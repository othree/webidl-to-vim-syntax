"use strict";

var memberTraversal = function (node, fn) {
  for (let member of node.members) {
    fn(member, node);
  }
};

var parseExposed = function (node) {
  if (node.extAttrs) {
    for (let ext of node.extAttrs) {
      if (ext.name === 'Exposed') {
        return ext.rhs;
      }
    }
  }

  return [];
}

var factory = {
  object: function (data) {
    var name = data.name;
    var members = [];
    var exposed = parseExposed(data);
    memberTraversal(data, function (member) {
      members.push( factory.member(member) );
    });
    return {
      name: name,
      members: members,
      exposed: exposed
    };
  },
  member: function (data) {
    var name = data.name;
    var type = (data.type === 'operation') ? 'method' : 'property';
    return {
      name: name,
      type: type
    };
  }
};

module.exports = factory;
