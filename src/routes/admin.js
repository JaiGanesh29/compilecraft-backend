const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');
const auth = require('../middleware/auth');

// 1. Admin Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'compilecraft-gauntlet-2026-supersecret',
      { expiresIn: '12h' }
    );

    res.json({ token, email: admin.email });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Get Settings
router.get('/settings', auth, async (req, res) => {
  try {
    const dbSettings = await prisma.setting.findMany();
    const settings = {};
    dbSettings.forEach(s => {
      settings[s.key] = s.value;
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
});

// 3. Update Settings
router.post('/settings', auth, async (req, res) => {
  const { timerDuration, shuffleQuestions, shuffleOptions, allowRetakes, quizOpen } = req.body;

  try {
    const updates = {
      timerDuration: String(timerDuration),
      shuffleQuestions: String(shuffleQuestions),
      shuffleOptions: String(shuffleOptions),
      allowRetakes: String(allowRetakes),
      quizOpen: String(quizOpen)
    };

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && value !== 'undefined') {
        await prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        });
      }
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// 4. Get Student Attempts List (searchable and sortable)
router.get('/attempts', auth, async (req, res) => {
  const { search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  try {
    // Build filter
    const where = {};
    if (search) {
      where.student = {
        OR: [
          { name: { contains: search } },
          { rollNumber: { contains: search } }
        ]
      };
    }

    // Determine sorting field
    let orderBy = {};
    if (sortBy === 'name') {
      orderBy = { student: { name: sortOrder } };
    } else if (sortBy === 'rollNumber') {
      orderBy = { student: { rollNumber: sortOrder } };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    const attempts = await prisma.attempt.findMany({
      where,
      orderBy,
      include: {
        student: true
      }
    });

    res.json(attempts);
  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(500).json({ error: 'Failed to retrieve attempts' });
  }
});

// 5. Get Single Attempt Drill-down
router.get('/attempts/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const attempt = await prisma.attempt.findUnique({
      where: { id },
      include: {
        student: true,
        answers: {
          include: {
            question: true
          }
        }
      }
    });

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    // Parse options array on responses
    const formattedAnswers = attempt.answers.map(ans => {
      let parsedOptions = [];
      try {
        parsedOptions = JSON.parse(ans.question.options);
      } catch (e) {
        parsedOptions = [];
      }
      return {
        id: ans.id,
        questionText: ans.question.q,
        options: parsedOptions,
        selectedOption: ans.selectedOption,
        correctOption: ans.question.correct,
        isCorrect: ans.isCorrect,
        timeSpent: ans.timeSpent
      };
    });

    res.json({
      attemptId: attempt.id,
      studentName: attempt.student.name,
      studentRoll: attempt.student.rollNumber,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      timeTaken: attempt.timeTaken,
      createdAt: attempt.createdAt,
      answers: formattedAnswers
    });
  } catch (error) {
    console.error('Get attempt detail error:', error);
    res.status(500).json({ error: 'Failed to retrieve attempt details' });
  }
});

// 6. Get Class Analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const totalStudents = await prisma.student.count();
    const attempts = await prisma.attempt.findMany();
    const totalAttempts = attempts.length;

    if (totalAttempts === 0) {
      return res.json({
        totalStudents,
        totalAttempts,
        averageScore: 0,
        completionRate: 0,
        scoreDistribution: {
          '0-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41-50': 0, '51-60': 0
        },
        hardestQuestions: []
      });
    }

    // Calculate Average
    const sum = attempts.reduce((acc, curr) => acc + curr.score, 0);
    const averageScore = Number((sum / totalAttempts).toFixed(2));

    // Completion Rate (attempts vs registered students)
    const completionRate = totalStudents > 0 ? Number(((totalAttempts / totalStudents) * 100).toFixed(2)) : 0;

    // Score distribution
    const scoreDistribution = {
      '0-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41-50': 0, '51-60': 0
    };
    attempts.forEach(a => {
      if (a.score <= 10) scoreDistribution['0-10']++;
      else if (a.score <= 20) scoreDistribution['11-20']++;
      else if (a.score <= 30) scoreDistribution['21-30']++;
      else if (a.score <= 40) scoreDistribution['31-40']++;
      else if (a.score <= 50) scoreDistribution['41-50']++;
      else scoreDistribution['51-60']++;
    });

    // Hardest Questions
    const questions = await prisma.question.findMany();
    const answers = await prisma.answer.findMany({
      select: { questionId: true, isCorrect: true }
    });

    const stats = {};
    questions.forEach(q => {
      stats[q.id] = { id: q.id, q: q.q, correct: 0, total: 0 };
    });
    answers.forEach(a => {
      if (stats[a.questionId]) {
        stats[a.questionId].total++;
        if (a.isCorrect) stats[a.questionId].correct++;
      }
    });

    const hardestQuestions = Object.values(stats)
      .map(s => ({
        id: s.id,
        q: s.q,
        correctPct: s.total > 0 ? Number(((s.correct / s.total) * 100).toFixed(2)) : 100,
        totalAttempts: s.total,
        correctAttempts: s.correct
      }))
      .sort((a, b) => a.correctPct - b.correctPct) // Ascending correct percentage = hardest first
      .slice(0, 10); // top 10 hardest

    res.json({
      totalStudents,
      totalAttempts,
      averageScore,
      completionRate,
      scoreDistribution,
      hardestQuestions
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
});

module.exports = router;
