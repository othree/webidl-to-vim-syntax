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
var transform = {
  constructor: function (def) {
    return {
      name: def.name,
      type: 'cons',
      members: transform.members(def.members)
    }
  },
  object: function (def) {
    return {
      name: def.name,
      type: 'prop',
      members: transform.members(def.members)
    }
  },
  assignMembers: function (target, fromInterfaces) {
    target.members = target.members.concat(transform.members(fromInterfaces.members));
  },
  implements: function (target, from, st) {
    "use strict";
    if (st.interfaces[from]) {
      transform.assignMembers(target, st.interfaces[from]);
    }
    if (st.implementations[from]) {
      for (let from of st.implementations[from]) {
        transform.implements(target, from, st);
      }
    }
  },
  members: function (members) {
    "use strict";
    return members.map(function (member) {
      return {
        name: member.name,
        type: (member.type === 'operation') ? 'method' : 'prop'
      };
    });
  },
  gen: function (st) {
    "use strict";
    var primaryGlobal = [];

    for (let name in st.interfaces) {
      let o = null;
      let currentInterface = st.interfaces[name];
      if (currentInterface.constructor) {
        o = transform.constructor(currentInterface);
      } else if (currentInterface.named) {
        o = transform.constructor(currentInterface);
      } else if (currentInterface.nointerface) {
        continue;
      } else {
        o = transform.object(currentInterface);
      }
      if (st.implementations[name]) {
        for (let from of st.implementations[name]) {
          transform.implements(o, from, st);
        }
      }

      primaryGlobal.push(o);
    }

    return primaryGlobal;
  }
};

module.exports = transform;
