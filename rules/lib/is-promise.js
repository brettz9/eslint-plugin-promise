/**
 * Library: isPromise
 * Makes sure that an Expression node is part of a promise.
 */
'use strict'

const PROMISE_STATICS = require('./promise-statics')

/**
 * @param {import('estree').Node} expression
 * @returns {expression is import('estree').CallExpression}
 */
function isPromise(expression) {
  return (
    // hello.then()
    (expression.type === 'CallExpression' &&
      expression.callee.type === 'MemberExpression' &&
      'name' in expression.callee.property &&
      expression.callee.property.name === 'then') ||
    // hello.catch()
    (expression.type === 'CallExpression' &&
      expression.callee.type === 'MemberExpression' &&
      'name' in expression.callee.property &&
      expression.callee.property.name === 'catch') ||
    // hello.finally()
    (expression.type === 'CallExpression' &&
      expression.callee.type === 'MemberExpression' &&
      'name' in expression.callee.property &&
      expression.callee.property.name === 'finally') ||
    // somePromise.ANYTHING()
    (expression.type === 'CallExpression' &&
      expression.callee.type === 'MemberExpression' &&
      isPromise(expression.callee.object)) ||
    // Promise.STATIC_METHOD()
    (expression.type === 'CallExpression' &&
      expression.callee.type === 'MemberExpression' &&
      expression.callee.object.type === 'Identifier' &&
      expression.callee.object.name === 'Promise' &&
      'name' in expression.callee.property &&
      expression.callee.property.name in PROMISE_STATICS &&
      PROMISE_STATICS[
        /** @type {keyof PROMISE_STATICS} */
        (expression.callee.property.name)
      ] &&
      expression.callee.property.name !== 'withResolvers')
  )
}

module.exports = isPromise
