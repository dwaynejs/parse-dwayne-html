module.exports = (code, map) => {
  const func = new Function();

  func.toString = () => code;
  func.code = code;
  func.map = map;

  return func;
};
