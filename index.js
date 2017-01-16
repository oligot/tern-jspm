const fs = require('fs');
const path = require('path');
const reqFrom = require('req-from');
const reqCwd = require('req-cwd');
const jspm = reqCwd('jspm');

var infer;
var cache = {};
var loader;

function resolve(name, parentFile) {
  if (name.substr(0, 2) == './') {
    name = path.resolve(path.dirname(parentFile), name);
  }
  var resolved = loader.normalizeSync(name).replace("file://", "");
  if (process.platform === 'win32') {
    resolved = resolved.replace(/^\//, '');
  }
  if (resolved) {
    try {
      if (fs.statSync(resolved).isDirectory()) {
        resolved += '.js';
      }
    } catch(e) {
    }
  }
  resolved = resolved && infer.cx().parent.normalizeFilename(resolved);
  console.log(name, parentFile, resolved);
  if (name.substr(0, 4) == 'npm:') {
    cache[parentFile] = resolved;
  } else {
    resolved = cache[resolved] || resolved;
  }
  return resolved;
}

exports.initialize = function(ternDir) {
  jspm.setPackagePath('.');
  loader = jspm.Loader();
  reqFrom(path.resolve(ternDir, 'plugin'), './es_modules');
  reqFrom(path.resolve(ternDir, 'plugin'), './node_resolve');
  infer = reqFrom(path.resolve(ternDir, 'lib'), './infer');
  const tern = reqFrom(path.resolve(ternDir, 'lib'), './tern');
  tern.registerPlugin('jspm', function(server) {
    server.loadPlugin('es_modules');
    server.loadPlugin('node_resolve');
    server.mod.modules.resolvers.push(resolve);
  })
};
