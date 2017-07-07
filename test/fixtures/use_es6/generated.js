let _tmpl;

module.exports = _ => (_tmpl = [
  {
    type: "div",
    children: [
      {
        type: _.Block,
        args: {
          __source: "source.html:2:4"
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