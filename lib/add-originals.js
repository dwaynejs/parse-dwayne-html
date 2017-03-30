var parse = require('babylon').parse;
var traverse = require('babel-traverse').default;
var generate = require('babel-generator').default;
var t = require('babel-types');

module.exports = function (parsed, options) {
  var ast = parse('(' + parsed + ')', {
    plugins: [
      'objectRestSpread',
      'functionBind'
    ]
  });

  traverse(ast, {
    enter: function (path) {
      if (
        !path.scope.parent
        && t.isObjectProperty(path)
        && t.isFunctionExpression(path.node.value)
      ) {
        var original = path.parent.properties[0].value.value;

        path.parentPath.replaceWith(
          t.sequenceExpression([
            t.assignmentExpression(
              '=',
              t.identifier(options.funcName),
              path.node.value
            ),
            t.assignmentExpression(
              '=',
              t.memberExpression(
                t.identifier(options.funcName),
                t.identifier('original')
              ),
              t.stringLiteral(original)
            ),
            t.identifier(options.funcName)
          ])
        );
      }
    }
  });

  return generate(ast, {}, parsed).code.slice(1, -2);
};
