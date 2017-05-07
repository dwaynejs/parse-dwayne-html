module.exports = function (tree) {
  if (!tree.length || tree[0].type !== 'script') {
    return;
  }

  var script = tree.shift();

  if (!script.children) {
    return;
  }

  return script.children[0].value;
};
