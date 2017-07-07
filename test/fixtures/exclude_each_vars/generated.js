module.exports = [
  {
    type: "div",
    children: [
      {
        type: Each,
        args: {
          item: "item",
          __source: "source.html:2:4"
        },
        children: [
          {
            type: "#text",
            value: function (_) {
              return _.item.value;
            }
          },
          {
            type: "span",
            args: {
              value: function (_) {
                return _.item.value;
              }
            }
          }
        ]
      }
    ]
  }
];