module.exports = function (code) {
  var func = function () {};

  func.toString = function () {
    return ('(' + code.replace(/;$/, '') + ')').replace(/^\(\((function[\s\S]+)\)\)$/, function (match, actualCode) {
      return actualCode;
    });
  };

  return func;
};
