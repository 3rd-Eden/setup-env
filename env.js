/**
 * But y tho:
 *
 * Tests are usually compiled using the `babel` compiler. This can be configured
 * using the `@babel/preset-env` plugin to allow different configurations per
 * environment. In order for this to work correct we need to have the correct
 * `NODE_ENV` set.
 *
 * @param {Object} setup Configuration and utilities to setup the test suite.
 * @returns {Undefined} Nope, nothing.
 * @private
 */
module.exports = function env({ debug }) {
  if (process.env.NODE_ENV) {
    debug('NOD_ENV is already set to `%s`, not updating.', process.env.NODE_ENV);
    return;
  }

  process.env.NODE_ENV = 'test';
  debug('Updated the NODE_ENV to `test`');
};
