/**
 * Apply additional patches to the JSDOM environment.
 *
 * @returns {Undefined} Absolutely nothing.
 */
function patch() {
  const { window } = global;

  //
  // JSDOM doesn't support the 2nd argument of getComputedStyle and throws a
  // Not implemented error, while it's true that is not functional, this
  // thrown errors and breaks test suites for no reason.
  //
  const errors = [];
  const error = console.error;
  console.error = (e) => errors.push(e);

  try {
    window.getComputedStyle(document.body, ':after');
  } catch (_) {}

  console.error = error;

  if (errors.length && errors[0].includes('Not implemented: window.computedStyle(elt, pseudoElt)')) {
    const { getComputedStyle } = window;
    window.getComputedStyle = (elt) => getComputedStyle(elt);
  }

  //
  // Ayo what is going on here you might ask, well lmao, your node process
  // will freeze if you use JSDOM, React, and node with some very specific
  // versioning conditions.
  //
  // https://github.com/facebook/react/issues/20756
  //
  // The only solution is to just nuke it.
  //
  try {
    const version = require('react').version.split('.');
    if (+version[0] < 17 || (+version[0] === 17 && +version[1] < 1)) {
      delete global.MessageChannel;
    }
  } catch (_) {}
}

/**
 * But y tho:
 *
 * There are cases where you actually want to have a full render/lifecycle
 * of your React components to ensure that all refs, and lifecycles and what
 * not are working as intended. So it needs to be mounted in the `DOM`. We
 * can simulate the enviroment in Node.js using JSDom.
 *
 * @param {Object} setup Configuration and utilities to setup the test suite.
 * @returns {Undefined} Nope, nothing.
 * @private
 */
module.exports = function jsdomMount({ debug, config, ignore }) {
  if (typeof global.window !== 'undefined' && typeof global.document !== 'undefined') {
    debug('Enviroment already has a window & document global, ignoring jsdom');
    return patch();
  }

  //
  // Prevent `enzyme/withDom` from puking bullshit into the console. We got you
  // fam.
  //
  const unignore = ignore();

  try { require('enzyme/withDom'); }
  catch (e) {};

  unignore();

  //
  // Check if it was sucessfull because the setup logic that ships with enzyme
  // only works with ancient versions of JSDOM.
  //
  if (typeof global.window !== 'undefined' && typeof global.document !== 'undefined') {
    debug('Enviroment already has a window & document global, ignoring jsdom');
    return patch();
  }

  //
  // The adapter that ships with enzyme is configured for really old versions
  // of JSDOM so if the statement above fails it means that we are either using
  // the latest and greatest version of JSDOM (or enzyme is not installed).
  //
  // In all those cases, we manually want to prepare the enviroment with the
  // correct global variables.
  //
  const { JSDOM } = require('jsdom');
  const page = new JSDOM('<!doctype html><html><body></body></html>', Object.assign({
    userAgent: config.userAgent,

    //
    // URL is required or we will get thrown security errors when we attempt
    // to copy over API's like `localStorage` from the JSDOM instance.
    //
    url: 'http://localhost'
  }, config.jsdom));

  //
  // Alias the jsdom reference onto this module for easy
  // require / import in tests when necessary.
  //
  module.exports.jsdom = page;

  //
  // Introduce the variables to the global scope.
  //
  const { window } = page;
  global.window = window;
  global.document = window.document;
  global.navigator = {
    userAgent: config.userAgent
  };

  Object.defineProperties(
    global,
    Object.getOwnPropertyNames(window).filter(prop => {
      return typeof global[prop] === 'undefined';
    }).reduce((result, prop) => {
      result[prop] = Object.getOwnPropertyDescriptor(window, prop);
      debug('Introducing %s to the global namespace', prop);

      return result;
    }, {})
  );

  patch();
};
