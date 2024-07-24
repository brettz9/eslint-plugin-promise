'use strict'

test('can require index file', () => {
  expect(require('../index')).toBeInstanceOf(Object)
})

test('rule set', () => {
  const plugin = require('../index')
  expect(plugin.configs.recommended.rules).toEqual(
    plugin.configs['flat/recommended'].rules,
  )
  expect(
    /** @type {Record<string, import('eslint').ESLint.Plugin> } */ (
      plugin.configs['flat/recommended'].plugins
    ).promise,
  ).toBe(plugin)
})
