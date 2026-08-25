const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const questions = [
  {
    "q": "Which phase of a compiler converts intermediate code into target code?",
    "options": ["Lexical analysis", "Code generation", "Syntax analysis", "Semantic analysis"],
    "correct": 1
  },
  {
    "q": "What is the main objective of code optimization?",
    "options": ["Increase source code size", "Improve program efficiency", "Remove the compiler", "Change the programming language"],
    "correct": 1
  },
  {
    "q": "Which of the following is a principal source of optimization?",
    "options": ["Redundant computations", "Comments", "Variable names", "Whitespace"],
    "correct": 0
  },
  {
    "q": "Peephole optimization examines:",
    "options": ["The entire source program", "A small sequence of target instructions", "Only the symbol table", "Only input characters"],
    "correct": 1
  },
  {
    "q": "A basic block has:",
    "options": ["Multiple entry points", "One entry and one exit", "No entry point", "Multiple exits only"],
    "correct": 1
  },
  {
    "q": "Which optimization removes computations whose results are not used?",
    "options": ["Dead-code elimination", "Loop unrolling", "Constant folding", "Register spilling"],
    "correct": 0
  },
  {
    "q": "Replacing a constant expression by its computed value is called:",
    "options": ["Constant folding", "Copy propagation", "Strength reduction", "Code motion"],
    "correct": 0
  },
  {
    "q": "Replacing a variable by another variable to which it has been copied is:",
    "options": ["Copy propagation", "Dead-code elimination", "Loop inversion", "Scheduling"],
    "correct": 0
  },
  {
    "q": "Which optimization replaces expensive operations with cheaper ones?",
    "options": ["Strength reduction", "Constant propagation", "Common subexpression elimination", "Dead-code elimination"],
    "correct": 0
  },
  {
    "q": "Global data-flow analysis is generally performed over:",
    "options": ["Characters", "Basic blocks and flow graphs", "Source comments", "Keywords only"],
    "correct": 1
  },
  {
    "q": "A flow graph represents:",
    "options": ["Data types only", "Control flow among basic blocks", "Memory size only", "Source formatting"],
    "correct": 1
  },
  {
    "q": "The nodes of a flow graph generally represent:",
    "options": ["Basic blocks", "Registers only", "Variables only", "Operators only"],
    "correct": 0
  },
  {
    "q": "An edge in a flow graph indicates:",
    "options": ["Data type conversion", "Possible transfer of control", "Register size", "Constant value"],
    "correct": 1
  },
  {
    "q": "The first instruction of a basic block is called its:",
    "options": ["Leader", "Trailer", "Operator", "Token"],
    "correct": 0
  },
  {
    "q": "Which instruction can be a leader of a basic block?",
    "options": ["The first instruction", "Only an assignment", "Only a comment", "Only a declaration"],
    "correct": 0
  },
  {
    "q": "A jump target is considered a:",
    "options": ["Leader", "Token", "Literal", "Register"],
    "correct": 0
  },
  {
    "q": "The target machine determines:",
    "options": ["Source program grammar", "Instruction set and machine constraints", "User interface", "Database schema"],
    "correct": 1
  },
  {
    "q": "Which is an important issue in code-generator design?",
    "options": ["Register allocation", "Font selection", "File naming", "Comment style"],
    "correct": 0
  },
  {
    "q": "Register allocation decides:",
    "options": ["Which variables are kept in registers", "Which source language is used", "Which comments are removed", "Which compiler is installed"],
    "correct": 0
  },
  {
    "q": "Register assignment determines:",
    "options": ["The exact register used for a value", "The number of source files", "The input format", "The number of tokens"],
    "correct": 0
  },
  {
    "q": "Instruction selection means:",
    "options": ["Choosing appropriate target-machine instructions", "Choosing variable names", "Selecting comments", "Selecting test cases"],
    "correct": 0
  },
  {
    "q": "Instruction ordering is important because it can affect:",
    "options": ["Program performance", "Source-code spelling", "File extension", "Number of comments"],
    "correct": 0
  },
  {
    "q": "Runtime storage management deals with:",
    "options": ["Allocation and organization of memory during execution", "Lexical tokens", "Grammar rules", "Source indentation"],
    "correct": 0
  },
  {
    "q": "Which storage area is commonly used for procedure activation records?",
    "options": ["Run-time stack", "Keyboard", "Cache only", "Source file"],
    "correct": 0
  },
  {
    "q": "A heap is mainly used for:",
    "options": ["Dynamic memory allocation", "Storing keywords", "Parsing expressions", "Holding comments"],
    "correct": 0
  },
  {
    "q": "An activation record is associated with:",
    "options": ["A procedure or function call", "A keyword", "A source-file comment", "A compiler phase only"],
    "correct": 0
  },
  {
    "q": "Which of the following may be stored in an activation record?",
    "options": ["Return address", "Source-code color", "File icon", "Compiler logo"],
    "correct": 0
  },
  {
    "q": "Next-use information tells:",
    "options": ["Where a variable is declared", "Whether a variable will be used again later", "The variable's data type only", "The variable's name length"],
    "correct": 1
  },
  {
    "q": "A variable that will not be used again in a block is:",
    "options": ["Live", "Dead", "Constant", "Global"],
    "correct": 1
  },
  {
    "q": "A variable whose value may be used later is called:",
    "options": ["Live", "Dead", "Invalid", "Static only"],
    "correct": 0
  },
  {
    "q": "The simple code generator commonly uses:",
    "options": ["Register descriptors and address descriptors", "Only comments", "Only tokens", "Only grammar rules"],
    "correct": 0
  },
  {
    "q": "A register descriptor records:",
    "options": ["Values currently held in registers", "Source comments", "Procedure names only", "File locations"],
    "correct": 0
  },
  {
    "q": "An address descriptor records:",
    "options": ["Locations where the current value of a name can be found", "CPU temperature", "Source indentation", "Number of keywords"],
    "correct": 0
  },
  {
    "q": "DAG stands for:",
    "options": ["Directed Acyclic Graph", "Data Allocation Group", "Direct Access Grammar", "Dynamic Address Generator"],
    "correct": 0
  },
  {
    "q": "A DAG can represent:",
    "options": ["Expressions and dependencies within a basic block", "Only source comments", "Hardware wiring", "User passwords"],
    "correct": 0
  },
  {
    "q": "In a DAG, leaf nodes generally represent:",
    "options": ["Identifiers or constants", "Only operators", "Basic blocks", "Registers only"],
    "correct": 0
  },
  {
    "q": "In a DAG, interior nodes generally represent:",
    "options": ["Operators", "Comments", "Keywords only", "Source files"],
    "correct": 0
  },
  {
    "q": "DAG representation helps detect:",
    "options": ["Common subexpressions", "Spelling errors", "Network failures", "Syntax highlighting"],
    "correct": 0
  },
  {
    "q": "If two expressions have the same operands and operator, they may be represented by:",
    "options": ["A common DAG node", "Two unrelated files", "Two symbol tables", "Two activation records"],
    "correct": 0
  },
  {
    "q": "Common subexpression elimination avoids:",
    "options": ["Recomputing the same expression", "Loading the compiler", "Creating source files", "Reading input"],
    "correct": 0
  },
  {
    "q": "Which optimization moves loop-invariant computations outside a loop?",
    "options": ["Code motion", "Copy propagation", "Peephole matching", "Register spilling"],
    "correct": 0
  },
  {
    "q": "Which is a local optimization?",
    "options": ["Optimization within a basic block", "Optimization across unrelated programs", "Operating-system scheduling", "Network routing"],
    "correct": 0
  },
  {
    "q": "Which is an example of machine-dependent optimization?",
    "options": ["Using target-machine instruction properties", "Removing comments", "Renaming variables", "Formatting code"],
    "correct": 0
  },
  {
    "q": "Which is an example of machine-independent optimization?",
    "options": ["Constant folding", "Choosing a specific CPU register", "Using a target-specific instruction", "Exploiting a special addressing mode"],
    "correct": 0
  },
  {
    "q": "Peephole optimization may remove:",
    "options": ["Redundant load/store instructions", "All functions", "All variables", "The symbol table"],
    "correct": 0
  },
  {
    "q": "The code generator receives as input:",
    "options": ["Intermediate representation", "Only machine code", "Only comments", "Only object files"],
    "correct": 0
  },
  {
    "q": "The output of a code generator is generally:",
    "options": ["Target code", "Source tokens", "Parse tree only", "Grammar"],
    "correct": 0
  },
  {
    "q": "A target instruction may be selected based on:",
    "options": ["Cost and machine capabilities", "Variable spelling", "Comment length", "Source-file name"],
    "correct": 0
  },
  {
    "q": "The purpose of flow-graph analysis is to understand:",
    "options": ["Control-flow relationships", "Keyboard input", "File permissions", "User interface layout"],
    "correct": 0
  },
  {
    "q": "Which optimization can reduce the number of instructions executed by eliminating unreachable code?",
    "options": ["Unreachable-code elimination", "Constant folding", "Register assignment", "Instruction scheduling"],
    "correct": 0
  }
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
  // Delete all existing records in referencing tables first to prevent foreign key violations
  await prisma.answer.deleteMany({});
  await prisma.attempt.deleteMany({});
  await prisma.student.deleteMany({});
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
