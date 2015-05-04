
if (!Object.assign) {
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(target, firstSource) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
      }

      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
          continue;
        }
        nextSource = Object(nextSource);

        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
      return to;
    }
  });
}

var loader = {
  definition: function (def) {
    var ext = loader.extattr(def);
    
    var d = null;

    if (d.type === 'interface') {
      d = loader.interface(def);
    } else if (def.type === 'implements') {
      d = loader.implements(def);
    }

    return Object.assign(d, ext);
  },
  extattr: function (def) {
    var primary = false;
    var constructor = false;
    var nointerface = false;
    var named = null;
    var exposed = [];

    if (def.extAttrs) {
      for (let attr of def.extAttrs) {
        if (attr.name === 'PrimaryGlobal')     { primary = true; }
        if (attr.name === 'Constructor')       { constructor = true; }
        if (attr.name === 'NamedConstructor')  { named = attr.rhs.value; }
        if (attr.name === 'NoInterfaceObject') { nointerface = true; }
        if (attr.name === 'Exposed') {
          exposed = attr.rhs;
          if (!Array.isArray(exposed)
           && exposed.type === 'identifier') {
            exposed = [exposed.value];
          }
        }
      }
    }

    return {
      primary,
      constructor,
      nointerface,
      named,
      exposed
    };
  },
  interface: function (def) {
    var type = 'interface';
    var name = def.name;
    var partial = def.partial;
    var members = [];
    for (let prop of def.members) {
      if (/^(?:moz|Moz)/.test(prop.name)) { continue; }
      members.push({
        name: prop.name,
        type: prop.type
      });
    }
    return {
      type,
      name,
      partial,
      members
    };
  },
  implements: function (def) {
    // console.log(` ${def.target} implements ${def.implements}`);
    var type = 'implements';
    return {
      target: def.target,
      implements: def.implements
    };
  },
  file: function (file, storage) {
    // console.log(file);
    if (!storage.interfaces)      { storage.interfaces = {}; }
    if (!storage.implementations) { storage.implementations = {}; }

    var tree = parse(fs.readFileSync(file, 'utf8'));

    for (let def of tree) {
      if (/^(?:moz|Moz|XUL)/.test(def.name)) { continue; }

      let d = loader.definition(def);

      if (d.type === 'interface') {
        if (d.partial) {
          storage.interfaces[d.name].members = storage.interfaces[d.name].members.concat(d.members);
        } else {
          storage.interfaces[d.name] = d;
        }
      } 
      if (d.type === 'implements') {
        storage.implementations[d.target] = d.implements;
      } 
    }

    return storage;
  }
};

module.exports = loader;
