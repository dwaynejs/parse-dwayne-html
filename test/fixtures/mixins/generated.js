var _tmpl, _mixin;

module.exports = (_tmpl = [
  {
    type: "div",
    children: [
      {
        type: Block,
        args: {
          "On:click": (_mixin = function (_) {
            return _.action();
          }, _mixin.mixin = On, _mixin),
          Class: (_mixin = function (_) {
            return _.cls;
          }, _mixin.mixin = Class, _mixin),
          BoolMixin: (_mixin = function () {
            return true;
          }, _mixin.mixin = BoolMixin, _mixin),
          __source: "source.html:2:3"
        }
      }
    ]
  }
], _tmpl.vars = ["action", "cls"], _tmpl);