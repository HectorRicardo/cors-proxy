module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'plugin:jsdoc/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'no-console': 'off',
    'no-param-reassign': ['error', { props: false }],
    'no-shadow': 'off',
    'jsdoc/no-undefined-types': ['warn', {
      definedTypes: [
        'IncomingMessage',
        'ClientRequest',
        'ServerResponse',
      ]
    }]
  },
  plugins: [
    'jsdoc',
  ]
};
