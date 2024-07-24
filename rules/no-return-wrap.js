/**
 * Rule: no-return-wrap function
 * Prevents unnecessary wrapping of results in Promise.resolve
 * or Promise.reject as the Promise will do that for us
 */

'use strict'

const { getAncestors } = require('./lib/eslint-compat')
const getDocsUrl = require('./lib/get-docs-url')
const isPromise = require('./lib/is-promise')

/**
 * @param {import('eslint').Rule.RuleContext} context
 * @param {import('eslint').Rule.Node} node
 */
function isInPromise(context, node) {
  let functionNode = /** @type {import('eslint').Rule.Node} */ (
    getAncestors(context, node)
      .filter((node) => {
        return (
          node.type === 'ArrowFunctionExpression' ||
          node.type === 'FunctionExpression'
        )
      })
      .reverse()[0]
  )
  while (
    functionNode &&
    functionNode.parent &&
    functionNode.parent.type === 'MemberExpression' &&
    functionNode.parent.object === functionNode &&
    functionNode.parent.property.type === 'Identifier' &&
    functionNode.parent.property.name === 'bind' &&
    functionNode.parent.parent &&
    functionNode.parent.parent.type === 'CallExpression' &&
    functionNode.parent.parent.callee === functionNode.parent
  ) {
    functionNode = functionNode.parent.parent
  }
  return functionNode && functionNode.parent && isPromise(functionNode.parent)
}

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow wrapping values in `Promise.resolve` or `Promise.reject` when not needed.',
      url: getDocsUrl('no-return-wrap'),
    },
    messages: {
      resolve: 'Avoid wrapping return values in Promise.resolve',
      reject: 'Expected throw instead of Promise.reject',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowReject: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {}
    const allowReject = options.allowReject

    /**
     * Checks a call expression, reporting if necessary.
     * @param {import('estree').CallExpression
     * } callExpression The call expression.
     * @param {import('eslint').Rule.Node} node The node to report.
     */
    function checkCallExpression({ callee }, node) {
      if (
        isInPromise(context, node) &&
        callee.type === 'MemberExpression' &&
        'name' in callee.object &&
        callee.object.name === 'Promise' &&
        'name' in callee.property
      ) {
        if (callee.property.name === 'resolve') {
          context.report({ node, messageId: 'resolve' })
        } else if (!allowReject && callee.property.name === 'reject') {
          context.report({ node, messageId: 'reject' })
        }
      }
    }

    return {
      ReturnStatement(node) {
        if (node.argument && node.argument.type === 'CallExpression') {
          checkCallExpression(node.argument, node)
        }
      },
      /**
       * @param {import('estree').CallExpression & import('eslint').Rule.Node} node
       */
      'ArrowFunctionExpression > CallExpression'(node) {
        checkCallExpression(node, node)
      },
    }
  },
}
