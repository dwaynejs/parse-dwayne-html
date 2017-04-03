var _ = require('lodash');

module.exports = function transformDIf(tree) {
  tree = tree || [];

  var newTree = [];
  var oldTree = tree.concat({});
  var ifElseBlock = null;

  _.forEach(oldTree, function (node) {
    var name = node.N;
    var children = node.C;

    if (name !== 'd-else-if' && name !== 'd-else') {
      if (ifElseBlock) {
        newTree.push({
          N: 'd-if',
          C: ifElseBlock
        });

        ifElseBlock = null;
      }

      if (name === 'd-if') {
        ifElseBlock = [node];
      } else if (name) {
        newTree.push(node);
      }
    } else {
      (ifElseBlock || newTree).push(node);

      if (name === 'd-else' && ifElseBlock) {
        newTree.push({
          N: 'd-if',
          C: ifElseBlock
        });

        ifElseBlock = null;
      }
    }

    if (children) {
      node.C = transformDIf(children);
    }
  });

  return newTree;
};
