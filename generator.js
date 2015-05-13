
var util = require('util');

var generator = {
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
        console.log(`sy keyword javascriptGlobal ${o.name} nextgroup=javascriptFuncCallArg,javascript${o.name}Dot`);
        let next = 'nextgroup=';
        if (sms && sps) { next += `javascript${o.name}StaticMethods,javascript${o.name}StaticProps` }
        else if (sms) { next += `javascript${o.name}StaticMethods` }
        else if (sps) { next += `javascript${o.name}StaticProps` }
        else { next = ''; }
        console.log(`sy match   javascript${o.name}Dot /\\./ contained ${next}`);
        if (sms || sps) {
          if (sms) {
            console.log(`sy keyword javascript${o.name}StaticMethods contained ${smethods.join(' ')} nextgroup=javascriptFuncCallArg`);
            allprops.push(`javascript${o.name}StaticMethods`);
            allkeys.push(`javascript${o.name}StaticMethods`);
          }
          if (sps) {
            if (sprops.length) {
              console.log(`sy keyword javascript${o.name}StaticProps contained ${props.join(' ')} nextgroup=@javascriptAfterIdentifier`);
            }
            allprops.push(`javascript${o.name}StaticProps`);
            allkeys.push(`javascript${o.name}StaticProps`);
          }
        } else {
          allcons.push(o.name);
        }
        if (ms) {
          console.log(`sy keyword javascript${o.name}Methods ${methods.join(' ')} nextgroup=javascriptFuncCallArg`);
          allprops.push(`javascript${o.name}Methods`);
          allkeys.push(`javascript${o.name}Methods`);
        }
        if (ps) {
          if (props.length) {
            console.log(`sy keyword javascript${o.name}Props ${props.join(' ')} nextgroup=@javascriptAfterIdentifier`);
          }
          for (let k in withInterfaces) {
            let sk = k.replace(' ', '');
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
              let sk = k.replace(' ', '');
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
      let sk = k.replace(' ', '');
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
