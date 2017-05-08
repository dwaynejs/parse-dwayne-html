var _ = require('lodash');
var entities = require('html-entities');

var parse = require('parse-dwayne-js');
var constructEvalFunction = require('./construct-eval-function');

var htmlEntities = new entities.AllHtmlEntities();
var parseJS = parse.parseJS;
var tryToParseJS = parse.tryToParseJS;
var BLOCK_REGEX = /^([A-Z][A-Za-z\d_$]*)(?:\.[A-Za-z_$][A-Za-z\d_$]*)*$/;
var MIXIN_REGEX = /^(([A-Z][A-Za-z\d_$]*)(?:\.[A-Za-z_$][A-Za-z\d_$]*)*)(?:\(([^)]*)\))?$/;

var transformTextNodes = module.exports = function (DOM, variables, usedLocals, exclude, options) {
  var newDOM = [];

  _.forEach(DOM, function (node) {
    var type = node.type;
    var args = node.args;
    var children = node.children;
    var value = node.value;
    var excludeLocal = {};
    var blockMatch = type.match(BLOCK_REGEX);

    if (type === 'Each' || type === 'Dwayne.Each') {
      excludeLocal[_.get(args, 'item', '$item')] = true;
      excludeLocal[_.get(args, 'index', '$index')] = true;
    }

    if (blockMatch) {
      node.type = function () {};
      node.type.toString = function () {
        return type;
      };
      variables[blockMatch[1]] = true;
    }

    if (args) {
      node.args = _.mapValues(args, function (value, name) {
        var mixinMatch = name.match(MIXIN_REGEX);
        var eventualValue;

        if (mixinMatch) {
          value = value === ''
            ? '{true}'
            : value[0] !== '{' || value[value.length - 1] !== '}'
              ? '{' + JSON.stringify(htmlEntities.decode(value)) + '}'
              : value;

          variables[mixinMatch[2]] = true;
        }

        if (value === '') {
          eventualValue = blockMatch ? true : '';
        } else if (value[0] !== '{' || value[value.length - 1] !== '}') {
          eventualValue = htmlEntities.decode(value);
        } else {
          var parsed = parseJS(value.slice(1, -1), _.assign({}, options, {
            __mixinMatch__: mixinMatch
          }));
          var usedVariables = {};

          _.forEach(parsed.vars, function (value, variable) {
            if (exclude[variable]) {
              return;
            }

            usedVariables[variable] = value;
          });

          _.assign(usedLocals, usedVariables);

          eventualValue = constructEvalFunction(parsed.code);
        }

        return eventualValue;
      });
    }

    if (type !== '#text') {
      if (children && type !== 'script' && type !== 'style') {
        node.children = transformTextNodes(
          children,
          variables,
          usedLocals,
          _.assign(exclude, excludeLocal),
          options
        );
      }

      newDOM.push(node);

      return;
    }

    while (value.length) {
      var match = value.match(/{/);

      if (!match) {
        newDOM.push({
          type: '#text',
          value: htmlEntities.decode(value)
        });

        break;
      }

      var index = match.index;

      if (index) {
        newDOM.push({
          type: '#text',
          value: htmlEntities.decode(value.slice(0, index))
        });
        value = value.slice(index);
      }

      var parsed = tryToParseJS(value.slice(1), options);

      if (!parsed) {
        newDOM.push({
          type: '#text',
          value: htmlEntities.decode(value)
        });

        break;
      }

      var usedVariables = {};

      _.forEach(parsed.vars, function (value, variable) {
        if (!exclude[variable]) {
          usedVariables[variable] = value;
        }
      });

      _.assign(usedLocals, usedVariables);

      newDOM.push({
        type: '#text',
        value: constructEvalFunction(parsed.code)
      });
      value = parsed.rest;
    }
  });

  return newDOM;
};
