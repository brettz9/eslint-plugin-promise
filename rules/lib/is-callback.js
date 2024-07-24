'use strict'

const isNamedCallback = require('./is-named-callback')

/**
 * @param {import('estree').Node} node
 * @param {string[]} exceptions
 */
function isCallback(node, exceptions) {
  const isCallExpression = node.type === 'CallExpression'
  // istanbul ignore next -- always invoked on `CallExpression`
  const callee = 'callee' in node ? node.callee : { name: '' }
  const nameIsCallback =
    'name' in callee ? isNamedCallback(callee.name, exceptions) : false
  const isCB = isCallExpression && nameIsCallback
  return isCB
}

module.exports = isCallback
