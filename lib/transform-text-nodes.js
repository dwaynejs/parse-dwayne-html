var _ = require('lodash');
var entities = require('html-entities');

var parse = require('./parse-js');
var constructEvalFunction = require('./construct-eval-function');

var htmlEntities = new entities.AllHtmlEntities();
var parseJS = parse.parseJS;
var tryToParseJS = parse.tryToParseJS;

var transformTextNodes = module.exports = function (DOM, variables, exclude, options) {
  var newDOM = [];

  _.forEach(DOM, function (node) {
    var name = node.name;
    var attrs = node.attrs || {};
    var children = node.children;
    var value = node.value;
    var isDEach = name === 'd-each';
    var excludeLocal = {};

    if (isDEach) {
      excludeLocal[attrs.item || '$item'] = true;
      excludeLocal[attrs.index || '$index'] = true;
    }

    if (node.attrs) {
      node.attrs = _.mapValues(attrs, function (value, attr) {
        if (value === '') {
          return true;
        }

        if (value[0] !== '{' || value[value.length - 1] !== '}') {
          return htmlEntities.decode(value);
        }

        var parsed = parseJS(value.slice(1, -1), options);
        var isUID = attr === 'uid';
        var usedVariables = {};

        _.forEach(parsed.vars, function (value, variable) {
          if (isDEach && isUID && excludeLocal[variable]) {
            return;
          }

          if (exclude[variable]) {
            return;
          }

          usedVariables[variable] = value;
        });

        _.assign(variables, usedVariables);

        var evalFunction = constructEvalFunction(parsed.js);

        if (!options.keepOriginal) {
          return evalFunction;
        }

        return {
          original: parsed.original,
          function: evalFunction
        };
      });
    }

    if (name !== '#text') {
      _.assign(exclude, excludeLocal);

      if (children) {
        node.children = transformTextNodes(children, variables, exclude, options);
      }

      newDOM.push(node);

      return;
    }

    while (value.length) {
      var match = value.match(/\{/);

      if (!match) {
        newDOM.push({
          name: '#text',
          value: htmlEntities.decode(value)
        });

        break;
      }

      var index = match.index;

      if (index) {
        newDOM.push({
          name: '#text',
          value: htmlEntities.decode(value.slice(0, index))
        });
        value = value.slice(index);
      }

      var parsed = tryToParseJS(value.slice(1), options);

      if (!parsed) {
        newDOM.push({
          name: '#text',
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

      _.assign(variables, usedVariables);

      var evalFunction = constructEvalFunction(parsed.js);
      var textNodeValue;

      if (!options.keepOriginal) {
        textNodeValue = evalFunction;
      } else {
        textNodeValue = {
          original: parsed.original,
          function: evalFunction
        };
      }

      newDOM.push({
        name: '#text',
        value: textNodeValue
      });
      value = parsed.rest;
    }
  });

  return newDOM;
};
