const _ = require('lodash');
const entities = require('entities');

const constructEvalFunction = require('./constructEvalFunction');
const { parseJs, maybeParseJs } = require('./parseJs');
const stringifyString = require('./stringifyString');

const BLOCK_REGEX = /^(?:[A-Z][A-Za-z\d_$]*(?:\.[A-Za-z_$][A-Za-z\d_$]*)*|[A-Za-z_$][A-Za-z\d_$]*\.[A-Za-z_$][A-Za-z\d_$]*(?:\.[A-Za-z_$][A-Za-z\d_$]*)*)$/;
const MIXIN_REGEX = /^((?:[A-Z][A-Za-z\d_$]*(?:\.[A-Za-z_$][A-Za-z\d_$]*)*|[A-Za-z_$][A-Za-z\d_$]*\.[A-Za-z_$][A-Za-z\d_$]*(?:\.[A-Za-z_$][A-Za-z\d_$]*)*))(?::.*)?$/;

module.exports = function transformJs(DOM, usedLocals, exclude, options) {
  const newDOM = [];

  _.forEach(DOM, (node) => {
    let {
      type,
      args,
      children,
      start,
      value
    } = node;
    const excludeLocal = {};
    const blockMatch = type.match(BLOCK_REGEX);

    if (type === 'Each' || type === 'Dwayne.Each') {
      excludeLocal[_.get(args, 'item', { value: '$item' }).value] = true;
      excludeLocal[_.get(args, 'index', { value: '$index' }).value] = true;
    }

    if (blockMatch) {
      node.type = constructEvalFunction(type);
      node.type.start = start;
    }

    if (args) {
      node.args = _.mapValues(args, (argValue, arg) => {
        const mixinMatch = arg.match(MIXIN_REGEX);
        let {
          nameStart,
          valueStart,
          value
        } = argValue;
        let eventualValue;

        if (mixinMatch) {
          value = value === true
            ? '{true}'
            : value[0] !== '{' || value[value.length - 1] !== '}'
              ? '{' + stringifyString(entities.decodeHTML(value), options) + '}'
              : value;
        }

        if (value === true) {
          eventualValue = blockMatch ? true : '';
        } else if (value[0] !== '{' || value[value.length - 1] !== '}') {
          eventualValue = entities.decodeHTML(value);
        } else {
          const index = valueStart === null
            ? nameStart
            : valueStart + 1;
          const parsed = parseJs(value.slice(1, -1), index, options);
          const usedVariables = {};

          _.forEach(parsed.vars, (variable) => {
            if (exclude[variable]) {
              return;
            }

            usedVariables[variable] = true;
          });

          _.assign(usedLocals, usedVariables);

          options.generatedThisVar = options.generatedThisVar || parsed.generatedThisVar;
          eventualValue = constructEvalFunction(parsed.code, parsed.map);

          if (mixinMatch) {
            eventualValue.mixin = mixinMatch[1];
          }

          eventualValue.nameStart = nameStart;
          eventualValue.location = index;
        }

        return eventualValue;
      });
    }

    if (type !== '#text') {
      if (
        children
        && (type !== 'script' || options.transformScripts)
        && (type !== 'style' || options.transformStyles)
      ) {
        node.children = transformJs(
          children,
          usedLocals,
          _.assign(exclude, excludeLocal),
          options
        );
      }

      newDOM.push(node);

      return;
    }

    let curIndex = 0;

    while (value.length) {
      const match = value.match(/{/);

      if (!match) {
        newDOM.push({
          start: start + curIndex,
          type: '#text',
          value: entities.decodeHTML(value)
        });

        break;
      }

      const index = match.index;

      if (index) {
        newDOM.push({
          start: curIndex,
          type: '#text',
          value: entities.decodeHTML(value.slice(0, index))
        });
        curIndex += index;
        value = value.slice(index);
      }

      const parsed = maybeParseJs(value.slice(1), start + curIndex + 1, options);
      const usedVariables = {};
      const newValue = constructEvalFunction(parsed.code, parsed.map);

      options.generatedThisVar = options.generatedThisVar || parsed.generatedThisVar;
      newValue.location = start + curIndex + 1;

      _.forEach(parsed.vars, (variable) => {
        if (!exclude[variable]) {
          usedVariables[variable] = true;
        }
      });

      _.assign(usedLocals, usedVariables);

      newDOM.push({
        start: start + curIndex + 1,
        type: '#text',
        value: newValue
      });
      curIndex += parsed.original.length + 2;
      value = parsed.rest;
    }
  });

  return newDOM;
};
