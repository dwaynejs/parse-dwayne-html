var _ = require('lodash');
var serializeJS = require('serialize-javascript');

var parseHTML = require('./parse-html');
var transformTextNodes = require('./transform-text-nodes');
var transformDIf = require('./transform-d-if');

module.exports = function (source, options) {
  options = options || {};
  options.keepOriginal = 'keepOriginal' in options
    ? options.keepOriginal
    : true;
  options.require = 'require' in options
    ? options.require
    : true;

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

  return serializeJS(exported, {
    space: 2
  });
};
