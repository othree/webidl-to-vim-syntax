"use strict";

var parse = require("webidl2").parse;
var fs = require('fs');
var factory = require('./factory.js');

var walk    = require('walk');
var files   = [];

var intfs   = {};
var impls   = {};

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
      let primaryGlobal = false;
      let constructor = false;
      let exposed = [];
      let named = null;

      if (def.extAttrs) {
        for (let attr of def.extAttrs) {
          if (attr.name === 'PrimaryGlobal') {
            primaryGlobal = true;
          }
          if (attr.name === 'Constructor') {
            constructor = true;
          }
          if (attr.name === 'Exposed') {
            exposed = attr.rhs;
            if (!Array.isArray(exposed)
             && exposed.type === 'identifier') {
              exposed = [exposed.value];
            }
          }
          if (attr.name === 'NamedConstructor') {
            named = attr.rhs.value;
          }
        }
      }

      if (primaryGlobal) {
        console.log('');
        console.log('PrimaryGlobal');
      }
      if (def.type === 'interface') {
        if (def.partial) {
          console.log(' partial');
        }
        console.log(` Interface: ${def.name}`);
        var members = [];
        for (let prop of def.members) {
          members.push(`${prop.type}: ${prop.name}`);
        }
        intfs[def.name] = {
          name: def.name,
          named: named,
          cons: constructor,
          members: members,
          exposed: exposed
        };
        if (exposed) {
          console.log(`  Exposed: [${exposed.join(', ')}]`)
        }
      } else if (def.type === 'implements') {
        if (!impls[def.target]) { impls[def.target] = []; }
        impls[def.target].push(def.implements);

        console.log(` ${def.target} implements ${def.implements}`);
      } else {
        console.log(` [${def.type}]`);
      }
    }
  }

  console.log(intfs);

});

