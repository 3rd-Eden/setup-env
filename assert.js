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
module.exports = function assert({ debug }) {
  /**
   * Simple helper function to register plugins in the assertion frameworks.
   *
   * @param {String} wat Name of the assertion library.
   * @param {Array} plugins Names of the plugins that it can use.
   * @private
   */
  function configure(wat, plugins) {
    let library;

    try { library = require(wat); }
    catch (e) { return; }

    debug('Found assertion library %s, attempting to add plugins', wat);

    plugins.reduce(function configureAssertion(instance, name) {
      try { instance.use(require(name)); }
      catch (e) { return instance; }

      debug('Added %s to %s', name, wat);
      return instance;
    }, library);
  }

  //
  // So you might think,
  //
  configure('chai', ['sinon-chai', 'enzyme-chai']);
  configure('assume', ['assume-sinon', 'assume-enzyme']);
};
