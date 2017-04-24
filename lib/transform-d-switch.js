var _ = require('lodash');

module.exports = function transformDSwitch(tree) {
  _.forEach(tree || [], function (node) {
    var newChildren = [];

    if (node.name === 'd-switch') {
      _.some(node.children, function (child) {
        var name = child.name;

        if (name !== 'd-case' && name !== 'd-default') {
          return;
        }

        newChildren.push(child);

        transformDSwitch(child.children);

        if (name === 'd-default') {
          return true;
        }
      });

      if (newChildren.length) {
        node.children = newChildren;
      } else {
        delete node.children;
      }
    }
  });
};
