const { parse } = require('babylon');
const { default: generate } = require('babel-generator');

module.exports = (tree, options) => {
  if (
    options.sourceType !== 'module'
    || !options.injectFirstScript
    || !tree.length
    || tree[0].type !== 'script'
  ) {
    return;
  }

  const script = tree.shift();

  if (!script.children) {
    return;
  }

  const {
    start,
    value: scriptCode
  } = script.children[0];
  let ast;

  try {
    ast = parse(scriptCode, {
      sourceFilename: options.filename,
      plugins: [
        'jsx',
        'flow',
        'doExpressions',
        'objectRestSpread',
        'decorators',
        'classProperties',
        'classPrivateProperties',
        'exportExtensions',
        'asyncGenerators',
        'functionBind',
        'functionSent',
        'dynamicImport',
        'numericSeparator',
        'optionalChaining',
        'importMeta'
      ]
    });
  } catch (err) {
    /* istanbul ignore if */
    if (typeof err.pos !== 'number') {
      throw err;
    }

    err.pos += start;
    err.loc = options.lines.locationForIndex(err.pos);
    err.loc.line++;
    err.message = err.message.replace(/\(\d+:\d+\)$/, () => (
      `(${ err.loc.line }:${ err.loc.column })`
    ));

    throw err;
  }

  const {
    code,
    map
  } = generate(ast, {
    filename: options.filename,
    sourceMaps: options.sourceMap
  }, scriptCode);

  return {
    code,
    map,
    start
  };
};
