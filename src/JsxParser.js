const _ = require('lodash');
const { parseExpression } = require('babylon');
const t = require('babel-types');

const stringifyString = require('./stringifyString');

class JsxParser {
  constructor(source, options) {
    this.source = source;

    this.options = options;
    this.filename = options.filename;
    this.collapseWhitespace = options.collapseWhitespace;
    this.restName = options.jsxRestName;
  }

  parse() {
    const jsxRootNode = parseExpression(this.source, {
      sourceFilename: this.filename,
      plugins: [
        'jsx',
        'flow',
        'doExpressions',
        'objectRestSpread',
        'decorators',
        'classProperties',
        'classPrivateProperties',
        'exportExtensions',
        'asyncGenerators',
        'functionBind',
        'functionSent',
        'dynamicImport',
        'numericSeparator',
        'optionalChaining',
        'importMeta'
      ]
    });

    return this.traverseNode(jsxRootNode, [], true, true);
  }

  traverseNode(node, dom, isFirst, isLast) {
    const {
      start,
      end
    } = node;
    let elem;

    if (t.isJSXElement(node)) {
      const {
        openingElement: {
          attributes,
          name: {
            start,
            end
          }
        },
        children
      } = node;
      let RestIndex = 0;

      elem = {
        start,
        type: this.source.slice(start, end),
        attrs: {},
        children: []
      };

      attributes.forEach((attribute) => {
        if (t.isJSXAttribute(attribute)) {
          const {
            name: {
              start,
              end
            },
            value
          } = attribute;
          const attr = elem.attrs[this.source.slice(start, end)] = {
            nameStart: start,
            valueStart: null,
            value: true
          };

          if (value) {
            const {
              start,
              end,
              value: attrValue
            } = value;

            if (t.isStringLiteral(value)) {
              if (attrValue[0] === '{' && attrValue[attrValue.length - 1] === '}') {
                attr.valueStart = start;
                attr.value = `{${ stringifyString(attrValue, this.options) }}`;
              } else {
                attr.valueStart = start + 1;
                attr.value = attrValue;
              }
            } else {
              attr.valueStart = start;
              attr.value = this.source.slice(start, end);
            }
          }
        } else {
          const {
            start,
            end
          } = attribute;

          elem.attrs[`${ this.restName }:${ RestIndex++ }`] = {
            nameStart: start,
            valueStart: start - 1,
            value: `{${ this.source.slice(start, end) }}`
          };
        }
      });

      children.forEach((node, index) => {
        this.traverseNode(
          node,
          elem.children,
          index === 0 || !children[index - 1] || t.isJSXElement(children[index - 1]),
          index === children.length - 1 || !children[index + 1] || t.isJSXElement(children[index + 1])
        );
      });
    } else {
      let value = this.source.slice(start, end);

      if (this.collapseWhitespace && isFirst) {
        value = _.trimStart(value);
      }

      if (this.collapseWhitespace && isLast) {
        value = _.trimEnd(value);
      }

      if (!value) {
        return;
      }

      elem = {
        type: '#text',
        start,
        value
      };
    }

    dom.push(elem);

    return dom;
  }
}

module.exports = JsxParser;
