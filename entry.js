var parse = require('./lib');

var expression = '<div>{a + b}123</div>';

console.log(parse(expression, {
  keepOriginal: true
}));
