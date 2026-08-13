const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const questions = [
  {"q": "A compiler engineer designs a syntax-directed definition where all attributes of a node are computed using only its children’s values. Which classification best fits this definition?", "options": ["S-attributed definition", "L-attributed definition", "Inherited definition", "Context-sensitive definition"], "correct": 0},
  {"q": "While implementing an expression evaluator, an attribute value is computed from child nodes only. What type of attribute is this?", "options": ["Synthesized attribute", "Inherited attribute", "Global attribute", "Dynamic attribute"], "correct": 0},
  {"q": "If a dependency graph for attribute evaluation contains a cycle, what does it indicate?", "options": ["Efficient evaluation order exists", "Attributes can be evaluated in parallel", "Circular dependency prevents evaluation", "Grammar is LL(1)"], "correct": 2},
  {"q": "In an L-attributed definition, an inherited attribute of a symbol on the right-hand side must depend on:", "options": ["Symbols to its right", "Parent and left siblings", "Only itself", "Terminal symbols only"], "correct": 1},
  {"q": "Why are all S-attributed definitions considered L-attributed?", "options": ["They use only synthesized attributes", "They require top-down parsing", "They include inherited attributes", "They are mutually exclusive"], "correct": 0},
  {"q": "During syntax tree construction, which function is used to create a leaf node for a constant value?", "options": ["mknode(op, left, right)", "mkleaf(num, value)", "mkop(id, entry)", "createNode()"], "correct": 1},
  {"q": "When attribute evaluation order is unclear, which technique is used to determine a valid sequence?", "options": ["Depth-first traversal", "Breadth-first traversal", "Topological sorting", "Backtracking"], "correct": 2},
  {"q": "Which type of checking ensures that operations are applied to compatible data types before execution?", "options": ["Dynamic checking", "Static checking", "Lexical checking", "Runtime parsing"], "correct": 1},
  {"q": "Consider the statement: float x = \"hello\"; Which compiler phase detects this error?", "options": ["Lexical analysis", "Syntax analysis", "Semantic analysis", "Code generation"], "correct": 2},
  {"q": "In a dependency graph, if node A points to node B, what does this indicate?", "options": ["A depends on B", "B depends on A", "Both are independent", "Both execute together"], "correct": 1},
  {"q": "In array-based syntax tree representation, what does each index represent?", "options": ["Memory address", "Pointer to node structure", "Line number", "Token value"], "correct": 1},
  {"q": "In an LR parser stack, for production A → XYZ, where is the attribute of X located?", "options": ["val[top]", "val[top-1]", "val[top-2]", "val[top-3]"], "correct": 2},
  {"q": "What distinguishes an attribute grammar from a general syntax-directed definition?", "options": ["Only synthesized attributes are allowed", "Functions must not have side effects", "Must use LL parsing", "Must be bottom-up"], "correct": 1},
  {"q": "When eliminating left recursion, which attributes help preserve evaluation order?", "options": ["Synthesized attributes", "Inherited attributes", "Static attributes", "Temporary attributes"], "correct": 1},
  {"q": "Why are marker nonterminals used in bottom-up parsing?", "options": ["To reduce grammar size", "To manage inherited attributes", "To eliminate recursion", "To simplify tokens"], "correct": 1},
  {"q": "In the type expression array(1..5, float), what does float represent?", "options": ["Index type", "Element type", "Constructor", "Range"], "correct": 1},
  {"q": "Under name equivalence, when are two types considered equal?", "options": ["Same structure", "Same name", "Same memory size", "Same value"], "correct": 1},
  {"q": "What is the purpose of type coercion in expressions?", "options": ["Remove variables", "Convert types automatically", "Generate code", "Reduce memory"], "correct": 1},
  {"q": "Which equivalence method considers two types equal if their structures match?", "options": ["Name equivalence", "Structural equivalence", "Static equivalence", "Dynamic equivalence"], "correct": 1},
  {"q": "Which process is used in compilers to resolve overloaded function types?", "options": ["Parsing and scanning", "Bottom-up synthesis and top-down refinement", "Code generation", "Tokenization"], "correct": 1},
  {"q": "In a syntax-directed definition, placing print(E.val) at the end ensures:", "options": ["Initialization", "Final output after evaluation", "Type conversion", "Error handling"], "correct": 1},
  {"q": "In L-attributed definitions, inherited attributes can depend on:", "options": ["Right siblings only", "Parent and left siblings", "Entire tree", "Constants only"], "correct": 1},
  {"q": "Which phase provides structure for static program checks?", "options": ["Lexical analysis", "Syntax analysis", "Semantic analysis", "Optimization"], "correct": 2},
  {"q": "In type unification, what must be done for child nodes?", "options": ["Ignore them", "Delete them", "Recursively unify", "Convert them"], "correct": 2},
  {"q": "What advantage does a DAG provide over a syntax tree?", "options": ["Larger size", "Duplicate subexpressions removed", "Easier parsing", "Linear structure"], "correct": 1},
  {"q": "Which type is required for operands of the div operator?", "options": ["Float", "Integer", "Boolean", "Character"], "correct": 1},
  {"q": "For LL(1) grammar with L-attributed definitions, which parsing is best?", "options": ["Bottom-up", "Predictive parsing", "Operator parsing", "Shift-reduce"], "correct": 1},
  {"q": "What does mknode('*', left, right) return?", "options": ["Leaf node", "Interior node", "Root node", "Pointer to operand"], "correct": 1},
  {"q": "What additional data does a symbol table store for semantic analysis?", "options": ["Token length", "Type and scope", "Comments", "Operators"], "correct": 1},
  {"q": "What is the purpose of topological sorting in attribute evaluation?", "options": ["Reduce grammar", "Determine evaluation order", "Remove recursion", "Generate code"], "correct": 1},
  {"q": "A compiler computes the value of an expression node only after all child expressions are evaluated. Which traversal is most suitable?", "options": ["Preorder", "Inorder", "Postorder", "Level Order"], "correct": 2},
  {"q": "A semantic rule passes datatype information from a declaration node down to variable nodes. Which attribute type is used?", "options": ["Synthesized attribute", "Inherited attribute", "Static attribute", "Terminal attribute"], "correct": 1},
  {"q": "In bottom-up parsing, synthesized attributes are preferred because:", "options": ["Parent nodes are processed before children", "Child values are available at reduction time", "Inherited attributes are faster", "They reduce parsing table size"], "correct": 1},
  {"q": "A compiler uses a decorated parse tree to:", "options": ["Store lexical tokens only", "Annotate parse tree with attribute values", "Eliminate recursion", "Optimize generated code"], "correct": 1},
  {"q": "Which of the following best describes a syntax tree?", "options": ["Full parse tree with grammar symbols", "Condensed hierarchical representation of program structure", "Flat token list", "Machine code tree"], "correct": 1},
  {"q": "A Directed Acyclic Graph (DAG) is preferred over syntax tree when:", "options": ["Grammar is ambiguous", "Common subexpressions need sharing", "Parsing is top-down", "Tokens are missing"], "correct": 1},
  {"q": "Which semantic analysis task verifies that a variable is declared before use?", "options": ["Type inference", "Scope checking", "Constant folding", "Code generation"], "correct": 1},
  {"q": "A compiler checks function call arguments against parameter types during:", "options": ["Lexical analysis", "Syntax analysis", "Semantic analysis", "Optimization"], "correct": 2},
  {"q": "Which symbol table entry is MOST useful for detecting redeclaration errors?", "options": ["Token ID", "Scope information", "Memory address only", "Parse stack position"], "correct": 1},
  {"q": "Type inference in compilers is primarily used to:", "options": ["Generate tokens", "Deduce unspecified data types", "Remove recursion", "Optimize loops"], "correct": 1},
  {"q": "If two record types have identical fields but different names, structural equivalence considers them:", "options": ["Different", "Equivalent", "Invalid", "Ambiguous"], "correct": 1},
  {"q": "If the same two record types above are checked using name equivalence, they are:", "options": ["Equivalent", "Different", "Recursive", "Dynamic"], "correct": 1},
  {"q": "What is the primary role of coercion in mixed-type arithmetic expressions?", "options": ["Remove operators", "Convert operands to compatible types", "Simplify parse tree", "Reduce memory"], "correct": 1},
  {"q": "Which semantic error is detected when assigning an integer to a boolean variable?", "options": ["Syntax error", "Type mismatch", "Scope violation", "Parsing conflict"], "correct": 1},
  {"q": "A compiler uses unification during semantic analysis to:", "options": ["Merge tokens", "Match compatible type expressions", "Remove left recursion", "Build parsing table"], "correct": 1},
  {"q": "Which data structure helps represent shared subexpressions efficiently?", "options": ["Parse Table", "Stack", "DAG", "Queue"], "correct": 2},
  {"q": "A syntax-directed translation scheme differs from an SDD because it:", "options": ["Has no semantic rules", "Embeds semantic actions within productions", "Uses only inherited attributes", "Eliminates parse tree"], "correct": 1},
  {"q": "When generating postfix notation, which attribute is commonly synthesized?", "options": ["Type", "Code string", "Scope", "Offset"], "correct": 1},
  {"q": "In semantic-directed translation, marker nonterminals are introduced mainly to:", "options": ["Create tokens", "Execute actions at intermediate parse points", "Remove ambiguity", "Reduce grammar size"], "correct": 1},
  {"q": "Which compiler phase allocates memory offsets to variables?", "options": ["Lexical Analysis", "Syntax Analysis", "Semantic Analysis", "Linking"], "correct": 2},
  {"q": "A variable’s offset in an activation record is generally stored in:", "options": ["Parse Table", "Symbol Table", "Token Stream", "DAG"], "correct": 1},
  {"q": "Which attribute type is easiest to evaluate in bottom-up parsers?", "options": ["Inherited", "Synthesized", "Global", "Static"], "correct": 1},
  {"q": "Why is inherited attribute evaluation difficult in LR parsing?", "options": ["Child nodes are unavailable", "Parent context may be unknown during shift/reduce", "Tokens are ambiguous", "Grammar becomes regular"], "correct": 1},
  {"q": "Which parsing strategy naturally supports inherited attributes?", "options": ["Bottom-up LR Parsing", "Shift-Reduce Parsing", "Top-down Recursive Descent", "Operator Precedence Parsing"], "correct": 2},
  {"q": "A compiler detects multiple declarations of the same variable in one scope using:", "options": ["Syntax Tree", "Symbol Table Lookup", "Dependency Graph", "Parse Stack"], "correct": 1},
  {"q": "Which of the following is NOT typically part of semantic analysis?", "options": ["Type Checking", "Scope Resolution", "Intermediate Code Generation", "Function Argument Validation"], "correct": 2},
  {"q": "A dependency graph with no cycles guarantees:", "options": ["Grammar is LL(1)", "Valid attribute evaluation order exists", "Parsing is deterministic", "Code is optimized"], "correct": 1},
  {"q": "Which representation omits punctuation and grammar-specific nodes?", "options": ["Parse Tree", "Syntax Tree", "Dependency Graph", "Symbol Table"], "correct": 1},
  {"q": "A compiler builds a DAG instead of a syntax tree mainly for:", "options": ["Better lexical analysis", "Code optimization opportunities", "Simpler parsing", "Faster tokenization"], "correct": 1},
  {"q": "Semantic analysis primarily ensures that a program is:", "options": ["Lexically valid", "Grammatically correct", "Meaningfully correct according to language rules", "Fully optimized"], "correct": 2}
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
