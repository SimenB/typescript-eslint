import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import rule from '../../src/rules/no-loop-func';

const ruleTester = new RuleTester();

ruleTester.run('no-loop-func', rule, {
  valid: [
    `
let someArray: MyType[] = [];
for (let i = 0; i < 10; i += 1) {
  someArray = someArray.filter((item: MyType) => !!item);
}
    `,
    {
      code: `
let someArray: MyType[] = [];
for (let i = 0; i < 10; i += 1) {
  someArray = someArray.filter((item: MyType) => !!item);
}
      `,
      languageOptions: {
        globals: {
          MyType: 'readonly',
        },
      },
    },
    {
      code: `
let someArray: MyType[] = [];
for (let i = 0; i < 10; i += 1) {
  someArray = someArray.filter((item: MyType) => !!item);
}
      `,
      languageOptions: {
        globals: {
          MyType: 'writable',
        },
      },
    },
    `
type MyType = 1;
let someArray: MyType[] = [];
for (let i = 0; i < 10; i += 1) {
  someArray = someArray.filter((item: MyType) => !!item);
}
    `,
  ],
  invalid: [],
});

// Forked from https://github.com/eslint/eslint/blob/bf2e367bf4f6fde9930af9de8b8d8bc3d8b5782f/tests/lib/rules/no-loop-func.js
ruleTester.run('no-loop-func ESLint tests', rule, {
  valid: [
    "string = 'function a() {}';",
    `
for (var i = 0; i < l; i++) {}
var a = function () {
  i;
};
    `,
    `
for (
  var i = 0,
    a = function () {
      i;
    };
  i < l;
  i++
) {}
    `,
    `
for (var x in xs.filter(function (x) {
  return x != upper;
})) {
}
    `,
    {
      code: `
for (var x of xs.filter(function (x) {
  return x != upper;
})) {
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },

    // no refers to variables that declared on upper scope.
    `
for (var i = 0; i < l; i++) {
  (function () {});
}
    `,
    `
for (var i in {}) {
  (function () {});
}
    `,
    {
      code: `
for (var i of {}) {
  (function () {});
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },

    // functions which are using unmodified variables are OK.
    {
      code: `
for (let i = 0; i < l; i++) {
  (function () {
    i;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (let i in {}) {
  i = 7;
  (function () {
    i;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (const i of {}) {
  (function () {
    i;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (let i = 0; i < 10; ++i) {
  for (let x in xs.filter(x => x != i)) {
  }
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a = 0;
for (let i = 0; i < l; i++) {
  (function () {
    a;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a = 0;
for (let i in {}) {
  (function () {
    a;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a = 0;
for (let i of {}) {
  (function () {
    a;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a = 0;
for (let i = 0; i < l; i++) {
  (function () {
    (function () {
      a;
    });
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a = 0;
for (let i in {}) {
  function foo() {
    (function () {
      a;
    });
  }
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a = 0;
for (let i of {}) {
  () => {
    (function () {
      a;
    });
  };
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var a = 0;
for (let i = 0; i < l; i++) {
  (function () {
    a;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var a = 0;
for (let i in {}) {
  (function () {
    a;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var a = 0;
for (let i of {}) {
  (function () {
    a;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: [
        'let result = {};',
        'for (const score in scores) {',
        '  const letters = scores[score];',
        "  letters.split('').forEach(letter => {",
        '    result[letter] = score;',
        '  });',
        '}',
        'result.__default = 6;',
      ].join('\n'),
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: ['while (true) {', '    (function() { a; });', '}', 'let a;'].join(
        '\n',
      ),
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
  ],
  invalid: [
    {
      code: `
for (var i = 0; i < l; i++) {
  (function () {
    i;
  });
}
      `,
      errors: [
        {
          data: { varNames: "'i'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionExpression,
        },
      ],
    },
    {
      code: `
for (var i = 0; i < l; i++) {
  for (var j = 0; j < m; j++) {
    (function () {
      i + j;
    });
  }
}
      `,
      errors: [
        {
          data: { varNames: "'i', 'j'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionExpression,
        },
      ],
    },
    {
      code: `
for (var i in {}) {
  (function () {
    i;
  });
}
      `,
      errors: [
        {
          data: { varNames: "'i'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionExpression,
        },
      ],
    },
    {
      code: `
for (var i of {}) {
  (function () {
    i;
  });
}
      `,
      errors: [
        {
          data: { varNames: "'i'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionExpression,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (var i = 0; i < l; i++) {
  () => {
    i;
  };
}
      `,
      errors: [
        {
          data: { varNames: "'i'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.ArrowFunctionExpression,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (var i = 0; i < l; i++) {
  var a = function () {
    i;
  };
}
      `,
      errors: [
        {
          data: { varNames: "'i'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionExpression,
        },
      ],
    },
    {
      code: `
for (var i = 0; i < l; i++) {
  function a() {
    i;
  }
  a();
}
      `,
      errors: [
        {
          data: { varNames: "'i'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionDeclaration,
        },
      ],
    },
    {
      code: `
for (
  var i = 0;
  (function () {
    i;
  })(),
    i < l;
  i++
) {}
      `,
      errors: [
        {
          data: { varNames: "'i'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionExpression,
        },
      ],
    },
    {
      code: `
for (
  var i = 0;
  i < l;
  (function () {
    i;
  })(),
    i++
) {}
      `,
      errors: [
        {
          data: { varNames: "'i'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionExpression,
        },
      ],
    },
    {
      code: `
while (i) {
  (function () {
    i;
  });
}
      `,
      errors: [
        {
          data: { varNames: "'i'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionExpression,
        },
      ],
    },
    {
      code: `
do {
  (function () {
    i;
  });
} while (i);
      `,
      errors: [
        {
          data: { varNames: "'i'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionExpression,
        },
      ],
    },

    // Warns functions which are using modified variables.
    {
      code: `
let a;
for (let i = 0; i < l; i++) {
  a = 1;
  (function () {
    a;
  });
}
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionExpression,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a;
for (let i in {}) {
  (function () {
    a;
  });
  a = 1;
}
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionExpression,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a;
for (let i of {}) {
  (function () {
    a;
  });
}
a = 1;
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionExpression,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a;
for (let i = 0; i < l; i++) {
  (function () {
    (function () {
      a;
    });
  });
  a = 1;
}
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionExpression,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a;
for (let i in {}) {
  a = 1;
  function foo() {
    (function () {
      a;
    });
  }
}
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionDeclaration,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a;
for (let i of {}) {
  () => {
    (function () {
      a;
    });
  };
}
a = 1;
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.ArrowFunctionExpression,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (var i = 0; i < 10; ++i) {
  for (let x in xs.filter(x => x != i)) {
  }
}
      `,
      errors: [
        {
          data: { varNames: "'i'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.ArrowFunctionExpression,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (let x of xs) {
  let a;
  for (let y of ys) {
    a = 1;
    (function () {
      a;
    });
  }
}
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionExpression,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (var x of xs) {
  for (let y of ys) {
    (function () {
      x;
    });
  }
}
      `,
      errors: [
        {
          data: { varNames: "'x'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionExpression,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (var x of xs) {
  (function () {
    x;
  });
}
      `,
      errors: [
        {
          data: { varNames: "'x'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionExpression,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var a;
for (let x of xs) {
  a = 1;
  (function () {
    a;
  });
}
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionExpression,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var a;
for (let x of xs) {
  (function () {
    a;
  });
  a = 1;
}
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionExpression,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a;
function foo() {
  a = 10;
}
for (let x of xs) {
  (function () {
    a;
  });
}
foo();
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionExpression,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a;
function foo() {
  a = 10;
  for (let x of xs) {
    (function () {
      a;
    });
  }
}
foo();
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
          type: AST_NODE_TYPES.FunctionExpression,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
  ],
});
