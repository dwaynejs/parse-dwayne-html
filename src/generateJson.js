const _ = require('lodash');

const PURE_PROP_REGEX = /^[A-Za-z_$][A-Za-z\d_$]*$/;

const setJsIndents = require('./setJsIndents');
const stringifyString = require('./stringifyString');

module.exports = function generateJson(json, code, indent, options) {
  const {
    mixinVarName,
    indent: INDENT
  } = options;

  code.add('[');

  json.forEach((node, index) => {
    let {
      type,
      args,
      children
    } = node;

    code.add(
      `
${ INDENT.repeat(indent + 1)
        }{
${ INDENT.repeat(indent + 2)
        }type: `
    );

    if (typeof type === 'string') {
      code.add(stringifyString(type, options));
    } else {
      if (options.toFunction) {
        code.generatedVarsName = true;
        code.addWithMapping(
          options.varsVarName + '.',
          type.start
        );
      }

      type.toString().split(/(\.)/).forEach((name) => {
        if (name === '.') {
          code.add('.');
        } else {
          code.addWithMapping(
            name,
            type.start,
            name
          );
        }
      });
    }

    if (args) {
      code.add(
        `,
${ INDENT.repeat(indent + 2)
          }args: {`
      );

      _.forEach(_.keys(args), (arg, index, keys) => {
        const value = args[arg];

        if (!PURE_PROP_REGEX.test(arg)) {
          arg = stringifyString(arg, options);
        }

        code.add(
          `
${ INDENT.repeat(indent + 3)
            }${ arg }: `
        );

        if (typeof value !== 'function') {
          code.add(stringifyString(value, options));
        } else {
          if (value.mixin) {
            code.generatedMixin = true;
            code.add(
              `(${ mixinVarName } = `
            );
          }

          const withIndents = setJsIndents(value.toString(), value.map, indent + 3, options);

          code.addWithMap(withIndents.code, withIndents.map, value.location);

          if (value.mixin) {
            code.add(
              `, ${ mixinVarName }.mixin = `
            );

            if (options.toFunction) {
              code.generatedVarsName = true;
              code.addWithMapping(
                options.varsVarName + '.',
                value.nameStart
              );
            }

            value.mixin.toString().split(/(\.)/).forEach((name) => {
              if (name === '.') {
                code.add('.');
              } else {
                code.addWithMapping(
                  name,
                  value.nameStart,
                  name
                );
              }
            });

            if (value.source) {
              code.add(
                `, ${ mixinVarName }.__source = ${ stringifyString(value.source, options) }`
              );
            }

            code.add(
              `, ${ mixinVarName })`
            );
          }
        }

        if (index !== keys.length - 1) {
          code.add(',');
        }
      });

      code.add(
        `
${ INDENT.repeat(indent + 2) }}`
      );
    }

    if ('value' in node) {
      const value = node.value;
      const withIndents = setJsIndents(
        typeof value === 'string' ? stringifyString(value, options) : value.toString(),
        value.map,
        indent + 2,
        options
      );

      code
        .add(
          `,
${ INDENT.repeat(indent + 2)
          }value: `
        )
        .addWithMap(
          withIndents.code,
          withIndents.map,
          value.location
        );
    }

    if (children) {
      code.add(
        `,
${ INDENT.repeat(indent + 2)
          }children: `
      );
      generateJson(children, code, indent + 2, options);
    }

    code.add(
      `
${ INDENT.repeat(indent + 1)}}`
    );

    if (index !== json.length - 1) {
      code.add(',');
    }
  });

  code.add(
    `
${ INDENT.repeat(indent) }]`
  );
};
