'use strict'

/**
 * @param {import('eslint').Rule.RuleContext} context
 */
function getSourceCode(context) {
  if (context.sourceCode != null) {
    return context.sourceCode
  }

  return context.getSourceCode()
}

/**
 * @param {import('eslint').Rule.RuleContext} context
 * @param {import('eslint').Rule.Node} node
 * @returns {import('eslint').Rule.Node[]}
 */
function getAncestors(context, node) {
  const sourceCode = getSourceCode(context)
  if (typeof sourceCode.getAncestors === 'function') {
    return /** @type {import('eslint').Rule.Node[]} */ (
      sourceCode.getAncestors(node)
    )
  }

  return /** @type {import('eslint').Rule.Node[]} */ (context.getAncestors())
}

/**
 * @param {import('eslint').Rule.RuleContext} context
 * @param {import('estree').Node} node
 */
function getScope(context, node) {
  const sourceCode = getSourceCode(context)
  if (typeof sourceCode.getScope === 'function') {
    return sourceCode.getScope(node)
  }

  return context.getScope()
}

module.exports = {
  getSourceCode,
  getAncestors,
  getScope,
}
