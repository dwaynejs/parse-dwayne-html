module.exports = function (name, options) {
  var globals = options.globals;
  var tmplVar = name;
  var index = 0;

  while (globals.indexOf(tmplVar) !== -1) {
    tmplVar = name + index++;
  }

  return tmplVar;
};
