var _tmpl, _mixin;

module.exports = function (_) {
  return (_tmpl = [
    {
      type: _.Block,
      args: {
        __source: "source.html:1:1"
      },
      children: [
        {
          type: _.Dwayne.If,
          args: {
            if: function (_) {
              return _.value;
            },
            __source: "source.html:2:3"
          },
          children: [
            {
              type: "div",
              args: {
                "Dwayne.Class": (_mixin = function (_) {
                  return _.cls;
                }, _mixin.mixin = _.Dwayne.Class, _mixin.__source = "source.html:4:6", _mixin),
                MyMixin: (_mixin = function (_) {
                  return _.value;
                }, _mixin.mixin = _.MyMixin, _mixin.__source = "source.html:5:6", _mixin)
              }
            }
          ]
        }
      ]
    }
  ], _tmpl.vars = ["value", "cls"], _tmpl);
};