const _ = require('lodash');

const PURE_PROP_REGEX = /^[A-Za-z_$][A-Za-z\d_$]*$/;

const setJsIndents = require('./setJsIndents');

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

    if (options.addSource && typeof type !== 'string') {
      args = args || {};

      const location = options.lines.locationForIndex(type.start);

      location.column += location.line === 0
        ? options.startColumn
        : 0;
      location.line += options.startLine - 1;

      args.__source = {
        file: options.filename,
        line: location.line + 1,
        column: location.column
      };
    }

    code.add(
      `
${ INDENT.repeat(indent + 1)
        }{
${ INDENT.repeat(indent + 2)
        }type: `
    );

    if (typeof type === 'string') {
      code.add(JSON.stringify(type));
    } else {
      let index = 0;

      if (options.toFunction) {
        code.addWithMapping(
          options.varsVarName + '.',
          options.lines.locationForIndex(type.start)
        );
      }

      type.toString().split(/(\.)/).forEach((name) => {
        if (name === '.') {
          code.add('.');
        } else {
          code.addWithMapping(
            name,
            options.lines.locationForIndex(type.start + index),
            name
          );

          index += name.length + 1;
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
          arg = JSON.stringify(arg);
        }

        code.add(
          `
${ INDENT.repeat(indent + 3)
            }${ arg }: `
        );

        if (typeof value === 'object' && arg === '__source') {
          code.add(
            `{
${ INDENT.repeat(indent + 4) }file: "${ value.file }",
${ INDENT.repeat(indent + 4) }line: ${ value.line },
${ INDENT.repeat(indent + 4) }column: ${ value.column }
${ INDENT.repeat(indent + 3) }}`
          );
        } else if (typeof value !== 'function') {
          code.add(JSON.stringify(value));
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

            let index = 0;

            if (options.toFunction) {
              code.addWithMapping(
                options.varsVarName + '.',
                options.lines.locationForIndex(value.nameStart)
              );
            }

            value.mixin.toString().split(/(\.)/).forEach((name) => {
              if (name === '.') {
                code.add('.');
              } else {
                code.addWithMapping(
                  name,
                  options.lines.locationForIndex(value.nameStart + index),
                  name
                );

                index += name.length + 1;
              }
            });

            code.add(
              `, ${ value.args ? `${
                mixinVarName }.args = ${ JSON.stringify(value.args).replace(/,/g, ', ') }, ` : '' }${
                mixinVarName})`
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
        typeof value === 'string' ? JSON.stringify(value) : value.toString(),
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
