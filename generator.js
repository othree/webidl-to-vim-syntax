/*
 *
 * [
 *   {
 *     name: 'name',
 *     type: 'cons' or 'method' or 'prop',
 *     members: [
 *       {
 *         name: 'name',
 *         type: 'method' or 'prop'
 *       }
 *     ]
 *   }
 * ]
 *
 */
var generator = {
  constructor: function (def) {
    return {
      name: def.name,
      type: 'cons',
      members: generator.members(def.members)
    }
  },
  object: function (def) {
    return {
      name: def.name,
      type: 'prop',
      members: generator.members(def.members)
    }
  },
  assignMembers: function (target, fromInterfaces) {
    target.members = target.members.concat(generator.members(fromInterfaces.members));
  },
  implements: function (target, from, st) {
    generator.assignMembers(target, st.interfaces[from]);
    if (st.implementations[from]) {
      for (let from of st.implementations[from]) {
        generator.implements(target, from, st);
      }
    }
  },
  mambers: function (members) {
    return members.map(function (member) {
      return {
        name: member.name,
        type: (member.type === 'operation') ? 'method' : 'prop'
      };
    });
  }
  gen: function (st) {
    var primaryGlobal = [];

    for (let name in st.interfaces) {
      let o = null;
      let currentInterface = st.interfaces[name];
      if (currentInterface.constructor) {
        o = generator.constructor(currentInterface);
      } else if (currentInterface.named) {
        o = generator.constructor(currentInterface);
      } else if (currentInterface.nointerface) {
        continue;
      } else {
        o = generator.object(currentInterface);
      }
      if (st.implementations[name]) {
        for (let from of st.implementations[name]) {
          generator.implements(o, from);
        }
      }

      primaryGlobal.push(o);
    }

    return primaryGlobal;
  };
};

module.exports = generator;
