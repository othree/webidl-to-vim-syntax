"use strict";

var parse = require("webidl2").parse;
var fs = require('fs');
var factory = require('./factory.js');

var walk    = require('walk');
var files   = [];

// Walker options
var walker  = walk.walk('./webidl/webidl', { followLinks: false });

walker.on('file', function(root, stat, next) {
  // Add this file to the list of files
  files.push(root + '/' + stat.name);
  next();
});

walker.on('end', function() {
  "use strict";

  for (let file of files) {
    console.log(file);
    let tree = parse(fs.readFileSync(file, 'utf8'));

    for (let def of tree) {
      if (def.type === 'interface') {
        if (def.partial) {
          console.log(' partial');
        }
        console.log(` Interface: ${def.name}`);
      } else if (def.type === 'implements') {
        console.log(` ${def.target} implements ${def.implements}`);
      } else {
        console.log(` [${def.type}]`);
      }
    }
  }
});


// var tree = WebIDL2.parse(fs.readFileSync(file, 'utf8'));



// var exposed;

// for (let def of tree) {
  // if (def.type === 'interface') {
    // console.log(JSON.stringify(factory.object(def)));
    // console.log(def.name);
    // exposed = exposedTo(def);
    // if (exposed.length) {
      // console.log(` Exposed To: ${JSON.stringify(exposed)}`);
    // }
    // memberTraversal(def, function (member) {
      // if (member.type === 'operation') {
        // console.log(`  method: ${member.name}`)
      // } else {
        // console.log(`  attrib: ${member.name}`)
      // }
    // });
  // }
// }
