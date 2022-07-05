const diagnostics = require('diagnostics');
const { readFileSync } = require('fs');
const debug = diagnostics('setup-env');
const resolves = require('resolves');
const { join } = require('path');

//
// The root location that we want to start searching for a package.json of the
// project that is using us.
//
const root = process.cwd();

//
// First thing we need to solve is to locate the `package.json` of the user
// so we can start searching for `setup-env` specific configurations.
//
const json = resolves(root, (dir) => {
  const file = join(dir, 'package.json');

  //
  // Please note that it's perfectly fine to use `sync` functions here. We
  // are in a bootstrap process. It's worth noting that we don't care if the
  // file exists here the `readFileSync` will thrown an error if it does.
  //
  let data;
  try { data = JSON.parse(readFileSync(file, 'utf-8')); }
  catch (e) { return false; }

  //
  // We've found our file, we want to make sure that we have a root
  // location in our configuration so set the directory that we're
  // currently in as the root.
  //
  if ('object' !== typeof data.setup) data.setup = {};
  data.setup.root = dir

  return data;
}) || {};

//
// Check if we have a custom configuration object in our package.json and if
// we do, we want to merge it with our own default configuration to ensure
// that all required configuration values are set.
//
const config = Object.assign({
  //
  // userAgent that will be used by JSDOM for the HTTP requests it could make
  //
  userAgent: `Node.js (setup-env: ${require('./package.json').version})`,

  //
  // Steps, and their order of execution which are done to prepare the
  // enviroment.
  //
  steps: [
    'env',          // Prepare the NODE_ENV.
    'register',     // Setup @babel/register.
    'enzyme',       // Configure enzyme Adapter.
    //
    // Note to future self: The order here somehow matters, when this is
    // switched with enzyme, CI, and tests will not exit cleanly.
    //
    'jsdom',        // Prepare enviroment for { mount } support.
    'static',       // Allow require of static assets in Node.js.
    'assert'        // Introduce plugins to assert frameworks.
  ],

  //
  // Options that are passed into the @babel/register hook.
  //
  babel: {},

  //
  // Additional configuration for JSDOM if needed.
  //
  jsdom: {},

  //
  // Additional configuration for enzyme
  //
  enzyme: {},

  //
  // Custom loader modules for a given extension that is listed below. This
  // allows you to manually process the extensions if needed. e.g. return
  // buffer instances instead of paths to the files.
  //
  loaders: {},

  //
  // File extensions support that we need to inject into `require` system
  // of node.
  //
  extensions: [
    //
    // Styling.
    //
    '.css', '.scss', '.sass', '.pcss', '.stylus', '.styl', '.less',

    //
    // Generic assets.
    //
    '.gif', '.jpeg', '.jpg', '.png', '.apng', '.svg', '.webp', '.ico', '.bmp',

    //
    // Font files
    //
    '.ttf', '.otf', '.woff', '.woff2', '.eot',

    //
    // Video an audio files.
    //
    '.mp4', '.webm', '.ogv', '.aac', '.mp3', '.wav', '.ogg', '.mpg', '.mov',
    '.avi'
  ],

  //
  // The directory where we've found the users package.json.
  //
  root
}, json.setup || {});

/**
 * Simple helper to prevent console from puking during the setup as certain
 * modules just like to be chatty, while we have them covered in our fallback
 * logic.
 *
 * @returns {Function} Undo what we just ignored.
 * @public
 */
function ignore() {
  const methods = ['warn', 'error', 'log'];
  const ignored = {};

  methods.forEach(function ignore(method) {
    ignored[method] = console[method];
    console[method] = (line, ...args) => {
      debug('console['+ method +'] intercepted: '+ line, ...args);
    };
  });

  return function unignore() {
    methods.forEach(function ignore(method) {
      console[method] = ignored[method];
      delete ignored[method];
    });
  }
}

/**
 * Find packages in the users package.json based on a given regexp.
 *
 * @param {RegExp|String} matcher RegExp/string the package name needs to match.
 * @returns {Array} Matches
 * @public
 */
function search(matcher) {
  return [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'bundledDependencies'
  ].reduce(function reducePackages(packages, field) {
    if (!(field in json)) return packages;

    const found = Object.keys(json[field]).map(function transform(name) {
      return {
        version: json[field][name],
        name: name,
        type: field
      };
    });

    return packages.concat(found);
  }, []).filter(function searchAdapter(spec) {
    if (typeof matcher === 'string') return matcher === spec.name;

    return matcher.test(spec.name);
  });
}

/**
 * Execute the steps when the file is required.
 *
 * @type {Object} Our configuration and utilities.
 * @public
 */
debug('preparing enviroment with the following steps', config.steps);
module.exports = config.steps.reduce((data, step) => {
  let patch = {};

  //
  // Give each step a dedicated logger so anything that they output will be
  // correctly namespaced in the debugger.
  //
  const debug = diagnostics(`setup-env:${step}`);
  data.debug = debug;

  try { patch = require(`./${step}`)(data); }
  catch (e) { debug('encountered an error during setup', e); }

  //
  // Allow steps to modify the data structure that we pass to each step
  // so it can provide contextual information for next steps if needed.
  //
  return Object.assign(data, patch || {});
}, { json, config, ignore, search });
