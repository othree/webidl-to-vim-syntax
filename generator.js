
var util = require('util');

var generator = {
  run: function (data) {
    "use strict";
    for (let o of data) {
      if (o.type === 'cons') {
        console.log(`syntax keyword javascriptGlobal ${o.name}`);
      } else {
        console.log(`syntax keyword javascriptGlobal ${o.name} nextgroup=javascript${o.name}Dot`);
        console.log(`syntax match   javascriptGlobal${o.name}Dot /\./ contained nextgroup=javascript${o.name}Method`);
      }
      for (let m of o.members) {
      }
    }
  }
};

module.exports = generator;
