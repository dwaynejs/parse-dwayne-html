module.exports = function (js) {
  var func = new Function();

  func.toString = function () {
    return js
      .replace(/;$/, '')
      .replace(/^\([\s\S]+\)$/, function (match) {
        return match.slice(1, -1);
      });
  };

  return func;
};
