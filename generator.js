
var generator = {
  constructor: function (def) {
  },
  object: function (def) {
  },
  implements: function (target, fromInterfaces) {
  },
  gen: function (st) {
    var primaryGlobal = {};

    for (let name in st.interfaces) {
      let o = null;
      let cons = false;
      let currentInterface = st.interfaces[name];
      if (currentInterface.primary) {
      } else if (currentInterface.constructor) {
        o = generator.constructor(currentInterface);
        cons = true;
      } else if (currentInterface.named) {
        o = generator.constructor(currentInterface);
        cons = true;
      } else if (currentInterface.nointerface) {
        continue;
      } else {
        o = generator.object(currentInterface);
      }
    }

    return primaryGlobal;
  };
};

module.exports = generator;
