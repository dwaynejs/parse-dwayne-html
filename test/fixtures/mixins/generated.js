var _tmpl, _mixin;

module.exports = (_tmpl = [
  {
    type: "div",
    children: [
      {
        type: Block,
        args: {
          "On(click,keydown)": (_mixin = function (_) {
            return _.action();
          }, _mixin.mixin = On, _mixin.args = ["click", "keydown"], _mixin),
          Class: (_mixin = function (_) {
            return _.cls;
          }, _mixin.mixin = Class, _mixin),
          "BoolMixin()": (_mixin = function (_) {
            return true;
          }, _mixin.mixin = BoolMixin, _mixin.args = [], _mixin),
          __source: {
            file: "source.html",
            line: 2,
            column: 3
          }
        }
      }
    ]
  }
], _tmpl.vars = ["action", "cls"], _tmpl);