"use strict";

var util = require('util');

var loader = require('./loader.js');
var transformer = require('./transform.js');

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

  var data = transformer.run(st);
  console.log(util.inspect(data, {showHidden: false, depth: null}));
  // console.log(util.inspect(st, {showHidden: false, depth: null}));
});

