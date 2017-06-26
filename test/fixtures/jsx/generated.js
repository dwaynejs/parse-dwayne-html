var _tmpl, _mixin;

module.exports = (_tmpl = [
  {
    type: "div",
    children: [
      {
        type: "span",
        args: {
          attr: ""
        },
        children: [
          {
            type: "#text",
            value: function (_) {
              return _.text;
            }
          }
        ]
      },
      {
        type: Namespace.Block,
        args: {
          arg1: "string",
          arg2: "string",
          arg3: function (_) {
            return _.value;
          },
          bool: true,
          MixinBool: (_mixin = function () {
            return true;
          }, _mixin.mixin = MixinBool, _mixin),
          MixinString: (_mixin = function () {
            return "string";
          }, _mixin.mixin = MixinString, _mixin),
          MixinDynamic: (_mixin = function (_) {
            return _.a + _.b;
          }, _mixin.mixin = MixinDynamic, _mixin),
          __source: {
            file: "source.html",
            line: 5,
            column: 3
          }
        }
      }
    ]
  }
], _tmpl.vars = ["text", "value", "a", "b"], _tmpl);