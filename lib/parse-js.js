var babylon = require('babylon');
var traverse = require('babel-traverse').default;
var generate = require('babel-generator').default;
var t = require('babel-types');

exports.tryToParseJS = function (code, options) {
  try {
    babylon.parseExpression(code, {
      plugins: [
        'objectRestSpread',
        'functionBind'
      ]
    });

    return null;
  } catch (err) {
    var pos = err.pos;

    if (typeof pos !== 'number') {
      throw err;
    }

    if (code[pos] !== '}') {
      throw new Error('Syntax error in expression: ' + JSON.stringify(code) + ' at pos: ' + pos);
    }

    var parsed = parseJS(code.slice(0, pos), options);

    return {
      vars: parsed.vars,
      js: parsed.js,
      original: parsed.original,
      rest: code.slice(pos + 1)
    };
  }
};

var parseJS = exports.parseJS = function (code, options) {
  var newCode = '(' + code + ')';

  try {
    var ast = babylon.parse(newCode, {
      plugins: [
        'objectRestSpread',
        'functionBind'
      ]
    });
  } catch (err) {
    var pos = err.pos;

    if (typeof pos !== 'number') {
      throw err;
    }

    throw new Error('Syntax error in expression: ' + JSON.stringify(code) + ' at pos: ' + (pos - 1));
  }

  var uid;
  var uid2;
  var used = {};

  traverse(ast, {
    enter: function (path) {
      if (path.isProgram()) {
        uid = path.scope.generateUid('$');
        uid2 = path.scope.generateUid('_');

        return;
      }

      if (
        path.parentPath
        && path.parentPath.parentPath
        && path.parentPath.isExpressionStatement()
        && path.parentPath.parentPath.isProgram()
        && (!path.node.id || path.node.id.name !== uid2)
      ) {
        path.replaceWith(
          t.functionExpression(
            t.identifier(uid2),
            [
              t.identifier(uid)
            ],
            t.blockStatement([
              t.returnStatement(path.node)
            ])
          )
        );
      }

      if (options.__keepScope__) {
        return;
      }

      if (path.isThisExpression()) {
        var scope = path.scope;

        while ((!scope.path.node.id || scope.path.node.id.name !== uid2) && scope.path.isArrowFunctionExpression()) {
          scope = scope.parent;
        }

        if (scope.path.node.id && scope.path.node.id.name === uid2) {
          if (
            path.parentPath
            && path.parentPath.isMemberExpression()
            && !path.parent.computed
            && isOuterVar(path.parent.property.name)
          ) {
            used[path.parent.property.name] = true;
          }

          path.replaceWith(t.identifier(uid));
        }
      }

      if (
        path.isIdentifier()
        && path.isExpression()
        && !path.isPure()
        && path.node.name !== uid
        && (path.node.name !== 'require' || !options.require)
      ) {
        if (isOuterVar(path.node.name)) {
          used[path.node.name] = true;
        }

        path.replaceWith(
          t.memberExpression(
            t.identifier(uid),
            t.identifier(path.node.name)
          )
        );
      }
    }
  });

  var generated = generate(ast, {}, newCode).code;

  return {
    vars: used,
    js: generated,
    original: code
  };
};

function isOuterVar(variable) {
  return (
    variable !== 'args'
    && variable !== 'globals'
    && variable !== '$$'
  );
}
