// Borrowed from here:
// https://github.com/colonyamerican/eslint-plugin-cah/issues/3

'use strict'

const { getScope } = require('./lib/eslint-compat')
const getDocsUrl = require('./lib/get-docs-url')

/**
 * @param {import('eslint').Scope.Scope} scope
 * @param {import('eslint').Scope.Reference} ref
 */
function isDeclared(scope, ref) {
  return scope.variables.some((variable) => {
    if (variable.name !== ref.identifier.name) {
      return false
    }

    // Presumably can't pass this since the implicit `Promise` global
    //  being checked here would always lack `defs`
    // istanbul ignore else
    if (!variable.defs || !variable.defs.length) {
      return false
    }

    // istanbul ignore next
    return true
  })
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require creating a `Promise` constructor before using it in an ES5 environment.',
      url: getDocsUrl('no-native'),
    },
    messages: {
      name: '"{{name}}" is not defined.',
    },
    schema: [],
  },
  create(context) {
    /**
     * Checks for and reports reassigned constants
     *
     * @param {import('eslint').Scope.Scope} scope - an eslint-scope Scope object
     * @returns {void}
     * @private
     */
    return {
      'Program:exit'(node) {
        const scope = getScope(context, node)
        const leftToBeResolved =
          /** @type {import('eslint').Scope.Reference[]} */ (
            /** @type {import('eslint').Scope.Scope & {implicit: {left: import('eslint').Scope.Reference[]}}} */ (
              scope
            ).implicit.left ||
              /**
               * Fixes https://github.com/eslint-community/eslint-plugin-promise/issues/205.
               * The problem was that @typescript-eslint has a scope manager
               * which has `leftToBeResolved` instead of the default `left`.
               */
              /** @type {import('eslint').Scope.Scope & {implicit: {leftToBeResolved: import('eslint').Scope.Reference[]}}} */ (
                scope
              ).implicit.leftToBeResolved
          )

        leftToBeResolved.forEach((ref) => {
          if (ref.identifier.name !== 'Promise') {
            return
          }

          // istanbul ignore else
          if (!isDeclared(scope, ref)) {
            context.report({
              node: ref.identifier,
              messageId: 'name',
              data: { name: ref.identifier.name },
            })
          }
        })
      },
    }
  },
}
