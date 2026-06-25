const nodeGlobals = {
  __dirname: "readonly",
  console: "readonly",
  module: "readonly",
  process: "readonly",
  require: "readonly",
};

module.exports = [
  {
    ignores: ["node_modules/**", "uploads/**", "public/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "commonjs",
      globals: nodeGlobals,
    },
    rules: {
      "no-unused-vars": [
        "warn",
        {
          args: "after-used",
          ignoreRestSiblings: true,
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
];
