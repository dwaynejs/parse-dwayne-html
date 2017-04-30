var _ = require('lodash');
var serializeJS = require('serialize-javascript');

var parseHTML = require('./parse-html');
var transformTextNodes = require('./transform-text-nodes');
var addOriginals = require('./add-originals');
var replaceUnicode = require('./replace-unicode');

module.exports = function (source, options) {
  options = options || {};
  options.keepOriginal = _.get(options, 'keepOriginal', true);
  options.globalVars = _.get(options, 'globalVars', ['require']);
  options.funcName = _.get(options, 'funcName', 'func');
  options.replaceUnicode = _.get(options, 'replaceUnicode', true);

  var variables = {};
  var parsed = transformTextNodes(
    parseHTML(source),
    variables,
    {},
    options
  );
  var exported = {
    vars: _.keys(variables),
    value: parsed
  };

  if (options.__keepScope__) {
    exported = exported.value;
  }

  var serialized = replaceUnicode(
    serializeJS(exported, {
      space: 2
    }),
    options
  );

  if (!options.keepOriginal) {
    return serialized;
  }

  return addOriginals(serialized, options).slice(1, -2);
};
