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
          arg2: function () {
            return "{string}";
          },
          arg3: function (_) {
            return _.value;
          },
          "Rest:0": (_mixin = function (_) {
            return { ..._.rest1 };
          }, _mixin.mixin = Rest, _mixin.__source = "source.html:9:5", _mixin),
          bool: true,
          MixinBool: (_mixin = function () {
            return true;
          }, _mixin.mixin = MixinBool, _mixin.__source = "source.html:11:5", _mixin),
          MixinString: (_mixin = function () {
            return "string";
          }, _mixin.mixin = MixinString, _mixin.__source = "source.html:12:5", _mixin),
          MixinDynamic: (_mixin = function (_) {
            return _.a + _.b;
          }, _mixin.mixin = MixinDynamic, _mixin.__source = "source.html:13:5", _mixin),
          "Rest:1": (_mixin = function (_) {
            return { ..._.rest2 };
          }, _mixin.mixin = Rest, _mixin.__source = "source.html:14:5", _mixin),
          __source: "source.html:5:4"
        }
      }
    ]
  }
], _tmpl.vars = ["text", "value", "rest1", "a", "b", "rest2"], _tmpl);