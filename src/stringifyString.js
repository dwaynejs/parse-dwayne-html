module.exports = (string, options) => {
  if (options.quotes === 'double') {
    return JSON.stringify(string);
  }

  return `'${
    string
      .replace(/\\/g, '\\\\')
      .replace(/'/g, '\\$&')
  }'`;
};
