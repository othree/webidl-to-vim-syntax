"use strict";

var util = require('util');

var parse = require("webidl2").parse;
var fs = require('fs');
var factory = require('./factory.js');

var walk    = require('walk');
var files   = [];

var intfs   = {};
var impls   = {};
var primaryGlobal = null;

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
      if (/^(?:moz|Moz|XUL)/.test(def.name)) {
        continue;
      }
      let primary = false;
      let constructor = false;
      let nointerface = false;
      let named = null;
      let exposed = [];

      if (def.extAttrs) {
        for (let attr of def.extAttrs) {
          if (attr.name === 'PrimaryGlobal') {
            primary = true;
          }
          if (attr.name === 'Constructor') {
            constructor = true;
          }
          if (attr.name === 'NamedConstructor') {
            named = attr.rhs.value;
          }
          if (attr.name === 'NoInterfaceObject') {
            nointerface = true;
          }
          if (attr.name === 'Exposed') {
            exposed = attr.rhs;
            if (!Array.isArray(exposed)
             && exposed.type === 'identifier') {
              exposed = [exposed.value];
            }
          }
        }
      }

      if (def.type === 'interface') {
        if (def.partial) {
          console.log(' partial');
        }
        console.log(` Interface: ${def.name}`);
        var members = [];
        for (let prop of def.members) {
          if (/^(?:moz|Moz)/.test(prop.name)) {
            continue;
          }
          members.push({
            name: prop.name,
            type: prop.type
          });
        }
        if (def.partial) {
          intfs[def.name]['members'] = intfs[def.name]['members'].concat(members);
        } else {
          intfs[def.name] = {
            name: def.name,
            cons: constructor,
            named: named,
            nointerface: nointerface,
            members: members,
            exposed: exposed,
            primary: primary
          };
          if (primary) {
            primaryGlobal = intfs[def.name];
          }
        }
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

  // console.log(util.inspect(intfs, {showHidden: false, depth: null}));
  console.log(primaryGlobal);

});

