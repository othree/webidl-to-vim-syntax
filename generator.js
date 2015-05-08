
var util = require('util');

var generator = {
  run: function (data) {
    "use strict";
    for (let o of data) {
      console.log(`${o.name}: ${o.type}`);
      for (let m of o.members) {
        console.log(`  ${m.name}: ${m.type}`);
      }
    }
  }
};

module.exports = generator;
