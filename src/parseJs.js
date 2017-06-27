const _ = require('lodash');
const { parseExpression } = require('babylon');
const transformDwayneJs = require('transform-dwayne-js-expressions');

exports.parseJs = (code, position, options) => {
  return transformDwayneJs(code, pickOptions(getOptions(options, position)));
};

exports.maybeParseJs = (code, position, options) => {
  try {
    parseExpression(code, {
      plugins: [
        'objectRestSpread',
        'functionBind',
        'doExpressions'
      ]
    });

    const pos = code.length;
    const loc = options.lines.locationForIndex(pos);

    loc.line++;

    const err = new Error(`Unterminated embedded javascript expression (${ loc.line }:${ loc.column })`);

    err.pos = pos;
    err.loc = loc;

    throw err;
  } catch (err) {
    const pos = err.pos;

    /* istanbul ignore if */
    if (typeof pos !== 'number') {
      throw err;
    }

    if (code[pos] !== '}') {
      throwError(err, position, options);
    }

    const newCode = code.slice(0, pos);

    const parsed = transformDwayneJs(newCode, pickOptions(getOptions(options, position)));

    return {
      vars: parsed.vars,
      generatedThisVar: parsed.generatedThisVar,
      code: parsed.code,
      map: parsed.map,
      original: newCode,
      rest: code.slice(pos + 1)
    };
  }
};

function throwError(err, position, options) {
  const location = options.lines.locationForIndex(position + err.pos);

  err.pos = options.startPosition + position + err.pos;
  err.loc = {
    line: options.startLine + location.line,
    column: location.line === 0
      ? options.startColumn + location.column
      : location.column
  };
  err.message = err.message.replace(/\(\d+:\d+\)$/, () => (
    `(${ err.loc.line }:${ err.loc.column })`
  ));

  throw err;
}

function getOptions(options, position) {
  options = _.assign({}, options);

  const location = options.lines.locationForIndex(position);

  options.startPosition += position;
  options.startLine += location.line;
  options.startColumn = location.line === 0
    ? options.startColumn + location.column
    : location.column;

  return options;
}

function pickOptions(options) {
  return _.pick(options, [
    'unscopables',
    'filename',
    'sourceMap',
    'keepScope',
    'thisVarName',
    'useES6',
    'startLine',
    'startColumn',
    'startPosition'
  ]);
}
