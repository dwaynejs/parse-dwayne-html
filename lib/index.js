var _ = require('lodash');
var serializeJS = require('serialize-javascript');

var parseHTML = require('./parse-html');
var transformTextNodes = require('./transform-text-nodes');
var transformDIf = require('./transform-d-if');
var addOriginals = require('./add-originals');

module.exports = function (source, options) {
  options = options || {};
  options.keepOriginal = _.get(options, 'keepOriginal', true);
  options.require = _.get(options, 'require', true);
  options.funcName = _.get(options, 'funcName', 'func');

  var variables = {};
  var parsed = transformDIf(
    transformTextNodes(
      parseHTML(source),
      variables,
      {},
      options
    )
  );
  var exported = {
    vars: _.keys(variables),
    value: parsed
  };

  if (options.__keepScope__) {
    exported = exported.value;
  }

  var serialized = serializeJS(exported, {
    space: 2
  });

  if (!options.keepOriginal) {
    return serialized;
  }

  return addOriginals(serialized, options).slice(1, -2);
};
