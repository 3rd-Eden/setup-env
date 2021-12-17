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
module.exports = function enzymeAdapter({ debug, config, search }) {
  const enzyme = require('enzyme');
  const adapters = [];

  //
  // Allow enzyme adapter to be configured in case of using a custom adapter
  // that we cannot programatically discover.
  //
  if (config.enzyme && config.enzyme.adapter) {
    adapters.push(config.enzyme.adapter);
  }

  //
  // Get _all_ possible dependencies of the application in an attempt to
  // figure out which enzyme adapter needs to be loaded.
  //
  Array.prototype.push.apply(adapters, search(/enzyme-adapter-react-(\d|\.)+$/));
  if (adapters.length) debug('Found the following adapters in package.json', adapters);

  //
  // If we found nothing, we need to programatically generate the correct
  // enzyme-adapters. If we did found definitions before, it wouldn't really
  // matter as they are required in order of occurance anyways (and bailed out
  // on the first match).
  //
  try {
    const [ major, minor, patch ] = require('react').version.split('.');

    adapters.push({
      name: `enzyme-adapter-react-${major}`,
      type: 'guess work',
      version: 'latest'
    });

    adapters.push({
      name: `enzyme-adapter-react-${major}.${minor}`,
      type: 'guess work',
      version: 'latest'
    });

    adapters.push({
      name: `enzyme-adapter-react-${major}.${minor}.${patch}`,
      type: 'guess work',
      version: 'latest'
    });
  } catch (e) { debug('Unable to resolve enzyme adapter based on React version'); }

  adapters.some(function setupAdapter(spec) {
    try {
      const Adapter = require(spec.name);
      enzyme.configure({ adapter: new Adapter() });
    } catch (e) {

      debug(`Failed to load adapter ${spec.name} due to unknown error`, e);
      return false;
    }

    debug(`Enzyme configured with the ${spec.name} Adapter found through ${spec.type}`);
    return true;
  });

  return adapters;
};
