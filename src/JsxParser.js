const _ = require('lodash');
const { parseExpression } = require('babylon');
const t = require('babel-types');

class JsxParser {
  constructor(source, options) {
    this.source = source;

    this.filename = options.filename;
    this.collapseWhitespace = options.collapseWhitespace;
  }

  parse() {
    try {
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

      if (!t.isJSXElement(jsxRootNode)) {
        return [];
      }

      return this.traverseNode(jsxRootNode, [], true, true);
    } catch (err) {
      return [];
    }
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

      elem = {
        start,
        type: this.source.slice(start, end),
        attrs: {},
        children: []
      };

      attributes
        .filter(t.isJSXAttribute)
        .forEach(({ name: { start, end }, value }) => {
          const attr = elem.attrs[this.source.slice(start, end)] = {
            nameStart: start,
            valueStart: null,
            value: true
          };

          if (value) {
            let {
              start,
              end
            } = value;

            if (t.isStringLiteral(value)) {
              start++;
              end--;
            }

            attr.valueStart = start;
            attr.value = this.source.slice(start, end);
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
