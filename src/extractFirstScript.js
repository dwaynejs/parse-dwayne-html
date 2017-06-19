module.exports = (tree, options) => {
  if (!tree.length || tree[0].type !== 'script') {
    return;
  }

  const script = tree.shift();

  if (!script.children) {
    return;
  }

  const text = script.children[0];

  return {
    code: text.value,
    loc: options.lines.locationForIndex(text.start)
  };
};
