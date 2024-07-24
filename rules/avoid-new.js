/**
 * Rule: avoid-new
 * Avoid creating new promises outside of utility libraries.
 */

'use strict'

const getDocsUrl = require('./lib/get-docs-url')

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow creating `new` promises outside of utility libs (use [util.promisify][] instead).',
      url: getDocsUrl('avoid-new'),
    },
    schema: [],
    messages: {
      avoidNew: 'Avoid creating new promises.',
    },
  },
  create(context) {
    return {
      NewExpression(node) {
        if ('name' in node.callee && node.callee.name === 'Promise') {
          context.report({ node, messageId: 'avoidNew' })
        }
      },
    }
  },
}
