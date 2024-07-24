'use strict'

const { getAncestors } = require('./lib/eslint-compat')
const getDocsUrl = require('./lib/get-docs-url')

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer `async`/`await` to the callback pattern.',
      url: getDocsUrl('prefer-await-to-callbacks'),
    },
    messages: {
      error: 'Avoid callbacks. Prefer Async/Await.',
    },
    schema: [],
  },
  create(context) {
    /**
     * @param {(import('estree').FunctionDeclaration|import('estree').FunctionExpression|
     *   import('estree').ArrowFunctionExpression) & import('eslint').Rule.Node} node
     */
    function checkLastParamsForCallback(node) {
      const lastParam = node.params[node.params.length - 1] || {}
      if (
        'name' in lastParam &&
        (lastParam.name === 'callback' || lastParam.name === 'cb')
      ) {
        context.report({ node: lastParam, messageId: 'error' })
      }
    }

    /**
     * @param {import('eslint').Rule.Node} node
     */
    function isInsideYieldOrAwait(node) {
      return getAncestors(context, node).some((parent) => {
        return (
          parent.type === 'AwaitExpression' || parent.type === 'YieldExpression'
        )
      })
    }
    return {
      CallExpression(node) {
        // Callbacks aren't allowed.
        if (
          'name' in node.callee &&
          (node.callee.name === 'cb' || node.callee.name === 'callback')
        ) {
          context.report({ node, messageId: 'error' })
          return
        }

        // Then-ables aren't allowed either.
        const args = node.arguments
        const lastArgIndex = args.length - 1
        const arg = lastArgIndex > -1 && node.arguments[lastArgIndex]
        if (
          arg &&
          (arg.type === 'FunctionExpression' ||
            arg.type === 'ArrowFunctionExpression')
        ) {
          // Ignore event listener callbacks.
          if (
            'property' in node.callee &&
            node.callee.property &&
            'name' in node.callee.property &&
            (node.callee.property.name === 'on' ||
              node.callee.property.name === 'once')
          ) {
            return
          }

          // carve out exemption for map/filter/etc
          const arrayMethods = [
            'map',
            'every',
            'forEach',
            'some',
            'find',
            'filter',
          ]
          const isLodash =
            'object' in node.callee &&
            node.callee.object &&
            'name' in node.callee.object &&
            ['lodash', 'underscore', '_'].includes(node.callee.object.name)
          const callsArrayMethod =
            'property' in node.callee &&
            node.callee.property &&
            'name' in node.callee.property &&
            arrayMethods.includes(node.callee.property.name) &&
            (node.arguments.length === 1 ||
              (node.arguments.length === 2 && isLodash))
          const isArrayMethod =
            'name' in node.callee &&
            node.callee.name &&
            arrayMethods.includes(node.callee.name) &&
            node.arguments.length === 2
          if (callsArrayMethod || isArrayMethod) return

          // actually check for callbacks (I know this is the worst)
          if (
            arg.params &&
            arg.params[0] &&
            'name' in arg.params[0] &&
            (arg.params[0].name === 'err' || arg.params[0].name === 'error')
          ) {
            if (!isInsideYieldOrAwait(node)) {
              context.report({ node: arg, messageId: 'error' })
            }
          }
        }
      },
      FunctionDeclaration: checkLastParamsForCallback,
      FunctionExpression: checkLastParamsForCallback,
      ArrowFunctionExpression: checkLastParamsForCallback,
    }
  },
}
