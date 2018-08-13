/**
 * But y tho:
 *
 * The Components that we've written could be processed with WebPack in order
 * to handle the importing of CSS, SCSS or other static files directly into the
 * component. Unfortunately, Node doesn't understand these requires and will
 * attempt execute the files as JavaScript, creating errors. We are going to
 * register additional loaders in Node.js to handle all these static files.
 *
 * @param {Object} setup Configuration and utilities to setup the test suite.
 * @returns {Undefined} Nope, nothing.
 * @private
 */
module.exports = function staticLoaders({ debug, config }) {
  const { extensions, loaders, root } = config;
  const path = require('path');

  /**
   * The default handler of static assets. This is really dirty and you should
   * look away before your eyes start burning. We are going to  override the
   * `exports` of the module instance with the filename. This allows you to
   * assert that the correct file is loaded/used in your tests without having to
   * figure out how to process the file contents.
   *
   * @param {Module} eww The Module instances for given file.
   * @private
   */
  function defaultLoader(eww) {
    eww.exports = eww.filename;
  }

  //
  // Setup our custom handlers and custom loaders.
  //
  debug('Adding custom extensions loaders for', extensions.join(', '));
  extensions.forEach(function registerLoader(ext) {
    const old = require.extensions[ext];
    let loader = loaders[ext];

    if (old) return debug('Loader already exists for %s, not updating', ext);
    if (!loader) return require.extensions[ext] = defaultLoader;

    //
    // A custom loader is requested for the given file extension, now we need
    // to figure out if it's a local dependency of the project or a module
    // or an npm module. We're going to be sipmle here for now, if it starts
    // with a `.` assume local, and path.join it with the directory.
    //
    if (loader.charAt(0) === '.') loader = path.join(root, loader);

    debug('Adding custom loader(%s) for ext(%s)', loader, ext);
    require.extensions[ext] = require(loader);
  });
};
