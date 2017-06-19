const _ = require('lodash');

module.exports = function traverseDom(dom) {
  return _.forEach(dom, (node) => {
    node.args = node.attrs;

    delete node.parent;
    delete node.attrs;

    if (node.children && !node.children.length) {
      delete node.children;
    }

    if (_.isEmpty(node.args)) {
      delete node.args;
    }

    if (node.children) {
      traverseDom(node.children);
    }
  });
};
