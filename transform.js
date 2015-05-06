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
var factory = require('./factory.js');

var transform = {
  constructor: function (def) {
    return factory.constructor(def);
  },
  object: function (def) {
    return factory.object(def);
  },
  assignMembers: function (target, fromInterfaces) {
    target.members = target.members.concat(factory.members(fromInterfaces.members));
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
  run: function (st) {
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
