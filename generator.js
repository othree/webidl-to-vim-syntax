
var util = require('util');

var s = {
  cap: function (n) {
    return n[0].toUpperCase() + n.substr(1);
  },
  prefix: function (n) {
    var c = (n[0] === '@') ? '@' : '';
    n = (c === '@') ? n.substr(1) : n;
      
    return `${c}javascript${s.cap(n)}`;
  },
  strip: function (n) {
    return n.replace(/ /g, '');
  },
  jspre: function (n) {
    return s.prefix(s.strip(n));
  },
  jsprearr: function (arr) {
    return arr.map(s.jspre);
  },
};

var generator = {
  keyword: function (groupname, keywords, nextgroups, contained) {
    if (!groupname || !keywords) { throw(new Error('Keyword definition, not enough arguments.')) }
    if (!contained) { contained = ''; }

    if (!Array.isArray(keywords)) { keywords = [keywords]; }

    if (nextgroups && !Array.isArray(nextgroups)) { nextgroups = [nextgroups]; }
    nextgroups = s.jsprearr(nextgroups);
    var next = '';
    if (nextgroups && nextgroups.length) {
      next = ` nextgroup=${nextgroups.join(',')}`;
    }

    console.log(`sy keyword ${s.jspre(groupname)} ${contained} ${keywords.join(' ')}${next}`);
  },
  method: function (name, methods, nextgroups, contained) {
    if (!nextgroups) { nextgroups = []; }
    generator.keyword(`${name}Methods`, methods, ['FuncCallArg'].concat(nextgroups), contained);
  },
  staticMethod: function (name, methods, nextgroups) {
    generator.method(`${name}Static`, methods, nextgroups, 'contained');
  },
  prop: function (name, props, nextgroups, contained) {
    if (!nextgroups) { nextgroups = []; }
    generator.keyword(`${name}Props`, props, ['@AfterIdentifier'].concat(nextgroups), contained);
  },
  staticProp: function (name, props, nextgroups) {
    generator.prop(`${name}Static`, props, nextgroups, 'contained');
  },
  match: function (groupname, pattern, nextgroups, contained) {
    if (!groupname || !pattern) { throw(new Error('Match definition, not enough arguments.')) }
    if (!contained) { contained = ''; }

    if (nextgroups && !Array.isArray(nextgroups)) { nextgroups = [nextgroups]; }
    nextgroups = s.jsprearr(nextgroups);
    var next = '';
    if (nextgroups && nextgroups.length) {
      next = ` nextgroup=${nextgroups.join(',')}`;
    }

    console.log(`sy match   ${s.jspre(groupname)} ${contained} ${pattern} ${next}`);
  },
  dot: function (groupname, nextgroups) {
    generator.match(`${groupname}Dot`, '/\\./', nextgroups, 'contained');
  },
  cluster: function (name, groups) {
    groups = s.jsprearr(groups);
    console.log(`sy cluster ${s.jspre(name)} add=${groups.join(',')}`);
  },
  link: function (from, to) {
    console.log(`hi def link ${s.jspre(from)} ${to}`);
  },
  run: function (data) {
    "use strict";
    var allprops = [];
    var allcons = [];
    var allkeys = [];
    var allWithInterfaces = {};
    for (let o of data) {
      let ms = false;
      let ps = false;
      let sms = false;
      let sps = false;
      let props = [];
      let sprops = [];
      let methods = [];
      let smethods = [];
      let withInterfaces = {};
      if (o.members) {
        for (let m of o.members) {
          if (m.name === 'contains') { continue; }
          if (m.type === 'prop') {
            if (m.static) {
              sprops.push(m.name);
              sps = true;
            } else {
              if (m.interface) {
                if (!withInterfaces[m.interface]) { withInterfaces[m.interface] = []; }
                withInterfaces[m.interface].push(m.name);
              } else {
                props.push(m.name);
              }
              ps = true;
            }
          }
          if (m.type === 'method') {
            if (m.static) {
              smethods.push(m.name);
              sms = true;
            } else {
              methods.push(m.name);
              ms = true;
            }
          }
        }
      }
      if (o.type === 'cons') {
        generator.keyword('global', o.name, ['FuncCallArg', `${o.name}Dot`]);
        let next = [];
        if (sms) { next.push(`${o.name}StaticMethods`) }
        if (sps) { next.push(`${o.name}StaticProps`) }
        // console.log(`sy match   javascript${o.name}Dot /\\./ contained ${next}`);
        generator.dot(o.name, next);
        if (sms || sps) {
          if (sms) {
            generator.staticMethod(o.name, smethods);
            allprops.push(`${o.name}StaticMethods`);
            allkeys.push(`${o.name}StaticMethods`);
          }
          if (sps) {
            generator.staticProp(o.name, sprops);
            allprops.push(`${o.name}StaticProps`);
            allkeys.push(`${o.name}StaticProps`);
          }
        } else {
          allcons.push(o.name);
        }
        if (ms) {
          generator.method(o.name, methods);
          allprops.push(`${o.name}Methods`);
          allkeys.push(`${o.name}Methods`);
        }
        if (ps) {
          if (props.length) {
            generator.prop(o.name, props);
          }
          for (let k in withInterfaces) {
            generator.prop(o.name, withInterfaces[k], [`${s.strip(k)}Dot`]);
          }
          allprops.push(`${o.name}Props`);
          allkeys.push(`${o.name}Props`);
        }
      } else {
        let next = '';
        if (ms || ps) {
          next = [];
          if (ms) { next.push(`${o.name}Methods`); }
          if (ps) { next.push(`${o.name}Props`); }

          if (o.type === 'operation') {
            generator.keyword('global', o.name, ['FuncCallArg', `${o.name}Dot`]);
          } else {
            generator.keyword('global', o.name, [`${o.name}Dot`]);
            if (o.name === 'CSSStyleDeclaration') {
              next.push('CSS2PropertiesProps');
            }
          }
          generator.dot(o.name, next);
          // console.log(`sy match   javascript${o.name}Dot /\\./ contained ${next}`);
          let contained = o.primary ? '' : 'contained';
          if (ms) {
            generator.method(o.name, methods, [], contained);
            // console.log(`sy keyword javascript${o.name}Methods ${contained} ${methods.join(' ')} nextgroup=javascriptFuncCallArg`);
            allkeys.push(`${o.name}Methods`);
          }
          if (ps) {
            if (props.length) {
              generator.prop(o.name, props, [], contained);
              // console.log(`sy keyword javascript${o.name}Props ${contained} ${props.join(' ')} nextgroup=@javascriptAfterIdentifier`);
            }
            for (let k in withInterfaces) {
              let sk = k.replace(/ /g, '');
              generator.prop(o.name, withInterfaces[k], [`${sk}Dot`], contained);
              // console.log(`sy keyword javascript${o.name}Props ${withInterfaces[k].join(' ')} nextgroup=javascript${sk}Dot,@javascriptAfterIdentifier`);
            }
            allkeys.push(`${o.name}Props`);
          }
        } else if (o.interface) {
          if (!allWithInterfaces[o.interface]) { allWithInterfaces[o.interface] = []; }
          allWithInterfaces[o.interface].push(o.name);
        } else {
          // no members
          allcons.push(o.name);
          continue;
        }
      }
    }
    for (let k in allWithInterfaces) {
      let sk = k.replace(/ /g, '');
      generator.keyword('global', allWithInterfaces[k], ['@AfterIdentifier', `${sk}Dot`]);
      // console.log(`sy keyword javascriptGlobal ${allWithInterfaces[k].join(' ')} nextgroup=javascript${sk}Dot,@javascriptAfterIdentifier`);
    }
    generator.keyword('global', allcons, ['FuncCallArg']);
    // console.log(`sy keyword javascriptGlobal ${allcons.join(' ')} nextgroup=javascriptFuncCallArg`);
    // console.log(`sy cluster props add=${allprops.join(',')}`);
    generator.cluster('props', allprops);
    for (let k of allkeys) {
      generator.link(k, 'keyword');
      // console.log(`hi def link ${k} keyword`);
    }
  }
};

module.exports = generator;
