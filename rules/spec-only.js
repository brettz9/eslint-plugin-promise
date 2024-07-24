'use strict'

const PROMISE_STATICS = require('./lib/promise-statics')
const getDocsUrl = require('./lib/get-docs-url')

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow use of non-standard Promise static methods.',
      url: getDocsUrl('spec-only'),
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedMethods: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      avoidNonStandard: "Avoid using non-standard 'Promise.{{ name }}'",
    },
  },
  create(context) {
    const { allowedMethods = /** @type {string[]} */ ([]) } =
      context.options[0] || {}

    return {
      MemberExpression(node) {
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'Promise' &&
          (!('name' in node.property) ||
            !(node.property.name in PROMISE_STATICS)) &&
          (!('name' in node.property) ||
            !allowedMethods.includes(node.property.name))
        ) {
          context.report({
            node,
            messageId: 'avoidNonStandard',
            data: {
              name: /** @type {import('estree').Identifier} */ (node.property)
                .name,
            },
          })
        }
      },
    }
  },
}
