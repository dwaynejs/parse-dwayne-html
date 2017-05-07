var _ = require('lodash');
var serializeJS = require('serialize-javascript');
var babylon = require('babylon');
var generate = require('babel-generator').default;

var parseHTML = require('./parse-html');
var transformJS = require('./transform-js');
var addOriginals = require('./add-originals');
var replaceUnicode = require('./replace-unicode');
var extractFirstScript = require('./extract-first-script');
var generateVar = require('./generate-var');

module.exports = function (source, options) {
  options = options || {};
  options.keepOriginal = _.get(options, 'keepOriginal', true);
  options.globals = _.get(options, 'globals', ['require']);
  options.funcName = _.get(options, 'funcName', '_func');
  options.replaceUnicode = _.get(options, 'replaceUnicode', true);
  options.injectFirstScript = _.get(options, 'injectFirstScript', true);
  options.exportFunction = _.get(options, 'exportFunction', false);

  var variables = {};
  var usedLocals = {};
  var parsed = transformJS(
    parseHTML(source),
    variables,
    usedLocals,
    {},
    options
  );
  var vars = _.keys(usedLocals);
  var additionalJs = extractFirstScript(parsed);
  var tmplVar = options.__tmplVar__ || generateVar(options.globals, '_tmpl');
  var varsVar = generateVar(options.globals, '_vars');

  var html = replaceUnicode(
    serializeJS(parsed, {
      space: 2
    }),
    options
  );

  if (options.keepOriginal) {
    html = addOriginals(html, options).replace(/;$/, '');
  }

  if (options.exportFunction) {
    var blockVars = _.map(_.keys(variables), function (variable) {
      return 'var ' + variable + ' = ' + varsVar + '.' + variable + ';';
    });

    html = 'function ('
      + varsVar
      + ') {\n'
      + blockVars.join('\n') + '\n\n'
      + 'return '
      + html
      + ';\n}';

    var ast = babylon.parseExpression(html, {
      plugins: [
        'objectRestSpread',
        'functionBind',
        'doExpressions'
      ]
    });

    html = generate(ast, {}, html).code;
  } else {
    html = '('
      + tmplVar
      + ' = '
      + html
      + ', '
      + tmplVar
      + '.vars = '
      + JSON.stringify(vars).replace(/,/g, ', ')
      + ', '
      + tmplVar
      + ')';
  }

  return {
    html: html,
    additionalJs: additionalJs || '',
    tmplVar: tmplVar,
    funcName: options.funcName
  };
};
