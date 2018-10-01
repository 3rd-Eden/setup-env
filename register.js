/**
 * But y tho:
 *
 * Introduce `@babel/register` as loader for `require` statements so that the
 * code can be transformed before we execute a test suite.
 *
 * @param {Object} setup Configuration and utilities to setup the test suite.
 * @returns {Undefined} Nope, nothing.
 * @private
 */
module.exports = function babel({ debug, config, search }) {
  if (search('@babel/register').length) {
    require('@babel/register')(config.babel);
    debug('Initialized @babel/register');
  } else if (search('babel-register').length) {
    require('babel-register')(config.babel);
    debug('Added babel-register');
  } else {
    debug('No babel compiler');
  }
};
