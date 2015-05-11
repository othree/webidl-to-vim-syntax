
var util = require('util');

var generator = {
  run: function (data) {
    "use strict";
    for (let o of data) {
      let ms = false;
      let ps = false;
      let props = [];
      let methods = [];
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
      if (o.type === 'cons') {
        console.log(`syntax keyword javascriptGlobal ${o.name}`);
        if (ms) {
          console.log(`syntax keyword javascript${o.name}Methods contained ${methods.join(' ')} nextgroup=javascriptFuncCallArg`);
          console.log(`syntax cluster props add=javascript${o.name}Methods`);
          console.log(`hi def link javascript${o.name}Methods keyword`);
        }
        if (ps) {
          console.log(`syntax keyword javascript${o.name}Props contained ${props.join(' ')}`);
          console.log(`syntax cluster props add=javascript${o.name}Props`);
          console.log(`hi def link javascript${o.name}Props keyword`);
        }
      } else {
        console.log(`syntax keyword javascriptGlobal ${o.name} nextgroup=javascript${o.name}Dot`);
        let next = '';
        if (ms || ps) {
          next = 'nextgroup=';
          let ns = [];
          if (ms) { ns.push(`javascript${o.name}Methods`); }
          if (ps) { ns.push(`javascript${o.name}Props`); }
          next += ns.join(',');
        }
        console.log(`syntax match   javascript${o.name}Dot /\\./ contained ${next}`);
        if (ms) {
          console.log(`syntax keyword javascript${o.name}Methods contained ${methods.join(' ')} nextgroup=javascriptFuncCallArg`);
          console.log(`hi def link javascript${o.name}Methods keyword`);
        }
        if (ps) {
          console.log(`syntax keyword javascript${o.name}Props contained ${props.join(' ')}`);
          console.log(`hi def link javascript${o.name}Props keyword`);
        }
      }
    }
  }
};

module.exports = generator;
