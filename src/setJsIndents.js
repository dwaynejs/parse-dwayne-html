const _ = require('lodash');
const { default: LinesAndColumns } = require('lines-and-columns');
const { decode, encode } = require('sourcemap-codec');

module.exports = (code, map, indent, options) => {
  indent = options.indent.repeat(indent);
  code = code.replace(/\r\n|\r|\n/g, '$&' + indent);

  if (!map || !indent) {
    return {
      code,
      map
    };
  }

  const lines = new LinesAndColumns(code);
  const mappings = decode(map.mappings);
  let line = 0;

  while (lines.indexForLocation({
    line: ++line,
    column: 0
  }) !== null) {
    _.forEach(mappings[line], (mapping) => {
      mapping[0] += indent.length;
    });
  }

  map.mappings = encode(mappings);

  return {
    code,
    map
  };
};
