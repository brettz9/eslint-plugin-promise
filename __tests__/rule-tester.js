/**
 * @fileoverview Helpers for tests.
 * @author 唯然<weiran.zsd@outlook.com>
 */
'use strict'
const { version } = require('eslint/package.json')
const { RuleTester } = require('eslint')
const globals = require('globals')

const majorVersion = Number.parseInt(version.split('.')[0], 10)

/**
 * @template {string|import('eslint').Linter.Config|import('eslint').RuleTester.InvalidTestCase|
 * import('eslint').RuleTester.ValidTestCase} T
 * @param {T} cfg
 * @returns {T}
 */
function convertConfig(cfg) {
  if (cfg instanceof Object === false) {
    return cfg
  }

  if (cfg.languageOptions == null) {
    cfg.languageOptions = {}
  }

  const config = /**
   * @type {import('eslint').Linter.Config|
   *   import('eslint').RuleTester.InvalidTestCase|
   *   import('eslint').RuleTester.ValidTestCase
   * }
   */ (cfg)

  if ('parserOptions' in config && config.parserOptions) {
    Object.assign(
      /** @type {import('eslint').Linter.LanguageOptions} */
      (config.languageOptions),
      config.parserOptions,
    )
    delete config.parserOptions
  }

  if ('parser' in config && typeof config.parser === 'string') {
    // prettier-ignore
    {
      /** @type {import('eslint').Linter.LanguageOptions} */ (
        config.languageOptions
      ).parser = require(config.parser)
    }
    delete config.parser
  }

  if ('globals' in config && config.globals instanceof Object) {
    // prettier-ignore
    {
      /** @type {import('eslint').Linter.LanguageOptions} */ (
        config.languageOptions
      ).globals =
        /** @type {import('eslint').Linter.Globals} */ (config.globals)
      delete config.globals
    }
  }

  if ('env' in config && config.env instanceof Object) {
    if (
      /** @type {import('eslint').Linter.LanguageOptions} */ (
        config.languageOptions
      ).globals == null
    ) {
      // prettier-ignore
      {
        /** @type {import('eslint').Linter.LanguageOptions} */ (
          config.languageOptions
        ).globals = {}
      }
    }

    for (const key in config.env) {
      Object.assign(
        /** @type {import('eslint').Linter.LanguageOptions} */
        (config.languageOptions).globals,
        globals[
          /** @type {keyof globals} */
          (key)
        ],
      )
    }

    delete config.env
  }

  if ('parserOptions' in config) {
    delete config.parserOptions
  }
  if ('parser' in config) {
    delete config.parser
  }

  return /** @type {T} */ (config)
}

exports.RuleTester = class {
  constructor(config = {}) {
    if (majorVersion <= 8) {
      // @ts-expect-error For ESLint 8
      return new RuleTester(config)
    }

    const ruleTester = new RuleTester(convertConfig(config))
    this.$run = ruleTester.run.bind(ruleTester)
  }

  /**
   * @param {string} name
   * @param {import('eslint').Rule.RuleModule} rule
   * @param {{
   *   valid: Array<string | import('eslint').RuleTester.ValidTestCase>;
   *   invalid: import('eslint').RuleTester.InvalidTestCase[];
   * }} tests
   */
  run(name, rule, tests) {
    tests.valid = tests.valid.map(convertConfig)
    tests.invalid = tests.invalid.map(convertConfig)

    return this.$run && this.$run(name, rule, tests)
  }
}
