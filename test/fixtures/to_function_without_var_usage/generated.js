let _tmpl;

module.exports = () => (_tmpl = [
  {
    type: "div",
    children: [
      {
        type: "#text",
        value: _ => _.text
      }
    ]
  }
], _tmpl.vars = ["text"], _tmpl);