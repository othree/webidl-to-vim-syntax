var WebIDL2 = require("webidl2");
var fs = require('fs');

var file = process.argv[2];

var tree = WebIDL2.parse(fs.readFileSync(file, 'utf8'));

console.log(tree);
