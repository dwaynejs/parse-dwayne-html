const { parseExpression } = require('babylon');
const transformDwayneJs = require('transform-dwayne-js-expressions');

exports.parseJs = (code, position, options) => {
  try {
    return transformDwayneJs(code, options);
  } catch (err) {
    /* istanbul ignore if */
    if (typeof err.pos !== 'number') {
      throw err;
    }

    throwError(err, position, options);
  }
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

    try {
      const parsed = transformDwayneJs(newCode, options);

      return {
        vars: parsed.vars,
        generatedThisVar: parsed.generatedThisVar,
        code: parsed.code,
        map: parsed.map,
        original: newCode,
        rest: code.slice(pos + 1)
      };
    } catch (err) {
      /* istanbul ignore if */
      if (typeof err.pos !== 'number') {
        throw err;
      }

      throwError(err, position, options);
    }
  }
};

function throwError(err, position, options) {
  err.pos = position + err.pos;

  const location = options.lines.locationForIndex(err.pos);

  location.line++;

  err.loc = location;
  err.message = err.message.replace(/\(\d+:\d+\)$/, () => (
    `(${ location.line }:${ location.column })`
  ));

  throw err;
}
