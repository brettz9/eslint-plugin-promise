'use strict'

const isInsidePromise = require('./is-inside-promise')

/**
 * @param {import('eslint').Rule.Node} node
 */
function isInsideCallback(node) {
  const isFunction =
    node.type === 'FunctionExpression' ||
    node.type === 'ArrowFunctionExpression' ||
    node.type === 'FunctionDeclaration' // this may be controversial

  // it's totally fine to use promises inside promises
  if (isInsidePromise(node)) return

  const name =
    'params' in node &&
    node.params &&
    node.params[0] &&
    'name' in node.params[0] &&
    node.params[0].name
  const firstArgIsError = name === 'err' || name === 'error'
  const isInACallback = isFunction && firstArgIsError
  return isInACallback
}

module.exports = isInsideCallback
