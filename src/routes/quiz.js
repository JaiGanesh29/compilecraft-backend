const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const prisma = require('../db');

// Rate limiting for attempt submissions: max 5 requests per 15 minutes per IP
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many attempts submitted from this IP. Please wait before trying again.' }
});

// Helper to load settings as key-value
async function getSettings() {
  const dbSettings = await prisma.setting.findMany();
  const settings = {};
  dbSettings.forEach(s => {
    settings[s.key] = s.value;
  });
  return {
    timerDuration: parseInt(settings.timerDuration || '30', 10),
    shuffleQuestions: settings.shuffleQuestions === 'true',
    shuffleOptions: settings.shuffleOptions === 'true',
    allowRetakes: settings.allowRetakes === 'true',
    quizOpen: settings.quizOpen === 'true'
  };
}

// 1. Init Endpoint (Get status and settings)
router.get('/init', async (req, res) => {
  const { rollNumber } = req.query;

  try {
    const settings = await getSettings();
    let hasAttempted = false;
    let student = null;

    if (rollNumber) {
      student = await prisma.student.findUnique({
        where: { rollNumber: rollNumber.trim().toUpperCase() },
        include: { attempts: true }
      });
      if (student && student.attempts.length > 0) {
        hasAttempted = true;
      }
    }

    res.json({
      quizOpen: settings.quizOpen,
      timerDuration: settings.timerDuration,
      allowRetakes: settings.allowRetakes,
      hasAttempted,
      studentName: student ? student.name : null,
      studentId: student ? student.id : null
    });
  } catch (error) {
    console.error('Quiz init error:', error);
    res.status(500).json({ error: 'Failed to initialize quiz configurations' });
  }
});

// 2. Student Registration / Verification
router.post('/register', async (req, res) => {
  const { name, rollNumber } = req.body;

  if (!name || !rollNumber) {
    return res.status(400).json({ error: 'Name and Roll Number are required' });
  }

  const cleanName = name.trim();
  const cleanRoll = rollNumber.trim().toUpperCase();

  try {
    const settings = await getSettings();

    if (!settings.quizOpen) {
      return res.status(403).json({ error: 'The quiz is currently closed by the instructor.' });
    }

    // Check if student with this roll number exists
    let student = await prisma.student.findUnique({
      where: { rollNumber: cleanRoll },
      include: { attempts: true }
    });

    if (student) {
      // If retakes are disabled and they have completed attempts
      if (!settings.allowRetakes && student.attempts.length > 0) {
        return res.status(403).json({
          error: 'You have already submitted an attempt for this quiz and retakes are disabled.'
        });
      }
    } else {
      // Create new student record
      student = await prisma.student.create({
        data: {
          name: cleanName,
          rollNumber: cleanRoll
        },
        include: { attempts: true }
      });
    }

    res.json({
      studentId: student.id,
      name: student.name,
      rollNumber: student.rollNumber
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register student' });
  }
});

// 3. Get Questions (Crucial: Correct answer indices must NOT be exposed)
router.get('/questions', async (req, res) => {
  try {
    const settings = await getSettings();

    if (!settings.quizOpen) {
      return res.status(403).json({ error: 'The quiz is currently closed by the instructor.' });
    }

    const dbQuestions = await prisma.question.findMany();
    
    // Format questions to hide correct answer index
    let formattedQuestions = dbQuestions.map(q => {
      let optionsArray = [];
      try {
        optionsArray = JSON.parse(q.options);
      } catch (e) {
        optionsArray = [];
      }
      return {
        id: q.id,
        q: q.q,
        options: optionsArray
      };
    });

    // Handle shufflings if enabled
    if (settings.shuffleQuestions) {
      formattedQuestions = formattedQuestions.sort(() => Math.random() - 0.5);
    }

    if (settings.shuffleOptions) {
      formattedQuestions = formattedQuestions.map(q => {
        // Keep track of which index was which if we shuffiled? 
        // Wait, if options are shuffled, then the option indexing changes.
        // If we shuffle options, how do we grade correctness on submission?
        // Ah! If we shuffle options on the client/frontend, or if the server shuffiles them,
        // then the index we submit (0, 1, 2, 3) must match the text of the selected option, OR
        // we must track which option text corresponds to the correct option.
        // Wait! Let's think. If we shuffle options, a very clean way is to shuffle the order of options
        // and return the list of options along with a scrambled index mapping, or we can simply keep
        // the original correct answer in a way that matches option text.
        // Let's do this: if we shuffle options on the client, the client knows the original array index.
        // If we do it on the server, we can return the options array and an index identifier, or
        // we can return the options shuffled but verify correctness on submission based on the option *text* instead of index!
        // Yes! Grading by option text is extremely robust against option shuffling, because the correct option's text is unique.
        // Wait, is it? Yes, all option texts for a question are unique in the MCQ list.
        // Let's see: grading by option text means:
        // When grading, we fetch the question, retrieve the correct option index, find the correct option text.
        // Compare the submitted option text with the correct option text.
        // Let's implement this! That way, we can support option shuffling perfectly and cleanly without tracking index mappings!
        // Wait, the submission payload would send either `selectedOption` (index) or `selectedOptionText`.
        // To be compatible with both shuffled and non-shuffled, let's send both or send the selected option index relative to the shuffled question array, along with the text of the option!
        // Yes! If we send `{ questionId: Int, selectedOption: Int, selectedOptionText: String, timeSpent: Int }`,
        // then on the server we can check:
        // If `selectedOptionText` matches the correct option's text, it's correct.
        // If it was a timeout (timed out/unanswered), the selectedOption is -1 and selectedOptionText is empty.
        // Let's check: in `seed.js`, options is a JSON array of strings.
        // Correct is the index in that array.
        // So the correct option text is `JSON.parse(q.options)[q.correct]`.
        // If `selectedOptionText === correctOptionText`, then `isCorrect = true`.
        // This is incredibly elegant and works 100% of the time, regardless of whether questions or options are shuffled!
        // Let's implement this.
        
        // Shuffle options but maintain their association.
        // For server-side shuffling of options:
        const shuffled = [...q.options].sort(() => Math.random() - 0.5);
        return {
          id: q.id,
          q: q.q,
          options: shuffled
        };
      });
    }

    res.json(formattedQuestions);
  } catch (error) {
    console.error('Fetch questions error:', error);
    res.status(500).json({ error: 'Failed to retrieve questions' });
  }
});

// 4. Submit Quiz Attempt
router.post('/submit', submitLimiter, async (req, res) => {
  const { studentId, answers, timeTaken } = req.body;

  if (!studentId || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Student ID and answers list are required' });
  }

  try {
    const settings = await getSettings();

    if (!settings.quizOpen) {
      return res.status(403).json({ error: 'The quiz is currently closed by the instructor.' });
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { attempts: true }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Verify retakes policy
    if (!settings.allowRetakes && student.attempts.length > 0) {
      return res.status(403).json({ error: 'Retakes are disabled for this quiz.' });
    }

    // Fetch all questions to grade correctness on the server
    const dbQuestions = await prisma.question.findMany();
    const questionMap = new Map(dbQuestions.map(q => [q.id, q]));

    let score = 0;
    const totalQuestions = dbQuestions.length;

    // Grade each answer
    const gradedAnswers = answers.map(ans => {
      const { questionId, selectedOption, selectedOptionText, timeSpent } = ans;
      const question = questionMap.get(questionId);

      if (!question) {
        throw new Error(`Invalid question ID: ${questionId}`);
      }

      // Selected option index validation
      if (selectedOption < -1 || selectedOption > 3) {
        throw new Error(`Invalid option index: ${selectedOption}`);
      }

      let isCorrect = false;
      const originalOptions = JSON.parse(question.options);
      const correctOptionText = originalOptions[question.correct];

      if (selectedOption !== -1 && selectedOptionText) {
        // Direct text comparison for robust shuffling support
        isCorrect = (selectedOptionText.trim() === correctOptionText.trim());
      }

      if (isCorrect) {
        score++;
      }

      return {
        questionId,
        selectedOption, // stores the index relative to what client showed
        isCorrect,
        timeSpent: timeSpent || 0
      };
    });

    // Transaction to create Attempt and Answers
    const result = await prisma.$transaction(async (tx) => {
      const attempt = await tx.attempt.create({
        data: {
          studentId,
          score,
          totalQuestions,
          timeTaken: timeTaken || 0
        }
      });

      const answersToCreate = gradedAnswers.map(ans => ({
        attemptId: attempt.id,
        questionId: ans.questionId,
        selectedOption: ans.selectedOption,
        isCorrect: ans.isCorrect,
        timeSpent: ans.timeSpent
      }));

      await tx.answer.createMany({
        data: answersToCreate
      });

      return attempt;
    });

    res.json({
      message: 'Quiz submitted successfully',
      attemptId: result.id,
      score: result.score,
      totalQuestions: result.totalQuestions,
      timeTaken: result.timeTaken
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ error: error.message || 'Failed to submit quiz' });
  }
});

// 5. Verify Individual Answer (Securely on-the-fly)
router.post('/verify', async (req, res) => {
  const { questionId, selectedOption, selectedOptionText } = req.body;

  if (questionId === undefined) {
    return res.status(400).json({ error: 'Question ID is required' });
  }

  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const originalOptions = JSON.parse(question.options);
    const correctOptionText = originalOptions[question.correct];
    
    let isCorrect = false;
    if (selectedOption !== -1 && selectedOptionText) {
      isCorrect = (selectedOptionText.trim() === correctOptionText.trim());
    }

    res.json({
      isCorrect
    });
  } catch (error) {
    console.error('Verify answer error:', error);
    res.status(500).json({ error: 'Failed to verify answer' });
  }
});

module.exports = router;
