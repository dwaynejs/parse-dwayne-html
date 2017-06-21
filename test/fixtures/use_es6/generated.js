let _tmpl;

module.exports = _ => (_tmpl = [
  {
    type: "div",
    children: [
      {
        type: _.Block,
        args: {
          __source: {
            file: "source.html",
            line: 2,
            column: 3
          }
        },
        children: [
          {
            type: "#text",
            value: _ => _.text
          }
        ]
      }
    ]
  }
], _tmpl.vars = ["text"], _tmpl);