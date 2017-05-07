module.exports = function (globals, name) {
  var tmplVar = name;
  var index = 0;

  while (globals.indexOf(tmplVar) !== -1) {
    tmplVar = name + index++;
  }

  return tmplVar;
};
