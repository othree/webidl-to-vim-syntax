
var util = require('util');

var generator = {
  run: function (data) {
    "use strict";
    var allprops = [];
    var allcons = [];
    var allkeys = [];
    for (let o of data) {
      let ms = false;
      let ps = false;
      let props = [];
      let methods = [];
      if (o.members) {
        for (let m of o.members) {
          if (m.type === 'prop' && m.name !== 'contains') {
            props.push(m.name);
            ps = true;
          } 
          if (m.type === 'method' && m.name !== 'contains') {
            methods.push(m.name);
            ms = true;
          }
        }
      }
      if (o.type === 'cons') {
        allcons.push(o.name);
        if (ms) {
          console.log(`sy keyword javascript${o.name}Methods contained ${methods.join(' ')} nextgroup=javascriptFuncCallArg`);
          allprops.push(`javascript${o.name}Methods`);
          allkeys.push(`javascript${o.name}Methods`);
        }
        if (ps) {
          console.log(`sy keyword javascript${o.name}Props contained ${props.join(' ')}`);
          allprops.push(`javascript${o.name}Props`);
          allkeys.push(`javascript${o.name}Props`);
        }
      } else {
        let next = '';
        if (ms || ps) {
          next = 'nextgroup=';
          let ns = [];
          if (ms) { ns.push(`javascript${o.name}Methods`); }
          if (ps) { ns.push(`javascript${o.name}Props`); }
          next += ns.join(',');

          console.log(`sy keyword javascriptGlobal ${o.name} nextgroup=javascript${o.name}Dot`);
          console.log(`sy match   javascript${o.name}Dot /\\./ contained ${next}`);
          let contained = o.primary ? '' : 'contained';
          if (ms) {
            console.log(`sy keyword javascript${o.name}Methods ${contained} ${methods.join(' ')} nextgroup=javascriptFuncCallArg`);
            allkeys.push(`javascript${o.name}Methods`);
          }
          if (ps) {
            console.log(`sy keyword javascript${o.name}Props ${contained} ${props.join(' ')}`);
            allkeys.push(`javascript${o.name}Props`);
          }
        } else if (o.interface) {
          console.log(`sy keyword javascriptGlobal ${o.name} nextgroup=javascript${o.interface}Dot`);
        } else {
          // no members
          allcons.push(o.name);
          continue;
        }
      }
    }
    console.log(`sy keyword javascriptGlobal ${allcons.join(' ')}`);
    console.log(`sy cluster props add=${allprops.join(',')}`);
    for (let k of allkeys) {
      console.log(`hi def link ${k} keyword`);
    }
  }
};

module.exports = generator;
