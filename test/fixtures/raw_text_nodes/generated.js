module.exports = [
  {
    type: "style",
    children: [
      {
        type: "#text",
        value: "body {\n    margin: 0;\n  }"
      }
    ]
  },
  {
    type: "script",
    children: [
      {
        type: "#text",
        value: "import { Block } from 'dwayne';\n\n  class MyBlock extends Block {}"
      }
    ]
  }
];