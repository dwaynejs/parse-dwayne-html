var _tmpl, _mixin;

module.exports = (_tmpl = [
  {
    type: 'div',
    children: [
      {
        type: Block,
        args: {
          StringMixin: (_mixin = function () {
            return 'value';
          }, _mixin.mixin = StringMixin, _mixin.__source = 'source.html:2:9', _mixin),
          __source: 'source.html:2:3'
        },
        children: [
          {
            type: '#text',
            value: function (_) {
              return _.text;
            }
          }
        ]
      }
    ]
  }
], _tmpl.vars = ['text'], _tmpl);