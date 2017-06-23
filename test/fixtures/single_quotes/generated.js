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
          }, _mixin.mixin = StringMixin, _mixin),
          __source: {
            file: 'source.html',
            line: 2,
            column: 3
          }
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