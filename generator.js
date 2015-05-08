
var util = require('util');

var generator = {
  run: function (data) {
    console.log(util.inspect(data, {showHidden: false, depth: null}));
  }
};

module.exports = generator;
