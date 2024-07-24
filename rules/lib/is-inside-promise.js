'use strict'

/**
 * @param {import('eslint').Rule.Node} node
 */
function isInsidePromise(node) {
  const isFunctionExpression =
    node.type === 'FunctionExpression' ||
    node.type === 'ArrowFunctionExpression'
  const parent = node.parent || {}
  const callee = 'callee' in parent ? parent.callee : {}
  const name =
    ('property' in callee &&
      callee.property &&
      typeof callee.property === 'object' &&
      'name' in callee.property &&
      callee.property.name) ||
    ''
  const parentIsPromise = name === 'then' || name === 'catch'
  const isInCB = isFunctionExpression && parentIsPromise
  return isInCB
}

module.exports = isInsidePromise
