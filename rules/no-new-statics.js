'use strict'

const PROMISE_STATICS = require('./lib/promise-statics')
const getDocsUrl = require('./lib/get-docs-url')

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow calling `new` on a Promise static method.',
      url: getDocsUrl('no-new-statics'),
    },
    fixable: 'code',
    schema: [],
    messages: {
      avoidNewStatic: "Avoid calling 'new' on 'Promise.{{ name }}()'",
    },
  },
  create(context) {
    return {
      NewExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          'name' in node.callee.object &&
          node.callee.object.name === 'Promise' &&
          'name' in node.callee.property &&
          node.callee.property.name in PROMISE_STATICS &&
          PROMISE_STATICS[
            /** @type {keyof PROMISE_STATICS} */
            (node.callee.property.name)
          ]
        ) {
          context.report({
            node,
            messageId: 'avoidNewStatic',
            data: { name: node.callee.property.name },
            fix(fixer) {
              const x =
                /** @type {import('estree').Node & {range: [number, number]}} */ (
                  node
                ).range[0]
              return fixer.replaceTextRange([x, x + 'new '.length], '')
            },
          })
        }
      },
    }
  },
}
