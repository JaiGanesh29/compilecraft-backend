const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const questions = [
  {"q": "Which phase of a compiler groups characters into tokens?", "options": ["Lexical analysis", "Syntax analysis", "Semantic analysis", "Code generation"], "correct": 0},
  {"q": "What is the tool used to generate a lexical analyzer?", "options": ["Yacc", "Lex", "Bison", "LLVM"], "correct": 1},
  {"q": "A regular expression is used to describe:", "options": ["Tokens", "Grammar rules", "Parse trees", "Symbol tables"], "correct": 0},
  {"q": "Which finite automaton allows multiple transitions on the same input from a state?", "options": ["DFA", "NFA", "PDA", "Turing Machine"], "correct": 1},
  {"q": "The process of converting NFA to DFA is called:", "options": ["Minimization", "Subset construction", "Closure conversion", "Regularization"], "correct": 1},
  {"q": "Which phase of compilation checks whether tokens form valid grammatical structures?", "options": ["Lexical analysis", "Syntax analysis", "Semantic analysis", "Optimization"], "correct": 1},
  {"q": "A context-free grammar is best represented using:", "options": ["Regular expressions", "Production rules", "Finite automata", "Symbol tables"], "correct": 1},
  {"q": "Which parser builds the parse tree from the root down to leaves?", "options": ["Bottom-up parser", "Top-down parser", "Operator precedence parser", "LR parser"], "correct": 1},
  {"q": "LL(1) parsing stands for:", "options": ["Left to right, Leftmost derivation, 1 lookahead", "Left to right, Last derivation, 1 lookahead", "Linear, Left, 1 pass", "Left, Last, 1 token"], "correct": 0},
  {"q": "Which of these is a bottom-up parsing technique?", "options": ["Recursive descent", "Predictive parsing", "LR parsing", "LL parsing"], "correct": 2},
  {"q": "A grammar is left recursive if:", "options": ["A non-terminal derives itself on the right", "A non-terminal derives itself as the leftmost symbol", "It has no terminals", "It has ambiguous rules"], "correct": 1},
  {"q": "Left recursion in a grammar causes problems for:", "options": ["LR parsers", "Top-down parsers", "Bottom-up parsers", "Lexical analyzers"], "correct": 1},
  {"q": "What does the FIRST set of a non-terminal represent?", "options": ["Symbols that can begin strings derived from it", "Symbols that can end a string", "All terminals in the grammar", "The starting production"], "correct": 0},
  {"q": "What does the FOLLOW set represent?", "options": ["Symbols that can appear after a non-terminal", "Symbols that begin a derivation", "The last token of input", "Terminals not used in grammar"], "correct": 0},
  {"q": "A grammar is ambiguous if:", "options": ["It has no derivations", "A string has more than one parse tree", "It has left recursion", "It has no terminals"], "correct": 1},
  {"q": "Which parser is more powerful, LL(1) or LR(1)?", "options": ["LL(1)", "LR(1)", "Both are equal", "Depends on grammar size"], "correct": 1},
  {"q": "SLR stands for:", "options": ["Simple Left Recursive", "Simple LR", "Shift Left Reduce", "Syntax Left Rule"], "correct": 1},
  {"q": "Which LR parser variant is the most powerful but uses the most memory?", "options": ["SLR", "LALR", "Canonical LR", "Operator precedence"], "correct": 2},
  {"q": "LALR parsers are built by merging states with the same:", "options": ["Core items", "Lookahead symbols", "Action tables", "Grammar rules"], "correct": 0},
  {"q": "A shift-reduce conflict occurs in which parsing method?", "options": ["Top-down parsing", "Bottom-up parsing", "Lexical analysis", "Semantic analysis"], "correct": 1},
  {"q": "The parsing table for an LR parser contains which two main functions?", "options": ["Push and Pop", "Shift and Goto/Reduce actions", "Read and Write", "Scan and Emit"], "correct": 1},
  {"q": "A handle in bottom-up parsing refers to:", "options": ["The start symbol", "A substring matching a production's RHS to be reduced", "A lookahead symbol", "The parse stack pointer"], "correct": 1},
  {"q": "Which data structure is essential in syntax analysis for tracking variable scope?", "options": ["Stack", "Symbol table", "Queue", "Heap"], "correct": 1},
  {"q": "Type checking is performed during which compiler phase?", "options": ["Lexical analysis", "Syntax analysis", "Semantic analysis", "Code generation"], "correct": 2},
  {"q": "Syntax-directed translation associates semantic rules with:", "options": ["Tokens", "Grammar productions", "Symbol table entries", "Machine instructions"], "correct": 1},
  {"q": "An attribute that is computed from the values of child nodes is called:", "options": ["Synthesized attribute", "Inherited attribute", "Static attribute", "Global attribute"], "correct": 0},
  {"q": "An attribute that depends on the parent or sibling nodes is called:", "options": ["Synthesized attribute", "Inherited attribute", "Local attribute", "Terminal attribute"], "correct": 1},
  {"q": "An S-attributed grammar uses only:", "options": ["Inherited attributes", "Synthesized attributes", "Both equally", "No attributes"], "correct": 1},
  {"q": "Which intermediate representation resembles assembly-like instructions with at most three operands?", "options": ["Abstract syntax tree", "Three-address code", "DAG", "Postfix notation"], "correct": 1},
  {"q": "A Directed Acyclic Graph (DAG) in compilers is mainly used for:", "options": ["Detecting common subexpressions", "Token generation", "Memory allocation", "Error recovery"], "correct": 0},
  {"q": "Which of the following is NOT a form of intermediate code?", "options": ["Three-address code", "Postfix notation", "Syntax tree", "Machine code"], "correct": 3},
  {"q": "The quadruple representation of three-address code consists of:", "options": ["Operator and two operands only", "Operator, two operands, and result", "Only operator and result", "Operator and label"], "correct": 1},
  {"q": "Which of these is an example of a three-address code statement?", "options": ["x = y + z", "if x then y else z", "x = y + z + w", "print(x, y, z)"], "correct": 0},
  {"q": "The main purpose of code optimization is to:", "options": ["Increase code size", "Improve efficiency without changing program meaning", "Add more variables", "Remove semantic checks"], "correct": 1},
  {"q": "Which optimization removes code that is computed but never used?", "options": ["Dead code elimination", "Loop unrolling", "Constant folding", "Strength reduction"], "correct": 0},
  {"q": "Replacing an expensive operation with a cheaper equivalent is called:", "options": ["Loop invariant removal", "Strength reduction", "Dead code elimination", "Peephole optimization"], "correct": 1},
  {"q": "Moving computations that don't change inside a loop to outside it is called:", "options": ["Loop unrolling", "Loop-invariant code motion", "Strength reduction", "Common subexpression elimination"], "correct": 1},
  {"q": "Evaluating constant expressions at compile time instead of runtime is called:", "options": ["Constant propagation", "Constant folding", "Loop fusion", "Dead code elimination"], "correct": 1},
  {"q": "Which optimization technique works on a small window of instructions?", "options": ["Global optimization", "Peephole optimization", "Loop optimization", "Interprocedural optimization"], "correct": 1},
  {"q": "Local optimization is performed within:", "options": ["The entire program", "A single basic block", "Multiple functions", "The symbol table"], "correct": 1},
  {"q": "A basic block is defined as:", "options": ["A sequence of instructions with one entry and one exit, no branches", "Any single instruction", "A loop body", "A function call"], "correct": 0},
  {"q": "A control flow graph represents:", "options": ["Variable dependencies", "The flow of control between basic blocks", "Memory layout", "Token sequences"], "correct": 1},
  {"q": "Global optimization operates across:", "options": ["A single statement", "Multiple basic blocks in a procedure", "Only the symbol table", "Lexical tokens"], "correct": 1},
  {"q": "Which phase of the compiler generates the target machine code?", "options": ["Lexical analysis", "Semantic analysis", "Code generation", "Syntax analysis"], "correct": 2},
  {"q": "Register allocation is a key task in which compiler phase?", "options": ["Code generation", "Lexical analysis", "Parsing", "Error handling"], "correct": 0},
  {"q": "The graph coloring technique in compilers is primarily used for:", "options": ["Syntax tree construction", "Register allocation", "Lexical scanning", "Symbol table hashing"], "correct": 1},
  {"q": "Which allocation strategy assigns variables to registers only when needed?", "options": ["Static allocation", "Dynamic allocation based on liveness", "Global allocation", "Manual allocation"], "correct": 1},
  {"q": "A runtime environment manages memory using which of the following?", "options": ["Activation records", "Symbol tables only", "Token streams", "Parse trees only"], "correct": 0},
  {"q": "An activation record is created for each:", "options": ["Global variable", "Procedure call", "Token", "Basic block"], "correct": 1},
  {"q": "Which memory allocation strategy uses a stack for procedure calls?", "options": ["Static allocation", "Stack allocation", "Heap allocation", "Register allocation"], "correct": 1},
  {"q": "Dynamic memory allocation during runtime typically uses:", "options": ["The stack", "The heap", "The symbol table", "The parse tree"], "correct": 1},
  {"q": "Which error recovery strategy skips input tokens until a synchronizing token is found?", "options": ["Phrase-level recovery", "Panic mode recovery", "Error productions", "Global correction"], "correct": 1},
  {"q": "Which error recovery method inserts specific rules to handle common errors in the grammar?", "options": ["Panic mode", "Error productions", "Phrase-level recovery", "Global correction"], "correct": 1},
  {"q": "A compiler differs from an interpreter mainly because a compiler:", "options": ["Executes code line by line", "Translates the whole program before execution", "Cannot detect errors", "Only works on scripting languages"], "correct": 1},
  {"q": "Which of these is an example of a two-pass assembler concept in compiler design?", "options": ["Reading the entire program before generating code", "Reading only one line at a time", "Skipping semantic analysis", "Avoiding symbol tables"], "correct": 0},
  {"q": "Pass in compiler terminology usually refers to:", "options": ["One complete traversal of the source program", "A single token", "An error message", "A memory address"], "correct": 0},
  {"q": "The symbol table is used to store information about:", "options": ["Identifiers, their types, and scope", "Only keywords", "Only numeric constants", "Machine instructions only"], "correct": 0},
  {"q": "A hash table is often used to implement the symbol table because it offers:", "options": ["Sequential access only", "Fast average-case lookup", "Guaranteed sorted order", "No collisions ever"], "correct": 1},
  {"q": "Which type of grammar is used to define the syntax of most programming languages?", "options": ["Regular grammar", "Context-free grammar", "Context-sensitive grammar", "Unrestricted grammar"], "correct": 1},
  {"q": "A recursive descent parser is a form of:", "options": ["Bottom-up parser", "Top-down parser implemented with functions per non-terminal", "LR parser", "Operator precedence parser"], "correct": 1}
];

async function main() {
  console.log('Seeding database...');

  // 1. Seed Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@compilecraft.edu';
  const adminPassword = process.env.ADMIN_PASSWORD || 'CompilerDesign2026';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword },
    create: {
      email: adminEmail,
      password: hashedPassword
    }
  });
  console.log('Admin account seeded.');

  // 2. Seed Settings
  const defaultSettings = [
    { key: 'timerDuration', value: '30' },
    { key: 'shuffleQuestions', value: 'false' },
    { key: 'shuffleOptions', value: 'false' },
    { key: 'allowRetakes', value: 'false' },
    { key: 'quizOpen', value: 'true' }
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s
    });
  }
  console.log('Settings seeded.');

  // 3. Seed Questions
  // Delete all existing questions first to prevent duplicates or clean sync
  await prisma.question.deleteMany({});
  
  for (let i = 0; i < questions.length; i++) {
    const qData = questions[i];
    await prisma.question.create({
      data: {
        id: i + 1, // Set continuous 1-based IDs
        q: qData.q,
        options: JSON.stringify(qData.options),
        correct: qData.correct
      }
    });
  }
  console.log(`Successfully seeded ${questions.length} questions.`);
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
