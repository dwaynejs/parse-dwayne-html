var parse = require('./lib');

var expression = '<div>{a + b}123&dagger;Привет!&nbsp;{a + c}</div>';
var parsed = parse(expression);

console.log(parsed);
