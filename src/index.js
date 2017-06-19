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

const SOURCE_TYPES = ['module', 'embed'];
const EXPORT_TYPES = ['es', 'cjs'];

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
  options.startLine = _.get(options, 'startLine', 1);
  options.startColumn = _.get(options, 'startColumn', 0);
  options.filename = _.get(options, 'filename', 'unknown');

  options.sourceContent = source;
  options.lines = new LinesAndColumns(source);
  options.varsVarName = generateVar('_', options);
  options.tmplVarName = _.get(options, 'tmplVarName', generateVar('_tmpl', options));
  options.mixinVarName = _.get(options, 'mixinVarName', generateVar('_mixin', options));

  if (SOURCE_TYPES.indexOf(options.sourceType) === -1) {
    throw new Error('options.sourceType has to be one either "module" or "embed"!');
  }

  if (EXPORT_TYPES.indexOf(options.exportType) === -1) {
    throw new Error('options.exportType has to be one either "es" or "cjs"!');
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
  const additionalJs = extractFirstScript(parsed, options);

  const code = new CodeGenerator(options);
  const tmplCode = new CodeGenerator(options);

  if (parsed.length) {
    generateJson(
      parsed,
      tmplCode,
      options.toFunction
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
      code.add('var ');

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
    code.add(
      `function (${ options.varsVarName }) {
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
        options.tmplVarName }.vars = ${ JSON.stringify(vars).replace(/,/g, ', ') }, ${
        options.tmplVarName })`
    );
  }

  if (options.toFunction) {
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
    generatedMixinVar: tmplCode.generatedMixin
  };
};
