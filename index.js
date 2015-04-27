"use strict";


var WebIDL2 = require("webidl2");
var fs = require('fs');
var factory = require('./factory.js');

var file = process.argv[2];

var tree = WebIDL2.parse(fs.readFileSync(file, 'utf8'));


var memberTraversal = function (node, fn) {
  for (let member of node.members) {
    fn(member, node);
  }
};

var exposedTo = function (node) {
  if (node.extAttrs) {
    for (let ext of node.extAttrs) {
      if (ext.name === 'Exposed') {
        return ext.rhs;
      }
    }
  }

  return [];
}

var exposed;

for (let def of tree) {
  if (def.type === 'interface') {
    console.log(JSON.stringify(factory.object(def)));
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
  }
}
