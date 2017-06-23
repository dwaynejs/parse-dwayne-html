const _ = require('lodash');
const { default: LinesAndColumns } = require('lines-and-columns');
const { transform } = require('babel-core');
const CodeGenerator = require('generate-code');

const Parser = require('./Parser');
const transformJs = require('./transformJs');
const generateJson = require('./generateJson');
const extractFirstScript = require('./extractFirstScript');
const generateVar = require('./generateVar');
const traverseDom = require('./traverseDom');
const stringifyString = require('./stringifyString');

const SOURCE_TYPES = ['module', 'embed'];
const EXPORT_TYPES = ['es', 'cjs'];
const QUOTE_TYPES = ['single', 'double'];

module.exports = (source, options) => {
  options = _.assign({}, options);

  options.xmlMode = !!_.get(options, 'xmlMode', true);
  options.collapseWhitespace = !!_.get(options, 'collapseWhitespace', true);
  options.unscopables = _.get(options, 'unscopables', ['require']);
  options.injectFirstScript = !!_.get(options, 'injectFirstScript', true);
  options.toFunction = !!_.get(options, 'toFunction', false);
  options.transformScripts = !!_.get(options, 'transformScripts', false);
  options.transformStyles = !!_.get(options, 'transformStyles', false);
  options.sourceType = _.get(options, 'sourceType', 'module');
  options.exportType = _.get(options, 'exportType', 'cjs');
  options.addSource = !!_.get(options, 'addSource', true);
  options.sourceMap = !!_.get(options, 'sourceMap', true);
  options.inputSourceMap = _.get(options, 'inputSourceMap', null);
  options.startLine = _.get(options, 'startLine', 1);
  options.startColumn = _.get(options, 'startColumn', 0);
  options.filename = _.get(options, 'filename', 'unknown');
  options.indent = _.get(options, 'indent', 2);
  options.useES6 = !!_.get(options, 'useES6', false);
  options.quotes = _.get(options, 'quotes', 'double');

  options.sourceContent = source;
  options.lines = new LinesAndColumns(source);
  options.varsVarName = generateVar('_', options);
  options.tmplVarName = _.get(options, 'tmplVarName', generateVar('_tmpl', options));
  options.mixinVarName = _.get(options, 'mixinVarName', generateVar('_mixin', options));
  options.generatedThisVar = false;

  if (typeof options.indent === 'number') {
    options.indent = ' '.repeat(options.indent);
  }

  if (typeof options.indent !== 'string') {
    throw new Error('options.indent has to be either a string or a number!');
  }

  if (!/^\s+$/.test(options.indent)) {
    throw new Error('options.indent has to be whitespace!');
  }

  if (SOURCE_TYPES.indexOf(options.sourceType) === -1) {
    throw new Error('options.sourceType has to be either "module" or "embed"!');
  }

  if (EXPORT_TYPES.indexOf(options.exportType) === -1) {
    throw new Error('options.exportType has to be either "es" or "cjs"!');
  }

  if (QUOTE_TYPES.indexOf(options.quotes) === -1) {
    throw new Error('options.quotes has to be either "single" or "double"!');
  }

  if (!_.isArray(options.unscopables) || !options.unscopables.every(_.isString)) {
    throw new Error('options.unscopables has to be an array of strings!');
  }

  const usedLocals = {};
  const parsedHTML = new Parser(source, options).parse();
  const parsed = transformJs(
    traverseDom(parsedHTML),
    usedLocals,
    {},
    options
  );
  const vars = _.keys(usedLocals);
  const additionalJs = extractFirstScript(parsed);

  const code = new CodeGenerator(_.assign(pickOptions(options), {
    inputSourceMap: options.inputSourceMap
  }));
  const tmplCode = new CodeGenerator(pickOptions(options));

  if (parsed.length) {
    generateJson(
      parsed,
      tmplCode,
      options.toFunction && !options.useES6
        ? 1
        : 0,
      options
    );
  } else {
    tmplCode.add('[]');
  }

  if (options.sourceType === 'module' && options.injectFirstScript && additionalJs) {
    const {
      code: imports,
      map: importsMap
    } = transform(additionalJs.code, {
      babelrc: false,
      filename: options.filename,
      sourceMaps: options.sourceMap
    });

    code.addWithMap(`${ imports }

`, importsMap, additionalJs.loc);
  }

  if (options.sourceType === 'module') {
    if (vars.length || tmplCode.generatedMixin) {
      code.add(
        options.useES6
          ? 'let '
          : 'var '
      );

      if (vars.length) {
        code.add(options.tmplVarName);

        if (tmplCode.generatedMixin) {
          code.add(', ');
        }
      }

      if (tmplCode.generatedMixin) {
        code.add(options.mixinVarName);
      }

      code.add(`;

`);
    }

    code.add(options.exportType === 'es' ? 'export default ' : 'module.exports = ');
  }

  if (options.toFunction) {
    const varName = tmplCode.generatedVarsName
      ? options.varsVarName
      : '';

    code.add(
      options.useES6
        ? varName
          ? `${ varName } => `
          : `() => `
        : `function (${ varName }) {
  return `
    );
  }

  if (vars.length) {
    code.add(
      `(${
        options.tmplVarName } = `
    );
  }

  code.addWithMap(
    tmplCode.toString(),
    tmplCode.generateMap()
  );

  if (vars.length) {
    code.add(
      `, ${
        options.tmplVarName }.vars = [${ vars.map((varName) => stringifyString(varName, options)).join(', ') }], ${
        options.tmplVarName })`
    );
  }

  if (options.toFunction && !options.useES6) {
    code.add(
      `;
}`
    );
  }

  if (options.sourceType === 'module') {
    code.add(';');
  }

  return {
    code: code.toString(),
    map: code.generateMap(),
    generatedTmplVar: !!vars.length,
    generatedMixinVar: !!tmplCode.generatedMixin,
    generatedThisVar: options.generatedThisVar,
  };
};

function pickOptions(options) {
  return _.pick(options, [
    'filename',
    'sourceContent',
    'sourceMap'
  ]);
}
