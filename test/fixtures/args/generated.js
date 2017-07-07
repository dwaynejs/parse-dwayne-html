var _tmpl;

module.exports = (_tmpl = [
  {
    type: "div",
    children: [
      {
        type: Block,
        args: {
          a: function (_) {
            return _.val1;
          },
          b: function (_) {
            return _.val2;
          },
          c: true,
          __source: "source.html:2:4"
        }
      }
    ]
  }
], _tmpl.vars = ["val1", "val2"], _tmpl);