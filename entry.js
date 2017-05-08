var fs = require('fs');
var path = require('path');
var parse = require('./lib');
var html = fs.readFileSync(path.resolve('./fixture.html'));

var parsed = parse(html, {
  keepOriginal: false
});

var eventualCode = parsed.additionalJs
  + '\n\nvar '
  + parsed.funcName
  + ', '
  + parsed.tmplVar
  + ';\n\nexport default '
  + parsed.html
  + ';';

fs.writeFileSync(path.resolve('./output.js'), eventualCode);
