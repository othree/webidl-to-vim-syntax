
var factory = {
  constructor: function (def) {
    return {
      name: def.name,
      type: 'cons',
      members: factory.members(def.members)
    }
  },
  object: function (def) {
    return {
      name: def.name,
      primary: def.primary,
      type: 'prop',
      members: factory.members(def.members)
    }
  },
  members: function (members) {
    "use strict";
    return members.map(function (member) {
      var idltype = null;
      return {
        name: member.name,
        type: (member.type === 'operation') ? 'method' : 'prop',
        static: member.static,
        interface: member.idl
      };
    });
  }
};

module.exports = factory;
