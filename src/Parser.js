const _ = require('lodash');

const ALLOWED_TAG_NAMES = '([a-z][a-z\\d\\-_.,:!@#\\$%\\^&*()\\[\\]{}\\\\=\'`"~<]*)';
const VOID_ELEMENTS_ARRAY = [
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
];
const RAW_TEXT_NODES_ARRAY = [
  'style',
  'script',
  'title',
  'textarea'
];
const VOID_ELEMENTS = Object.create(null);
const RAW_TEXT_NODES = Object.create(null);

VOID_ELEMENTS_ARRAY.forEach((tag) => {
  VOID_ELEMENTS[tag] = true;
});

RAW_TEXT_NODES_ARRAY.forEach((tag) => {
  RAW_TEXT_NODES[tag] = true;
});

const STATES = {
  TEXT: 'TEXT',
  INSIDE_OPEN_TAG: 'INSIDE_OPEN_TAG',
  BEFORE_ATTR: 'BEFORE_ATTR',
  INSIDE_RAW_TEXT_NODE: 'INSIDE_RAW_TEXT_NODE',
  BEFORE_OPEN_TAG: 'BEFORE_OPEN_TAG',
  BEFORE_CLOSE_TAG: 'BEFORE_CLOSE_TAG',
  BEFORE_COMMENT_OPEN_TAG: 'BEFORE_COMMENT_OPEN_TAG',
  BEFORE_COMMENT_VALUE: 'BEFORE_COMMENT_VALUE'
};

const OPEN_TAG_START_REGEX = new RegExp('<' + ALLOWED_TAG_NAMES, 'i');
const CLOSE_TAG_START_REGEX = new RegExp('</' + ALLOWED_TAG_NAMES + '>', 'i');
const COMMENT_START_REGEX = /<!--/;
const COMMENT_END_REGEX = /-->|-?-?$/;
const ATTR_REGEX = /([^\u0000-\u0020\s"'>/=]+)(?:(\s*=\s*)('[^']*'|"[^"]*"|[^\s"'>=]*))?\s*/;

class Parser {
  constructor(html, options) {
    this.original = html;
    this.html = html;
    this.index = 0;
    this.length = html.length;
    this.elements = [];
    this.state = STATES.TEXT;
    this.currentNode = {
      type: null,
      children: this.elements
    };

    this.xmlMode = options.xmlMode;
    this.collapseWhitespace = options.collapseWhitespace;
  }

  parse() {
    while (this.index !== this.length) {
      const prevIndex = this.index;
      const prevState = this.state;

      this._parseChunk();

      /* istanbul ignore if*/
      if (this.index === prevIndex && this.state === prevState) {
        throw new Error('An unexpected error happened! '
          + 'Please, submit an issue to https://github.com/dwaynejs/parse-dwayne-html. '
          + 'Input html: '
          + JSON.stringify(this.original)
        );
      }

      this.html = this.original.slice(this.index);
    }

    return this.elements;
  }

  _parseChunk() {
    switch (this.state) {
      case STATES.TEXT: {
        return this._parseText();
      }

      case STATES.INSIDE_OPEN_TAG: {
        return this._parseAttrs();
      }

      case STATES.BEFORE_ATTR: {
        return this._parseAttr();
      }

      case STATES.INSIDE_RAW_TEXT_NODE: {
        return this._parseRawText();
      }

      case STATES.BEFORE_COMMENT_OPEN_TAG: {
        return this._parseBeforeComment();
      }

      case STATES.BEFORE_COMMENT_VALUE: {
        return this._parseCommentValue();
      }

      case STATES.BEFORE_OPEN_TAG: {
        return this._parseBeforeOpenTag();
      }

      case STATES.BEFORE_CLOSE_TAG: {
        return this._parseBeforeCloseTag();
      }
    }
  }

  _parseText() {
    const commentMatch = this.html.match(COMMENT_START_REGEX) || { index: Infinity };
    const openTagMatch = this.html.match(OPEN_TAG_START_REGEX) || { index: Infinity };
    const closeTagMatch = this.html.match(CLOSE_TAG_START_REGEX) || { index: Infinity };
    const minIndex = Math.min(commentMatch.index, openTagMatch.index, closeTagMatch.index);

    if (minIndex === Infinity) {
      this._addText(this.length - this.index);
      this.index = this.length;
    } else {
      if (minIndex === commentMatch.index) {
        this.state = STATES.BEFORE_COMMENT_OPEN_TAG;
      } else if (minIndex === openTagMatch.index) {
        this.state = STATES.BEFORE_OPEN_TAG;
      } else {
        this.state = STATES.BEFORE_CLOSE_TAG;
      }

      this._addText(minIndex);
      this.index += minIndex;
    }
  }

  _parseAttrs() {
    if (this.html.indexOf('/>') === 0) {
      this.index += 2;
      this.state = STATES.TEXT;
      this.currentNode = this.currentNode.parent;
    } else if (this.html[0] === '>') {
      this.index += 1;
      this.state = RAW_TEXT_NODES[this.currentNode.type]
        ? STATES.INSIDE_RAW_TEXT_NODE
        : STATES.TEXT;

      if (!this.xmlMode && VOID_ELEMENTS[this.currentNode.type]) {
        this.currentNode = this.currentNode.parent;
      }
    } else {
      const attrMatch = this.html.match(ATTR_REGEX);

      if (attrMatch && attrMatch.index === 0) {
        this.state = STATES.BEFORE_ATTR;
      } else {
        this.index += 1;
      }
    }
  }

  _parseAttr() {
    const attrMatch = this.html.match(ATTR_REGEX);
    const name = attrMatch[1];
    const value = attrMatch[2]
      ? attrMatch[3].replace(/^["']|["']$/g, '')
      : true;

    if (attrMatch[2]) {
      this.currentNode.attrsValuesLocations[name] = this.index + name.length + attrMatch[2].length + /^['|"]/.test(attrMatch[3]);
    }

    const attr = this.currentNode.attrs[name] = {
      nameStart: this.index,
      valueStart: null,
      value
    };

    if (attrMatch[2]) {
      attr.valueStart = this.index + name.length + attrMatch[2].length + /^['|"]/.test(attrMatch[3]);
    }

    this.index += attrMatch[0].length;
    this.state = STATES.INSIDE_OPEN_TAG;
  }

  _parseRawText() {
    const closeTagRegexp = new RegExp('</' + this.currentNode.type + '>');
    let closeTagMatch = this.html.match(closeTagRegexp);

    if (!closeTagMatch) {
      closeTagMatch = {
        index: this.length - this.index
      };
    }

    this._addText(closeTagMatch.index);
    this.index += closeTagMatch.index;
    this.state = STATES.BEFORE_CLOSE_TAG;
  }

  _parseBeforeComment() {
    this.index += 4;
    this.state = STATES.BEFORE_COMMENT_VALUE;

    const comment = {
      parent: this.currentNode,
      type: '#comment',
      value: ''
    };

    this.currentNode.children.push(comment);
    this.currentNode = comment;
  }

  _parseCommentValue() {
    const commentEndMatch = this.html.match(COMMENT_END_REGEX);

    this.index += commentEndMatch.index + commentEndMatch[0].length;
    this.state = STATES.TEXT;
    this.currentNode.value = this.html.slice(0, commentEndMatch.index);
    this.currentNode = this.currentNode.parent;
  }

  _parseBeforeOpenTag() {
    const openTagMatch = this.html.match(OPEN_TAG_START_REGEX);
    const node = {
      parent: this.currentNode,
      start: this.index + 1,
      type: openTagMatch[1],
      attrs: {},
      attrsNamesLocations: {},
      attrsValuesLocations: Object.create(null),
      children: []
    };

    this.index += openTagMatch[0].length;
    this.state = STATES.INSIDE_OPEN_TAG;
    this.currentNode.children.push(node);
    this.currentNode = node;
  }

  _parseBeforeCloseTag() {
    const closeTagName = this.html.match(CLOSE_TAG_START_REGEX);

    this.index += closeTagName[0].length;
    this.state = STATES.TEXT;

    if (this.currentNode.type === closeTagName[1]) {
      this.currentNode = this.currentNode.parent;
    }
  }

  _addText(upToIndex) {
    if (!upToIndex) {
      return;
    }

    let text = this.html.slice(0, upToIndex);
    let offsetStart = 0;

    if (this.collapseWhitespace) {
      offsetStart = (text.match(/\S/) || { index: 0 }).index;
      text = text.trim();
    }

    if (!text) {
      return;
    }

    this.currentNode.children.push({
      parent: this.currentNode,
      start: this.index + offsetStart,
      type: '#text',
      value: text
    });
  }
}

module.exports = Parser;
