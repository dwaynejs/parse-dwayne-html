var parse = require('babylon').parse;
var traverse = require('babel-traverse').default;
var generate = require('babel-generator').default;
var t = require('babel-types');

module.exports = function (parsed, options) {
  var ast = parse(parsed, {
    plugins: [
      'objectRestSpread',
      'functionBind',
      'doExpressions'
    ]
  });

  traverse(ast, {
    enter: function (path) {
      if (
        !path.scope.parent
        && t.isObjectProperty(path)
        && t.isFunctionExpression(path.node.value)
        && path.node.key.value === 'function'
      ) {
        var original = path.parent.properties[0].value.value;
        var funcName = options.funcName;

        path.parentPath.replaceWith(
          t.sequenceExpression([
            t.assignmentExpression(
              '=',
              t.identifier(funcName),
              path.node.value
            ),
            t.assignmentExpression(
              '=',
              t.memberExpression(
                t.identifier(funcName),
                t.identifier('original')
              ),
              t.stringLiteral(original)
            ),
            t.identifier(funcName)
          ])
        );
      }
    }
  });

  return generate(ast, {}, parsed).code;
};
