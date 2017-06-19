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
          __source: {
            file: "source.html",
            line: 2,
            column: 3
          }
        }
      }
    ]
  }
], _tmpl.vars = ["val1", "val2"], _tmpl);