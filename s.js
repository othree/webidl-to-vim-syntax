
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

module.exports = s;
