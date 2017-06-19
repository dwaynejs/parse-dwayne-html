module.exports = [
  {
    type: "div",
    children: [
      {
        type: Each,
        args: {
          item: "item",
          __source: {
            file: "source.html",
            line: 2,
            column: 3
          }
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