# transform-dwayne-html

The module is used for transforming plain html to javascript code (with
sourcemaps) according to the needs of Dwayne.

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
//   code: `module.exports = [
//     {
//       type: 'div',
//       children: [
//         {
//           type: '#text',
//           value: function (_) {
//             return _.value;
//           }
//         }
//       ]
//     }
//   ]`,
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
  filename?: string = 'unknown',
  indent?: string | number = 2,
  tmplVarName?: string = '_tmpl',
  mixinVarName?: string = '_mixin',
  thisVarName?: string,
  keepScope?: boolean
}): {
  code: string,
  map: SourceMap | null,
  generatedTmplVar: boolean,
  generatedMixinVar: boolean
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
* `options.startLine` (default: `1`): useful when the html is embedded
into javascript. Used when `options.addSource` is `true`. Note that it
doesn't shift the output code or its map. (1-indexed)
* `options.startColumn` (default: `0`): useful when the html is embedded
into javascript. Used when `options.addSource` is `true`. Note that it
doesn't shift the output code or its map.
* `options.filename` (default: `'unknown'`): used for sourcemaps and
source args (see `options.addSource`).
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
gets `__source` arg which is used (see the examples below). The
`__source` arg will be used later by Dwayne.
* `options.sourceMap` (default: `true`): whether the sourcemap should
be generated (also passed to
[transform-dwayne-js-expressions](https://github.com/dwaynejs/transform-dwayne-js-expressions)).
* `options.indent` (default: `2`): output indent string. Number means
that many spaces.

Returns an object with following properties:

* `code`: the output js code.
* `map`: the output sourcemap.
* `generatedTmplVar`: whether `options.tmplVarName` was used in the
codeor not. (useful for embedded code)
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
<div>
  <Block/>
</div>
```

Output (`false`):

```js
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

Output (`true`):

```js
module.exports = [
  {
    type: "div",
    children: [
      {
        type: Block,
        args: {
          __source: {
            file: "template.html",
            line: 2,
            column: 3
          }
        }
      }
    ]
  }
];
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
