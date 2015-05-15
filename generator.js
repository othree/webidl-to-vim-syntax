
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
    generator.keyword(`${name}Methods`, methods, ['FuncCallArg'], contained);
  },
  staticMethod: function (name, methods, nextgroups) {
    generator.method(`${name}Static`, methods, [], 'contained');
  },
  prop: function (name, props, nextgroups, contained) {
    generator.keyword(`${name}Props`, props, ['@AfterIdentifier'], contained);
  },
  staticProp: function (name, props, nextgroups) {
    generator.prop(`${name}Static`, props, [], 'contained');
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
            allprops.push(`javascript${o.name}StaticMethods`);
            allkeys.push(`javascript${o.name}StaticMethods`);
          }
          if (sps) {
            generator.staticProp(o.name, sprops);
            allprops.push(`javascript${o.name}StaticProps`);
            allkeys.push(`javascript${o.name}StaticProps`);
          }
        } else {
          allcons.push(o.name);
        }
        if (ms) {
          generator.method(o.name, methods);
          console.log(`sy keyword javascript${o.name}Methods ${methods.join(' ')} nextgroup=javascriptFuncCallArg`);
          allprops.push(`javascript${o.name}Methods`);
          allkeys.push(`javascript${o.name}Methods`);
        }
        if (ps) {
          if (props.length) {
            generator.prop(o.name, props);
            console.log(`sy keyword javascript${o.name}Props ${props.join(' ')} nextgroup=@javascriptAfterIdentifier`);
          }
          for (let k in withInterfaces) {
            let sk = k.replace(/ /g, '');
            console.log(`sy keyword javascript${o.name}Props ${withInterfaces[k].join(' ')} nextgroup=javascript${sk}Dot,@javascriptAfterIdentifier`);
          }
          allprops.push(`javascript${o.name}Props`);
          allkeys.push(`javascript${o.name}Props`);
        }
      } else {
        let next = '';
        if (ms || ps) {
          next = 'nextgroup=';
          let ns = [];
          if (ms) { ns.push(`javascript${o.name}Methods`); }
          if (ps) { ns.push(`javascript${o.name}Props`); }
          next += ns.join(',');

          if (o.type === 'operation') {
            console.log(`sy keyword javascriptGlobal ${o.name} nextgroup=javascript${o.name}Dot,javascriptFuncCallArg`);
          } else {
            console.log(`sy keyword javascriptGlobal ${o.name} nextgroup=javascript${o.name}Dot`);
            if (o.name === 'CSSStyleDeclaration') {
              next += ',javascriptCSS2PropertiesProps';
            }
          }
          console.log(`sy match   javascript${o.name}Dot /\\./ contained ${next}`);
          let contained = o.primary ? '' : 'contained';
          if (ms) {
            console.log(`sy keyword javascript${o.name}Methods ${contained} ${methods.join(' ')} nextgroup=javascriptFuncCallArg`);
            allkeys.push(`javascript${o.name}Methods`);
          }
          if (ps) {
            if (props.length) {
              console.log(`sy keyword javascript${o.name}Props ${contained} ${props.join(' ')} nextgroup=@javascriptAfterIdentifier`);
            }
            for (let k in withInterfaces) {
              let sk = k.replace(/ /g, '');
              console.log(`sy keyword javascript${o.name}Props ${withInterfaces[k].join(' ')} nextgroup=javascript${sk}Dot,@javascriptAfterIdentifier`);
            }
            allkeys.push(`javascript${o.name}Props`);
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
      console.log(`sy keyword javascriptGlobal ${allWithInterfaces[k].join(' ')} nextgroup=javascript${sk}Dot,@javascriptAfterIdentifier`);
    }
    console.log(`sy keyword javascriptGlobal ${allcons.join(' ')} nextgroup=javascriptFuncCallArg`);
    console.log(`sy cluster props add=${allprops.join(',')}`);
    for (let k of allkeys) {
      console.log(`hi def link ${k} keyword`);
    }
  }
};

module.exports = generator;
