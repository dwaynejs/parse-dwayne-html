var _ = require('lodash');

module.exports = function (code, options) {
  if (!options.replaceUnicode) {
    return code;
  }

  return code.replace(/[^\u0000-\u007f]/g, function (match) {
    return '\\u' + _.padStart(match.charCodeAt(0).toString(16), 4, '0');
  });
};
