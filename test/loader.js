module.exports = function customLoader(Module) {
  Module.exports = {
    content: require('fs').readFileSync(Module.filename),
    data: 'this file is processed by a custom loader'
  };
}
