"use strict";

var util = require('util');

var loader = require('./loader.js');
var factory = require('./factory.js');

var walk = require('walk');
var files = [];

var st = {};

// Walker options
var walker  = walk.walk('./webidl/webidl', { followLinks: false });

walker.on('file', function(root, stat, next) {
  // Add this file to the list of files
  st = loader.file(root + '/' + stat.name, st);
  next();
});

walker.on('end', function() {
  "use strict";

  console.log(util.inspect(st, {showHidden: false, depth: null}));
});

