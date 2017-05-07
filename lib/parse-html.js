var _ = require('lodash');
var htmlParser = require('htmlparser2');

var types = [
  'tag',
  'text',
  'comment',
  'style',
  'script'
];

module.exports = function (html) {
  var DOM;
  var handler = new htmlParser.DomHandler(function (err, dom) {
    DOM = dom;
  });
  var parser = new htmlParser.Parser(handler, {
    xmlMode: true,
    lowerCaseTags: false,
    lowerCaseAttributeNames: false
  });

  parser.write(html);
  parser.end();

  var tree = [];

  _.forEach(DOM, forEachChild(tree));

  return tree;
};

function forEachChild(tree) {
  return function (child) {
    var type = child.type;

    if (types.indexOf(type) === -1) {
      return;
    }

    var newChild = {};

    if (type === 'text' || type === 'comment') {
      newChild.type = '#' + type;

      if (type === 'text') {
        var value = _.trim(child.data);

        if (!value) {
          return;
        }

        newChild.value = value;
      } else {
        newChild.value = child.data;
      }
    } else {
      newChild.type = child.name;

      if (!_.isEmpty(child.attribs)) {
        newChild.args = child.attribs;
      }

      if (child.children.length) {
        _.forEach(child.children, forEachChild(newChild.children = []));
      }
    }

    tree.push(newChild);
  };
}
