# transform-dwayne-html

The module is used for transforming plain HTML and JSX to javascript
code (with sourcemaps) according to the needs of Dwayne.

It's supposed to be used in loaders, plugins for bundlers,
build systems, task runners and etc.

### Installation

```bash
npm install --save transform-dwayne-html
```

### Usage

```js
const transformDwayneHtml = require('transform-dwayne-html');

const html = `
  <div>
    {text}
  </div>
`;

console.log(transformDwayneHtml(html));

// {
//   code: `var _tmpl;
// 
//   module.exports = (_tmpl = [
//     {
//       type: "div",
//       children: [
//         {
//           type: "#text",
//           value: function (_) {
//             return _.text;
//           }
//         }
//       ]
//     }
//   ], _tmpl.vars = ["text"], _tmpl)`,
//   map: { ... },
//   generatedTmplVar: false,
//   generatedMixinVar: false
// }
```

### API

```
transformDwayneHtml(code: string, options?: {
  xmlMode?: boolean = true,
  collapseWhitespace?: boolean = true,
  unscopables?: string[] = ['require'],
  injectFirstScript?: boolean = true,
  transformScript?: boolean = false,
  transformStyle?: boolean = false,
  sourceType?: 'module' | 'embed' = 'module',
  exportType?: 'es' | 'cjs' = 'cjs',
  toFunction?: boolean = false,
  addSource?: boolean = true,
  sourceMap?: boolean = true,
  inputSourceMap?: SourceMap | null,
  startLine?: number = 1,
  startColumn?: number = 0,
  startPosition?: number = 0,
  filename?: string = 'unknown',
  mode?: 'html' | 'jsx' = 'html',
  jsxRestName?: string = 'Rest',
  indent?: string | number = 2,
  useES6?: boolean = false,
  quotes?: 'single' | 'double' = 'double',
  tmplVarName?: string = '_tmpl',
  mixinVarName?: string = '_mixin',
  thisVarName?: string,
  keepScope?: boolean
}): {
  code: string,
  map: SourceMap | null,
  generatedTmplVar: boolean,
  generatedMixinVar: boolean,
  generatedThisVar: boolean
}
```

There are two types of options: ones that are used by loaders,
plugins and etc (not by the end Dwayne user) and ones that are usually
passed through.

Plugins options:

* `options.sourceType` (default: `'module'`): one of
`['module', 'embed']`. `module` means that the output should be a
module, and `embed` means that the output should be a plain template.
* `options.inputSourceMap` (default: `null`): input sourcemap.
* `options.startLine` (default: `1`): set this when the html is embedded
into javascript. Used when `options.addSource` is `true` and for syntax
error messages. Note that it doesn't shift the output code or its
map. (1-indexed)
* `options.startColumn` (default: `0`): set this when the html is embedded
into javascript. Used when `options.addSource` is `true` and for syntax
error messages. Note that it doesn't shift the output code or its map.
* `options.startPosition` (default: `0`): set this when the html is embedded
into javascript. Used when `options.addSource` is `true` and for syntax
error messages. Note that it doesn't shift the output code or its map.
* `options.filename` (default: `'unknown'`): used for sourcemaps and
`__source` args (see `options.addSource`).
* `options.mode` (default: `'html'`): one of `['html', 'jsx']`. Type
of the source code. It's planned to parse at least pug templates in
the future.
* `options.tmplVarName` (default: `_tmpl`): used for referencing
the template var. If the html is embedded into javascript it's
important not to violate the outer scope, so you should pass a unique
id when it's the case (it also probably shouldn't match any of
`options.unscopables` vars).
* `options.mixinVarName` (default: `_mixin`): the same as the previous
one, but it's used for referencing a mixin function.
* `options.thisVarName`: see [transform-dwayne-js-expressions](https://github.com/dwaynejs/transform-dwayne-js-expressions).
* `options.keepScope`: see [transform-dwayne-js-expressions](https://github.com/dwaynejs/transform-dwayne-js-expressions).

Dwayne user options:

* `options.xmlMode` (default: `true`): passed to the html parser.
Means that all html tags must be closed.
* `options.collapseWhitespace` (default: `true`): passed to the html
parser. Means that any whitespace between tags and text are ignored.
* `options.unscopables` (default: `['require']`): passed to
[transform-dwayne-js-expressions](https://github.com/dwaynejs/transform-dwayne-js-expressions).
* `options.injectFirstScript` (default: `true`): used only when
`options.sourceType` is `module`. If it is, `truthy` values means
that if the first element in the html is a script, its contents are
passed to the result html. It is useful for importing the blocks and
the mixins that you use in the template (see the examples below).
* `options.toFunction` (default: `false`): means that the template
will compile into a function. Useful when you don't use
`options.injectFirstScript` - you can pass the blocks and the mixins
that you use in the template through the function argument (see the
examples below).
* `options.transformScripts` (default: `false`): whether to transform
embedded js inside `script` tags or not. (doesn't affect the first
script with the previous option set to `true`).
* `options.transformStyles` (default: `false`): whether to transform
embedded js inside `style` tags or not.
* `options.exportType` (default: `cjs`): one of `['es', 'cjs']`.
Used only when `options.sourceType` is `module`. If it is `es`, the
output will be exported like `export default ...;` and if `cjs`, it
will be `module.exports = ...;`.
* `options.addSource` (default: `true`): means that every block
gets `__source` arg and every mixin gets `__source` property, which
will be used later by Dwayne for debugging purposes (see the
examples below).
* `options.sourceMap` (default: `true`): whether the sourcemap should
be generated (also passed to
[transform-dwayne-js-expressions](https://github.com/dwaynejs/transform-dwayne-js-expressions)).
* `options.indent` (default: `2`): output indent string. Number means
that many spaces.
* `options.useES6` (default: `false`): whether ES6 should be used in
the output rather than ES5: `let` instead of `var`, arrow functions
instead of usual functions. It's recommended setting this option to
`true` and leave transformations to babel. Also passed to
[transform-dwayne-js-expressions](https://github.com/dwaynejs/transform-dwayne-js-expressions).
See the examples below.
* `options.quotes` (default: `'double'`): one of `['single', 'double']`.
Type of quotes to use in the output. Note that it doesn't affect
your JS embedded code.
* `options.jsxRestName` (default: `'Rest'`): name of the Rest mixin
when transforming JSX spread attribute.

Returns an object with following properties:

* `code`: the output js code.
* `map`: the output sourcemap.
* `generatedTmplVar`: whether `options.tmplVarName` was used in the
code or not. (useful for embedded code)
* `generatedMixinVar`: whether `options.mixinVarName` was used in the
code or not. (useful for embedded code)
* `generatedThisVar`: whether `options.thisVarName` was used in the
code or not. (see [transform-dwayne-js-expressions](https://github.com/dwaynejs/transform-dwayne-js-expressions))

### Examples

#### `options.injectFirstScript`

Input:

```html
<script>
  const Block = require('../Block');
</script>

<div>
  <Block/>
</div>
```

Output (`false`):

```js
module.exports = [
  {
    type: "script",
    children: [
      {
        type: "#text",
        value: "const Block = require('../Block');"
      }
    ]
  },
  {
    type: "div",
    children: [
      {
        type: Block
      }
    ]
  }
];
```

Output (`true`):

```js
const Block = require('../Block');

module.exports = [
  {
    type: "div",
    children: [
      {
        type: Block
      }
    ]
  }
];
```

#### `options.toFunction`

Input:

```html
<Block>
  <div Namespace.Mixin="{value}">
    {text}
  </div>
</Block>
```

Output (`false`):

```js
var _tmpl, _mixin;

module.exports = (_tmpl = [
  {
    type: Block,
    children: [
      {
        type: "div",
        args: {
          "Namespace.Mixin": (_mixin = function (_) {
            return _.value;
          }, _mixin.mixin = Namespace.Mixin, _mixin)
        },
        children: [
          {
            type: "#text",
            value: function (_) {
              return _.text;
            }
          }
        ]
      }
    ]
  }
], _tmpl.vars = ["value", "text"], _tmpl);
```

Output (`true`):

```js
var _tmpl, _mixin;

module.exports = function (_) {
  return (_tmpl = [
    {
      type: _.Block,
      children: [
        {
          type: "div",
          args: {
            "Namespace.Mixin": (_mixin = function (_) {
              return _.value;
            }, _mixin.mixin = _.Namespace.Mixin, _mixin)
          },
          children: [
            {
              type: "#text",
              value: function (_) {
                return _.text;
              }
            }
          ]
        }
      ]
    }
  ], _tmpl.vars = ["value", "text"], _tmpl);
};
```

#### `options.addSource`

Input:

```html
<div Class="{classes}">
  <Block/>
</div>
```

Output (`false`):

```js
var _tmpl, _mixin;

module.exports = (_tmpl = [
  {
    type: "div",
    args: {
      Class: (_mixin = function (_) {
        return _.classes;
      }, _mixin.mixin = Class, _mixin)
    },
    children: [
      {
        type: Block
      }
    ]
  }
], _tmpl.vars = ["classes"], _tmpl);
```

Output (`true`):

```js
var _tmpl, _mixin;

module.exports = (_tmpl = [
  {
    type: "div",
    args: {
      Class: (_mixin = function (_) {
        return _.classes;
      }, _mixin.mixin = Class, _mixin.__source = "template.html:1:5", _mixin)
    },
    children: [
      {
        type: Block,
        args: {
          __source: "template.html:2:3"
        }
      }
    ]
  }
], _tmpl.vars = ["classes"], _tmpl);
```

#### `options.useES6`

Input:

```html
<div>
  {text}
</div>
```

Output (`false`):

```js
var _tmpl;

module.exports = (_tmpl = [
  {
    type: "div",
    children: [
      {
        type: "#text",
        value: function (_) {
          return _.text;
        }
      }
    ]
  }
], _tmpl.vars = ["text"], _tmpl);
```

Output (`true`):

```js
let _tmpl;

module.exports = (_tmpl = [
  {
    type: "div",
    children: [
      {
        type: "#text",
        value: _ => _.text
      }
    ]
  }
], _tmpl.vars = ["text"], _tmpl);
```

#### `options.mode`

Input:

```jsx
<div>
  {text}
  <span>
    {text}
  </span>
  <Block
    arg1="string"
    arg2="{stringWithCurly}"
    bool
    dynamic={value}
    Mixin={value}
    {...rest}
  />
</div>
```

Output (`'jsx'`):

```js
var _tmpl, _mixin;

module.exports = (_tmpl = [
  {
    type: "div",
    children: [
      {
        type: "#text",
        value: function (_) {
          return _.text;
        }
      },
      {
        type: "span",
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
        type: Block,
        args: {
          arg1: "string",
          arg2: function () {
            return "{stringWithCurly}";
          },
          bool: true,
          dynamic: function (_) {
            return _.value;
          },
          Mixin: (_mixin = function (_) {
            return _.value;
          }, _mixin.mixin = Mixin, _mixin),
          "Rest:0": (_mixin = function (_) {
            return { ..._.rest };
          }, _mixin.mixin = Rest, _mixin)
        }
      }
    ]
  }
], _tmpl.vars = ["text", "value", "rest"], _tmpl);
```

### Syntax rules and tips

* All your template code is just a plain html.
* You can embed any js expressions (even using ES6 or some proposals)
inside curly braces. Example: `{a + b}`. Note that none of js is
transformed for you. You can pass the output through
[babel](http://babeljs.io/).
  * Embedded js in args should start with `{` and end with `}`.
  * `{` in text nodes means that the embedded js expression begins. If
  you want to print just `{`, you should type `{'{'}` (embed a js string).
  * If you want to print a space at the beginning or at the end with
  `options.collapseWhitespace` set to `true`, just embed it as a js:
  `{' '}`.
* Block and mixin names should be either capitalized or contain a dot.
Example: `MyBlock`, `nsp.block` will compile into pure js and `myBlock`,
`block` will compile into js strings (meaning html elements).
* To pass blocks and mixins to the template, either use
`options.injectFirstScript` or `options.toFunction`.
* If the template contain a `Each` or a `Dwayne.Each` block, it
excludes `item` and `index` variables inside them from used variables.
* All rules for usual JSX are the same for Dwayne JSX. Only JSX spread
attribute is transformed into `Rest` mixin from Dwayne.

### Output template

Output template is a js array, containing the template elements and
blocks. The array may have a `vars` property that contains used scope
vars. Output block or element has following properties:

* `type` (`string | any`): the only property that is always present.
If the tag is an html element, it's a string, otherwise it's a
js expression.
* `args` (`object<string, string | boolean | function>`): args object
with keys being args names and values being their values.
* `value` (`string | function`): this property exists if the node
is a text node or a comment node.
* `children` (`array`): this property is present if the element has
any children.
