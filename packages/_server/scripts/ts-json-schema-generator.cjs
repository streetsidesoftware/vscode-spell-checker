"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../../../../code/clones/ts-json-schema-generator/node_modules/commander/lib/error.js
var require_error = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/commander/lib/error.js"(exports2) {
    var CommanderError = class extends Error {
      /**
       * Constructs the CommanderError class
       * @param {number} exitCode suggested exit code which could be used with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       * @constructor
       */
      constructor(exitCode, code, message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = code;
        this.exitCode = exitCode;
        this.nestedError = void 0;
      }
    };
    var InvalidArgumentError = class extends CommanderError {
      /**
       * Constructs the InvalidArgumentError class
       * @param {string} [message] explanation of why argument is invalid
       * @constructor
       */
      constructor(message) {
        super(1, "commander.invalidArgument", message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
      }
    };
    exports2.CommanderError = CommanderError;
    exports2.InvalidArgumentError = InvalidArgumentError;
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/commander/lib/argument.js
var require_argument = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/commander/lib/argument.js"(exports2) {
    var { InvalidArgumentError } = require_error();
    var Argument = class {
      /**
       * Initialize a new command argument with the given name and description.
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @param {string} name
       * @param {string} [description]
       */
      constructor(name, description) {
        this.description = description || "";
        this.variadic = false;
        this.parseArg = void 0;
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.argChoices = void 0;
        switch (name[0]) {
          case "<":
            this.required = true;
            this._name = name.slice(1, -1);
            break;
          case "[":
            this.required = false;
            this._name = name.slice(1, -1);
            break;
          default:
            this.required = true;
            this._name = name;
            break;
        }
        if (this._name.length > 3 && this._name.slice(-3) === "...") {
          this.variadic = true;
          this._name = this._name.slice(0, -3);
        }
      }
      /**
       * Return argument name.
       *
       * @return {string}
       */
      name() {
        return this._name;
      }
      /**
       * @api private
       */
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {any} value
       * @param {string} [description]
       * @return {Argument}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Set the custom handler for processing CLI command arguments into argument values.
       *
       * @param {Function} [fn]
       * @return {Argument}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Only allow argument value to be one of choices.
       *
       * @param {string[]} values
       * @return {Argument}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError(`Allowed choices are ${this.argChoices.join(", ")}.`);
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Make argument required.
       */
      argRequired() {
        this.required = true;
        return this;
      }
      /**
       * Make argument optional.
       */
      argOptional() {
        this.required = false;
        return this;
      }
    };
    function humanReadableArgName(arg) {
      const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
      return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
    }
    exports2.Argument = Argument;
    exports2.humanReadableArgName = humanReadableArgName;
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/commander/lib/help.js
var require_help = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/commander/lib/help.js"(exports2) {
    var { humanReadableArgName } = require_argument();
    var Help = class {
      constructor() {
        this.helpWidth = void 0;
        this.sortSubcommands = false;
        this.sortOptions = false;
        this.showGlobalOptions = false;
      }
      /**
       * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
       *
       * @param {Command} cmd
       * @returns {Command[]}
       */
      visibleCommands(cmd) {
        const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
        if (cmd._hasImplicitHelpCommand()) {
          const [, helpName, helpArgs] = cmd._helpCommandnameAndArgs.match(/([^ ]+) *(.*)/);
          const helpCommand = cmd.createCommand(helpName).helpOption(false);
          helpCommand.description(cmd._helpCommandDescription);
          if (helpArgs)
            helpCommand.arguments(helpArgs);
          visibleCommands.push(helpCommand);
        }
        if (this.sortSubcommands) {
          visibleCommands.sort((a, b) => {
            return a.name().localeCompare(b.name());
          });
        }
        return visibleCommands;
      }
      /**
       * Compare options for sort.
       *
       * @param {Option} a
       * @param {Option} b
       * @returns number
       */
      compareOptions(a, b) {
        const getSortKey = (option) => {
          return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
        };
        return getSortKey(a).localeCompare(getSortKey(b));
      }
      /**
       * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleOptions(cmd) {
        const visibleOptions = cmd.options.filter((option) => !option.hidden);
        const showShortHelpFlag = cmd._hasHelpOption && cmd._helpShortFlag && !cmd._findOption(cmd._helpShortFlag);
        const showLongHelpFlag = cmd._hasHelpOption && !cmd._findOption(cmd._helpLongFlag);
        if (showShortHelpFlag || showLongHelpFlag) {
          let helpOption;
          if (!showShortHelpFlag) {
            helpOption = cmd.createOption(cmd._helpLongFlag, cmd._helpDescription);
          } else if (!showLongHelpFlag) {
            helpOption = cmd.createOption(cmd._helpShortFlag, cmd._helpDescription);
          } else {
            helpOption = cmd.createOption(cmd._helpFlags, cmd._helpDescription);
          }
          visibleOptions.push(helpOption);
        }
        if (this.sortOptions) {
          visibleOptions.sort(this.compareOptions);
        }
        return visibleOptions;
      }
      /**
       * Get an array of the visible global options. (Not including help.)
       *
       * @param {Command} cmd
       * @returns {Option[]}
       */
      visibleGlobalOptions(cmd) {
        if (!this.showGlobalOptions)
          return [];
        const globalOptions = [];
        for (let parentCmd = cmd.parent; parentCmd; parentCmd = parentCmd.parent) {
          const visibleOptions = parentCmd.options.filter((option) => !option.hidden);
          globalOptions.push(...visibleOptions);
        }
        if (this.sortOptions) {
          globalOptions.sort(this.compareOptions);
        }
        return globalOptions;
      }
      /**
       * Get an array of the arguments if any have a description.
       *
       * @param {Command} cmd
       * @returns {Argument[]}
       */
      visibleArguments(cmd) {
        if (cmd._argsDescription) {
          cmd._args.forEach((argument) => {
            argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
          });
        }
        if (cmd._args.find((argument) => argument.description)) {
          return cmd._args;
        }
        return [];
      }
      /**
       * Get the command term to show in the list of subcommands.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandTerm(cmd) {
        const args2 = cmd._args.map((arg) => humanReadableArgName(arg)).join(" ");
        return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + // simplistic check for non-help option
        (args2 ? " " + args2 : "");
      }
      /**
       * Get the option term to show in the list of options.
       *
       * @param {Option} option
       * @returns {string}
       */
      optionTerm(option) {
        return option.flags;
      }
      /**
       * Get the argument term to show in the list of arguments.
       *
       * @param {Argument} argument
       * @returns {string}
       */
      argumentTerm(argument) {
        return argument.name();
      }
      /**
       * Get the longest command term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestSubcommandTermLength(cmd, helper) {
        return helper.visibleCommands(cmd).reduce((max, command) => {
          return Math.max(max, helper.subcommandTerm(command).length);
        }, 0);
      }
      /**
       * Get the longest option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestOptionTermLength(cmd, helper) {
        return helper.visibleOptions(cmd).reduce((max, option) => {
          return Math.max(max, helper.optionTerm(option).length);
        }, 0);
      }
      /**
       * Get the longest global option term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestGlobalOptionTermLength(cmd, helper) {
        return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
          return Math.max(max, helper.optionTerm(option).length);
        }, 0);
      }
      /**
       * Get the longest argument term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      longestArgumentTermLength(cmd, helper) {
        return helper.visibleArguments(cmd).reduce((max, argument) => {
          return Math.max(max, helper.argumentTerm(argument).length);
        }, 0);
      }
      /**
       * Get the command usage to be displayed at the top of the built-in help.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandUsage(cmd) {
        let cmdName = cmd._name;
        if (cmd._aliases[0]) {
          cmdName = cmdName + "|" + cmd._aliases[0];
        }
        let parentCmdNames = "";
        for (let parentCmd = cmd.parent; parentCmd; parentCmd = parentCmd.parent) {
          parentCmdNames = parentCmd.name() + " " + parentCmdNames;
        }
        return parentCmdNames + cmdName + " " + cmd.usage();
      }
      /**
       * Get the description for the command.
       *
       * @param {Command} cmd
       * @returns {string}
       */
      commandDescription(cmd) {
        return cmd.description();
      }
      /**
       * Get the subcommand summary to show in the list of subcommands.
       * (Fallback to description for backwards compatibility.)
       *
       * @param {Command} cmd
       * @returns {string}
       */
      subcommandDescription(cmd) {
        return cmd.summary() || cmd.description();
      }
      /**
       * Get the option description to show in the list of options.
       *
       * @param {Option} option
       * @return {string}
       */
      optionDescription(option) {
        const extraInfo = [];
        if (option.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (option.defaultValue !== void 0) {
          const showDefault = option.required || option.optional || option.isBoolean() && typeof option.defaultValue === "boolean";
          if (showDefault) {
            extraInfo.push(`default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`);
          }
        }
        if (option.presetArg !== void 0 && option.optional) {
          extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
        }
        if (option.envVar !== void 0) {
          extraInfo.push(`env: ${option.envVar}`);
        }
        if (extraInfo.length > 0) {
          return `${option.description} (${extraInfo.join(", ")})`;
        }
        return option.description;
      }
      /**
       * Get the argument description to show in the list of arguments.
       *
       * @param {Argument} argument
       * @return {string}
       */
      argumentDescription(argument) {
        const extraInfo = [];
        if (argument.argChoices) {
          extraInfo.push(
            // use stringify to match the display of the default value
            `choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`
          );
        }
        if (argument.defaultValue !== void 0) {
          extraInfo.push(`default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`);
        }
        if (extraInfo.length > 0) {
          const extraDescripton = `(${extraInfo.join(", ")})`;
          if (argument.description) {
            return `${argument.description} ${extraDescripton}`;
          }
          return extraDescripton;
        }
        return argument.description;
      }
      /**
       * Generate the built-in help text.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {string}
       */
      formatHelp(cmd, helper) {
        const termWidth = helper.padWidth(cmd, helper);
        const helpWidth = helper.helpWidth || 80;
        const itemIndentWidth = 2;
        const itemSeparatorWidth = 2;
        function formatItem(term, description) {
          if (description) {
            const fullText = `${term.padEnd(termWidth + itemSeparatorWidth)}${description}`;
            return helper.wrap(fullText, helpWidth - itemIndentWidth, termWidth + itemSeparatorWidth);
          }
          return term;
        }
        function formatList(textArray) {
          return textArray.join("\n").replace(/^/gm, " ".repeat(itemIndentWidth));
        }
        let output = [`Usage: ${helper.commandUsage(cmd)}`, ""];
        const commandDescription = helper.commandDescription(cmd);
        if (commandDescription.length > 0) {
          output = output.concat([helper.wrap(commandDescription, helpWidth, 0), ""]);
        }
        const argumentList = helper.visibleArguments(cmd).map((argument) => {
          return formatItem(helper.argumentTerm(argument), helper.argumentDescription(argument));
        });
        if (argumentList.length > 0) {
          output = output.concat(["Arguments:", formatList(argumentList), ""]);
        }
        const optionList = helper.visibleOptions(cmd).map((option) => {
          return formatItem(helper.optionTerm(option), helper.optionDescription(option));
        });
        if (optionList.length > 0) {
          output = output.concat(["Options:", formatList(optionList), ""]);
        }
        if (this.showGlobalOptions) {
          const globalOptionList = helper.visibleGlobalOptions(cmd).map((option) => {
            return formatItem(helper.optionTerm(option), helper.optionDescription(option));
          });
          if (globalOptionList.length > 0) {
            output = output.concat(["Global Options:", formatList(globalOptionList), ""]);
          }
        }
        const commandList = helper.visibleCommands(cmd).map((cmd2) => {
          return formatItem(helper.subcommandTerm(cmd2), helper.subcommandDescription(cmd2));
        });
        if (commandList.length > 0) {
          output = output.concat(["Commands:", formatList(commandList), ""]);
        }
        return output.join("\n");
      }
      /**
       * Calculate the pad width from the maximum term length.
       *
       * @param {Command} cmd
       * @param {Help} helper
       * @returns {number}
       */
      padWidth(cmd, helper) {
        return Math.max(
          helper.longestOptionTermLength(cmd, helper),
          helper.longestGlobalOptionTermLength(cmd, helper),
          helper.longestSubcommandTermLength(cmd, helper),
          helper.longestArgumentTermLength(cmd, helper)
        );
      }
      /**
       * Wrap the given string to width characters per line, with lines after the first indented.
       * Do not wrap if insufficient room for wrapping (minColumnWidth), or string is manually formatted.
       *
       * @param {string} str
       * @param {number} width
       * @param {number} indent
       * @param {number} [minColumnWidth=40]
       * @return {string}
       *
       */
      wrap(str, width, indent, minColumnWidth = 40) {
        const indents = " \\f\\t\\v\xA0\u1680\u2000-\u200A\u202F\u205F\u3000\uFEFF";
        const manualIndent = new RegExp(`[\\n][${indents}]+`);
        if (str.match(manualIndent))
          return str;
        const columnWidth = width - indent;
        if (columnWidth < minColumnWidth)
          return str;
        const leadingStr = str.slice(0, indent);
        const columnText = str.slice(indent).replace("\r\n", "\n");
        const indentString = " ".repeat(indent);
        const zeroWidthSpace = "\u200B";
        const breaks = `\\s${zeroWidthSpace}`;
        const regex = new RegExp(`
|.{1,${columnWidth - 1}}([${breaks}]|$)|[^${breaks}]+?([${breaks}]|$)`, "g");
        const lines = columnText.match(regex) || [];
        return leadingStr + lines.map((line, i) => {
          if (line === "\n")
            return "";
          return (i > 0 ? indentString : "") + line.trimEnd();
        }).join("\n");
      }
    };
    exports2.Help = Help;
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/commander/lib/option.js
var require_option = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/commander/lib/option.js"(exports2) {
    var { InvalidArgumentError } = require_error();
    var Option = class {
      /**
       * Initialize a new `Option` with the given `flags` and `description`.
       *
       * @param {string} flags
       * @param {string} [description]
       */
      constructor(flags, description) {
        this.flags = flags;
        this.description = description || "";
        this.required = flags.includes("<");
        this.optional = flags.includes("[");
        this.variadic = /\w\.\.\.[>\]]$/.test(flags);
        this.mandatory = false;
        const optionFlags = splitOptionFlags(flags);
        this.short = optionFlags.shortFlag;
        this.long = optionFlags.longFlag;
        this.negate = false;
        if (this.long) {
          this.negate = this.long.startsWith("--no-");
        }
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.presetArg = void 0;
        this.envVar = void 0;
        this.parseArg = void 0;
        this.hidden = false;
        this.argChoices = void 0;
        this.conflictsWith = [];
        this.implied = void 0;
      }
      /**
       * Set the default value, and optionally supply the description to be displayed in the help.
       *
       * @param {any} value
       * @param {string} [description]
       * @return {Option}
       */
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      /**
       * Preset to use when option used without option-argument, especially optional but also boolean and negated.
       * The custom processing (parseArg) is called.
       *
       * @example
       * new Option('--color').default('GREYSCALE').preset('RGB');
       * new Option('--donate [amount]').preset('20').argParser(parseFloat);
       *
       * @param {any} arg
       * @return {Option}
       */
      preset(arg) {
        this.presetArg = arg;
        return this;
      }
      /**
       * Add option name(s) that conflict with this option.
       * An error will be displayed if conflicting options are found during parsing.
       *
       * @example
       * new Option('--rgb').conflicts('cmyk');
       * new Option('--js').conflicts(['ts', 'jsx']);
       *
       * @param {string | string[]} names
       * @return {Option}
       */
      conflicts(names) {
        this.conflictsWith = this.conflictsWith.concat(names);
        return this;
      }
      /**
       * Specify implied option values for when this option is set and the implied options are not.
       *
       * The custom processing (parseArg) is not called on the implied values.
       *
       * @example
       * program
       *   .addOption(new Option('--log', 'write logging information to file'))
       *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
       *
       * @param {Object} impliedOptionValues
       * @return {Option}
       */
      implies(impliedOptionValues) {
        let newImplied = impliedOptionValues;
        if (typeof impliedOptionValues === "string") {
          newImplied = { [impliedOptionValues]: true };
        }
        this.implied = Object.assign(this.implied || {}, newImplied);
        return this;
      }
      /**
       * Set environment variable to check for option value.
       *
       * An environment variable is only used if when processed the current option value is
       * undefined, or the source of the current value is 'default' or 'config' or 'env'.
       *
       * @param {string} name
       * @return {Option}
       */
      env(name) {
        this.envVar = name;
        return this;
      }
      /**
       * Set the custom handler for processing CLI option arguments into option values.
       *
       * @param {Function} [fn]
       * @return {Option}
       */
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      /**
       * Whether the option is mandatory and must have a value after parsing.
       *
       * @param {boolean} [mandatory=true]
       * @return {Option}
       */
      makeOptionMandatory(mandatory = true) {
        this.mandatory = !!mandatory;
        return this;
      }
      /**
       * Hide option in help.
       *
       * @param {boolean} [hide=true]
       * @return {Option}
       */
      hideHelp(hide = true) {
        this.hidden = !!hide;
        return this;
      }
      /**
       * @api private
       */
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      /**
       * Only allow option value to be one of choices.
       *
       * @param {string[]} values
       * @return {Option}
       */
      choices(values) {
        this.argChoices = values.slice();
        this.parseArg = (arg, previous) => {
          if (!this.argChoices.includes(arg)) {
            throw new InvalidArgumentError(`Allowed choices are ${this.argChoices.join(", ")}.`);
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      /**
       * Return option name.
       *
       * @return {string}
       */
      name() {
        if (this.long) {
          return this.long.replace(/^--/, "");
        }
        return this.short.replace(/^-/, "");
      }
      /**
       * Return option name, in a camelcase format that can be used
       * as a object attribute key.
       *
       * @return {string}
       * @api private
       */
      attributeName() {
        return camelcase(this.name().replace(/^no-/, ""));
      }
      /**
       * Check if `arg` matches the short or long flag.
       *
       * @param {string} arg
       * @return {boolean}
       * @api private
       */
      is(arg) {
        return this.short === arg || this.long === arg;
      }
      /**
       * Return whether a boolean option.
       *
       * Options are one of boolean, negated, required argument, or optional argument.
       *
       * @return {boolean}
       * @api private
       */
      isBoolean() {
        return !this.required && !this.optional && !this.negate;
      }
    };
    var DualOptions = class {
      /**
       * @param {Option[]} options
       */
      constructor(options) {
        this.positiveOptions = /* @__PURE__ */ new Map();
        this.negativeOptions = /* @__PURE__ */ new Map();
        this.dualOptions = /* @__PURE__ */ new Set();
        options.forEach((option) => {
          if (option.negate) {
            this.negativeOptions.set(option.attributeName(), option);
          } else {
            this.positiveOptions.set(option.attributeName(), option);
          }
        });
        this.negativeOptions.forEach((value, key) => {
          if (this.positiveOptions.has(key)) {
            this.dualOptions.add(key);
          }
        });
      }
      /**
       * Did the value come from the option, and not from possible matching dual option?
       *
       * @param {any} value
       * @param {Option} option
       * @returns {boolean}
       */
      valueFromOption(value, option) {
        const optionKey = option.attributeName();
        if (!this.dualOptions.has(optionKey))
          return true;
        const preset = this.negativeOptions.get(optionKey).presetArg;
        const negativeValue = preset !== void 0 ? preset : false;
        return option.negate === (negativeValue === value);
      }
    };
    function camelcase(str) {
      return str.split("-").reduce((str2, word) => {
        return str2 + word[0].toUpperCase() + word.slice(1);
      });
    }
    function splitOptionFlags(flags) {
      let shortFlag;
      let longFlag;
      const flagParts = flags.split(/[ |,]+/);
      if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1]))
        shortFlag = flagParts.shift();
      longFlag = flagParts.shift();
      if (!shortFlag && /^-[^-]$/.test(longFlag)) {
        shortFlag = longFlag;
        longFlag = void 0;
      }
      return { shortFlag, longFlag };
    }
    exports2.Option = Option;
    exports2.splitOptionFlags = splitOptionFlags;
    exports2.DualOptions = DualOptions;
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/commander/lib/suggestSimilar.js
var require_suggestSimilar = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/commander/lib/suggestSimilar.js"(exports2) {
    var maxDistance = 3;
    function editDistance(a, b) {
      if (Math.abs(a.length - b.length) > maxDistance)
        return Math.max(a.length, b.length);
      const d = [];
      for (let i = 0; i <= a.length; i++) {
        d[i] = [i];
      }
      for (let j = 0; j <= b.length; j++) {
        d[0][j] = j;
      }
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          let cost = 1;
          if (a[i - 1] === b[j - 1]) {
            cost = 0;
          } else {
            cost = 1;
          }
          d[i][j] = Math.min(
            d[i - 1][j] + 1,
            // deletion
            d[i][j - 1] + 1,
            // insertion
            d[i - 1][j - 1] + cost
            // substitution
          );
          if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
            d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
          }
        }
      }
      return d[a.length][b.length];
    }
    function suggestSimilar(word, candidates) {
      if (!candidates || candidates.length === 0)
        return "";
      candidates = Array.from(new Set(candidates));
      const searchingOptions = word.startsWith("--");
      if (searchingOptions) {
        word = word.slice(2);
        candidates = candidates.map((candidate) => candidate.slice(2));
      }
      let similar = [];
      let bestDistance = maxDistance;
      const minSimilarity = 0.4;
      candidates.forEach((candidate) => {
        if (candidate.length <= 1)
          return;
        const distance = editDistance(word, candidate);
        const length = Math.max(word.length, candidate.length);
        const similarity = (length - distance) / length;
        if (similarity > minSimilarity) {
          if (distance < bestDistance) {
            bestDistance = distance;
            similar = [candidate];
          } else if (distance === bestDistance) {
            similar.push(candidate);
          }
        }
      });
      similar.sort((a, b) => a.localeCompare(b));
      if (searchingOptions) {
        similar = similar.map((candidate) => `--${candidate}`);
      }
      if (similar.length > 1) {
        return `
(Did you mean one of ${similar.join(", ")}?)`;
      }
      if (similar.length === 1) {
        return `
(Did you mean ${similar[0]}?)`;
      }
      return "";
    }
    exports2.suggestSimilar = suggestSimilar;
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/commander/lib/command.js
var require_command = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/commander/lib/command.js"(exports2) {
    var EventEmitter = require("events").EventEmitter;
    var childProcess = require("child_process");
    var path = require("path");
    var fs = require("fs");
    var process2 = require("process");
    var { Argument, humanReadableArgName } = require_argument();
    var { CommanderError } = require_error();
    var { Help } = require_help();
    var { Option, splitOptionFlags, DualOptions } = require_option();
    var { suggestSimilar } = require_suggestSimilar();
    var Command = class _Command extends EventEmitter {
      /**
       * Initialize a new `Command`.
       *
       * @param {string} [name]
       */
      constructor(name) {
        super();
        this.commands = [];
        this.options = [];
        this.parent = null;
        this._allowUnknownOption = false;
        this._allowExcessArguments = true;
        this._args = [];
        this.args = [];
        this.rawArgs = [];
        this.processedArgs = [];
        this._scriptPath = null;
        this._name = name || "";
        this._optionValues = {};
        this._optionValueSources = {};
        this._storeOptionsAsProperties = false;
        this._actionHandler = null;
        this._executableHandler = false;
        this._executableFile = null;
        this._executableDir = null;
        this._defaultCommandName = null;
        this._exitCallback = null;
        this._aliases = [];
        this._combineFlagAndOptionalValue = true;
        this._description = "";
        this._summary = "";
        this._argsDescription = void 0;
        this._enablePositionalOptions = false;
        this._passThroughOptions = false;
        this._lifeCycleHooks = {};
        this._showHelpAfterError = false;
        this._showSuggestionAfterError = true;
        this._outputConfiguration = {
          writeOut: (str) => process2.stdout.write(str),
          writeErr: (str) => process2.stderr.write(str),
          getOutHelpWidth: () => process2.stdout.isTTY ? process2.stdout.columns : void 0,
          getErrHelpWidth: () => process2.stderr.isTTY ? process2.stderr.columns : void 0,
          outputError: (str, write) => write(str)
        };
        this._hidden = false;
        this._hasHelpOption = true;
        this._helpFlags = "-h, --help";
        this._helpDescription = "display help for command";
        this._helpShortFlag = "-h";
        this._helpLongFlag = "--help";
        this._addImplicitHelpCommand = void 0;
        this._helpCommandName = "help";
        this._helpCommandnameAndArgs = "help [command]";
        this._helpCommandDescription = "display help for command";
        this._helpConfiguration = {};
      }
      /**
       * Copy settings that are useful to have in common across root command and subcommands.
       *
       * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
       *
       * @param {Command} sourceCommand
       * @return {Command} `this` command for chaining
       */
      copyInheritedSettings(sourceCommand) {
        this._outputConfiguration = sourceCommand._outputConfiguration;
        this._hasHelpOption = sourceCommand._hasHelpOption;
        this._helpFlags = sourceCommand._helpFlags;
        this._helpDescription = sourceCommand._helpDescription;
        this._helpShortFlag = sourceCommand._helpShortFlag;
        this._helpLongFlag = sourceCommand._helpLongFlag;
        this._helpCommandName = sourceCommand._helpCommandName;
        this._helpCommandnameAndArgs = sourceCommand._helpCommandnameAndArgs;
        this._helpCommandDescription = sourceCommand._helpCommandDescription;
        this._helpConfiguration = sourceCommand._helpConfiguration;
        this._exitCallback = sourceCommand._exitCallback;
        this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
        this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
        this._allowExcessArguments = sourceCommand._allowExcessArguments;
        this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
        this._showHelpAfterError = sourceCommand._showHelpAfterError;
        this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
        return this;
      }
      /**
       * Define a command.
       *
       * There are two styles of command: pay attention to where to put the description.
       *
       * @example
       * // Command implemented using action handler (description is supplied separately to `.command`)
       * program
       *   .command('clone <source> [destination]')
       *   .description('clone a repository into a newly created directory')
       *   .action((source, destination) => {
       *     console.log('clone command called');
       *   });
       *
       * // Command implemented using separate executable file (description is second parameter to `.command`)
       * program
       *   .command('start <service>', 'start named service')
       *   .command('stop [service]', 'stop named service, or all if no name supplied');
       *
       * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
       * @param {Object|string} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
       * @param {Object} [execOpts] - configuration options (for executable)
       * @return {Command} returns new command for action handler, or `this` for executable command
       */
      command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
        let desc = actionOptsOrExecDesc;
        let opts = execOpts;
        if (typeof desc === "object" && desc !== null) {
          opts = desc;
          desc = null;
        }
        opts = opts || {};
        const [, name, args2] = nameAndArgs.match(/([^ ]+) *(.*)/);
        const cmd = this.createCommand(name);
        if (desc) {
          cmd.description(desc);
          cmd._executableHandler = true;
        }
        if (opts.isDefault)
          this._defaultCommandName = cmd._name;
        cmd._hidden = !!(opts.noHelp || opts.hidden);
        cmd._executableFile = opts.executableFile || null;
        if (args2)
          cmd.arguments(args2);
        this.commands.push(cmd);
        cmd.parent = this;
        cmd.copyInheritedSettings(this);
        if (desc)
          return this;
        return cmd;
      }
      /**
       * Factory routine to create a new unattached command.
       *
       * See .command() for creating an attached subcommand, which uses this routine to
       * create the command. You can override createCommand to customise subcommands.
       *
       * @param {string} [name]
       * @return {Command} new command
       */
      createCommand(name) {
        return new _Command(name);
      }
      /**
       * You can customise the help with a subclass of Help by overriding createHelp,
       * or by overriding Help properties using configureHelp().
       *
       * @return {Help}
       */
      createHelp() {
        return Object.assign(new Help(), this.configureHelp());
      }
      /**
       * You can customise the help by overriding Help properties using configureHelp(),
       * or with a subclass of Help by overriding createHelp().
       *
       * @param {Object} [configuration] - configuration options
       * @return {Command|Object} `this` command for chaining, or stored configuration
       */
      configureHelp(configuration) {
        if (configuration === void 0)
          return this._helpConfiguration;
        this._helpConfiguration = configuration;
        return this;
      }
      /**
       * The default output goes to stdout and stderr. You can customise this for special
       * applications. You can also customise the display of errors by overriding outputError.
       *
       * The configuration properties are all functions:
       *
       *     // functions to change where being written, stdout and stderr
       *     writeOut(str)
       *     writeErr(str)
       *     // matching functions to specify width for wrapping help
       *     getOutHelpWidth()
       *     getErrHelpWidth()
       *     // functions based on what is being written out
       *     outputError(str, write) // used for displaying errors, and not used for displaying help
       *
       * @param {Object} [configuration] - configuration options
       * @return {Command|Object} `this` command for chaining, or stored configuration
       */
      configureOutput(configuration) {
        if (configuration === void 0)
          return this._outputConfiguration;
        Object.assign(this._outputConfiguration, configuration);
        return this;
      }
      /**
       * Display the help or a custom message after an error occurs.
       *
       * @param {boolean|string} [displayHelp]
       * @return {Command} `this` command for chaining
       */
      showHelpAfterError(displayHelp = true) {
        if (typeof displayHelp !== "string")
          displayHelp = !!displayHelp;
        this._showHelpAfterError = displayHelp;
        return this;
      }
      /**
       * Display suggestion of similar commands for unknown commands, or options for unknown options.
       *
       * @param {boolean} [displaySuggestion]
       * @return {Command} `this` command for chaining
       */
      showSuggestionAfterError(displaySuggestion = true) {
        this._showSuggestionAfterError = !!displaySuggestion;
        return this;
      }
      /**
       * Add a prepared subcommand.
       *
       * See .command() for creating an attached subcommand which inherits settings from its parent.
       *
       * @param {Command} cmd - new subcommand
       * @param {Object} [opts] - configuration options
       * @return {Command} `this` command for chaining
       */
      addCommand(cmd, opts) {
        if (!cmd._name) {
          throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
        }
        opts = opts || {};
        if (opts.isDefault)
          this._defaultCommandName = cmd._name;
        if (opts.noHelp || opts.hidden)
          cmd._hidden = true;
        this.commands.push(cmd);
        cmd.parent = this;
        return this;
      }
      /**
       * Factory routine to create a new unattached argument.
       *
       * See .argument() for creating an attached argument, which uses this routine to
       * create the argument. You can override createArgument to return a custom argument.
       *
       * @param {string} name
       * @param {string} [description]
       * @return {Argument} new argument
       */
      createArgument(name, description) {
        return new Argument(name, description);
      }
      /**
       * Define argument syntax for command.
       *
       * The default is that the argument is required, and you can explicitly
       * indicate this with <> around the name. Put [] around the name for an optional argument.
       *
       * @example
       * program.argument('<input-file>');
       * program.argument('[output-file]');
       *
       * @param {string} name
       * @param {string} [description]
       * @param {Function|*} [fn] - custom argument processing function
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      argument(name, description, fn, defaultValue) {
        const argument = this.createArgument(name, description);
        if (typeof fn === "function") {
          argument.default(defaultValue).argParser(fn);
        } else {
          argument.default(fn);
        }
        this.addArgument(argument);
        return this;
      }
      /**
       * Define argument syntax for command, adding multiple at once (without descriptions).
       *
       * See also .argument().
       *
       * @example
       * program.arguments('<cmd> [env]');
       *
       * @param {string} names
       * @return {Command} `this` command for chaining
       */
      arguments(names) {
        names.trim().split(/ +/).forEach((detail) => {
          this.argument(detail);
        });
        return this;
      }
      /**
       * Define argument syntax for command, adding a prepared argument.
       *
       * @param {Argument} argument
       * @return {Command} `this` command for chaining
       */
      addArgument(argument) {
        const previousArgument = this._args.slice(-1)[0];
        if (previousArgument && previousArgument.variadic) {
          throw new Error(`only the last argument can be variadic '${previousArgument.name()}'`);
        }
        if (argument.required && argument.defaultValue !== void 0 && argument.parseArg === void 0) {
          throw new Error(`a default value for a required argument is never used: '${argument.name()}'`);
        }
        this._args.push(argument);
        return this;
      }
      /**
       * Override default decision whether to add implicit help command.
       *
       *    addHelpCommand() // force on
       *    addHelpCommand(false); // force off
       *    addHelpCommand('help [cmd]', 'display help for [cmd]'); // force on with custom details
       *
       * @return {Command} `this` command for chaining
       */
      addHelpCommand(enableOrNameAndArgs, description) {
        if (enableOrNameAndArgs === false) {
          this._addImplicitHelpCommand = false;
        } else {
          this._addImplicitHelpCommand = true;
          if (typeof enableOrNameAndArgs === "string") {
            this._helpCommandName = enableOrNameAndArgs.split(" ")[0];
            this._helpCommandnameAndArgs = enableOrNameAndArgs;
          }
          this._helpCommandDescription = description || this._helpCommandDescription;
        }
        return this;
      }
      /**
       * @return {boolean}
       * @api private
       */
      _hasImplicitHelpCommand() {
        if (this._addImplicitHelpCommand === void 0) {
          return this.commands.length && !this._actionHandler && !this._findCommand("help");
        }
        return this._addImplicitHelpCommand;
      }
      /**
       * Add hook for life cycle event.
       *
       * @param {string} event
       * @param {Function} listener
       * @return {Command} `this` command for chaining
       */
      hook(event, listener) {
        const allowedValues = ["preSubcommand", "preAction", "postAction"];
        if (!allowedValues.includes(event)) {
          throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        if (this._lifeCycleHooks[event]) {
          this._lifeCycleHooks[event].push(listener);
        } else {
          this._lifeCycleHooks[event] = [listener];
        }
        return this;
      }
      /**
       * Register callback to use as replacement for calling process.exit.
       *
       * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
       * @return {Command} `this` command for chaining
       */
      exitOverride(fn) {
        if (fn) {
          this._exitCallback = fn;
        } else {
          this._exitCallback = (err) => {
            if (err.code !== "commander.executeSubCommandAsync") {
              throw err;
            } else {
            }
          };
        }
        return this;
      }
      /**
       * Call process.exit, and _exitCallback if defined.
       *
       * @param {number} exitCode exit code for using with process.exit
       * @param {string} code an id string representing the error
       * @param {string} message human-readable description of the error
       * @return never
       * @api private
       */
      _exit(exitCode, code, message) {
        if (this._exitCallback) {
          this._exitCallback(new CommanderError(exitCode, code, message));
        }
        process2.exit(exitCode);
      }
      /**
       * Register callback `fn` for the command.
       *
       * @example
       * program
       *   .command('serve')
       *   .description('start service')
       *   .action(function() {
       *      // do work here
       *   });
       *
       * @param {Function} fn
       * @return {Command} `this` command for chaining
       */
      action(fn) {
        const listener = (args2) => {
          const expectedArgsCount = this._args.length;
          const actionArgs = args2.slice(0, expectedArgsCount);
          if (this._storeOptionsAsProperties) {
            actionArgs[expectedArgsCount] = this;
          } else {
            actionArgs[expectedArgsCount] = this.opts();
          }
          actionArgs.push(this);
          return fn.apply(this, actionArgs);
        };
        this._actionHandler = listener;
        return this;
      }
      /**
       * Factory routine to create a new unattached option.
       *
       * See .option() for creating an attached option, which uses this routine to
       * create the option. You can override createOption to return a custom option.
       *
       * @param {string} flags
       * @param {string} [description]
       * @return {Option} new option
       */
      createOption(flags, description) {
        return new Option(flags, description);
      }
      /**
       * Add an option.
       *
       * @param {Option} option
       * @return {Command} `this` command for chaining
       */
      addOption(option) {
        const oname = option.name();
        const name = option.attributeName();
        if (option.negate) {
          const positiveLongFlag = option.long.replace(/^--no-/, "--");
          if (!this._findOption(positiveLongFlag)) {
            this.setOptionValueWithSource(name, option.defaultValue === void 0 ? true : option.defaultValue, "default");
          }
        } else if (option.defaultValue !== void 0) {
          this.setOptionValueWithSource(name, option.defaultValue, "default");
        }
        this.options.push(option);
        const handleOptionValue = (val, invalidValueMessage, valueSource) => {
          if (val == null && option.presetArg !== void 0) {
            val = option.presetArg;
          }
          const oldValue = this.getOptionValue(name);
          if (val !== null && option.parseArg) {
            try {
              val = option.parseArg(val, oldValue);
            } catch (err) {
              if (err.code === "commander.invalidArgument") {
                const message = `${invalidValueMessage} ${err.message}`;
                this.error(message, { exitCode: err.exitCode, code: err.code });
              }
              throw err;
            }
          } else if (val !== null && option.variadic) {
            val = option._concatValue(val, oldValue);
          }
          if (val == null) {
            if (option.negate) {
              val = false;
            } else if (option.isBoolean() || option.optional) {
              val = true;
            } else {
              val = "";
            }
          }
          this.setOptionValueWithSource(name, val, valueSource);
        };
        this.on("option:" + oname, (val) => {
          const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
          handleOptionValue(val, invalidValueMessage, "cli");
        });
        if (option.envVar) {
          this.on("optionEnv:" + oname, (val) => {
            const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
            handleOptionValue(val, invalidValueMessage, "env");
          });
        }
        return this;
      }
      /**
       * Internal implementation shared by .option() and .requiredOption()
       *
       * @api private
       */
      _optionEx(config2, flags, description, fn, defaultValue) {
        if (typeof flags === "object" && flags instanceof Option) {
          throw new Error("To add an Option object use addOption() instead of option() or requiredOption()");
        }
        const option = this.createOption(flags, description);
        option.makeOptionMandatory(!!config2.mandatory);
        if (typeof fn === "function") {
          option.default(defaultValue).argParser(fn);
        } else if (fn instanceof RegExp) {
          const regex = fn;
          fn = (val, def) => {
            const m = regex.exec(val);
            return m ? m[0] : def;
          };
          option.default(defaultValue).argParser(fn);
        } else {
          option.default(fn);
        }
        return this.addOption(option);
      }
      /**
       * Define option with `flags`, `description` and optional
       * coercion `fn`.
       *
       * The `flags` string contains the short and/or long flags,
       * separated by comma, a pipe or space. The following are all valid
       * all will output this way when `--help` is used.
       *
       *     "-p, --pepper"
       *     "-p|--pepper"
       *     "-p --pepper"
       *
       * @example
       * // simple boolean defaulting to undefined
       * program.option('-p, --pepper', 'add pepper');
       *
       * program.pepper
       * // => undefined
       *
       * --pepper
       * program.pepper
       * // => true
       *
       * // simple boolean defaulting to true (unless non-negated option is also defined)
       * program.option('-C, --no-cheese', 'remove cheese');
       *
       * program.cheese
       * // => true
       *
       * --no-cheese
       * program.cheese
       * // => false
       *
       * // required argument
       * program.option('-C, --chdir <path>', 'change the working directory');
       *
       * --chdir /tmp
       * program.chdir
       * // => "/tmp"
       *
       * // optional argument
       * program.option('-c, --cheese [type]', 'add cheese [marble]');
       *
       * @param {string} flags
       * @param {string} [description]
       * @param {Function|*} [fn] - custom option processing function or default value
       * @param {*} [defaultValue]
       * @return {Command} `this` command for chaining
       */
      option(flags, description, fn, defaultValue) {
        return this._optionEx({}, flags, description, fn, defaultValue);
      }
      /**
      * Add a required option which must have a value after parsing. This usually means
      * the option must be specified on the command line. (Otherwise the same as .option().)
      *
      * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
      *
      * @param {string} flags
      * @param {string} [description]
      * @param {Function|*} [fn] - custom option processing function or default value
      * @param {*} [defaultValue]
      * @return {Command} `this` command for chaining
      */
      requiredOption(flags, description, fn, defaultValue) {
        return this._optionEx({ mandatory: true }, flags, description, fn, defaultValue);
      }
      /**
       * Alter parsing of short flags with optional values.
       *
       * @example
       * // for `.option('-f,--flag [value]'):
       * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
       * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
       *
       * @param {Boolean} [combine=true] - if `true` or omitted, an optional value can be specified directly after the flag.
       */
      combineFlagAndOptionalValue(combine = true) {
        this._combineFlagAndOptionalValue = !!combine;
        return this;
      }
      /**
       * Allow unknown options on the command line.
       *
       * @param {Boolean} [allowUnknown=true] - if `true` or omitted, no error will be thrown
       * for unknown options.
       */
      allowUnknownOption(allowUnknown = true) {
        this._allowUnknownOption = !!allowUnknown;
        return this;
      }
      /**
       * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
       *
       * @param {Boolean} [allowExcess=true] - if `true` or omitted, no error will be thrown
       * for excess arguments.
       */
      allowExcessArguments(allowExcess = true) {
        this._allowExcessArguments = !!allowExcess;
        return this;
      }
      /**
       * Enable positional options. Positional means global options are specified before subcommands which lets
       * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
       * The default behaviour is non-positional and global options may appear anywhere on the command line.
       *
       * @param {Boolean} [positional=true]
       */
      enablePositionalOptions(positional = true) {
        this._enablePositionalOptions = !!positional;
        return this;
      }
      /**
       * Pass through options that come after command-arguments rather than treat them as command-options,
       * so actual command-options come before command-arguments. Turning this on for a subcommand requires
       * positional options to have been enabled on the program (parent commands).
       * The default behaviour is non-positional and options may appear before or after command-arguments.
       *
       * @param {Boolean} [passThrough=true]
       * for unknown options.
       */
      passThroughOptions(passThrough = true) {
        this._passThroughOptions = !!passThrough;
        if (!!this.parent && passThrough && !this.parent._enablePositionalOptions) {
          throw new Error("passThroughOptions can not be used without turning on enablePositionalOptions for parent command(s)");
        }
        return this;
      }
      /**
        * Whether to store option values as properties on command object,
        * or store separately (specify false). In both cases the option values can be accessed using .opts().
        *
        * @param {boolean} [storeAsProperties=true]
        * @return {Command} `this` command for chaining
        */
      storeOptionsAsProperties(storeAsProperties = true) {
        this._storeOptionsAsProperties = !!storeAsProperties;
        if (this.options.length) {
          throw new Error("call .storeOptionsAsProperties() before adding options");
        }
        return this;
      }
      /**
       * Retrieve option value.
       *
       * @param {string} key
       * @return {Object} value
       */
      getOptionValue(key) {
        if (this._storeOptionsAsProperties) {
          return this[key];
        }
        return this._optionValues[key];
      }
      /**
       * Store option value.
       *
       * @param {string} key
       * @param {Object} value
       * @return {Command} `this` command for chaining
       */
      setOptionValue(key, value) {
        return this.setOptionValueWithSource(key, value, void 0);
      }
      /**
        * Store option value and where the value came from.
        *
        * @param {string} key
        * @param {Object} value
        * @param {string} source - expected values are default/config/env/cli/implied
        * @return {Command} `this` command for chaining
        */
      setOptionValueWithSource(key, value, source) {
        if (this._storeOptionsAsProperties) {
          this[key] = value;
        } else {
          this._optionValues[key] = value;
        }
        this._optionValueSources[key] = source;
        return this;
      }
      /**
        * Get source of option value.
        * Expected values are default | config | env | cli | implied
        *
        * @param {string} key
        * @return {string}
        */
      getOptionValueSource(key) {
        return this._optionValueSources[key];
      }
      /**
        * Get source of option value. See also .optsWithGlobals().
        * Expected values are default | config | env | cli | implied
        *
        * @param {string} key
        * @return {string}
        */
      getOptionValueSourceWithGlobals(key) {
        let source;
        getCommandAndParents(this).forEach((cmd) => {
          if (cmd.getOptionValueSource(key) !== void 0) {
            source = cmd.getOptionValueSource(key);
          }
        });
        return source;
      }
      /**
       * Get user arguments from implied or explicit arguments.
       * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
       *
       * @api private
       */
      _prepareUserArgs(argv, parseOptions) {
        if (argv !== void 0 && !Array.isArray(argv)) {
          throw new Error("first parameter to parse must be array or undefined");
        }
        parseOptions = parseOptions || {};
        if (argv === void 0) {
          argv = process2.argv;
          if (process2.versions && process2.versions.electron) {
            parseOptions.from = "electron";
          }
        }
        this.rawArgs = argv.slice();
        let userArgs;
        switch (parseOptions.from) {
          case void 0:
          case "node":
            this._scriptPath = argv[1];
            userArgs = argv.slice(2);
            break;
          case "electron":
            if (process2.defaultApp) {
              this._scriptPath = argv[1];
              userArgs = argv.slice(2);
            } else {
              userArgs = argv.slice(1);
            }
            break;
          case "user":
            userArgs = argv.slice(0);
            break;
          default:
            throw new Error(`unexpected parse option { from: '${parseOptions.from}' }`);
        }
        if (!this._name && this._scriptPath)
          this.nameFromFilename(this._scriptPath);
        this._name = this._name || "program";
        return userArgs;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * The default expectation is that the arguments are from node and have the application as argv[0]
       * and the script being run in argv[1], with user parameters after that.
       *
       * @example
       * program.parse(process.argv);
       * program.parse(); // implicitly use process.argv and auto-detect node vs electron conventions
       * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv] - optional, defaults to process.argv
       * @param {Object} [parseOptions] - optionally specify style of options with from: node/user/electron
       * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
       * @return {Command} `this` command for chaining
       */
      parse(argv, parseOptions) {
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Parse `argv`, setting options and invoking commands when defined.
       *
       * Use parseAsync instead of parse if any of your action handlers are async. Returns a Promise.
       *
       * The default expectation is that the arguments are from node and have the application as argv[0]
       * and the script being run in argv[1], with user parameters after that.
       *
       * @example
       * await program.parseAsync(process.argv);
       * await program.parseAsync(); // implicitly use process.argv and auto-detect node vs electron conventions
       * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
       *
       * @param {string[]} [argv]
       * @param {Object} [parseOptions]
       * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
       * @return {Promise}
       */
      async parseAsync(argv, parseOptions) {
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        await this._parseCommand([], userArgs);
        return this;
      }
      /**
       * Execute a sub-command executable.
       *
       * @api private
       */
      _executeSubCommand(subcommand, args2) {
        args2 = args2.slice();
        let launchWithNode = false;
        const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
        function findFile(baseDir, baseName) {
          const localBin = path.resolve(baseDir, baseName);
          if (fs.existsSync(localBin))
            return localBin;
          if (sourceExt.includes(path.extname(baseName)))
            return void 0;
          const foundExt = sourceExt.find((ext) => fs.existsSync(`${localBin}${ext}`));
          if (foundExt)
            return `${localBin}${foundExt}`;
          return void 0;
        }
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        let executableFile = subcommand._executableFile || `${this._name}-${subcommand._name}`;
        let executableDir = this._executableDir || "";
        if (this._scriptPath) {
          let resolvedScriptPath;
          try {
            resolvedScriptPath = fs.realpathSync(this._scriptPath);
          } catch (err) {
            resolvedScriptPath = this._scriptPath;
          }
          executableDir = path.resolve(path.dirname(resolvedScriptPath), executableDir);
        }
        if (executableDir) {
          let localFile = findFile(executableDir, executableFile);
          if (!localFile && !subcommand._executableFile && this._scriptPath) {
            const legacyName = path.basename(this._scriptPath, path.extname(this._scriptPath));
            if (legacyName !== this._name) {
              localFile = findFile(executableDir, `${legacyName}-${subcommand._name}`);
            }
          }
          executableFile = localFile || executableFile;
        }
        launchWithNode = sourceExt.includes(path.extname(executableFile));
        let proc;
        if (process2.platform !== "win32") {
          if (launchWithNode) {
            args2.unshift(executableFile);
            args2 = incrementNodeInspectorPort(process2.execArgv).concat(args2);
            proc = childProcess.spawn(process2.argv[0], args2, { stdio: "inherit" });
          } else {
            proc = childProcess.spawn(executableFile, args2, { stdio: "inherit" });
          }
        } else {
          args2.unshift(executableFile);
          args2 = incrementNodeInspectorPort(process2.execArgv).concat(args2);
          proc = childProcess.spawn(process2.execPath, args2, { stdio: "inherit" });
        }
        if (!proc.killed) {
          const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
          signals.forEach((signal) => {
            process2.on(signal, () => {
              if (proc.killed === false && proc.exitCode === null) {
                proc.kill(signal);
              }
            });
          });
        }
        const exitCallback = this._exitCallback;
        if (!exitCallback) {
          proc.on("close", process2.exit.bind(process2));
        } else {
          proc.on("close", () => {
            exitCallback(new CommanderError(process2.exitCode || 0, "commander.executeSubCommandAsync", "(close)"));
          });
        }
        proc.on("error", (err) => {
          if (err.code === "ENOENT") {
            const executableDirMessage = executableDir ? `searched for local subcommand relative to directory '${executableDir}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory";
            const executableMissing = `'${executableFile}' does not exist
 - if '${subcommand._name}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
            throw new Error(executableMissing);
          } else if (err.code === "EACCES") {
            throw new Error(`'${executableFile}' not executable`);
          }
          if (!exitCallback) {
            process2.exit(1);
          } else {
            const wrappedError = new CommanderError(1, "commander.executeSubCommandAsync", "(error)");
            wrappedError.nestedError = err;
            exitCallback(wrappedError);
          }
        });
        this.runningCommand = proc;
      }
      /**
       * @api private
       */
      _dispatchSubcommand(commandName, operands, unknown) {
        const subCommand = this._findCommand(commandName);
        if (!subCommand)
          this.help({ error: true });
        let hookResult;
        hookResult = this._chainOrCallSubCommandHook(hookResult, subCommand, "preSubcommand");
        hookResult = this._chainOrCall(hookResult, () => {
          if (subCommand._executableHandler) {
            this._executeSubCommand(subCommand, operands.concat(unknown));
          } else {
            return subCommand._parseCommand(operands, unknown);
          }
        });
        return hookResult;
      }
      /**
       * Invoke help directly if possible, or dispatch if necessary.
       * e.g. help foo
       *
       * @api private
       */
      _dispatchHelpCommand(subcommandName) {
        if (!subcommandName) {
          this.help();
        }
        const subCommand = this._findCommand(subcommandName);
        if (subCommand && !subCommand._executableHandler) {
          subCommand.help();
        }
        return this._dispatchSubcommand(subcommandName, [], [this._helpLongFlag]);
      }
      /**
       * Check this.args against expected this._args.
       *
       * @api private
       */
      _checkNumberOfArguments() {
        this._args.forEach((arg, i) => {
          if (arg.required && this.args[i] == null) {
            this.missingArgument(arg.name());
          }
        });
        if (this._args.length > 0 && this._args[this._args.length - 1].variadic) {
          return;
        }
        if (this.args.length > this._args.length) {
          this._excessArguments(this.args);
        }
      }
      /**
       * Process this.args using this._args and save as this.processedArgs!
       *
       * @api private
       */
      _processArguments() {
        const myParseArg = (argument, value, previous) => {
          let parsedValue = value;
          if (value !== null && argument.parseArg) {
            try {
              parsedValue = argument.parseArg(value, previous);
            } catch (err) {
              if (err.code === "commander.invalidArgument") {
                const message = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'. ${err.message}`;
                this.error(message, { exitCode: err.exitCode, code: err.code });
              }
              throw err;
            }
          }
          return parsedValue;
        };
        this._checkNumberOfArguments();
        const processedArgs = [];
        this._args.forEach((declaredArg, index) => {
          let value = declaredArg.defaultValue;
          if (declaredArg.variadic) {
            if (index < this.args.length) {
              value = this.args.slice(index);
              if (declaredArg.parseArg) {
                value = value.reduce((processed, v) => {
                  return myParseArg(declaredArg, v, processed);
                }, declaredArg.defaultValue);
              }
            } else if (value === void 0) {
              value = [];
            }
          } else if (index < this.args.length) {
            value = this.args[index];
            if (declaredArg.parseArg) {
              value = myParseArg(declaredArg, value, declaredArg.defaultValue);
            }
          }
          processedArgs[index] = value;
        });
        this.processedArgs = processedArgs;
      }
      /**
       * Once we have a promise we chain, but call synchronously until then.
       *
       * @param {Promise|undefined} promise
       * @param {Function} fn
       * @return {Promise|undefined}
       * @api private
       */
      _chainOrCall(promise, fn) {
        if (promise && promise.then && typeof promise.then === "function") {
          return promise.then(() => fn());
        }
        return fn();
      }
      /**
       *
       * @param {Promise|undefined} promise
       * @param {string} event
       * @return {Promise|undefined}
       * @api private
       */
      _chainOrCallHooks(promise, event) {
        let result = promise;
        const hooks = [];
        getCommandAndParents(this).reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== void 0).forEach((hookedCommand) => {
          hookedCommand._lifeCycleHooks[event].forEach((callback) => {
            hooks.push({ hookedCommand, callback });
          });
        });
        if (event === "postAction") {
          hooks.reverse();
        }
        hooks.forEach((hookDetail) => {
          result = this._chainOrCall(result, () => {
            return hookDetail.callback(hookDetail.hookedCommand, this);
          });
        });
        return result;
      }
      /**
       *
       * @param {Promise|undefined} promise
       * @param {Command} subCommand
       * @param {string} event
       * @return {Promise|undefined}
       * @api private
       */
      _chainOrCallSubCommandHook(promise, subCommand, event) {
        let result = promise;
        if (this._lifeCycleHooks[event] !== void 0) {
          this._lifeCycleHooks[event].forEach((hook) => {
            result = this._chainOrCall(result, () => {
              return hook(this, subCommand);
            });
          });
        }
        return result;
      }
      /**
       * Process arguments in context of this command.
       * Returns action result, in case it is a promise.
       *
       * @api private
       */
      _parseCommand(operands, unknown) {
        const parsed = this.parseOptions(unknown);
        this._parseOptionsEnv();
        this._parseOptionsImplied();
        operands = operands.concat(parsed.operands);
        unknown = parsed.unknown;
        this.args = operands.concat(unknown);
        if (operands && this._findCommand(operands[0])) {
          return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
        }
        if (this._hasImplicitHelpCommand() && operands[0] === this._helpCommandName) {
          return this._dispatchHelpCommand(operands[1]);
        }
        if (this._defaultCommandName) {
          outputHelpIfRequested(this, unknown);
          return this._dispatchSubcommand(this._defaultCommandName, operands, unknown);
        }
        if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
          this.help({ error: true });
        }
        outputHelpIfRequested(this, parsed.unknown);
        this._checkForMissingMandatoryOptions();
        this._checkForConflictingOptions();
        const checkForUnknownOptions = () => {
          if (parsed.unknown.length > 0) {
            this.unknownOption(parsed.unknown[0]);
          }
        };
        const commandEvent = `command:${this.name()}`;
        if (this._actionHandler) {
          checkForUnknownOptions();
          this._processArguments();
          let actionResult;
          actionResult = this._chainOrCallHooks(actionResult, "preAction");
          actionResult = this._chainOrCall(actionResult, () => this._actionHandler(this.processedArgs));
          if (this.parent) {
            actionResult = this._chainOrCall(actionResult, () => {
              this.parent.emit(commandEvent, operands, unknown);
            });
          }
          actionResult = this._chainOrCallHooks(actionResult, "postAction");
          return actionResult;
        }
        if (this.parent && this.parent.listenerCount(commandEvent)) {
          checkForUnknownOptions();
          this._processArguments();
          this.parent.emit(commandEvent, operands, unknown);
        } else if (operands.length) {
          if (this._findCommand("*")) {
            return this._dispatchSubcommand("*", operands, unknown);
          }
          if (this.listenerCount("command:*")) {
            this.emit("command:*", operands, unknown);
          } else if (this.commands.length) {
            this.unknownCommand();
          } else {
            checkForUnknownOptions();
            this._processArguments();
          }
        } else if (this.commands.length) {
          checkForUnknownOptions();
          this.help({ error: true });
        } else {
          checkForUnknownOptions();
          this._processArguments();
        }
      }
      /**
       * Find matching command.
       *
       * @api private
       */
      _findCommand(name) {
        if (!name)
          return void 0;
        return this.commands.find((cmd) => cmd._name === name || cmd._aliases.includes(name));
      }
      /**
       * Return an option matching `arg` if any.
       *
       * @param {string} arg
       * @return {Option}
       * @api private
       */
      _findOption(arg) {
        return this.options.find((option) => option.is(arg));
      }
      /**
       * Display an error message if a mandatory option does not have a value.
       * Called after checking for help flags in leaf subcommand.
       *
       * @api private
       */
      _checkForMissingMandatoryOptions() {
        for (let cmd = this; cmd; cmd = cmd.parent) {
          cmd.options.forEach((anOption) => {
            if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === void 0) {
              cmd.missingMandatoryOptionValue(anOption);
            }
          });
        }
      }
      /**
       * Display an error message if conflicting options are used together in this.
       *
       * @api private
       */
      _checkForConflictingLocalOptions() {
        const definedNonDefaultOptions = this.options.filter(
          (option) => {
            const optionKey = option.attributeName();
            if (this.getOptionValue(optionKey) === void 0) {
              return false;
            }
            return this.getOptionValueSource(optionKey) !== "default";
          }
        );
        const optionsWithConflicting = definedNonDefaultOptions.filter(
          (option) => option.conflictsWith.length > 0
        );
        optionsWithConflicting.forEach((option) => {
          const conflictingAndDefined = definedNonDefaultOptions.find(
            (defined) => option.conflictsWith.includes(defined.attributeName())
          );
          if (conflictingAndDefined) {
            this._conflictingOption(option, conflictingAndDefined);
          }
        });
      }
      /**
       * Display an error message if conflicting options are used together.
       * Called after checking for help flags in leaf subcommand.
       *
       * @api private
       */
      _checkForConflictingOptions() {
        for (let cmd = this; cmd; cmd = cmd.parent) {
          cmd._checkForConflictingLocalOptions();
        }
      }
      /**
       * Parse options from `argv` removing known options,
       * and return argv split into operands and unknown arguments.
       *
       * Examples:
       *
       *     argv => operands, unknown
       *     --known kkk op => [op], []
       *     op --known kkk => [op], []
       *     sub --unknown uuu op => [sub], [--unknown uuu op]
       *     sub -- --unknown uuu op => [sub --unknown uuu op], []
       *
       * @param {String[]} argv
       * @return {{operands: String[], unknown: String[]}}
       */
      parseOptions(argv) {
        const operands = [];
        const unknown = [];
        let dest = operands;
        const args2 = argv.slice();
        function maybeOption(arg) {
          return arg.length > 1 && arg[0] === "-";
        }
        let activeVariadicOption = null;
        while (args2.length) {
          const arg = args2.shift();
          if (arg === "--") {
            if (dest === unknown)
              dest.push(arg);
            dest.push(...args2);
            break;
          }
          if (activeVariadicOption && !maybeOption(arg)) {
            this.emit(`option:${activeVariadicOption.name()}`, arg);
            continue;
          }
          activeVariadicOption = null;
          if (maybeOption(arg)) {
            const option = this._findOption(arg);
            if (option) {
              if (option.required) {
                const value = args2.shift();
                if (value === void 0)
                  this.optionMissingArgument(option);
                this.emit(`option:${option.name()}`, value);
              } else if (option.optional) {
                let value = null;
                if (args2.length > 0 && !maybeOption(args2[0])) {
                  value = args2.shift();
                }
                this.emit(`option:${option.name()}`, value);
              } else {
                this.emit(`option:${option.name()}`);
              }
              activeVariadicOption = option.variadic ? option : null;
              continue;
            }
          }
          if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
            const option = this._findOption(`-${arg[1]}`);
            if (option) {
              if (option.required || option.optional && this._combineFlagAndOptionalValue) {
                this.emit(`option:${option.name()}`, arg.slice(2));
              } else {
                this.emit(`option:${option.name()}`);
                args2.unshift(`-${arg.slice(2)}`);
              }
              continue;
            }
          }
          if (/^--[^=]+=/.test(arg)) {
            const index = arg.indexOf("=");
            const option = this._findOption(arg.slice(0, index));
            if (option && (option.required || option.optional)) {
              this.emit(`option:${option.name()}`, arg.slice(index + 1));
              continue;
            }
          }
          if (maybeOption(arg)) {
            dest = unknown;
          }
          if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
            if (this._findCommand(arg)) {
              operands.push(arg);
              if (args2.length > 0)
                unknown.push(...args2);
              break;
            } else if (arg === this._helpCommandName && this._hasImplicitHelpCommand()) {
              operands.push(arg);
              if (args2.length > 0)
                operands.push(...args2);
              break;
            } else if (this._defaultCommandName) {
              unknown.push(arg);
              if (args2.length > 0)
                unknown.push(...args2);
              break;
            }
          }
          if (this._passThroughOptions) {
            dest.push(arg);
            if (args2.length > 0)
              dest.push(...args2);
            break;
          }
          dest.push(arg);
        }
        return { operands, unknown };
      }
      /**
       * Return an object containing local option values as key-value pairs.
       *
       * @return {Object}
       */
      opts() {
        if (this._storeOptionsAsProperties) {
          const result = {};
          const len = this.options.length;
          for (let i = 0; i < len; i++) {
            const key = this.options[i].attributeName();
            result[key] = key === this._versionOptionName ? this._version : this[key];
          }
          return result;
        }
        return this._optionValues;
      }
      /**
       * Return an object containing merged local and global option values as key-value pairs.
       *
       * @return {Object}
       */
      optsWithGlobals() {
        return getCommandAndParents(this).reduce(
          (combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()),
          {}
        );
      }
      /**
       * Display error message and exit (or call exitOverride).
       *
       * @param {string} message
       * @param {Object} [errorOptions]
       * @param {string} [errorOptions.code] - an id string representing the error
       * @param {number} [errorOptions.exitCode] - used with process.exit
       */
      error(message, errorOptions) {
        this._outputConfiguration.outputError(`${message}
`, this._outputConfiguration.writeErr);
        if (typeof this._showHelpAfterError === "string") {
          this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
        } else if (this._showHelpAfterError) {
          this._outputConfiguration.writeErr("\n");
          this.outputHelp({ error: true });
        }
        const config2 = errorOptions || {};
        const exitCode = config2.exitCode || 1;
        const code = config2.code || "commander.error";
        this._exit(exitCode, code, message);
      }
      /**
       * Apply any option related environment variables, if option does
       * not have a value from cli or client code.
       *
       * @api private
       */
      _parseOptionsEnv() {
        this.options.forEach((option) => {
          if (option.envVar && option.envVar in process2.env) {
            const optionKey = option.attributeName();
            if (this.getOptionValue(optionKey) === void 0 || ["default", "config", "env"].includes(this.getOptionValueSource(optionKey))) {
              if (option.required || option.optional) {
                this.emit(`optionEnv:${option.name()}`, process2.env[option.envVar]);
              } else {
                this.emit(`optionEnv:${option.name()}`);
              }
            }
          }
        });
      }
      /**
       * Apply any implied option values, if option is undefined or default value.
       *
       * @api private
       */
      _parseOptionsImplied() {
        const dualHelper = new DualOptions(this.options);
        const hasCustomOptionValue = (optionKey) => {
          return this.getOptionValue(optionKey) !== void 0 && !["default", "implied"].includes(this.getOptionValueSource(optionKey));
        };
        this.options.filter((option) => option.implied !== void 0 && hasCustomOptionValue(option.attributeName()) && dualHelper.valueFromOption(this.getOptionValue(option.attributeName()), option)).forEach((option) => {
          Object.keys(option.implied).filter((impliedKey) => !hasCustomOptionValue(impliedKey)).forEach((impliedKey) => {
            this.setOptionValueWithSource(impliedKey, option.implied[impliedKey], "implied");
          });
        });
      }
      /**
       * Argument `name` is missing.
       *
       * @param {string} name
       * @api private
       */
      missingArgument(name) {
        const message = `error: missing required argument '${name}'`;
        this.error(message, { code: "commander.missingArgument" });
      }
      /**
       * `Option` is missing an argument.
       *
       * @param {Option} option
       * @api private
       */
      optionMissingArgument(option) {
        const message = `error: option '${option.flags}' argument missing`;
        this.error(message, { code: "commander.optionMissingArgument" });
      }
      /**
       * `Option` does not have a value, and is a mandatory option.
       *
       * @param {Option} option
       * @api private
       */
      missingMandatoryOptionValue(option) {
        const message = `error: required option '${option.flags}' not specified`;
        this.error(message, { code: "commander.missingMandatoryOptionValue" });
      }
      /**
       * `Option` conflicts with another option.
       *
       * @param {Option} option
       * @param {Option} conflictingOption
       * @api private
       */
      _conflictingOption(option, conflictingOption) {
        const findBestOptionFromValue = (option2) => {
          const optionKey = option2.attributeName();
          const optionValue = this.getOptionValue(optionKey);
          const negativeOption = this.options.find((target) => target.negate && optionKey === target.attributeName());
          const positiveOption = this.options.find((target) => !target.negate && optionKey === target.attributeName());
          if (negativeOption && (negativeOption.presetArg === void 0 && optionValue === false || negativeOption.presetArg !== void 0 && optionValue === negativeOption.presetArg)) {
            return negativeOption;
          }
          return positiveOption || option2;
        };
        const getErrorMessage = (option2) => {
          const bestOption = findBestOptionFromValue(option2);
          const optionKey = bestOption.attributeName();
          const source = this.getOptionValueSource(optionKey);
          if (source === "env") {
            return `environment variable '${bestOption.envVar}'`;
          }
          return `option '${bestOption.flags}'`;
        };
        const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
        this.error(message, { code: "commander.conflictingOption" });
      }
      /**
       * Unknown option `flag`.
       *
       * @param {string} flag
       * @api private
       */
      unknownOption(flag) {
        if (this._allowUnknownOption)
          return;
        let suggestion = "";
        if (flag.startsWith("--") && this._showSuggestionAfterError) {
          let candidateFlags = [];
          let command = this;
          do {
            const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
            candidateFlags = candidateFlags.concat(moreFlags);
            command = command.parent;
          } while (command && !command._enablePositionalOptions);
          suggestion = suggestSimilar(flag, candidateFlags);
        }
        const message = `error: unknown option '${flag}'${suggestion}`;
        this.error(message, { code: "commander.unknownOption" });
      }
      /**
       * Excess arguments, more than expected.
       *
       * @param {string[]} receivedArgs
       * @api private
       */
      _excessArguments(receivedArgs) {
        if (this._allowExcessArguments)
          return;
        const expected = this._args.length;
        const s = expected === 1 ? "" : "s";
        const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
        const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
        this.error(message, { code: "commander.excessArguments" });
      }
      /**
       * Unknown command.
       *
       * @api private
       */
      unknownCommand() {
        const unknownName = this.args[0];
        let suggestion = "";
        if (this._showSuggestionAfterError) {
          const candidateNames = [];
          this.createHelp().visibleCommands(this).forEach((command) => {
            candidateNames.push(command.name());
            if (command.alias())
              candidateNames.push(command.alias());
          });
          suggestion = suggestSimilar(unknownName, candidateNames);
        }
        const message = `error: unknown command '${unknownName}'${suggestion}`;
        this.error(message, { code: "commander.unknownCommand" });
      }
      /**
       * Set the program version to `str`.
       *
       * This method auto-registers the "-V, --version" flag
       * which will print the version number when passed.
       *
       * You can optionally supply the  flags and description to override the defaults.
       *
       * @param {string} str
       * @param {string} [flags]
       * @param {string} [description]
       * @return {this | string} `this` command for chaining, or version string if no arguments
       */
      version(str, flags, description) {
        if (str === void 0)
          return this._version;
        this._version = str;
        flags = flags || "-V, --version";
        description = description || "output the version number";
        const versionOption = this.createOption(flags, description);
        this._versionOptionName = versionOption.attributeName();
        this.options.push(versionOption);
        this.on("option:" + versionOption.name(), () => {
          this._outputConfiguration.writeOut(`${str}
`);
          this._exit(0, "commander.version", str);
        });
        return this;
      }
      /**
       * Set the description.
       *
       * @param {string} [str]
       * @param {Object} [argsDescription]
       * @return {string|Command}
       */
      description(str, argsDescription) {
        if (str === void 0 && argsDescription === void 0)
          return this._description;
        this._description = str;
        if (argsDescription) {
          this._argsDescription = argsDescription;
        }
        return this;
      }
      /**
       * Set the summary. Used when listed as subcommand of parent.
       *
       * @param {string} [str]
       * @return {string|Command}
       */
      summary(str) {
        if (str === void 0)
          return this._summary;
        this._summary = str;
        return this;
      }
      /**
       * Set an alias for the command.
       *
       * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
       *
       * @param {string} [alias]
       * @return {string|Command}
       */
      alias(alias) {
        if (alias === void 0)
          return this._aliases[0];
        let command = this;
        if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
          command = this.commands[this.commands.length - 1];
        }
        if (alias === command._name)
          throw new Error("Command alias can't be the same as its name");
        command._aliases.push(alias);
        return this;
      }
      /**
       * Set aliases for the command.
       *
       * Only the first alias is shown in the auto-generated help.
       *
       * @param {string[]} [aliases]
       * @return {string[]|Command}
       */
      aliases(aliases) {
        if (aliases === void 0)
          return this._aliases;
        aliases.forEach((alias) => this.alias(alias));
        return this;
      }
      /**
       * Set / get the command usage `str`.
       *
       * @param {string} [str]
       * @return {String|Command}
       */
      usage(str) {
        if (str === void 0) {
          if (this._usage)
            return this._usage;
          const args2 = this._args.map((arg) => {
            return humanReadableArgName(arg);
          });
          return [].concat(
            this.options.length || this._hasHelpOption ? "[options]" : [],
            this.commands.length ? "[command]" : [],
            this._args.length ? args2 : []
          ).join(" ");
        }
        this._usage = str;
        return this;
      }
      /**
       * Get or set the name of the command.
       *
       * @param {string} [str]
       * @return {string|Command}
       */
      name(str) {
        if (str === void 0)
          return this._name;
        this._name = str;
        return this;
      }
      /**
       * Set the name of the command from script filename, such as process.argv[1],
       * or require.main.filename, or __filename.
       *
       * (Used internally and public although not documented in README.)
       *
       * @example
       * program.nameFromFilename(require.main.filename);
       *
       * @param {string} filename
       * @return {Command}
       */
      nameFromFilename(filename) {
        this._name = path.basename(filename, path.extname(filename));
        return this;
      }
      /**
       * Get or set the directory for searching for executable subcommands of this command.
       *
       * @example
       * program.executableDir(__dirname);
       * // or
       * program.executableDir('subcommands');
       *
       * @param {string} [path]
       * @return {string|Command}
       */
      executableDir(path2) {
        if (path2 === void 0)
          return this._executableDir;
        this._executableDir = path2;
        return this;
      }
      /**
       * Return program help documentation.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
       * @return {string}
       */
      helpInformation(contextOptions) {
        const helper = this.createHelp();
        if (helper.helpWidth === void 0) {
          helper.helpWidth = contextOptions && contextOptions.error ? this._outputConfiguration.getErrHelpWidth() : this._outputConfiguration.getOutHelpWidth();
        }
        return helper.formatHelp(this, helper);
      }
      /**
       * @api private
       */
      _getHelpContext(contextOptions) {
        contextOptions = contextOptions || {};
        const context = { error: !!contextOptions.error };
        let write;
        if (context.error) {
          write = (arg) => this._outputConfiguration.writeErr(arg);
        } else {
          write = (arg) => this._outputConfiguration.writeOut(arg);
        }
        context.write = contextOptions.write || write;
        context.command = this;
        return context;
      }
      /**
       * Output help information for this command.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      outputHelp(contextOptions) {
        let deprecatedCallback;
        if (typeof contextOptions === "function") {
          deprecatedCallback = contextOptions;
          contextOptions = void 0;
        }
        const context = this._getHelpContext(contextOptions);
        getCommandAndParents(this).reverse().forEach((command) => command.emit("beforeAllHelp", context));
        this.emit("beforeHelp", context);
        let helpInformation = this.helpInformation(context);
        if (deprecatedCallback) {
          helpInformation = deprecatedCallback(helpInformation);
          if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
            throw new Error("outputHelp callback must return a string or a Buffer");
          }
        }
        context.write(helpInformation);
        this.emit(this._helpLongFlag);
        this.emit("afterHelp", context);
        getCommandAndParents(this).forEach((command) => command.emit("afterAllHelp", context));
      }
      /**
       * You can pass in flags and a description to override the help
       * flags and help description for your command. Pass in false to
       * disable the built-in help option.
       *
       * @param {string | boolean} [flags]
       * @param {string} [description]
       * @return {Command} `this` command for chaining
       */
      helpOption(flags, description) {
        if (typeof flags === "boolean") {
          this._hasHelpOption = flags;
          return this;
        }
        this._helpFlags = flags || this._helpFlags;
        this._helpDescription = description || this._helpDescription;
        const helpFlags = splitOptionFlags(this._helpFlags);
        this._helpShortFlag = helpFlags.shortFlag;
        this._helpLongFlag = helpFlags.longFlag;
        return this;
      }
      /**
       * Output help information and exit.
       *
       * Outputs built-in help, and custom text added using `.addHelpText()`.
       *
       * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
       */
      help(contextOptions) {
        this.outputHelp(contextOptions);
        let exitCode = process2.exitCode || 0;
        if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
          exitCode = 1;
        }
        this._exit(exitCode, "commander.help", "(outputHelp)");
      }
      /**
       * Add additional text to be displayed with the built-in help.
       *
       * Position is 'before' or 'after' to affect just this command,
       * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
       *
       * @param {string} position - before or after built-in help
       * @param {string | Function} text - string to add, or a function returning a string
       * @return {Command} `this` command for chaining
       */
      addHelpText(position, text) {
        const allowedValues = ["beforeAll", "before", "after", "afterAll"];
        if (!allowedValues.includes(position)) {
          throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        const helpEvent = `${position}Help`;
        this.on(helpEvent, (context) => {
          let helpStr;
          if (typeof text === "function") {
            helpStr = text({ error: context.error, command: context.command });
          } else {
            helpStr = text;
          }
          if (helpStr) {
            context.write(`${helpStr}
`);
          }
        });
        return this;
      }
    };
    function outputHelpIfRequested(cmd, args2) {
      const helpOption = cmd._hasHelpOption && args2.find((arg) => arg === cmd._helpLongFlag || arg === cmd._helpShortFlag);
      if (helpOption) {
        cmd.outputHelp();
        cmd._exit(0, "commander.helpDisplayed", "(outputHelp)");
      }
    }
    function incrementNodeInspectorPort(args2) {
      return args2.map((arg) => {
        if (!arg.startsWith("--inspect")) {
          return arg;
        }
        let debugOption;
        let debugHost = "127.0.0.1";
        let debugPort = "9229";
        let match;
        if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
          debugOption = match[1];
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
          debugOption = match[1];
          if (/^\d+$/.test(match[3])) {
            debugPort = match[3];
          } else {
            debugHost = match[3];
          }
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
          debugOption = match[1];
          debugHost = match[3];
          debugPort = match[4];
        }
        if (debugOption && debugPort !== "0") {
          return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
        }
        return arg;
      });
    }
    function getCommandAndParents(startCommand) {
      const result = [];
      for (let command = startCommand; command; command = command.parent) {
        result.push(command);
      }
      return result;
    }
    exports2.Command = Command;
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/commander/index.js
var require_commander = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/commander/index.js"(exports2, module2) {
    var { Argument } = require_argument();
    var { Command } = require_command();
    var { CommanderError, InvalidArgumentError } = require_error();
    var { Help } = require_help();
    var { Option } = require_option();
    exports2 = module2.exports = new Command();
    exports2.program = exports2;
    exports2.Argument = Argument;
    exports2.Command = Command;
    exports2.CommanderError = CommanderError;
    exports2.Help = Help;
    exports2.InvalidArgumentError = InvalidArgumentError;
    exports2.InvalidOptionArgumentError = InvalidArgumentError;
    exports2.Option = Option;
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/safe-stable-stringify/index.js
var require_safe_stable_stringify = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/safe-stable-stringify/index.js"(exports2, module2) {
    "use strict";
    var { hasOwnProperty } = Object.prototype;
    var stringify = configure();
    stringify.configure = configure;
    stringify.stringify = stringify;
    stringify.default = stringify;
    exports2.stringify = stringify;
    exports2.configure = configure;
    module2.exports = stringify;
    var strEscapeSequencesRegExp = /[\u0000-\u001f\u0022\u005c\ud800-\udfff]|[\ud800-\udbff](?![\udc00-\udfff])|(?:[^\ud800-\udbff]|^)[\udc00-\udfff]/;
    function strEscape(str) {
      if (str.length < 5e3 && !strEscapeSequencesRegExp.test(str)) {
        return `"${str}"`;
      }
      return JSON.stringify(str);
    }
    function insertSort(array) {
      if (array.length > 200) {
        return array.sort();
      }
      for (let i = 1; i < array.length; i++) {
        const currentValue = array[i];
        let position = i;
        while (position !== 0 && array[position - 1] > currentValue) {
          array[position] = array[position - 1];
          position--;
        }
        array[position] = currentValue;
      }
      return array;
    }
    var typedArrayPrototypeGetSymbolToStringTag = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(
        Object.getPrototypeOf(
          new Int8Array()
        )
      ),
      Symbol.toStringTag
    ).get;
    function isTypedArrayWithEntries(value) {
      return typedArrayPrototypeGetSymbolToStringTag.call(value) !== void 0 && value.length !== 0;
    }
    function stringifyTypedArray(array, separator, maximumBreadth) {
      if (array.length < maximumBreadth) {
        maximumBreadth = array.length;
      }
      const whitespace = separator === "," ? "" : " ";
      let res = `"0":${whitespace}${array[0]}`;
      for (let i = 1; i < maximumBreadth; i++) {
        res += `${separator}"${i}":${whitespace}${array[i]}`;
      }
      return res;
    }
    function getCircularValueOption(options) {
      if (hasOwnProperty.call(options, "circularValue")) {
        const circularValue = options.circularValue;
        if (typeof circularValue === "string") {
          return `"${circularValue}"`;
        }
        if (circularValue == null) {
          return circularValue;
        }
        if (circularValue === Error || circularValue === TypeError) {
          return {
            toString() {
              throw new TypeError("Converting circular structure to JSON");
            }
          };
        }
        throw new TypeError('The "circularValue" argument must be of type string or the value null or undefined');
      }
      return '"[Circular]"';
    }
    function getBooleanOption(options, key) {
      let value;
      if (hasOwnProperty.call(options, key)) {
        value = options[key];
        if (typeof value !== "boolean") {
          throw new TypeError(`The "${key}" argument must be of type boolean`);
        }
      }
      return value === void 0 ? true : value;
    }
    function getPositiveIntegerOption(options, key) {
      let value;
      if (hasOwnProperty.call(options, key)) {
        value = options[key];
        if (typeof value !== "number") {
          throw new TypeError(`The "${key}" argument must be of type number`);
        }
        if (!Number.isInteger(value)) {
          throw new TypeError(`The "${key}" argument must be an integer`);
        }
        if (value < 1) {
          throw new RangeError(`The "${key}" argument must be >= 1`);
        }
      }
      return value === void 0 ? Infinity : value;
    }
    function getItemCount(number) {
      if (number === 1) {
        return "1 item";
      }
      return `${number} items`;
    }
    function getUniqueReplacerSet(replacerArray) {
      const replacerSet = /* @__PURE__ */ new Set();
      for (const value of replacerArray) {
        if (typeof value === "string" || typeof value === "number") {
          replacerSet.add(String(value));
        }
      }
      return replacerSet;
    }
    function getStrictOption(options) {
      if (hasOwnProperty.call(options, "strict")) {
        const value = options.strict;
        if (typeof value !== "boolean") {
          throw new TypeError('The "strict" argument must be of type boolean');
        }
        if (value) {
          return (value2) => {
            let message = `Object can not safely be stringified. Received type ${typeof value2}`;
            if (typeof value2 !== "function")
              message += ` (${value2.toString()})`;
            throw new Error(message);
          };
        }
      }
    }
    function configure(options) {
      options = { ...options };
      const fail = getStrictOption(options);
      if (fail) {
        if (options.bigint === void 0) {
          options.bigint = false;
        }
        if (!("circularValue" in options)) {
          options.circularValue = Error;
        }
      }
      const circularValue = getCircularValueOption(options);
      const bigint = getBooleanOption(options, "bigint");
      const deterministic = getBooleanOption(options, "deterministic");
      const maximumDepth = getPositiveIntegerOption(options, "maximumDepth");
      const maximumBreadth = getPositiveIntegerOption(options, "maximumBreadth");
      function stringifyFnReplacer(key, parent, stack, replacer, spacer, indentation) {
        let value = parent[key];
        if (typeof value === "object" && value !== null && typeof value.toJSON === "function") {
          value = value.toJSON(key);
        }
        value = replacer.call(parent, key, value);
        switch (typeof value) {
          case "string":
            return strEscape(value);
          case "object": {
            if (value === null) {
              return "null";
            }
            if (stack.indexOf(value) !== -1) {
              return circularValue;
            }
            let res = "";
            let join = ",";
            const originalIndentation = indentation;
            if (Array.isArray(value)) {
              if (value.length === 0) {
                return "[]";
              }
              if (maximumDepth < stack.length + 1) {
                return '"[Array]"';
              }
              stack.push(value);
              if (spacer !== "") {
                indentation += spacer;
                res += `
${indentation}`;
                join = `,
${indentation}`;
              }
              const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
              let i = 0;
              for (; i < maximumValuesToStringify - 1; i++) {
                const tmp2 = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
                res += tmp2 !== void 0 ? tmp2 : "null";
                res += join;
              }
              const tmp = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
              res += tmp !== void 0 ? tmp : "null";
              if (value.length - 1 > maximumBreadth) {
                const removedKeys = value.length - maximumBreadth - 1;
                res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
              }
              if (spacer !== "") {
                res += `
${originalIndentation}`;
              }
              stack.pop();
              return `[${res}]`;
            }
            let keys = Object.keys(value);
            const keyLength = keys.length;
            if (keyLength === 0) {
              return "{}";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Object]"';
            }
            let whitespace = "";
            let separator = "";
            if (spacer !== "") {
              indentation += spacer;
              join = `,
${indentation}`;
              whitespace = " ";
            }
            const maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
            if (deterministic && !isTypedArrayWithEntries(value)) {
              keys = insertSort(keys);
            }
            stack.push(value);
            for (let i = 0; i < maximumPropertiesToStringify; i++) {
              const key2 = keys[i];
              const tmp = stringifyFnReplacer(key2, value, stack, replacer, spacer, indentation);
              if (tmp !== void 0) {
                res += `${separator}${strEscape(key2)}:${whitespace}${tmp}`;
                separator = join;
              }
            }
            if (keyLength > maximumBreadth) {
              const removedKeys = keyLength - maximumBreadth;
              res += `${separator}"...":${whitespace}"${getItemCount(removedKeys)} not stringified"`;
              separator = join;
            }
            if (spacer !== "" && separator.length > 1) {
              res = `
${indentation}${res}
${originalIndentation}`;
            }
            stack.pop();
            return `{${res}}`;
          }
          case "number":
            return isFinite(value) ? String(value) : fail ? fail(value) : "null";
          case "boolean":
            return value === true ? "true" : "false";
          case "undefined":
            return void 0;
          case "bigint":
            if (bigint) {
              return String(value);
            }
          default:
            return fail ? fail(value) : void 0;
        }
      }
      function stringifyArrayReplacer(key, value, stack, replacer, spacer, indentation) {
        if (typeof value === "object" && value !== null && typeof value.toJSON === "function") {
          value = value.toJSON(key);
        }
        switch (typeof value) {
          case "string":
            return strEscape(value);
          case "object": {
            if (value === null) {
              return "null";
            }
            if (stack.indexOf(value) !== -1) {
              return circularValue;
            }
            const originalIndentation = indentation;
            let res = "";
            let join = ",";
            if (Array.isArray(value)) {
              if (value.length === 0) {
                return "[]";
              }
              if (maximumDepth < stack.length + 1) {
                return '"[Array]"';
              }
              stack.push(value);
              if (spacer !== "") {
                indentation += spacer;
                res += `
${indentation}`;
                join = `,
${indentation}`;
              }
              const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
              let i = 0;
              for (; i < maximumValuesToStringify - 1; i++) {
                const tmp2 = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
                res += tmp2 !== void 0 ? tmp2 : "null";
                res += join;
              }
              const tmp = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
              res += tmp !== void 0 ? tmp : "null";
              if (value.length - 1 > maximumBreadth) {
                const removedKeys = value.length - maximumBreadth - 1;
                res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
              }
              if (spacer !== "") {
                res += `
${originalIndentation}`;
              }
              stack.pop();
              return `[${res}]`;
            }
            stack.push(value);
            let whitespace = "";
            if (spacer !== "") {
              indentation += spacer;
              join = `,
${indentation}`;
              whitespace = " ";
            }
            let separator = "";
            for (const key2 of replacer) {
              const tmp = stringifyArrayReplacer(key2, value[key2], stack, replacer, spacer, indentation);
              if (tmp !== void 0) {
                res += `${separator}${strEscape(key2)}:${whitespace}${tmp}`;
                separator = join;
              }
            }
            if (spacer !== "" && separator.length > 1) {
              res = `
${indentation}${res}
${originalIndentation}`;
            }
            stack.pop();
            return `{${res}}`;
          }
          case "number":
            return isFinite(value) ? String(value) : fail ? fail(value) : "null";
          case "boolean":
            return value === true ? "true" : "false";
          case "undefined":
            return void 0;
          case "bigint":
            if (bigint) {
              return String(value);
            }
          default:
            return fail ? fail(value) : void 0;
        }
      }
      function stringifyIndent(key, value, stack, spacer, indentation) {
        switch (typeof value) {
          case "string":
            return strEscape(value);
          case "object": {
            if (value === null) {
              return "null";
            }
            if (typeof value.toJSON === "function") {
              value = value.toJSON(key);
              if (typeof value !== "object") {
                return stringifyIndent(key, value, stack, spacer, indentation);
              }
              if (value === null) {
                return "null";
              }
            }
            if (stack.indexOf(value) !== -1) {
              return circularValue;
            }
            const originalIndentation = indentation;
            if (Array.isArray(value)) {
              if (value.length === 0) {
                return "[]";
              }
              if (maximumDepth < stack.length + 1) {
                return '"[Array]"';
              }
              stack.push(value);
              indentation += spacer;
              let res2 = `
${indentation}`;
              const join2 = `,
${indentation}`;
              const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
              let i = 0;
              for (; i < maximumValuesToStringify - 1; i++) {
                const tmp2 = stringifyIndent(String(i), value[i], stack, spacer, indentation);
                res2 += tmp2 !== void 0 ? tmp2 : "null";
                res2 += join2;
              }
              const tmp = stringifyIndent(String(i), value[i], stack, spacer, indentation);
              res2 += tmp !== void 0 ? tmp : "null";
              if (value.length - 1 > maximumBreadth) {
                const removedKeys = value.length - maximumBreadth - 1;
                res2 += `${join2}"... ${getItemCount(removedKeys)} not stringified"`;
              }
              res2 += `
${originalIndentation}`;
              stack.pop();
              return `[${res2}]`;
            }
            let keys = Object.keys(value);
            const keyLength = keys.length;
            if (keyLength === 0) {
              return "{}";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Object]"';
            }
            indentation += spacer;
            const join = `,
${indentation}`;
            let res = "";
            let separator = "";
            let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
            if (isTypedArrayWithEntries(value)) {
              res += stringifyTypedArray(value, join, maximumBreadth);
              keys = keys.slice(value.length);
              maximumPropertiesToStringify -= value.length;
              separator = join;
            }
            if (deterministic) {
              keys = insertSort(keys);
            }
            stack.push(value);
            for (let i = 0; i < maximumPropertiesToStringify; i++) {
              const key2 = keys[i];
              const tmp = stringifyIndent(key2, value[key2], stack, spacer, indentation);
              if (tmp !== void 0) {
                res += `${separator}${strEscape(key2)}: ${tmp}`;
                separator = join;
              }
            }
            if (keyLength > maximumBreadth) {
              const removedKeys = keyLength - maximumBreadth;
              res += `${separator}"...": "${getItemCount(removedKeys)} not stringified"`;
              separator = join;
            }
            if (separator !== "") {
              res = `
${indentation}${res}
${originalIndentation}`;
            }
            stack.pop();
            return `{${res}}`;
          }
          case "number":
            return isFinite(value) ? String(value) : fail ? fail(value) : "null";
          case "boolean":
            return value === true ? "true" : "false";
          case "undefined":
            return void 0;
          case "bigint":
            if (bigint) {
              return String(value);
            }
          default:
            return fail ? fail(value) : void 0;
        }
      }
      function stringifySimple(key, value, stack) {
        switch (typeof value) {
          case "string":
            return strEscape(value);
          case "object": {
            if (value === null) {
              return "null";
            }
            if (typeof value.toJSON === "function") {
              value = value.toJSON(key);
              if (typeof value !== "object") {
                return stringifySimple(key, value, stack);
              }
              if (value === null) {
                return "null";
              }
            }
            if (stack.indexOf(value) !== -1) {
              return circularValue;
            }
            let res = "";
            if (Array.isArray(value)) {
              if (value.length === 0) {
                return "[]";
              }
              if (maximumDepth < stack.length + 1) {
                return '"[Array]"';
              }
              stack.push(value);
              const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
              let i = 0;
              for (; i < maximumValuesToStringify - 1; i++) {
                const tmp2 = stringifySimple(String(i), value[i], stack);
                res += tmp2 !== void 0 ? tmp2 : "null";
                res += ",";
              }
              const tmp = stringifySimple(String(i), value[i], stack);
              res += tmp !== void 0 ? tmp : "null";
              if (value.length - 1 > maximumBreadth) {
                const removedKeys = value.length - maximumBreadth - 1;
                res += `,"... ${getItemCount(removedKeys)} not stringified"`;
              }
              stack.pop();
              return `[${res}]`;
            }
            let keys = Object.keys(value);
            const keyLength = keys.length;
            if (keyLength === 0) {
              return "{}";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Object]"';
            }
            let separator = "";
            let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
            if (isTypedArrayWithEntries(value)) {
              res += stringifyTypedArray(value, ",", maximumBreadth);
              keys = keys.slice(value.length);
              maximumPropertiesToStringify -= value.length;
              separator = ",";
            }
            if (deterministic) {
              keys = insertSort(keys);
            }
            stack.push(value);
            for (let i = 0; i < maximumPropertiesToStringify; i++) {
              const key2 = keys[i];
              const tmp = stringifySimple(key2, value[key2], stack);
              if (tmp !== void 0) {
                res += `${separator}${strEscape(key2)}:${tmp}`;
                separator = ",";
              }
            }
            if (keyLength > maximumBreadth) {
              const removedKeys = keyLength - maximumBreadth;
              res += `${separator}"...":"${getItemCount(removedKeys)} not stringified"`;
            }
            stack.pop();
            return `{${res}}`;
          }
          case "number":
            return isFinite(value) ? String(value) : fail ? fail(value) : "null";
          case "boolean":
            return value === true ? "true" : "false";
          case "undefined":
            return void 0;
          case "bigint":
            if (bigint) {
              return String(value);
            }
          default:
            return fail ? fail(value) : void 0;
        }
      }
      function stringify2(value, replacer, space) {
        if (arguments.length > 1) {
          let spacer = "";
          if (typeof space === "number") {
            spacer = " ".repeat(Math.min(space, 10));
          } else if (typeof space === "string") {
            spacer = space.slice(0, 10);
          }
          if (replacer != null) {
            if (typeof replacer === "function") {
              return stringifyFnReplacer("", { "": value }, [], replacer, spacer, "");
            }
            if (Array.isArray(replacer)) {
              return stringifyArrayReplacer("", value, [], getUniqueReplacerSet(replacer), spacer, "");
            }
          }
          if (spacer.length !== 0) {
            return stringifyIndent("", value, [], spacer, "");
          }
        }
        return stringifySimple("", value, []);
      }
      return stringify2;
    }
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Error/BaseError.js
var require_BaseError = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Error/BaseError.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BaseError = void 0;
    var BaseError = class extends Error {
      constructor(message) {
        super(message);
      }
    };
    exports2.BaseError = BaseError;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Error/NoRootTypeError.js
var require_NoRootTypeError = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Error/NoRootTypeError.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NoRootTypeError = void 0;
    var BaseError_12 = require_BaseError();
    var NoRootTypeError = class extends BaseError_12.BaseError {
      constructor(type) {
        super(`No root type "${type}" found`);
        this.type = type;
      }
      getType() {
        return this.type;
      }
    };
    exports2.NoRootTypeError = NoRootTypeError;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/nodeKey.js
var require_nodeKey = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/nodeKey.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getKey = exports2.hash = void 0;
    var safe_stable_stringify_12 = __importDefault2(require_safe_stable_stringify());
    function hash(a) {
      if (typeof a === "number") {
        return a;
      }
      const str = typeof a === "string" ? a : (0, safe_stable_stringify_12.default)(a);
      if (str.length < 20) {
        return str;
      }
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        h = (h << 5) - h + char;
        h = h & h;
      }
      if (h < 0) {
        return -h;
      }
      return h;
    }
    exports2.hash = hash;
    function getKey(node, context) {
      const ids = [];
      while (node) {
        const source = node.getSourceFile();
        if (!source) {
          ids.push(Math.random());
        } else {
          const filename = source.fileName.substring(process.cwd().length + 1).replace(/\//g, "_");
          ids.push(hash(filename), node.pos, node.end);
        }
        node = node.parent;
      }
      const id = ids.join("-");
      const args2 = context.getArguments();
      return args2.length ? `${id}<${args2.map((arg) => arg.getId()).join(",")}>` : id;
    }
    exports2.getKey = getKey;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser.js
var require_NodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Context = void 0;
    var safe_stable_stringify_12 = __importDefault2(require_safe_stable_stringify());
    var nodeKey_1 = require_nodeKey();
    var Context = class {
      constructor(reference) {
        this.cacheKey = null;
        this.arguments = [];
        this.parameters = [];
        this.defaultArgument = /* @__PURE__ */ new Map();
        this.reference = reference;
      }
      pushArgument(argumentType) {
        this.arguments.push(argumentType);
        this.cacheKey = null;
      }
      pushParameter(parameterName) {
        this.parameters.push(parameterName);
      }
      setDefault(parameterName, argumentType) {
        this.defaultArgument.set(parameterName, argumentType);
      }
      getCacheKey() {
        if (this.cacheKey == null) {
          this.cacheKey = (0, safe_stable_stringify_12.default)([
            this.reference ? (0, nodeKey_1.getKey)(this.reference, this) : "",
            this.arguments.map((argument) => argument === null || argument === void 0 ? void 0 : argument.getId())
          ]);
        }
        return this.cacheKey;
      }
      getArgument(parameterName) {
        const index = this.parameters.indexOf(parameterName);
        if ((index < 0 || !this.arguments[index]) && this.defaultArgument.has(parameterName)) {
          return this.defaultArgument.get(parameterName);
        }
        return this.arguments[index];
      }
      getParameters() {
        return this.parameters;
      }
      getArguments() {
        return this.arguments;
      }
      getReference() {
        return this.reference;
      }
    };
    exports2.Context = Context;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/BaseType.js
var require_BaseType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/BaseType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BaseType = void 0;
    var BaseType = class {
      getName() {
        return this.getId();
      }
    };
    exports2.BaseType = BaseType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/DefinitionType.js
var require_DefinitionType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/DefinitionType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DefinitionType = void 0;
    var BaseType_1 = require_BaseType();
    var DefinitionType = class extends BaseType_1.BaseType {
      constructor(name, type) {
        super();
        this.name = name;
        this.type = type;
      }
      getId() {
        return `def-${this.type.getId()}`;
      }
      getName() {
        return this.name || super.getName();
      }
      getType() {
        return this.type;
      }
    };
    exports2.DefinitionType = DefinitionType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/symbolAtNode.js
var require_symbolAtNode = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/symbolAtNode.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.localSymbolAtNode = exports2.symbolAtNode = void 0;
    function symbolAtNode(node) {
      return node.symbol;
    }
    exports2.symbolAtNode = symbolAtNode;
    function localSymbolAtNode(node) {
      return node.localSymbol;
    }
    exports2.localSymbolAtNode = localSymbolAtNode;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/removeUnreachable.js
var require_removeUnreachable = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/removeUnreachable.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.removeUnreachable = void 0;
    var DEFINITION_OFFSET = "#/definitions/".length;
    function addReachable(definition, definitions, reachable) {
      var _a, _b;
      if (typeof definition === "boolean") {
        return;
      }
      if (definition.$ref) {
        const typeName = decodeURIComponent(definition.$ref.slice(DEFINITION_OFFSET));
        if (reachable.has(typeName) || !isLocalRef(definition.$ref)) {
          return;
        }
        reachable.add(typeName);
        const refDefinition = definitions[typeName];
        if (!refDefinition) {
          throw new Error(`Encountered a reference to a missing definition: "${definition.$ref}". This is a bug.`);
        }
        addReachable(refDefinition, definitions, reachable);
      } else if (definition.anyOf) {
        for (const def of definition.anyOf) {
          addReachable(def, definitions, reachable);
        }
      } else if (definition.allOf) {
        for (const def of definition.allOf) {
          addReachable(def, definitions, reachable);
        }
      } else if (definition.oneOf) {
        for (const def of definition.oneOf) {
          addReachable(def, definitions, reachable);
        }
      } else if (definition.not) {
        addReachable(definition.not, definitions, reachable);
      } else if ((_a = definition.type) === null || _a === void 0 ? void 0 : _a.includes("object")) {
        for (const prop in definition.properties || {}) {
          const propDefinition = definition.properties[prop];
          addReachable(propDefinition, definitions, reachable);
        }
        const additionalProperties = definition.additionalProperties;
        if (additionalProperties) {
          addReachable(additionalProperties, definitions, reachable);
        }
      } else if ((_b = definition.type) === null || _b === void 0 ? void 0 : _b.includes("array")) {
        const items = definition.items;
        if (Array.isArray(items)) {
          for (const item of items) {
            addReachable(item, definitions, reachable);
          }
        } else if (items) {
          addReachable(items, definitions, reachable);
        }
      } else if (definition.then) {
        addReachable(definition.then, definitions, reachable);
      }
    }
    function removeUnreachable(rootTypeDefinition, definitions) {
      if (!rootTypeDefinition) {
        return definitions;
      }
      const reachable = /* @__PURE__ */ new Set();
      addReachable(rootTypeDefinition, definitions, reachable);
      const out = {};
      for (const def of reachable) {
        out[def] = definitions[def];
      }
      return out;
    }
    exports2.removeUnreachable = removeUnreachable;
    function isLocalRef(ref) {
      return ref.charAt(0) === "#";
    }
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/hasJsDocTag.js
var require_hasJsDocTag = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/hasJsDocTag.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.hasJsDocTag = void 0;
    var symbolAtNode_1 = require_symbolAtNode();
    function hasJsDocTag(node, tagName) {
      var _a;
      const symbol = (0, symbolAtNode_1.symbolAtNode)(node);
      return symbol ? (_a = symbol.getJsDocTags()) === null || _a === void 0 ? void 0 : _a.some((tag) => tag.name === tagName) : false;
    }
    exports2.hasJsDocTag = hasJsDocTag;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/SchemaGenerator.js
var require_SchemaGenerator = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/SchemaGenerator.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SchemaGenerator = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var NoRootTypeError_1 = require_NoRootTypeError();
    var NodeParser_1 = require_NodeParser();
    var DefinitionType_1 = require_DefinitionType();
    var symbolAtNode_1 = require_symbolAtNode();
    var removeUnreachable_1 = require_removeUnreachable();
    var hasJsDocTag_1 = require_hasJsDocTag();
    var SchemaGenerator = class {
      constructor(program, nodeParser, typeFormatter, config2) {
        this.program = program;
        this.nodeParser = nodeParser;
        this.typeFormatter = typeFormatter;
        this.config = config2;
      }
      createSchema(fullName) {
        const rootNodes = this.getRootNodes(fullName);
        return this.createSchemaFromNodes(rootNodes);
      }
      createSchemaFromNodes(rootNodes) {
        var _a;
        const rootTypes = rootNodes.map((rootNode) => {
          return this.nodeParser.createType(rootNode, new NodeParser_1.Context());
        });
        const rootTypeDefinition = rootTypes.length === 1 ? this.getRootTypeDefinition(rootTypes[0]) : void 0;
        const definitions = {};
        rootTypes.forEach((rootType) => this.appendRootChildDefinitions(rootType, definitions));
        const reachableDefinitions = (0, removeUnreachable_1.removeUnreachable)(rootTypeDefinition, definitions);
        return {
          ...((_a = this.config) === null || _a === void 0 ? void 0 : _a.schemaId) ? { $id: this.config.schemaId } : {},
          $schema: "http://json-schema.org/draft-07/schema#",
          ...rootTypeDefinition !== null && rootTypeDefinition !== void 0 ? rootTypeDefinition : {},
          definitions: reachableDefinitions
        };
      }
      getRootNodes(fullName) {
        if (fullName && fullName !== "*") {
          return [this.findNamedNode(fullName)];
        } else {
          const rootFileNames = this.program.getRootFileNames();
          const rootSourceFiles = this.program.getSourceFiles().filter((sourceFile) => rootFileNames.includes(sourceFile.fileName));
          const rootNodes = /* @__PURE__ */ new Map();
          this.appendTypes(rootSourceFiles, this.program.getTypeChecker(), rootNodes);
          return [...rootNodes.values()];
        }
      }
      findNamedNode(fullName) {
        const typeChecker = this.program.getTypeChecker();
        const allTypes = /* @__PURE__ */ new Map();
        const { projectFiles, externalFiles } = this.partitionFiles();
        this.appendTypes(projectFiles, typeChecker, allTypes);
        if (allTypes.has(fullName)) {
          return allTypes.get(fullName);
        }
        this.appendTypes(externalFiles, typeChecker, allTypes);
        if (allTypes.has(fullName)) {
          return allTypes.get(fullName);
        }
        throw new NoRootTypeError_1.NoRootTypeError(fullName);
      }
      getRootTypeDefinition(rootType) {
        return this.typeFormatter.getDefinition(rootType);
      }
      appendRootChildDefinitions(rootType, childDefinitions) {
        const seen = /* @__PURE__ */ new Set();
        const children = this.typeFormatter.getChildren(rootType).filter((child) => child instanceof DefinitionType_1.DefinitionType).filter((child) => {
          if (!seen.has(child.getId())) {
            seen.add(child.getId());
            return true;
          }
          return false;
        });
        const ids = /* @__PURE__ */ new Map();
        for (const child of children) {
          const name = child.getName();
          const previousId = ids.get(name);
          const childId = child.getId().replace(/def-/g, "");
          if (previousId && childId !== previousId) {
            throw new Error(`Type "${name}" has multiple definitions.`);
          }
          ids.set(name, childId);
        }
        children.reduce((definitions, child) => {
          const name = child.getName();
          if (!(name in definitions)) {
            definitions[name] = this.typeFormatter.getDefinition(child.getType());
          }
          return definitions;
        }, childDefinitions);
      }
      partitionFiles() {
        const projectFiles = new Array();
        const externalFiles = new Array();
        for (const sourceFile of this.program.getSourceFiles()) {
          const destination = sourceFile.fileName.includes("/node_modules/") ? externalFiles : projectFiles;
          destination.push(sourceFile);
        }
        return { projectFiles, externalFiles };
      }
      appendTypes(sourceFiles, typeChecker, types) {
        for (const sourceFile of sourceFiles) {
          this.inspectNode(sourceFile, typeChecker, types);
        }
      }
      inspectNode(node, typeChecker, allTypes) {
        var _a, _b, _c;
        switch (node.kind) {
          case typescript_1.default.SyntaxKind.VariableDeclaration: {
            const variableDeclarationNode = node;
            if (((_a = variableDeclarationNode.initializer) === null || _a === void 0 ? void 0 : _a.kind) === typescript_1.default.SyntaxKind.ArrowFunction || ((_b = variableDeclarationNode.initializer) === null || _b === void 0 ? void 0 : _b.kind) === typescript_1.default.SyntaxKind.FunctionExpression) {
              this.inspectNode(variableDeclarationNode.initializer, typeChecker, allTypes);
            }
            return;
          }
          case typescript_1.default.SyntaxKind.InterfaceDeclaration:
          case typescript_1.default.SyntaxKind.ClassDeclaration:
          case typescript_1.default.SyntaxKind.EnumDeclaration:
          case typescript_1.default.SyntaxKind.TypeAliasDeclaration:
            if (((_c = this.config) === null || _c === void 0 ? void 0 : _c.expose) === "all" || this.isExportType(node) && !this.isGenericType(node)) {
              allTypes.set(this.getFullName(node, typeChecker), node);
              return;
            }
            return;
          case typescript_1.default.SyntaxKind.FunctionDeclaration:
          case typescript_1.default.SyntaxKind.FunctionExpression:
          case typescript_1.default.SyntaxKind.ArrowFunction:
            allTypes.set(`NamedParameters<typeof ${this.getFullName(node, typeChecker)}>`, node);
            return;
          default:
            typescript_1.default.forEachChild(node, (subnode) => this.inspectNode(subnode, typeChecker, allTypes));
            return;
        }
      }
      isExportType(node) {
        var _a;
        if (((_a = this.config) === null || _a === void 0 ? void 0 : _a.jsDoc) !== "none" && (0, hasJsDocTag_1.hasJsDocTag)(node, "internal")) {
          return false;
        }
        const localSymbol = (0, symbolAtNode_1.localSymbolAtNode)(node);
        return localSymbol ? "exportSymbol" in localSymbol : false;
      }
      isGenericType(node) {
        return !!(node.typeParameters && node.typeParameters.length > 0);
      }
      getFullName(node, typeChecker) {
        const symbol = (0, symbolAtNode_1.symbolAtNode)(node);
        return typeChecker.getFullyQualifiedName(symbol).replace(/".*"\./, "");
      }
    };
    exports2.SchemaGenerator = SchemaGenerator;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Error/UnknownTypeError.js
var require_UnknownTypeError = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Error/UnknownTypeError.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UnknownTypeError = void 0;
    var BaseError_12 = require_BaseError();
    var UnknownTypeError = class extends BaseError_12.BaseError {
      constructor(type) {
        super(`Unknown type "${type.getId()}"`);
        this.type = type;
      }
      getType() {
        return this.type;
      }
    };
    exports2.UnknownTypeError = UnknownTypeError;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/ChainTypeFormatter.js
var require_ChainTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/ChainTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ChainTypeFormatter = void 0;
    var UnknownTypeError_1 = require_UnknownTypeError();
    var ChainTypeFormatter = class {
      constructor(typeFormatters) {
        this.typeFormatters = typeFormatters;
      }
      addTypeFormatter(typeFormatter) {
        this.typeFormatters.push(typeFormatter);
        return this;
      }
      supportsType(type) {
        return this.typeFormatters.some((typeFormatter) => typeFormatter.supportsType(type));
      }
      getDefinition(type) {
        return this.getTypeFormatter(type).getDefinition(type);
      }
      getChildren(type) {
        return this.getTypeFormatter(type).getChildren(type);
      }
      getTypeFormatter(type) {
        for (const typeFormatter of this.typeFormatters) {
          if (typeFormatter.supportsType(type)) {
            return typeFormatter;
          }
        }
        throw new UnknownTypeError_1.UnknownTypeError(type);
      }
    };
    exports2.ChainTypeFormatter = ChainTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/uniqueArray.js
var require_uniqueArray = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/uniqueArray.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.uniqueArray = void 0;
    function uniqueArray(array) {
      return array.reduce((result, item) => {
        if (result.indexOf(item) < 0) {
          result.push(item);
        }
        return result;
      }, []);
    }
    exports2.uniqueArray = uniqueArray;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/CircularReferenceTypeFormatter.js
var require_CircularReferenceTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/CircularReferenceTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CircularReferenceTypeFormatter = void 0;
    var uniqueArray_1 = require_uniqueArray();
    var CircularReferenceTypeFormatter = class {
      constructor(childTypeFormatter) {
        this.childTypeFormatter = childTypeFormatter;
        this.definition = /* @__PURE__ */ new Map();
        this.children = /* @__PURE__ */ new Map();
      }
      supportsType(type) {
        return this.childTypeFormatter.supportsType(type);
      }
      getDefinition(type) {
        if (this.definition.has(type)) {
          return this.definition.get(type);
        }
        const definition = {};
        this.definition.set(type, definition);
        Object.assign(definition, this.childTypeFormatter.getDefinition(type));
        return definition;
      }
      getChildren(type) {
        if (this.children.has(type)) {
          return this.children.get(type);
        }
        const children = [];
        this.children.set(type, children);
        children.push(...this.childTypeFormatter.getChildren(type));
        return (0, uniqueArray_1.uniqueArray)(children);
      }
    };
    exports2.CircularReferenceTypeFormatter = CircularReferenceTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/AliasType.js
var require_AliasType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/AliasType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AliasType = void 0;
    var BaseType_1 = require_BaseType();
    var AliasType = class extends BaseType_1.BaseType {
      constructor(id, type) {
        super();
        this.id = id;
        this.type = type;
      }
      getId() {
        return this.id;
      }
      getType() {
        return this.type;
      }
    };
    exports2.AliasType = AliasType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/AliasTypeFormatter.js
var require_AliasTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/AliasTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AliasTypeFormatter = void 0;
    var AliasType_1 = require_AliasType();
    var AliasTypeFormatter = class {
      constructor(childTypeFormatter) {
        this.childTypeFormatter = childTypeFormatter;
      }
      supportsType(type) {
        return type instanceof AliasType_1.AliasType;
      }
      getDefinition(type) {
        return this.childTypeFormatter.getDefinition(type.getType());
      }
      getChildren(type) {
        return this.childTypeFormatter.getChildren(type.getType());
      }
    };
    exports2.AliasTypeFormatter = AliasTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/AnnotatedType.js
var require_AnnotatedType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/AnnotatedType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AnnotatedType = void 0;
    var BaseType_1 = require_BaseType();
    var nodeKey_1 = require_nodeKey();
    var AnnotatedType = class extends BaseType_1.BaseType {
      constructor(type, annotations, nullable) {
        super();
        this.type = type;
        this.annotations = annotations;
        this.nullable = nullable;
      }
      getId() {
        return this.type.getId() + (0, nodeKey_1.hash)([this.isNullable(), this.annotations]);
      }
      getType() {
        return this.type;
      }
      getAnnotations() {
        return this.annotations;
      }
      isNullable() {
        return this.nullable;
      }
    };
    exports2.AnnotatedType = AnnotatedType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/uniqueTypeArray.js
var require_uniqueTypeArray = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/uniqueTypeArray.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.uniqueTypeArray = void 0;
    function uniqueTypeArray(types) {
      const uniqueTypes = /* @__PURE__ */ new Map();
      for (const type of types) {
        uniqueTypes.set(type.getId(), type);
      }
      return Array.from(uniqueTypes.values());
    }
    exports2.uniqueTypeArray = uniqueTypeArray;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/NeverType.js
var require_NeverType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/NeverType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NeverType = void 0;
    var BaseType_1 = require_BaseType();
    var NeverType = class extends BaseType_1.BaseType {
      getId() {
        return "never";
      }
    };
    exports2.NeverType = NeverType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/ReferenceType.js
var require_ReferenceType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/ReferenceType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReferenceType = void 0;
    var BaseType_1 = require_BaseType();
    var ReferenceType = class extends BaseType_1.BaseType {
      constructor() {
        super(...arguments);
        this.type = null;
        this.id = null;
        this.name = null;
      }
      getId() {
        if (this.id == null) {
          throw new Error("Reference type ID not set yet");
        }
        return this.id;
      }
      setId(id) {
        this.id = id;
      }
      getName() {
        if (this.name == null) {
          throw new Error("Reference type name not set yet");
        }
        return this.name;
      }
      setName(name) {
        this.name = name;
      }
      getType() {
        if (this.type == null) {
          throw new Error("Reference type not set yet");
        }
        return this.type;
      }
      hasType() {
        return this.type != null;
      }
      setType(type) {
        this.type = type;
        this.setId(type.getId());
        this.setName(type.getName());
      }
    };
    exports2.ReferenceType = ReferenceType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/derefType.js
var require_derefType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/derefType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.derefAnnotatedType = exports2.derefType = void 0;
    var AliasType_1 = require_AliasType();
    var AnnotatedType_1 = require_AnnotatedType();
    var DefinitionType_1 = require_DefinitionType();
    var ReferenceType_1 = require_ReferenceType();
    function derefType(type) {
      if (type instanceof DefinitionType_1.DefinitionType || type instanceof AliasType_1.AliasType || type instanceof AnnotatedType_1.AnnotatedType) {
        return derefType(type.getType());
      }
      if (type instanceof ReferenceType_1.ReferenceType && type.hasType()) {
        return derefType(type.getType());
      }
      return type;
    }
    exports2.derefType = derefType;
    function derefAnnotatedType(type) {
      if (type instanceof AnnotatedType_1.AnnotatedType || type instanceof AliasType_1.AliasType) {
        return derefAnnotatedType(type.getType());
      }
      return type;
    }
    exports2.derefAnnotatedType = derefAnnotatedType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/UnionType.js
var require_UnionType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/UnionType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UnionType = void 0;
    var BaseType_1 = require_BaseType();
    var uniqueTypeArray_1 = require_uniqueTypeArray();
    var NeverType_1 = require_NeverType();
    var derefType_1 = require_derefType();
    var UnionType = class _UnionType extends BaseType_1.BaseType {
      constructor(types) {
        super();
        this.discriminator = void 0;
        this.types = (0, uniqueTypeArray_1.uniqueTypeArray)(types.reduce((flatTypes, type) => {
          if (type instanceof _UnionType) {
            flatTypes.push(...type.getTypes());
          } else if (!(type instanceof NeverType_1.NeverType)) {
            flatTypes.push(type);
          }
          return flatTypes;
        }, []));
      }
      setDiscriminator(discriminator) {
        this.discriminator = discriminator;
      }
      getDiscriminator() {
        return this.discriminator;
      }
      getId() {
        return `(${this.types.map((type) => type.getId()).join("|")})`;
      }
      getName() {
        return `(${this.types.map((type) => type.getName()).join("|")})`;
      }
      getTypes() {
        return this.types;
      }
      normalize() {
        if (this.types.length === 0) {
          return new NeverType_1.NeverType();
        } else if (this.types.length === 1) {
          return this.types[0];
        } else {
          const union = new _UnionType(this.types.filter((type) => !((0, derefType_1.derefType)(type) instanceof NeverType_1.NeverType)));
          if (union.getTypes().length > 1) {
            return union;
          } else {
            return union.normalize();
          }
        }
      }
    };
    exports2.UnionType = UnionType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/AnnotatedTypeFormatter.js
var require_AnnotatedTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/AnnotatedTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AnnotatedTypeFormatter = exports2.makeNullable = void 0;
    var AnnotatedType_1 = require_AnnotatedType();
    var UnionType_1 = require_UnionType();
    var derefType_1 = require_derefType();
    function makeNullable(def) {
      const union = def.oneOf || def.anyOf;
      if (union && union.filter((d) => d.type === "null").length === 0) {
        union.push({ type: "null" });
      } else if (def.type && def.type !== "object") {
        if (Array.isArray(def.type)) {
          if (def.type.indexOf("null") === -1) {
            def.type.push("null");
          }
        } else if (def.type !== "null") {
          def.type = [def.type, "null"];
        }
        if (def.enum && def.enum.indexOf(null) === -1) {
          def.enum.push(null);
        }
      } else {
        const subdef = {};
        if ("anyOf" in def) {
          for (const d of def.anyOf) {
            if (d.type === "null") {
              return def;
            }
          }
        }
        for (const key of Object.keys(def)) {
          if (key !== "description" && key !== "title" && key !== "default") {
            subdef[key] = def[key];
            delete def[key];
          }
        }
        def.anyOf = [subdef, { type: "null" }];
      }
      return def;
    }
    exports2.makeNullable = makeNullable;
    var AnnotatedTypeFormatter = class {
      constructor(childTypeFormatter) {
        this.childTypeFormatter = childTypeFormatter;
      }
      supportsType(type) {
        return type instanceof AnnotatedType_1.AnnotatedType;
      }
      getDefinition(type) {
        const annotations = type.getAnnotations();
        if ("discriminator" in annotations) {
          const derefed = (0, derefType_1.derefType)(type.getType());
          if (derefed instanceof UnionType_1.UnionType) {
            derefed.setDiscriminator(annotations.discriminator);
            delete annotations.discriminator;
          } else {
            throw new Error(`Cannot assign discriminator tag to type: ${JSON.stringify(derefed)}. This tag can only be assigned to union types.`);
          }
        }
        const def = {
          ...this.childTypeFormatter.getDefinition(type.getType()),
          ...type.getAnnotations()
        };
        if ("$ref" in def && "type" in def) {
          delete def["$ref"];
        }
        if (type.isNullable()) {
          return makeNullable(def);
        }
        return def;
      }
      getChildren(type) {
        return this.childTypeFormatter.getChildren(type.getType());
      }
    };
    exports2.AnnotatedTypeFormatter = AnnotatedTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/AnyType.js
var require_AnyType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/AnyType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AnyType = void 0;
    var BaseType_1 = require_BaseType();
    var AnyType = class extends BaseType_1.BaseType {
      getId() {
        return "any";
      }
    };
    exports2.AnyType = AnyType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/AnyTypeFormatter.js
var require_AnyTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/AnyTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AnyTypeFormatter = void 0;
    var AnyType_1 = require_AnyType();
    var AnyTypeFormatter = class {
      supportsType(type) {
        return type instanceof AnyType_1.AnyType;
      }
      getDefinition(type) {
        return {};
      }
      getChildren(type) {
        return [];
      }
    };
    exports2.AnyTypeFormatter = AnyTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/ArrayType.js
var require_ArrayType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/ArrayType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ArrayType = void 0;
    var BaseType_1 = require_BaseType();
    var ArrayType = class extends BaseType_1.BaseType {
      constructor(item) {
        super();
        this.item = item;
      }
      getId() {
        return `${this.item.getId()}[]`;
      }
      getItem() {
        return this.item;
      }
    };
    exports2.ArrayType = ArrayType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/ArrayTypeFormatter.js
var require_ArrayTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/ArrayTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ArrayTypeFormatter = void 0;
    var ArrayType_1 = require_ArrayType();
    var ArrayTypeFormatter = class {
      constructor(childTypeFormatter) {
        this.childTypeFormatter = childTypeFormatter;
      }
      supportsType(type) {
        return type instanceof ArrayType_1.ArrayType;
      }
      getDefinition(type) {
        return {
          type: "array",
          items: this.childTypeFormatter.getDefinition(type.getItem())
        };
      }
      getChildren(type) {
        return this.childTypeFormatter.getChildren(type.getItem());
      }
    };
    exports2.ArrayTypeFormatter = ArrayTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/PrimitiveType.js
var require_PrimitiveType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/PrimitiveType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PrimitiveType = void 0;
    var BaseType_1 = require_BaseType();
    var PrimitiveType = class extends BaseType_1.BaseType {
    };
    exports2.PrimitiveType = PrimitiveType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/BooleanType.js
var require_BooleanType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/BooleanType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BooleanType = void 0;
    var PrimitiveType_1 = require_PrimitiveType();
    var BooleanType = class extends PrimitiveType_1.PrimitiveType {
      getId() {
        return "boolean";
      }
    };
    exports2.BooleanType = BooleanType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/BooleanTypeFormatter.js
var require_BooleanTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/BooleanTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BooleanTypeFormatter = void 0;
    var BooleanType_1 = require_BooleanType();
    var BooleanTypeFormatter = class {
      supportsType(type) {
        return type instanceof BooleanType_1.BooleanType;
      }
      getDefinition(type) {
        return { type: "boolean" };
      }
      getChildren(type) {
        return [];
      }
    };
    exports2.BooleanTypeFormatter = BooleanTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/DefinitionTypeFormatter.js
var require_DefinitionTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/DefinitionTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DefinitionTypeFormatter = void 0;
    var DefinitionType_1 = require_DefinitionType();
    var uniqueArray_1 = require_uniqueArray();
    var DefinitionTypeFormatter = class {
      constructor(childTypeFormatter, encodeRefs) {
        this.childTypeFormatter = childTypeFormatter;
        this.encodeRefs = encodeRefs;
      }
      supportsType(type) {
        return type instanceof DefinitionType_1.DefinitionType;
      }
      getDefinition(type) {
        const ref = type.getName();
        return { $ref: `#/definitions/${this.encodeRefs ? encodeURIComponent(ref) : ref}` };
      }
      getChildren(type) {
        return (0, uniqueArray_1.uniqueArray)([type, ...this.childTypeFormatter.getChildren(type.getType())]);
      }
    };
    exports2.DefinitionTypeFormatter = DefinitionTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/LiteralType.js
var require_LiteralType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/LiteralType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LiteralType = void 0;
    var BaseType_1 = require_BaseType();
    var LiteralType = class extends BaseType_1.BaseType {
      constructor(value) {
        super();
        this.value = value;
      }
      getId() {
        return JSON.stringify(this.value);
      }
      getValue() {
        return this.value;
      }
    };
    exports2.LiteralType = LiteralType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/NullType.js
var require_NullType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/NullType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NullType = void 0;
    var PrimitiveType_1 = require_PrimitiveType();
    var NullType = class extends PrimitiveType_1.PrimitiveType {
      getId() {
        return "null";
      }
    };
    exports2.NullType = NullType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/EnumType.js
var require_EnumType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/EnumType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EnumType = void 0;
    var BaseType_1 = require_BaseType();
    var LiteralType_1 = require_LiteralType();
    var NullType_1 = require_NullType();
    var EnumType = class extends BaseType_1.BaseType {
      constructor(id, values) {
        super();
        this.id = id;
        this.values = values;
        this.types = values.map((value) => value == null ? new NullType_1.NullType() : new LiteralType_1.LiteralType(value));
      }
      getId() {
        return this.id;
      }
      getValues() {
        return this.values;
      }
      getTypes() {
        return this.types;
      }
    };
    exports2.EnumType = EnumType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/typeName.js
var require_typeName = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/typeName.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.typeName = void 0;
    function typeName(value) {
      if (value === null) {
        return "null";
      }
      const type = typeof value;
      if (type === "string" || type === "number" || type === "boolean") {
        return type;
      }
      if (Array.isArray(value)) {
        return "array";
      } else if (type === "object") {
        return "object";
      } else {
        throw new Error(`JavaScript type "${type}" can't be converted to JSON type name`);
      }
    }
    exports2.typeName = typeName;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/EnumTypeFormatter.js
var require_EnumTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/EnumTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EnumTypeFormatter = void 0;
    var EnumType_1 = require_EnumType();
    var typeName_1 = require_typeName();
    var uniqueArray_1 = require_uniqueArray();
    var EnumTypeFormatter = class {
      supportsType(type) {
        return type instanceof EnumType_1.EnumType;
      }
      getDefinition(type) {
        const values = (0, uniqueArray_1.uniqueArray)(type.getValues());
        const types = (0, uniqueArray_1.uniqueArray)(values.map(typeName_1.typeName));
        return values.length === 1 ? { type: types[0], const: values[0] } : { type: types.length === 1 ? types[0] : types, enum: values };
      }
      getChildren(type) {
        return [];
      }
    };
    exports2.EnumTypeFormatter = EnumTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/HiddenType.js
var require_HiddenType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/HiddenType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.HiddenType = void 0;
    var NeverType_1 = require_NeverType();
    var HiddenType = class extends NeverType_1.NeverType {
      getId() {
        return "hidden";
      }
    };
    exports2.HiddenType = HiddenType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/HiddenTypeFormatter.js
var require_HiddenTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/HiddenTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.HiddenTypeFormatter = void 0;
    var HiddenType_1 = require_HiddenType();
    var HiddenTypeFormatter = class {
      supportsType(type) {
        return type instanceof HiddenType_1.HiddenType;
      }
      getDefinition(type) {
        return { additionalProperties: false };
      }
      getChildren(type) {
        return [];
      }
    };
    exports2.HiddenTypeFormatter = HiddenTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/IntersectionType.js
var require_IntersectionType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/IntersectionType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IntersectionType = void 0;
    var BaseType_1 = require_BaseType();
    var IntersectionType = class extends BaseType_1.BaseType {
      constructor(types) {
        super();
        this.types = types;
      }
      getId() {
        return `(${this.types.map((type) => type.getId()).join("&")})`;
      }
      getTypes() {
        return this.types;
      }
    };
    exports2.IntersectionType = IntersectionType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/RestType.js
var require_RestType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/RestType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RestType = void 0;
    var BaseType_1 = require_BaseType();
    var RestType = class extends BaseType_1.BaseType {
      constructor(item, title = null) {
        super();
        this.item = item;
        this.title = title;
      }
      getId() {
        return `...${this.item.getId()}${this.title || ""}`;
      }
      getTitle() {
        return this.title;
      }
      getType() {
        return this.item;
      }
    };
    exports2.RestType = RestType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/TupleType.js
var require_TupleType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/TupleType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TupleType = void 0;
    var derefType_1 = require_derefType();
    var BaseType_1 = require_BaseType();
    var RestType_1 = require_RestType();
    function normalize(types) {
      let normalized = [];
      for (const type of types) {
        if (type instanceof RestType_1.RestType) {
          const inner_type = (0, derefType_1.derefType)(type.getType());
          normalized = [
            ...normalized,
            ...inner_type instanceof TupleType ? normalize(inner_type.getTypes()) : [type]
          ];
        } else {
          normalized.push(type);
        }
      }
      return normalized;
    }
    var TupleType = class extends BaseType_1.BaseType {
      constructor(types) {
        super();
        this.types = normalize(types);
      }
      getId() {
        return `[${this.types.map((item) => {
          var _a;
          return (_a = item === null || item === void 0 ? void 0 : item.getId()) !== null && _a !== void 0 ? _a : "never";
        }).join(",")}]`;
      }
      getTypes() {
        return this.types;
      }
    };
    exports2.TupleType = TupleType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/intersectionOfArrays.js
var require_intersectionOfArrays = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/intersectionOfArrays.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.intersectionOfArrays = void 0;
    var safe_stable_stringify_12 = __importDefault2(require_safe_stable_stringify());
    function intersectionOfArrays(a, b) {
      const output = [];
      const inA = new Set(a.map((item) => (0, safe_stable_stringify_12.default)(item)));
      for (const value of b) {
        if (inA.has((0, safe_stable_stringify_12.default)(value))) {
          output.push(value);
        }
      }
      return output;
    }
    exports2.intersectionOfArrays = intersectionOfArrays;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/deepMerge.js
var require_deepMerge = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/deepMerge.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.deepMerge = void 0;
    var intersectionOfArrays_1 = require_intersectionOfArrays();
    function deepMerge(a, b) {
      const output = { ...a, ...b };
      for (const key in a) {
        if (b.hasOwnProperty(key)) {
          const elementA = a[key];
          const elementB = b[key];
          if (elementA != null && elementB != null && typeof elementA === "object" && typeof elementB === "object" && "type" in elementA && "type" in elementB) {
            if (elementA.type == elementB.type) {
              const enums = mergeConstsAndEnums(elementA, elementB);
              if (enums != null) {
                const isSingle = enums.length === 1;
                output[key][isSingle ? "const" : "enum"] = isSingle ? enums[0] : enums;
                delete output[key][isSingle ? "enum" : "const"];
              }
            }
          }
        }
      }
      return output;
    }
    exports2.deepMerge = deepMerge;
    function mergeConstsAndEnums(a, b) {
      const enumA = a.const !== void 0 ? [a.const] : a.enum;
      const enumB = b.const !== void 0 ? [b.const] : b.enum;
      if (enumA == null && enumB != null) {
        return enumB;
      } else if (enumA != null && enumB == null) {
        return enumA;
      } else if (enumA != null && enumB != null) {
        return (0, intersectionOfArrays_1.intersectionOfArrays)(enumA, enumB);
      } else {
        return void 0;
      }
    }
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/allOfDefinition.js
var require_allOfDefinition = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/allOfDefinition.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getAllOfDefinitionReducer = void 0;
    var uniqueArray_1 = require_uniqueArray();
    var deepMerge_1 = require_deepMerge();
    var derefType_1 = require_derefType();
    function getAllOfDefinitionReducer(childTypeFormatter) {
      return (definition, baseType) => {
        const other = childTypeFormatter.getDefinition((0, derefType_1.derefType)(baseType));
        definition.properties = (0, deepMerge_1.deepMerge)(other.properties || {}, definition.properties || {});
        function additionalPropsDefinition(props) {
          return props !== void 0 && props !== true;
        }
        if (additionalPropsDefinition(definition.additionalProperties) && additionalPropsDefinition(other.additionalProperties)) {
          let additionalProps = [];
          let additionalTypes = [];
          const addAdditionalProps = (addProps) => {
            if (addProps) {
              if (addProps.anyOf) {
                for (const prop of addProps.anyOf) {
                  if (prop.type) {
                    additionalTypes = additionalTypes.concat(Array.isArray(prop.type) ? prop.type : [prop.type]);
                  } else {
                    additionalProps.push(prop);
                  }
                }
              } else if (addProps.type) {
                additionalTypes = additionalTypes.concat(Array.isArray(addProps.type) ? addProps.type : [addProps.type]);
              } else {
                additionalProps.push(addProps);
              }
            }
          };
          addAdditionalProps(definition.additionalProperties);
          addAdditionalProps(other.additionalProperties);
          additionalTypes = (0, uniqueArray_1.uniqueArray)(additionalTypes);
          additionalProps = (0, uniqueArray_1.uniqueArray)(additionalProps);
          if (additionalTypes.length > 1) {
            additionalProps.push({
              type: additionalTypes
            });
          } else if (additionalTypes.length === 1) {
            additionalProps.push({
              type: additionalTypes[0]
            });
          }
          if (additionalProps.length > 1) {
            definition.additionalProperties = {
              anyOf: additionalProps
            };
          } else if (additionalProps.length === 1) {
            if (Object.keys(additionalProps[0]).length === 0) {
              delete definition.additionalProperties;
            } else {
              definition.additionalProperties = additionalProps[0];
            }
          } else {
            definition.additionalProperties = false;
          }
        }
        if (other.required) {
          definition.required = (0, uniqueArray_1.uniqueArray)((definition.required || []).concat(other.required)).sort();
        }
        if ((other.additionalProperties || other.additionalProperties === void 0) && definition.additionalProperties == false) {
          delete definition.additionalProperties;
        }
        return definition;
      };
    }
    exports2.getAllOfDefinitionReducer = getAllOfDefinitionReducer;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/IntersectionTypeFormatter.js
var require_IntersectionTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/IntersectionTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IntersectionTypeFormatter = void 0;
    var ArrayType_1 = require_ArrayType();
    var IntersectionType_1 = require_IntersectionType();
    var TupleType_1 = require_TupleType();
    var allOfDefinition_1 = require_allOfDefinition();
    var uniqueArray_1 = require_uniqueArray();
    var IntersectionTypeFormatter = class {
      constructor(childTypeFormatter) {
        this.childTypeFormatter = childTypeFormatter;
      }
      supportsType(type) {
        return type instanceof IntersectionType_1.IntersectionType;
      }
      getDefinition(type) {
        const dependencies = [];
        const nonArrayLikeTypes = [];
        for (const t of type.getTypes()) {
          if (t instanceof ArrayType_1.ArrayType || t instanceof TupleType_1.TupleType) {
            dependencies.push(this.childTypeFormatter.getDefinition(t));
          } else {
            nonArrayLikeTypes.push(t);
          }
        }
        if (nonArrayLikeTypes.length) {
          dependencies.push(nonArrayLikeTypes.reduce((0, allOfDefinition_1.getAllOfDefinitionReducer)(this.childTypeFormatter), {
            type: "object",
            additionalProperties: false
          }));
        }
        return dependencies.length === 1 ? dependencies[0] : { allOf: dependencies };
      }
      getChildren(type) {
        return (0, uniqueArray_1.uniqueArray)(type.getTypes().reduce((result, item) => [...result, ...this.childTypeFormatter.getChildren(item)], []));
      }
    };
    exports2.IntersectionTypeFormatter = IntersectionTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/LiteralTypeFormatter.js
var require_LiteralTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/LiteralTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LiteralTypeFormatter = void 0;
    var LiteralType_1 = require_LiteralType();
    var typeName_1 = require_typeName();
    var LiteralTypeFormatter = class {
      supportsType(type) {
        return type instanceof LiteralType_1.LiteralType;
      }
      getDefinition(type) {
        return {
          type: (0, typeName_1.typeName)(type.getValue()),
          const: type.getValue()
        };
      }
      getChildren(type) {
        return [];
      }
    };
    exports2.LiteralTypeFormatter = LiteralTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/LiteralUnionTypeFormatter.js
var require_LiteralUnionTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/LiteralUnionTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LiteralUnionTypeFormatter = void 0;
    var LiteralType_1 = require_LiteralType();
    var NullType_1 = require_NullType();
    var UnionType_1 = require_UnionType();
    var typeName_1 = require_typeName();
    var uniqueArray_1 = require_uniqueArray();
    var LiteralUnionTypeFormatter = class {
      supportsType(type) {
        return type instanceof UnionType_1.UnionType && type.getTypes().length > 0 && this.isLiteralUnion(type);
      }
      getDefinition(type) {
        const values = (0, uniqueArray_1.uniqueArray)(type.getTypes().map((item) => this.getLiteralValue(item)));
        const types = (0, uniqueArray_1.uniqueArray)(type.getTypes().map((item) => this.getLiteralType(item)));
        if (types.length === 1) {
          return {
            type: types[0],
            enum: values
          };
        } else {
          return {
            type: types,
            enum: values
          };
        }
      }
      getChildren(type) {
        return [];
      }
      isLiteralUnion(type) {
        return type.getTypes().every((item) => item instanceof LiteralType_1.LiteralType || item instanceof NullType_1.NullType);
      }
      getLiteralValue(value) {
        return value instanceof LiteralType_1.LiteralType ? value.getValue() : null;
      }
      getLiteralType(value) {
        return value instanceof LiteralType_1.LiteralType ? (0, typeName_1.typeName)(value.getValue()) : "null";
      }
    };
    exports2.LiteralUnionTypeFormatter = LiteralUnionTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/NeverTypeFormatter.js
var require_NeverTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/NeverTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NeverTypeFormatter = void 0;
    var NeverType_1 = require_NeverType();
    var NeverTypeFormatter = class {
      supportsType(type) {
        return type instanceof NeverType_1.NeverType;
      }
      getDefinition(type) {
        return { not: {} };
      }
      getChildren(type) {
        return [];
      }
    };
    exports2.NeverTypeFormatter = NeverTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/NullTypeFormatter.js
var require_NullTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/NullTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NullTypeFormatter = void 0;
    var NullType_1 = require_NullType();
    var NullTypeFormatter = class {
      supportsType(type) {
        return type instanceof NullType_1.NullType;
      }
      getDefinition(type) {
        return { type: "null" };
      }
      getChildren(type) {
        return [];
      }
    };
    exports2.NullTypeFormatter = NullTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/NumberType.js
var require_NumberType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/NumberType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NumberType = void 0;
    var PrimitiveType_1 = require_PrimitiveType();
    var NumberType = class extends PrimitiveType_1.PrimitiveType {
      getId() {
        return "number";
      }
    };
    exports2.NumberType = NumberType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/NumberTypeFormatter.js
var require_NumberTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/NumberTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NumberTypeFormatter = void 0;
    var NumberType_1 = require_NumberType();
    var NumberTypeFormatter = class {
      supportsType(type) {
        return type instanceof NumberType_1.NumberType;
      }
      getDefinition(type) {
        return { type: "number" };
      }
      getChildren(type) {
        return [];
      }
    };
    exports2.NumberTypeFormatter = NumberTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/SymbolType.js
var require_SymbolType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/SymbolType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SymbolType = void 0;
    var PrimitiveType_1 = require_PrimitiveType();
    var SymbolType = class extends PrimitiveType_1.PrimitiveType {
      getId() {
        return "symbol";
      }
    };
    exports2.SymbolType = SymbolType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/String.js
var require_String = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/String.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.strip = void 0;
    var quotes = /* @__PURE__ */ new Set(["'", '"']);
    function strip(input, chars = quotes) {
      const length = input.length;
      const start = input.charAt(0);
      const end = input.charAt(length - 1);
      if (length >= 2 && start === end && chars.has(start)) {
        return input.substring(1, length - 1);
      }
      return input;
    }
    exports2.strip = strip;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/ObjectType.js
var require_ObjectType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/ObjectType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ObjectType = exports2.ObjectProperty = void 0;
    var BaseType_1 = require_BaseType();
    var String_1 = require_String();
    var ObjectProperty = class {
      constructor(name, type, required) {
        this.name = name;
        this.type = type;
        this.required = required;
      }
      getName() {
        return (0, String_1.strip)(this.name);
      }
      getType() {
        return this.type;
      }
      isRequired() {
        return this.required;
      }
    };
    exports2.ObjectProperty = ObjectProperty;
    var ObjectType = class extends BaseType_1.BaseType {
      constructor(id, baseTypes, properties, additionalProperties, nonPrimitive = false) {
        super();
        this.id = id;
        this.baseTypes = baseTypes;
        this.properties = properties;
        this.additionalProperties = additionalProperties;
        this.nonPrimitive = nonPrimitive;
      }
      getId() {
        return this.id;
      }
      getBaseTypes() {
        return this.baseTypes;
      }
      getProperties() {
        return this.properties;
      }
      getAdditionalProperties() {
        return this.additionalProperties;
      }
      getNonPrimitive() {
        return this.nonPrimitive;
      }
    };
    exports2.ObjectType = ObjectType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/UndefinedType.js
var require_UndefinedType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/UndefinedType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UndefinedType = void 0;
    var BaseType_1 = require_BaseType();
    var UndefinedType = class extends BaseType_1.BaseType {
      getId() {
        return "undefined";
      }
    };
    exports2.UndefinedType = UndefinedType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/preserveAnnotation.js
var require_preserveAnnotation = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/preserveAnnotation.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.preserveAnnotation = void 0;
    var AnnotatedType_1 = require_AnnotatedType();
    function preserveAnnotation(originalType, newType) {
      if (originalType instanceof AnnotatedType_1.AnnotatedType) {
        return new AnnotatedType_1.AnnotatedType(newType, originalType.getAnnotations(), originalType.isNullable());
      }
      return newType;
    }
    exports2.preserveAnnotation = preserveAnnotation;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/removeUndefined.js
var require_removeUndefined = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/removeUndefined.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.removeUndefined = void 0;
    var UndefinedType_1 = require_UndefinedType();
    var UnionType_1 = require_UnionType();
    var derefType_1 = require_derefType();
    var preserveAnnotation_1 = require_preserveAnnotation();
    function removeUndefined(propertyType) {
      const types = [];
      let numRemoved = 0;
      for (const type of propertyType.getTypes()) {
        const newType2 = (0, derefType_1.derefAnnotatedType)(type);
        if (newType2 instanceof UndefinedType_1.UndefinedType) {
          numRemoved += 1;
        } else if (newType2 instanceof UnionType_1.UnionType) {
          const result = removeUndefined(newType2);
          numRemoved += result.numRemoved;
          types.push((0, preserveAnnotation_1.preserveAnnotation)(type, result.newType));
        } else {
          types.push(type);
        }
      }
      const newType = types.length == 0 ? new UndefinedType_1.UndefinedType() : types.length == 1 ? types[0] : new UnionType_1.UnionType(types);
      return {
        numRemoved,
        newType
      };
    }
    exports2.removeUndefined = removeUndefined;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/ObjectTypeFormatter.js
var require_ObjectTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/ObjectTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ObjectTypeFormatter = void 0;
    var AnyType_1 = require_AnyType();
    var SymbolType_1 = require_SymbolType();
    var BaseType_1 = require_BaseType();
    var ObjectType_1 = require_ObjectType();
    var UndefinedType_1 = require_UndefinedType();
    var UnionType_1 = require_UnionType();
    var allOfDefinition_1 = require_allOfDefinition();
    var derefType_1 = require_derefType();
    var preserveAnnotation_1 = require_preserveAnnotation();
    var removeUndefined_1 = require_removeUndefined();
    var uniqueArray_1 = require_uniqueArray();
    var NeverType_1 = require_NeverType();
    var ObjectTypeFormatter = class {
      constructor(childTypeFormatter) {
        this.childTypeFormatter = childTypeFormatter;
      }
      supportsType(type) {
        return type instanceof ObjectType_1.ObjectType;
      }
      getDefinition(type) {
        const types = type.getBaseTypes();
        if (types.length === 0) {
          return this.getObjectDefinition(type);
        }
        return types.reduce((0, allOfDefinition_1.getAllOfDefinitionReducer)(this.childTypeFormatter), this.getObjectDefinition(type));
      }
      getChildren(type) {
        const properties = type.getProperties();
        const additionalProperties = type.getAdditionalProperties();
        const childrenOfBase = type.getBaseTypes().reduce((result, baseType) => [...result, ...this.childTypeFormatter.getChildren(baseType)], []);
        const childrenOfAdditionalProps = additionalProperties instanceof BaseType_1.BaseType ? this.childTypeFormatter.getChildren(additionalProperties) : [];
        const childrenOfProps = properties.reduce((result, property) => {
          const propertyType = property.getType();
          if (propertyType instanceof NeverType_1.NeverType) {
            return result;
          }
          return [...result, ...this.childTypeFormatter.getChildren(propertyType)];
        }, []);
        const children = [...childrenOfBase, ...childrenOfAdditionalProps, ...childrenOfProps];
        return (0, uniqueArray_1.uniqueArray)(children);
      }
      getObjectDefinition(type) {
        let objectProperties = type.getProperties();
        const additionalProperties = type.getAdditionalProperties();
        if (additionalProperties === false) {
          objectProperties = objectProperties.filter((property) => !((0, derefType_1.derefType)(property.getType()) instanceof NeverType_1.NeverType));
        }
        const preparedProperties = objectProperties.map((property) => this.prepareObjectProperty(property));
        const required = preparedProperties.filter((property) => property.isRequired()).map((property) => property.getName());
        const properties = preparedProperties.reduce((result, property) => {
          result[property.getName()] = this.childTypeFormatter.getDefinition(property.getType());
          return result;
        }, {});
        return {
          type: "object",
          ...Object.keys(properties).length > 0 ? { properties } : {},
          ...required.length > 0 ? { required } : {},
          ...additionalProperties === true || additionalProperties instanceof AnyType_1.AnyType || additionalProperties instanceof SymbolType_1.SymbolType ? {} : {
            additionalProperties: additionalProperties instanceof BaseType_1.BaseType ? this.childTypeFormatter.getDefinition(additionalProperties) : additionalProperties
          }
        };
      }
      prepareObjectProperty(property) {
        const propertyType = property.getType();
        const propType = (0, derefType_1.derefType)(propertyType);
        if (propType instanceof UndefinedType_1.UndefinedType) {
          return new ObjectType_1.ObjectProperty(property.getName(), propertyType, false);
        } else if (!(propType instanceof UnionType_1.UnionType)) {
          return property;
        }
        const { newType: newPropType, numRemoved } = (0, removeUndefined_1.removeUndefined)(propType);
        if (numRemoved == 0) {
          return property;
        }
        return new ObjectType_1.ObjectProperty(property.getName(), (0, preserveAnnotation_1.preserveAnnotation)(propertyType, newPropType), false);
      }
    };
    exports2.ObjectTypeFormatter = ObjectTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/OptionalType.js
var require_OptionalType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/OptionalType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.OptionalType = void 0;
    var BaseType_1 = require_BaseType();
    var OptionalType = class extends BaseType_1.BaseType {
      constructor(item) {
        super();
        this.item = item;
      }
      getId() {
        return `${this.item.getId()}?`;
      }
      getType() {
        return this.item;
      }
    };
    exports2.OptionalType = OptionalType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/OptionalTypeFormatter.js
var require_OptionalTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/OptionalTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.OptionalTypeFormatter = void 0;
    var OptionalType_1 = require_OptionalType();
    var OptionalTypeFormatter = class {
      constructor(childTypeFormatter) {
        this.childTypeFormatter = childTypeFormatter;
      }
      supportsType(type) {
        return type instanceof OptionalType_1.OptionalType;
      }
      getDefinition(type) {
        return this.childTypeFormatter.getDefinition(type.getType());
      }
      getChildren(type) {
        return this.childTypeFormatter.getChildren(type.getType());
      }
    };
    exports2.OptionalTypeFormatter = OptionalTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Error/LogicError.js
var require_LogicError = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Error/LogicError.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LogicError = void 0;
    var BaseError_12 = require_BaseError();
    var LogicError = class extends BaseError_12.BaseError {
      constructor(msg) {
        super(msg);
        this.msg = msg;
      }
    };
    exports2.LogicError = LogicError;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/StringType.js
var require_StringType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/StringType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StringType = void 0;
    var PrimitiveType_1 = require_PrimitiveType();
    var StringType = class extends PrimitiveType_1.PrimitiveType {
      getId() {
        return "string";
      }
    };
    exports2.StringType = StringType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/PrimitiveUnionTypeFormatter.js
var require_PrimitiveUnionTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/PrimitiveUnionTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PrimitiveUnionTypeFormatter = void 0;
    var LogicError_1 = require_LogicError();
    var BooleanType_1 = require_BooleanType();
    var NullType_1 = require_NullType();
    var NumberType_1 = require_NumberType();
    var PrimitiveType_1 = require_PrimitiveType();
    var StringType_1 = require_StringType();
    var UnionType_1 = require_UnionType();
    var uniqueArray_1 = require_uniqueArray();
    var PrimitiveUnionTypeFormatter = class {
      supportsType(type) {
        return type instanceof UnionType_1.UnionType && type.getTypes().length > 0 && this.isPrimitiveUnion(type);
      }
      getDefinition(type) {
        return {
          type: (0, uniqueArray_1.uniqueArray)(type.getTypes().map((item) => this.getPrimitiveType(item)))
        };
      }
      getChildren(type) {
        return [];
      }
      isPrimitiveUnion(type) {
        return type.getTypes().every((item) => item instanceof PrimitiveType_1.PrimitiveType);
      }
      getPrimitiveType(item) {
        if (item instanceof StringType_1.StringType) {
          return "string";
        } else if (item instanceof NumberType_1.NumberType) {
          return "number";
        } else if (item instanceof BooleanType_1.BooleanType) {
          return "boolean";
        } else if (item instanceof NullType_1.NullType) {
          return "null";
        }
        throw new LogicError_1.LogicError("Unexpected code branch");
      }
    };
    exports2.PrimitiveUnionTypeFormatter = PrimitiveUnionTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/ReferenceTypeFormatter.js
var require_ReferenceTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/ReferenceTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReferenceTypeFormatter = void 0;
    var DefinitionType_1 = require_DefinitionType();
    var ReferenceType_1 = require_ReferenceType();
    var ReferenceTypeFormatter = class {
      constructor(childTypeFormatter, encodeRefs) {
        this.childTypeFormatter = childTypeFormatter;
        this.encodeRefs = encodeRefs;
      }
      supportsType(type) {
        return type instanceof ReferenceType_1.ReferenceType;
      }
      getDefinition(type) {
        const ref = type.getName();
        return { $ref: `#/definitions/${this.encodeRefs ? encodeURIComponent(ref) : ref}` };
      }
      getChildren(type) {
        const referredType = type.getType();
        if (referredType instanceof DefinitionType_1.DefinitionType) {
          return this.childTypeFormatter.getChildren(referredType);
        }
        return this.childTypeFormatter.getChildren(new DefinitionType_1.DefinitionType(type.getName(), type.getType()));
      }
    };
    exports2.ReferenceTypeFormatter = ReferenceTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/RestTypeFormatter.js
var require_RestTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/RestTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RestTypeFormatter = void 0;
    var RestType_1 = require_RestType();
    var RestTypeFormatter = class {
      constructor(childTypeFormatter) {
        this.childTypeFormatter = childTypeFormatter;
      }
      supportsType(type) {
        return type instanceof RestType_1.RestType;
      }
      getDefinition(type) {
        const definition = this.childTypeFormatter.getDefinition(type.getType());
        const title = type.getTitle();
        if (title !== null && typeof definition.items === "object") {
          return { ...definition, items: { ...definition.items, title } };
        }
        return definition;
      }
      getChildren(type) {
        return this.childTypeFormatter.getChildren(type.getType());
      }
    };
    exports2.RestTypeFormatter = RestTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/StringTypeFormatter.js
var require_StringTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/StringTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StringTypeFormatter = void 0;
    var StringType_1 = require_StringType();
    var StringTypeFormatter = class {
      supportsType(type) {
        return type instanceof StringType_1.StringType;
      }
      getDefinition(type) {
        return { type: "string" };
      }
      getChildren(type) {
        return [];
      }
    };
    exports2.StringTypeFormatter = StringTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/SymbolTypeFormatter.js
var require_SymbolTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/SymbolTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SymbolTypeFormatter = void 0;
    var SymbolType_1 = require_SymbolType();
    var SymbolTypeFormatter = class {
      supportsType(type) {
        return type instanceof SymbolType_1.SymbolType;
      }
      getDefinition(type) {
        return {};
      }
      getChildren(type) {
        return [];
      }
    };
    exports2.SymbolTypeFormatter = SymbolTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/notNever.js
var require_notNever = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/notNever.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.notNever = void 0;
    var NeverType_1 = require_NeverType();
    function notNever(x) {
      return !(x instanceof NeverType_1.NeverType);
    }
    exports2.notNever = notNever;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/TupleTypeFormatter.js
var require_TupleTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/TupleTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TupleTypeFormatter = void 0;
    var ArrayType_1 = require_ArrayType();
    var OptionalType_1 = require_OptionalType();
    var RestType_1 = require_RestType();
    var TupleType_1 = require_TupleType();
    var notNever_1 = require_notNever();
    var uniqueArray_1 = require_uniqueArray();
    function uniformRestType(type, check_type) {
      const inner = type.getType();
      return inner instanceof ArrayType_1.ArrayType && inner.getItem().getId() === check_type.getId() || inner instanceof TupleType_1.TupleType && inner.getTypes().every((tuple_type) => {
        if (tuple_type instanceof RestType_1.RestType) {
          return uniformRestType(tuple_type, check_type);
        } else {
          return (tuple_type === null || tuple_type === void 0 ? void 0 : tuple_type.getId()) === check_type.getId();
        }
      });
    }
    var TupleTypeFormatter = class {
      constructor(childTypeFormatter) {
        this.childTypeFormatter = childTypeFormatter;
      }
      supportsType(type) {
        return type instanceof TupleType_1.TupleType;
      }
      getDefinition(type) {
        var _a;
        const subTypes = type.getTypes().filter(notNever_1.notNever);
        const requiredElements = subTypes.filter((t) => !(t instanceof OptionalType_1.OptionalType) && !(t instanceof RestType_1.RestType));
        const optionalElements = subTypes.filter((t) => t instanceof OptionalType_1.OptionalType);
        const restType = subTypes.find((t) => t instanceof RestType_1.RestType);
        const firstItemType = requiredElements.length > 0 ? requiredElements[0] : (_a = optionalElements[0]) === null || _a === void 0 ? void 0 : _a.getType();
        const isUniformArray = firstItemType && requiredElements.every((item) => item.getId() === firstItemType.getId()) && optionalElements.every((item) => item.getType().getId() === firstItemType.getId()) && (!restType || uniformRestType(restType, firstItemType));
        if (isUniformArray) {
          return {
            type: "array",
            items: this.childTypeFormatter.getDefinition(firstItemType),
            minItems: requiredElements.length,
            ...restType ? {} : { maxItems: requiredElements.length + optionalElements.length }
          };
        }
        const requiredDefinitions = requiredElements.map((item) => this.childTypeFormatter.getDefinition(item));
        const optionalDefinitions = optionalElements.map((item) => this.childTypeFormatter.getDefinition(item));
        const itemsTotal = requiredDefinitions.length + optionalDefinitions.length;
        const additionalItems = restType ? this.childTypeFormatter.getDefinition(restType).items : void 0;
        return {
          type: "array",
          minItems: requiredDefinitions.length,
          ...itemsTotal ? { items: requiredDefinitions.concat(optionalDefinitions) } : {},
          ...!itemsTotal && additionalItems ? { items: additionalItems } : {},
          ...!itemsTotal && !additionalItems ? { maxItems: 0 } : {},
          ...additionalItems && !Array.isArray(additionalItems) && itemsTotal ? { additionalItems } : {},
          ...!additionalItems && itemsTotal ? { maxItems: itemsTotal } : {}
        };
      }
      getChildren(type) {
        return (0, uniqueArray_1.uniqueArray)(type.getTypes().filter(notNever_1.notNever).reduce((result, item) => [...result, ...this.childTypeFormatter.getChildren(item)], []));
      }
    };
    exports2.TupleTypeFormatter = TupleTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/UndefinedTypeFormatter.js
var require_UndefinedTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/UndefinedTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UndefinedTypeFormatter = void 0;
    var UndefinedType_1 = require_UndefinedType();
    var UndefinedTypeFormatter = class {
      supportsType(type) {
        return type instanceof UndefinedType_1.UndefinedType;
      }
      getDefinition(type) {
        return { not: {} };
      }
      getChildren(type) {
        return [];
      }
    };
    exports2.UndefinedTypeFormatter = UndefinedTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/IntersectionNodeParser.js
var require_IntersectionNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/IntersectionNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.translate = exports2.IntersectionNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var IntersectionType_1 = require_IntersectionType();
    var PrimitiveType_1 = require_PrimitiveType();
    var UnionType_1 = require_UnionType();
    var derefType_1 = require_derefType();
    var uniqueTypeArray_1 = require_uniqueTypeArray();
    var UndefinedType_1 = require_UndefinedType();
    var NeverType_1 = require_NeverType();
    var IntersectionNodeParser = class {
      constructor(typeChecker, childNodeParser) {
        this.typeChecker = typeChecker;
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.IntersectionType;
      }
      createType(node, context) {
        const types = node.types.map((subnode) => this.childNodeParser.createType(subnode, context));
        if (types.filter((t) => t instanceof NeverType_1.NeverType).length) {
          return new NeverType_1.NeverType();
        }
        return translate(types);
      }
    };
    exports2.IntersectionNodeParser = IntersectionNodeParser;
    function derefAndFlattenUnions(type) {
      const derefed = (0, derefType_1.derefType)(type);
      return derefed instanceof UnionType_1.UnionType ? derefed.getTypes().reduce((result, derefedType) => {
        result.push(...derefAndFlattenUnions(derefedType));
        return result;
      }, []) : [type];
    }
    function translate(types) {
      types = (0, uniqueTypeArray_1.uniqueTypeArray)(types);
      if (types.length == 1) {
        return types[0];
      }
      const unions = types.map(derefAndFlattenUnions);
      const result = [];
      function process2(i, t = []) {
        for (const type of unions[i]) {
          let currentTypes = [...t, type];
          if (i < unions.length - 1) {
            process2(i + 1, currentTypes);
          } else {
            currentTypes = (0, uniqueTypeArray_1.uniqueTypeArray)(currentTypes);
            if (currentTypes.some((c) => c instanceof UndefinedType_1.UndefinedType)) {
              result.push(new UndefinedType_1.UndefinedType());
            } else {
              const primitives = currentTypes.filter((c) => c instanceof PrimitiveType_1.PrimitiveType);
              if (primitives.length === 1) {
                result.push(primitives[0]);
              } else if (primitives.length > 1) {
              } else if (currentTypes.length === 1) {
                result.push(currentTypes[0]);
              } else {
                result.push(new IntersectionType_1.IntersectionType(currentTypes));
              }
            }
          }
        }
      }
      process2(0);
      if (result.length === 1) {
        return result[0];
      } else if (result.length > 1) {
        return new UnionType_1.UnionType(result);
      }
      throw new Error("Could not translate intersection to union.");
    }
    exports2.translate = translate;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/typeKeys.js
var require_typeKeys = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/typeKeys.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getTypeByKey = exports2.getTypeKeys = void 0;
    var IntersectionNodeParser_1 = require_IntersectionNodeParser();
    var AnyType_1 = require_AnyType();
    var ArrayType_1 = require_ArrayType();
    var BaseType_1 = require_BaseType();
    var IntersectionType_1 = require_IntersectionType();
    var LiteralType_1 = require_LiteralType();
    var NumberType_1 = require_NumberType();
    var ObjectType_1 = require_ObjectType();
    var TupleType_1 = require_TupleType();
    var UndefinedType_1 = require_UndefinedType();
    var UnionType_1 = require_UnionType();
    var derefType_1 = require_derefType();
    var preserveAnnotation_1 = require_preserveAnnotation();
    var uniqueArray_1 = require_uniqueArray();
    var uniqueTypeArray_1 = require_uniqueTypeArray();
    function uniqueLiterals(types) {
      const values = types.map((type) => type.getValue());
      return (0, uniqueArray_1.uniqueArray)(values).map((value) => new LiteralType_1.LiteralType(value));
    }
    function getTypeKeys(type) {
      type = (0, derefType_1.derefType)(type);
      if (type instanceof IntersectionType_1.IntersectionType || type instanceof UnionType_1.UnionType) {
        return uniqueLiterals(type.getTypes().reduce((result, subType) => [...result, ...getTypeKeys(subType)], []));
      }
      if (type instanceof TupleType_1.TupleType) {
        return type.getTypes().map((_it, idx) => new LiteralType_1.LiteralType(idx));
      }
      if (type instanceof ObjectType_1.ObjectType) {
        const objectProperties = type.getProperties().map((it) => new LiteralType_1.LiteralType(it.getName()));
        return uniqueLiterals(type.getBaseTypes().reduce((result, parentType) => [...result, ...getTypeKeys(parentType)], objectProperties));
      }
      return [];
    }
    exports2.getTypeKeys = getTypeKeys;
    function getTypeByKey(type, index) {
      type = (0, derefType_1.derefType)(type);
      if (type instanceof IntersectionType_1.IntersectionType || type instanceof UnionType_1.UnionType) {
        let subTypes = [];
        let firstType;
        for (const subType of type.getTypes()) {
          const subKeyType = getTypeByKey(subType, index);
          if (subKeyType) {
            subTypes.push(subKeyType);
            if (!firstType) {
              firstType = subKeyType;
            }
          }
        }
        subTypes = (0, uniqueTypeArray_1.uniqueTypeArray)(subTypes);
        let returnType = void 0;
        if (subTypes.length == 1) {
          return firstType;
        } else if (subTypes.length > 1) {
          if (type instanceof UnionType_1.UnionType) {
            returnType = new UnionType_1.UnionType(subTypes);
          } else {
            returnType = (0, IntersectionNodeParser_1.translate)(subTypes);
          }
        }
        if (!returnType) {
          return void 0;
        }
        if (!firstType) {
          return returnType;
        }
        return (0, preserveAnnotation_1.preserveAnnotation)(firstType, returnType);
      }
      if (type instanceof TupleType_1.TupleType && index instanceof LiteralType_1.LiteralType) {
        return type.getTypes().find((it, idx) => idx === index.getValue());
      }
      if (type instanceof ArrayType_1.ArrayType && index instanceof NumberType_1.NumberType) {
        return type.getItem();
      }
      if (type instanceof ObjectType_1.ObjectType) {
        if (index instanceof LiteralType_1.LiteralType) {
          const property = type.getProperties().find((it) => it.getName() === index.getValue());
          if (property) {
            const propertyType = property.getType();
            if (propertyType === void 0) {
              return void 0;
            }
            let newPropType = (0, derefType_1.derefAnnotatedType)(propertyType);
            if (!property.isRequired()) {
              if (newPropType instanceof UnionType_1.UnionType) {
                if (!newPropType.getTypes().some((subType) => subType instanceof UndefinedType_1.UndefinedType)) {
                  newPropType = new UnionType_1.UnionType([...newPropType.getTypes(), new UndefinedType_1.UndefinedType()]);
                }
              } else {
                newPropType = new UnionType_1.UnionType([newPropType, new UndefinedType_1.UndefinedType()]);
              }
            }
            return (0, preserveAnnotation_1.preserveAnnotation)(propertyType, newPropType);
          }
        }
        const additionalProperty = type.getAdditionalProperties();
        if (additionalProperty instanceof BaseType_1.BaseType) {
          return additionalProperty;
        } else if (additionalProperty === true) {
          return new AnyType_1.AnyType();
        }
        for (const subType of type.getBaseTypes()) {
          const subKeyType = getTypeByKey(subType, index);
          if (subKeyType) {
            return subKeyType;
          }
        }
        return void 0;
      }
      return void 0;
    }
    exports2.getTypeByKey = getTypeByKey;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/UnionTypeFormatter.js
var require_UnionTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/UnionTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UnionTypeFormatter = void 0;
    var LiteralType_1 = require_LiteralType();
    var NeverType_1 = require_NeverType();
    var UnionType_1 = require_UnionType();
    var derefType_1 = require_derefType();
    var typeKeys_1 = require_typeKeys();
    var uniqueArray_1 = require_uniqueArray();
    var UnionTypeFormatter = class {
      constructor(childTypeFormatter, discriminatorType) {
        this.childTypeFormatter = childTypeFormatter;
        this.discriminatorType = discriminatorType;
      }
      supportsType(type) {
        return type instanceof UnionType_1.UnionType;
      }
      getTypeDefinitions(type) {
        return type.getTypes().filter((item) => !((0, derefType_1.derefType)(item) instanceof NeverType_1.NeverType)).map((item) => this.childTypeFormatter.getDefinition(item));
      }
      getJsonSchemaDiscriminatorDefinition(type) {
        const definitions = this.getTypeDefinitions(type);
        const discriminator = type.getDiscriminator();
        if (!discriminator)
          throw new Error("discriminator is undefined");
        const kindTypes = type.getTypes().filter((item) => !((0, derefType_1.derefType)(item) instanceof NeverType_1.NeverType)).map((item) => (0, typeKeys_1.getTypeByKey)(item, new LiteralType_1.LiteralType(discriminator)));
        const undefinedIndex = kindTypes.findIndex((item) => item === void 0);
        if (undefinedIndex != -1) {
          throw new Error(`Cannot find discriminator keyword "${discriminator}" in type ${JSON.stringify(type.getTypes()[undefinedIndex])}.`);
        }
        const kindDefinitions = kindTypes.map((item) => this.childTypeFormatter.getDefinition(item));
        const allOf = [];
        for (let i = 0; i < definitions.length; i++) {
          allOf.push({
            if: {
              properties: { [discriminator]: kindDefinitions[i] }
            },
            then: definitions[i]
          });
        }
        const kindValues = kindDefinitions.flatMap((item) => {
          var _a;
          return (_a = item.const) !== null && _a !== void 0 ? _a : item.enum;
        }).filter((item) => item !== void 0);
        const duplicates = kindValues.filter((item, index) => kindValues.indexOf(item) !== index);
        if (duplicates.length > 0) {
          throw new Error(`Duplicate discriminator values: ${duplicates.join(", ")} in type ${JSON.stringify(type.getName())}.`);
        }
        const properties = {
          [discriminator]: {
            enum: kindValues
          }
        };
        return { type: "object", properties, required: [discriminator], allOf };
      }
      getOpenApiDiscriminatorDefinition(type) {
        const oneOf = this.getTypeDefinitions(type);
        const discriminator = type.getDiscriminator();
        if (!discriminator)
          throw new Error("discriminator is undefined");
        return {
          type: "object",
          discriminator: { propertyName: discriminator },
          required: [discriminator],
          oneOf
        };
      }
      getDefinition(type) {
        const discriminator = type.getDiscriminator();
        if (discriminator !== void 0) {
          if (this.discriminatorType === "open-api")
            return this.getOpenApiDiscriminatorDefinition(type);
          return this.getJsonSchemaDiscriminatorDefinition(type);
        }
        const definitions = this.getTypeDefinitions(type);
        let stringType = true;
        let oneNotEnum = false;
        for (const def of definitions) {
          if (def.type !== "string") {
            stringType = false;
            break;
          }
          if (def.enum === void 0) {
            oneNotEnum = true;
          }
        }
        if (stringType && oneNotEnum) {
          const values = [];
          for (const def of definitions) {
            if (def.enum) {
              values.push(...def.enum);
            } else if (def.const) {
              values.push(def.const);
            } else {
              return {
                type: "string"
              };
            }
          }
          return {
            type: "string",
            enum: values
          };
        }
        const flattenedDefinitions = [];
        for (const def of definitions) {
          const keys = Object.keys(def);
          if (keys.length === 1 && keys[0] === "anyOf") {
            flattenedDefinitions.push(...def.anyOf);
          } else {
            flattenedDefinitions.push(def);
          }
        }
        return flattenedDefinitions.length > 1 ? {
          anyOf: flattenedDefinitions
        } : flattenedDefinitions[0];
      }
      getChildren(type) {
        return (0, uniqueArray_1.uniqueArray)(type.getTypes().reduce((result, item) => [...result, ...this.childTypeFormatter.getChildren(item)], []));
      }
    };
    exports2.UnionTypeFormatter = UnionTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/UnknownType.js
var require_UnknownType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/UnknownType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UnknownType = void 0;
    var BaseType_1 = require_BaseType();
    var UnknownType = class extends BaseType_1.BaseType {
      constructor(comment) {
        super();
        this.comment = comment;
      }
      getId() {
        return "unknown";
      }
      getComment() {
        return this.comment;
      }
    };
    exports2.UnknownType = UnknownType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/UnknownTypeFormatter.js
var require_UnknownTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/UnknownTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UnknownTypeFormatter = void 0;
    var UnknownType_1 = require_UnknownType();
    var UnknownTypeFormatter = class {
      supportsType(type) {
        return type instanceof UnknownType_1.UnknownType;
      }
      getDefinition(type) {
        return {
          $comment: type.getComment()
        };
      }
      getChildren(type) {
        return [];
      }
    };
    exports2.UnknownTypeFormatter = UnknownTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/VoidType.js
var require_VoidType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/VoidType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.VoidType = void 0;
    var BaseType_1 = require_BaseType();
    var VoidType = class extends BaseType_1.BaseType {
      getId() {
        return "void";
      }
    };
    exports2.VoidType = VoidType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/VoidTypeFormatter.js
var require_VoidTypeFormatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TypeFormatter/VoidTypeFormatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.VoidTypeFormatter = void 0;
    var VoidType_1 = require_VoidType();
    var VoidTypeFormatter = class {
      supportsType(type) {
        return type instanceof VoidType_1.VoidType;
      }
      getDefinition(type) {
        return { type: "null" };
      }
      getChildren(type) {
        return [];
      }
    };
    exports2.VoidTypeFormatter = VoidTypeFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/factory/formatter.js
var require_formatter = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/factory/formatter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createFormatter = void 0;
    var ChainTypeFormatter_1 = require_ChainTypeFormatter();
    var CircularReferenceTypeFormatter_1 = require_CircularReferenceTypeFormatter();
    var AliasTypeFormatter_1 = require_AliasTypeFormatter();
    var AnnotatedTypeFormatter_1 = require_AnnotatedTypeFormatter();
    var AnyTypeFormatter_1 = require_AnyTypeFormatter();
    var ArrayTypeFormatter_1 = require_ArrayTypeFormatter();
    var BooleanTypeFormatter_1 = require_BooleanTypeFormatter();
    var DefinitionTypeFormatter_1 = require_DefinitionTypeFormatter();
    var EnumTypeFormatter_1 = require_EnumTypeFormatter();
    var HiddenTypeFormatter_1 = require_HiddenTypeFormatter();
    var IntersectionTypeFormatter_1 = require_IntersectionTypeFormatter();
    var LiteralTypeFormatter_1 = require_LiteralTypeFormatter();
    var LiteralUnionTypeFormatter_1 = require_LiteralUnionTypeFormatter();
    var NeverTypeFormatter_1 = require_NeverTypeFormatter();
    var NullTypeFormatter_1 = require_NullTypeFormatter();
    var NumberTypeFormatter_1 = require_NumberTypeFormatter();
    var ObjectTypeFormatter_1 = require_ObjectTypeFormatter();
    var OptionalTypeFormatter_1 = require_OptionalTypeFormatter();
    var PrimitiveUnionTypeFormatter_1 = require_PrimitiveUnionTypeFormatter();
    var ReferenceTypeFormatter_1 = require_ReferenceTypeFormatter();
    var RestTypeFormatter_1 = require_RestTypeFormatter();
    var StringTypeFormatter_1 = require_StringTypeFormatter();
    var SymbolTypeFormatter_1 = require_SymbolTypeFormatter();
    var TupleTypeFormatter_1 = require_TupleTypeFormatter();
    var UndefinedTypeFormatter_1 = require_UndefinedTypeFormatter();
    var UnionTypeFormatter_1 = require_UnionTypeFormatter();
    var UnknownTypeFormatter_1 = require_UnknownTypeFormatter();
    var VoidTypeFormatter_1 = require_VoidTypeFormatter();
    function createFormatter(config2, augmentor) {
      var _a, _b;
      const chainTypeFormatter = new ChainTypeFormatter_1.ChainTypeFormatter([]);
      const circularReferenceTypeFormatter = new CircularReferenceTypeFormatter_1.CircularReferenceTypeFormatter(chainTypeFormatter);
      if (augmentor) {
        augmentor(chainTypeFormatter, circularReferenceTypeFormatter);
      }
      chainTypeFormatter.addTypeFormatter(new AnnotatedTypeFormatter_1.AnnotatedTypeFormatter(circularReferenceTypeFormatter)).addTypeFormatter(new StringTypeFormatter_1.StringTypeFormatter()).addTypeFormatter(new NumberTypeFormatter_1.NumberTypeFormatter()).addTypeFormatter(new BooleanTypeFormatter_1.BooleanTypeFormatter()).addTypeFormatter(new NullTypeFormatter_1.NullTypeFormatter()).addTypeFormatter(new SymbolTypeFormatter_1.SymbolTypeFormatter()).addTypeFormatter(new AnyTypeFormatter_1.AnyTypeFormatter()).addTypeFormatter(new UndefinedTypeFormatter_1.UndefinedTypeFormatter()).addTypeFormatter(new UnknownTypeFormatter_1.UnknownTypeFormatter()).addTypeFormatter(new VoidTypeFormatter_1.VoidTypeFormatter()).addTypeFormatter(new HiddenTypeFormatter_1.HiddenTypeFormatter()).addTypeFormatter(new NeverTypeFormatter_1.NeverTypeFormatter()).addTypeFormatter(new LiteralTypeFormatter_1.LiteralTypeFormatter()).addTypeFormatter(new EnumTypeFormatter_1.EnumTypeFormatter()).addTypeFormatter(new ReferenceTypeFormatter_1.ReferenceTypeFormatter(circularReferenceTypeFormatter, (_a = config2.encodeRefs) !== null && _a !== void 0 ? _a : true)).addTypeFormatter(new DefinitionTypeFormatter_1.DefinitionTypeFormatter(circularReferenceTypeFormatter, (_b = config2.encodeRefs) !== null && _b !== void 0 ? _b : true)).addTypeFormatter(new ObjectTypeFormatter_1.ObjectTypeFormatter(circularReferenceTypeFormatter)).addTypeFormatter(new AliasTypeFormatter_1.AliasTypeFormatter(circularReferenceTypeFormatter)).addTypeFormatter(new PrimitiveUnionTypeFormatter_1.PrimitiveUnionTypeFormatter()).addTypeFormatter(new LiteralUnionTypeFormatter_1.LiteralUnionTypeFormatter()).addTypeFormatter(new OptionalTypeFormatter_1.OptionalTypeFormatter(circularReferenceTypeFormatter)).addTypeFormatter(new RestTypeFormatter_1.RestTypeFormatter(circularReferenceTypeFormatter)).addTypeFormatter(new ArrayTypeFormatter_1.ArrayTypeFormatter(circularReferenceTypeFormatter)).addTypeFormatter(new TupleTypeFormatter_1.TupleTypeFormatter(circularReferenceTypeFormatter)).addTypeFormatter(new UnionTypeFormatter_1.UnionTypeFormatter(circularReferenceTypeFormatter, config2.discriminatorType)).addTypeFormatter(new IntersectionTypeFormatter_1.IntersectionTypeFormatter(circularReferenceTypeFormatter));
      return circularReferenceTypeFormatter;
    }
    exports2.createFormatter = createFormatter;
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/json5/lib/unicode.js
var require_unicode = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/json5/lib/unicode.js"(exports2, module2) {
    module2.exports.Space_Separator = /[\u1680\u2000-\u200A\u202F\u205F\u3000]/;
    module2.exports.ID_Start = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE83\uDE86-\uDE89\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]/;
    module2.exports.ID_Continue = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09FC\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF9\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDE00-\uDE3E\uDE47\uDE50-\uDE83\uDE86-\uDE99\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/;
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/json5/lib/util.js
var require_util = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/json5/lib/util.js"(exports2, module2) {
    var unicode = require_unicode();
    module2.exports = {
      isSpaceSeparator(c) {
        return typeof c === "string" && unicode.Space_Separator.test(c);
      },
      isIdStartChar(c) {
        return typeof c === "string" && (c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c === "$" || c === "_" || unicode.ID_Start.test(c));
      },
      isIdContinueChar(c) {
        return typeof c === "string" && (c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c >= "0" && c <= "9" || c === "$" || c === "_" || c === "\u200C" || c === "\u200D" || unicode.ID_Continue.test(c));
      },
      isDigit(c) {
        return typeof c === "string" && /[0-9]/.test(c);
      },
      isHexDigit(c) {
        return typeof c === "string" && /[0-9A-Fa-f]/.test(c);
      }
    };
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/json5/lib/parse.js
var require_parse = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/json5/lib/parse.js"(exports2, module2) {
    var util = require_util();
    var source;
    var parseState;
    var stack;
    var pos;
    var line;
    var column;
    var token;
    var key;
    var root;
    module2.exports = function parse(text, reviver) {
      source = String(text);
      parseState = "start";
      stack = [];
      pos = 0;
      line = 1;
      column = 0;
      token = void 0;
      key = void 0;
      root = void 0;
      do {
        token = lex();
        parseStates[parseState]();
      } while (token.type !== "eof");
      if (typeof reviver === "function") {
        return internalize({ "": root }, "", reviver);
      }
      return root;
    };
    function internalize(holder, name, reviver) {
      const value = holder[name];
      if (value != null && typeof value === "object") {
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            const key2 = String(i);
            const replacement = internalize(value, key2, reviver);
            if (replacement === void 0) {
              delete value[key2];
            } else {
              Object.defineProperty(value, key2, {
                value: replacement,
                writable: true,
                enumerable: true,
                configurable: true
              });
            }
          }
        } else {
          for (const key2 in value) {
            const replacement = internalize(value, key2, reviver);
            if (replacement === void 0) {
              delete value[key2];
            } else {
              Object.defineProperty(value, key2, {
                value: replacement,
                writable: true,
                enumerable: true,
                configurable: true
              });
            }
          }
        }
      }
      return reviver.call(holder, name, value);
    }
    var lexState;
    var buffer;
    var doubleQuote;
    var sign;
    var c;
    function lex() {
      lexState = "default";
      buffer = "";
      doubleQuote = false;
      sign = 1;
      for (; ; ) {
        c = peek();
        const token2 = lexStates[lexState]();
        if (token2) {
          return token2;
        }
      }
    }
    function peek() {
      if (source[pos]) {
        return String.fromCodePoint(source.codePointAt(pos));
      }
    }
    function read() {
      const c2 = peek();
      if (c2 === "\n") {
        line++;
        column = 0;
      } else if (c2) {
        column += c2.length;
      } else {
        column++;
      }
      if (c2) {
        pos += c2.length;
      }
      return c2;
    }
    var lexStates = {
      default() {
        switch (c) {
          case "	":
          case "\v":
          case "\f":
          case " ":
          case "\xA0":
          case "\uFEFF":
          case "\n":
          case "\r":
          case "\u2028":
          case "\u2029":
            read();
            return;
          case "/":
            read();
            lexState = "comment";
            return;
          case void 0:
            read();
            return newToken("eof");
        }
        if (util.isSpaceSeparator(c)) {
          read();
          return;
        }
        return lexStates[parseState]();
      },
      comment() {
        switch (c) {
          case "*":
            read();
            lexState = "multiLineComment";
            return;
          case "/":
            read();
            lexState = "singleLineComment";
            return;
        }
        throw invalidChar(read());
      },
      multiLineComment() {
        switch (c) {
          case "*":
            read();
            lexState = "multiLineCommentAsterisk";
            return;
          case void 0:
            throw invalidChar(read());
        }
        read();
      },
      multiLineCommentAsterisk() {
        switch (c) {
          case "*":
            read();
            return;
          case "/":
            read();
            lexState = "default";
            return;
          case void 0:
            throw invalidChar(read());
        }
        read();
        lexState = "multiLineComment";
      },
      singleLineComment() {
        switch (c) {
          case "\n":
          case "\r":
          case "\u2028":
          case "\u2029":
            read();
            lexState = "default";
            return;
          case void 0:
            read();
            return newToken("eof");
        }
        read();
      },
      value() {
        switch (c) {
          case "{":
          case "[":
            return newToken("punctuator", read());
          case "n":
            read();
            literal("ull");
            return newToken("null", null);
          case "t":
            read();
            literal("rue");
            return newToken("boolean", true);
          case "f":
            read();
            literal("alse");
            return newToken("boolean", false);
          case "-":
          case "+":
            if (read() === "-") {
              sign = -1;
            }
            lexState = "sign";
            return;
          case ".":
            buffer = read();
            lexState = "decimalPointLeading";
            return;
          case "0":
            buffer = read();
            lexState = "zero";
            return;
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9":
            buffer = read();
            lexState = "decimalInteger";
            return;
          case "I":
            read();
            literal("nfinity");
            return newToken("numeric", Infinity);
          case "N":
            read();
            literal("aN");
            return newToken("numeric", NaN);
          case '"':
          case "'":
            doubleQuote = read() === '"';
            buffer = "";
            lexState = "string";
            return;
        }
        throw invalidChar(read());
      },
      identifierNameStartEscape() {
        if (c !== "u") {
          throw invalidChar(read());
        }
        read();
        const u = unicodeEscape();
        switch (u) {
          case "$":
          case "_":
            break;
          default:
            if (!util.isIdStartChar(u)) {
              throw invalidIdentifier();
            }
            break;
        }
        buffer += u;
        lexState = "identifierName";
      },
      identifierName() {
        switch (c) {
          case "$":
          case "_":
          case "\u200C":
          case "\u200D":
            buffer += read();
            return;
          case "\\":
            read();
            lexState = "identifierNameEscape";
            return;
        }
        if (util.isIdContinueChar(c)) {
          buffer += read();
          return;
        }
        return newToken("identifier", buffer);
      },
      identifierNameEscape() {
        if (c !== "u") {
          throw invalidChar(read());
        }
        read();
        const u = unicodeEscape();
        switch (u) {
          case "$":
          case "_":
          case "\u200C":
          case "\u200D":
            break;
          default:
            if (!util.isIdContinueChar(u)) {
              throw invalidIdentifier();
            }
            break;
        }
        buffer += u;
        lexState = "identifierName";
      },
      sign() {
        switch (c) {
          case ".":
            buffer = read();
            lexState = "decimalPointLeading";
            return;
          case "0":
            buffer = read();
            lexState = "zero";
            return;
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9":
            buffer = read();
            lexState = "decimalInteger";
            return;
          case "I":
            read();
            literal("nfinity");
            return newToken("numeric", sign * Infinity);
          case "N":
            read();
            literal("aN");
            return newToken("numeric", NaN);
        }
        throw invalidChar(read());
      },
      zero() {
        switch (c) {
          case ".":
            buffer += read();
            lexState = "decimalPoint";
            return;
          case "e":
          case "E":
            buffer += read();
            lexState = "decimalExponent";
            return;
          case "x":
          case "X":
            buffer += read();
            lexState = "hexadecimal";
            return;
        }
        return newToken("numeric", sign * 0);
      },
      decimalInteger() {
        switch (c) {
          case ".":
            buffer += read();
            lexState = "decimalPoint";
            return;
          case "e":
          case "E":
            buffer += read();
            lexState = "decimalExponent";
            return;
        }
        if (util.isDigit(c)) {
          buffer += read();
          return;
        }
        return newToken("numeric", sign * Number(buffer));
      },
      decimalPointLeading() {
        if (util.isDigit(c)) {
          buffer += read();
          lexState = "decimalFraction";
          return;
        }
        throw invalidChar(read());
      },
      decimalPoint() {
        switch (c) {
          case "e":
          case "E":
            buffer += read();
            lexState = "decimalExponent";
            return;
        }
        if (util.isDigit(c)) {
          buffer += read();
          lexState = "decimalFraction";
          return;
        }
        return newToken("numeric", sign * Number(buffer));
      },
      decimalFraction() {
        switch (c) {
          case "e":
          case "E":
            buffer += read();
            lexState = "decimalExponent";
            return;
        }
        if (util.isDigit(c)) {
          buffer += read();
          return;
        }
        return newToken("numeric", sign * Number(buffer));
      },
      decimalExponent() {
        switch (c) {
          case "+":
          case "-":
            buffer += read();
            lexState = "decimalExponentSign";
            return;
        }
        if (util.isDigit(c)) {
          buffer += read();
          lexState = "decimalExponentInteger";
          return;
        }
        throw invalidChar(read());
      },
      decimalExponentSign() {
        if (util.isDigit(c)) {
          buffer += read();
          lexState = "decimalExponentInteger";
          return;
        }
        throw invalidChar(read());
      },
      decimalExponentInteger() {
        if (util.isDigit(c)) {
          buffer += read();
          return;
        }
        return newToken("numeric", sign * Number(buffer));
      },
      hexadecimal() {
        if (util.isHexDigit(c)) {
          buffer += read();
          lexState = "hexadecimalInteger";
          return;
        }
        throw invalidChar(read());
      },
      hexadecimalInteger() {
        if (util.isHexDigit(c)) {
          buffer += read();
          return;
        }
        return newToken("numeric", sign * Number(buffer));
      },
      string() {
        switch (c) {
          case "\\":
            read();
            buffer += escape();
            return;
          case '"':
            if (doubleQuote) {
              read();
              return newToken("string", buffer);
            }
            buffer += read();
            return;
          case "'":
            if (!doubleQuote) {
              read();
              return newToken("string", buffer);
            }
            buffer += read();
            return;
          case "\n":
          case "\r":
            throw invalidChar(read());
          case "\u2028":
          case "\u2029":
            separatorChar(c);
            break;
          case void 0:
            throw invalidChar(read());
        }
        buffer += read();
      },
      start() {
        switch (c) {
          case "{":
          case "[":
            return newToken("punctuator", read());
        }
        lexState = "value";
      },
      beforePropertyName() {
        switch (c) {
          case "$":
          case "_":
            buffer = read();
            lexState = "identifierName";
            return;
          case "\\":
            read();
            lexState = "identifierNameStartEscape";
            return;
          case "}":
            return newToken("punctuator", read());
          case '"':
          case "'":
            doubleQuote = read() === '"';
            lexState = "string";
            return;
        }
        if (util.isIdStartChar(c)) {
          buffer += read();
          lexState = "identifierName";
          return;
        }
        throw invalidChar(read());
      },
      afterPropertyName() {
        if (c === ":") {
          return newToken("punctuator", read());
        }
        throw invalidChar(read());
      },
      beforePropertyValue() {
        lexState = "value";
      },
      afterPropertyValue() {
        switch (c) {
          case ",":
          case "}":
            return newToken("punctuator", read());
        }
        throw invalidChar(read());
      },
      beforeArrayValue() {
        if (c === "]") {
          return newToken("punctuator", read());
        }
        lexState = "value";
      },
      afterArrayValue() {
        switch (c) {
          case ",":
          case "]":
            return newToken("punctuator", read());
        }
        throw invalidChar(read());
      },
      end() {
        throw invalidChar(read());
      }
    };
    function newToken(type, value) {
      return {
        type,
        value,
        line,
        column
      };
    }
    function literal(s) {
      for (const c2 of s) {
        const p = peek();
        if (p !== c2) {
          throw invalidChar(read());
        }
        read();
      }
    }
    function escape() {
      const c2 = peek();
      switch (c2) {
        case "b":
          read();
          return "\b";
        case "f":
          read();
          return "\f";
        case "n":
          read();
          return "\n";
        case "r":
          read();
          return "\r";
        case "t":
          read();
          return "	";
        case "v":
          read();
          return "\v";
        case "0":
          read();
          if (util.isDigit(peek())) {
            throw invalidChar(read());
          }
          return "\0";
        case "x":
          read();
          return hexEscape();
        case "u":
          read();
          return unicodeEscape();
        case "\n":
        case "\u2028":
        case "\u2029":
          read();
          return "";
        case "\r":
          read();
          if (peek() === "\n") {
            read();
          }
          return "";
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          throw invalidChar(read());
        case void 0:
          throw invalidChar(read());
      }
      return read();
    }
    function hexEscape() {
      let buffer2 = "";
      let c2 = peek();
      if (!util.isHexDigit(c2)) {
        throw invalidChar(read());
      }
      buffer2 += read();
      c2 = peek();
      if (!util.isHexDigit(c2)) {
        throw invalidChar(read());
      }
      buffer2 += read();
      return String.fromCodePoint(parseInt(buffer2, 16));
    }
    function unicodeEscape() {
      let buffer2 = "";
      let count = 4;
      while (count-- > 0) {
        const c2 = peek();
        if (!util.isHexDigit(c2)) {
          throw invalidChar(read());
        }
        buffer2 += read();
      }
      return String.fromCodePoint(parseInt(buffer2, 16));
    }
    var parseStates = {
      start() {
        if (token.type === "eof") {
          throw invalidEOF();
        }
        push();
      },
      beforePropertyName() {
        switch (token.type) {
          case "identifier":
          case "string":
            key = token.value;
            parseState = "afterPropertyName";
            return;
          case "punctuator":
            pop();
            return;
          case "eof":
            throw invalidEOF();
        }
      },
      afterPropertyName() {
        if (token.type === "eof") {
          throw invalidEOF();
        }
        parseState = "beforePropertyValue";
      },
      beforePropertyValue() {
        if (token.type === "eof") {
          throw invalidEOF();
        }
        push();
      },
      beforeArrayValue() {
        if (token.type === "eof") {
          throw invalidEOF();
        }
        if (token.type === "punctuator" && token.value === "]") {
          pop();
          return;
        }
        push();
      },
      afterPropertyValue() {
        if (token.type === "eof") {
          throw invalidEOF();
        }
        switch (token.value) {
          case ",":
            parseState = "beforePropertyName";
            return;
          case "}":
            pop();
        }
      },
      afterArrayValue() {
        if (token.type === "eof") {
          throw invalidEOF();
        }
        switch (token.value) {
          case ",":
            parseState = "beforeArrayValue";
            return;
          case "]":
            pop();
        }
      },
      end() {
      }
    };
    function push() {
      let value;
      switch (token.type) {
        case "punctuator":
          switch (token.value) {
            case "{":
              value = {};
              break;
            case "[":
              value = [];
              break;
          }
          break;
        case "null":
        case "boolean":
        case "numeric":
        case "string":
          value = token.value;
          break;
      }
      if (root === void 0) {
        root = value;
      } else {
        const parent = stack[stack.length - 1];
        if (Array.isArray(parent)) {
          parent.push(value);
        } else {
          Object.defineProperty(parent, key, {
            value,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
      if (value !== null && typeof value === "object") {
        stack.push(value);
        if (Array.isArray(value)) {
          parseState = "beforeArrayValue";
        } else {
          parseState = "beforePropertyName";
        }
      } else {
        const current = stack[stack.length - 1];
        if (current == null) {
          parseState = "end";
        } else if (Array.isArray(current)) {
          parseState = "afterArrayValue";
        } else {
          parseState = "afterPropertyValue";
        }
      }
    }
    function pop() {
      stack.pop();
      const current = stack[stack.length - 1];
      if (current == null) {
        parseState = "end";
      } else if (Array.isArray(current)) {
        parseState = "afterArrayValue";
      } else {
        parseState = "afterPropertyValue";
      }
    }
    function invalidChar(c2) {
      if (c2 === void 0) {
        return syntaxError(`JSON5: invalid end of input at ${line}:${column}`);
      }
      return syntaxError(`JSON5: invalid character '${formatChar(c2)}' at ${line}:${column}`);
    }
    function invalidEOF() {
      return syntaxError(`JSON5: invalid end of input at ${line}:${column}`);
    }
    function invalidIdentifier() {
      column -= 5;
      return syntaxError(`JSON5: invalid identifier character at ${line}:${column}`);
    }
    function separatorChar(c2) {
      console.warn(`JSON5: '${formatChar(c2)}' in strings is not valid ECMAScript; consider escaping`);
    }
    function formatChar(c2) {
      const replacements = {
        "'": "\\'",
        '"': '\\"',
        "\\": "\\\\",
        "\b": "\\b",
        "\f": "\\f",
        "\n": "\\n",
        "\r": "\\r",
        "	": "\\t",
        "\v": "\\v",
        "\0": "\\0",
        "\u2028": "\\u2028",
        "\u2029": "\\u2029"
      };
      if (replacements[c2]) {
        return replacements[c2];
      }
      if (c2 < " ") {
        const hexString = c2.charCodeAt(0).toString(16);
        return "\\x" + ("00" + hexString).substring(hexString.length);
      }
      return c2;
    }
    function syntaxError(message) {
      const err = new SyntaxError(message);
      err.lineNumber = line;
      err.columnNumber = column;
      return err;
    }
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/json5/lib/stringify.js
var require_stringify = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/json5/lib/stringify.js"(exports2, module2) {
    var util = require_util();
    module2.exports = function stringify(value, replacer, space) {
      const stack = [];
      let indent = "";
      let propertyList;
      let replacerFunc;
      let gap = "";
      let quote;
      if (replacer != null && typeof replacer === "object" && !Array.isArray(replacer)) {
        space = replacer.space;
        quote = replacer.quote;
        replacer = replacer.replacer;
      }
      if (typeof replacer === "function") {
        replacerFunc = replacer;
      } else if (Array.isArray(replacer)) {
        propertyList = [];
        for (const v of replacer) {
          let item;
          if (typeof v === "string") {
            item = v;
          } else if (typeof v === "number" || v instanceof String || v instanceof Number) {
            item = String(v);
          }
          if (item !== void 0 && propertyList.indexOf(item) < 0) {
            propertyList.push(item);
          }
        }
      }
      if (space instanceof Number) {
        space = Number(space);
      } else if (space instanceof String) {
        space = String(space);
      }
      if (typeof space === "number") {
        if (space > 0) {
          space = Math.min(10, Math.floor(space));
          gap = "          ".substr(0, space);
        }
      } else if (typeof space === "string") {
        gap = space.substr(0, 10);
      }
      return serializeProperty("", { "": value });
      function serializeProperty(key, holder) {
        let value2 = holder[key];
        if (value2 != null) {
          if (typeof value2.toJSON5 === "function") {
            value2 = value2.toJSON5(key);
          } else if (typeof value2.toJSON === "function") {
            value2 = value2.toJSON(key);
          }
        }
        if (replacerFunc) {
          value2 = replacerFunc.call(holder, key, value2);
        }
        if (value2 instanceof Number) {
          value2 = Number(value2);
        } else if (value2 instanceof String) {
          value2 = String(value2);
        } else if (value2 instanceof Boolean) {
          value2 = value2.valueOf();
        }
        switch (value2) {
          case null:
            return "null";
          case true:
            return "true";
          case false:
            return "false";
        }
        if (typeof value2 === "string") {
          return quoteString(value2, false);
        }
        if (typeof value2 === "number") {
          return String(value2);
        }
        if (typeof value2 === "object") {
          return Array.isArray(value2) ? serializeArray(value2) : serializeObject(value2);
        }
        return void 0;
      }
      function quoteString(value2) {
        const quotes = {
          "'": 0.1,
          '"': 0.2
        };
        const replacements = {
          "'": "\\'",
          '"': '\\"',
          "\\": "\\\\",
          "\b": "\\b",
          "\f": "\\f",
          "\n": "\\n",
          "\r": "\\r",
          "	": "\\t",
          "\v": "\\v",
          "\0": "\\0",
          "\u2028": "\\u2028",
          "\u2029": "\\u2029"
        };
        let product = "";
        for (let i = 0; i < value2.length; i++) {
          const c = value2[i];
          switch (c) {
            case "'":
            case '"':
              quotes[c]++;
              product += c;
              continue;
            case "\0":
              if (util.isDigit(value2[i + 1])) {
                product += "\\x00";
                continue;
              }
          }
          if (replacements[c]) {
            product += replacements[c];
            continue;
          }
          if (c < " ") {
            let hexString = c.charCodeAt(0).toString(16);
            product += "\\x" + ("00" + hexString).substring(hexString.length);
            continue;
          }
          product += c;
        }
        const quoteChar = quote || Object.keys(quotes).reduce((a, b) => quotes[a] < quotes[b] ? a : b);
        product = product.replace(new RegExp(quoteChar, "g"), replacements[quoteChar]);
        return quoteChar + product + quoteChar;
      }
      function serializeObject(value2) {
        if (stack.indexOf(value2) >= 0) {
          throw TypeError("Converting circular structure to JSON5");
        }
        stack.push(value2);
        let stepback = indent;
        indent = indent + gap;
        let keys = propertyList || Object.keys(value2);
        let partial = [];
        for (const key of keys) {
          const propertyString = serializeProperty(key, value2);
          if (propertyString !== void 0) {
            let member = serializeKey(key) + ":";
            if (gap !== "") {
              member += " ";
            }
            member += propertyString;
            partial.push(member);
          }
        }
        let final;
        if (partial.length === 0) {
          final = "{}";
        } else {
          let properties;
          if (gap === "") {
            properties = partial.join(",");
            final = "{" + properties + "}";
          } else {
            let separator = ",\n" + indent;
            properties = partial.join(separator);
            final = "{\n" + indent + properties + ",\n" + stepback + "}";
          }
        }
        stack.pop();
        indent = stepback;
        return final;
      }
      function serializeKey(key) {
        if (key.length === 0) {
          return quoteString(key, true);
        }
        const firstChar = String.fromCodePoint(key.codePointAt(0));
        if (!util.isIdStartChar(firstChar)) {
          return quoteString(key, true);
        }
        for (let i = firstChar.length; i < key.length; i++) {
          if (!util.isIdContinueChar(String.fromCodePoint(key.codePointAt(i)))) {
            return quoteString(key, true);
          }
        }
        return key;
      }
      function serializeArray(value2) {
        if (stack.indexOf(value2) >= 0) {
          throw TypeError("Converting circular structure to JSON5");
        }
        stack.push(value2);
        let stepback = indent;
        indent = indent + gap;
        let partial = [];
        for (let i = 0; i < value2.length; i++) {
          const propertyString = serializeProperty(String(i), value2);
          partial.push(propertyString !== void 0 ? propertyString : "null");
        }
        let final;
        if (partial.length === 0) {
          final = "[]";
        } else {
          if (gap === "") {
            let properties = partial.join(",");
            final = "[" + properties + "]";
          } else {
            let separator = ",\n" + indent;
            let properties = partial.join(separator);
            final = "[\n" + indent + properties + ",\n" + stepback + "]";
          }
        }
        stack.pop();
        indent = stepback;
        return final;
      }
    };
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/json5/lib/index.js
var require_lib = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/json5/lib/index.js"(exports2, module2) {
    var parse = require_parse();
    var stringify = require_stringify();
    var JSON5 = {
      parse,
      stringify
    };
    module2.exports = JSON5;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/AnnotationsReader/BasicAnnotationsReader.js
var require_BasicAnnotationsReader = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/AnnotationsReader/BasicAnnotationsReader.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BasicAnnotationsReader = void 0;
    var json5_1 = __importDefault2(require_lib());
    var symbolAtNode_1 = require_symbolAtNode();
    var BasicAnnotationsReader = class _BasicAnnotationsReader {
      constructor(extraTags) {
        this.extraTags = extraTags;
      }
      getAnnotations(node) {
        const symbol = (0, symbolAtNode_1.symbolAtNode)(node);
        if (!symbol) {
          return void 0;
        }
        const jsDocTags = symbol.getJsDocTags();
        if (!jsDocTags || !jsDocTags.length) {
          return void 0;
        }
        const annotations = jsDocTags.reduce((result, jsDocTag) => {
          const value = this.parseJsDocTag(jsDocTag);
          if (value !== void 0) {
            if (_BasicAnnotationsReader.requiresDollar.has(jsDocTag.name)) {
              result["$" + jsDocTag.name] = value;
            } else {
              result[jsDocTag.name] = value;
            }
          }
          return result;
        }, {});
        return Object.keys(annotations).length ? annotations : void 0;
      }
      parseJsDocTag(jsDocTag) {
        var _a, _b;
        const isTextTag = _BasicAnnotationsReader.textTags.has(jsDocTag.name);
        const defaultText = isTextTag ? "" : "true";
        const text = ((_a = jsDocTag.text) === null || _a === void 0 ? void 0 : _a.map((part) => part.text).join("")) || defaultText;
        if (isTextTag) {
          return text;
        }
        let parsed = this.parseJson(text);
        parsed = parsed === void 0 ? text : parsed;
        if (_BasicAnnotationsReader.jsonTags.has(jsDocTag.name)) {
          return parsed;
        } else if ((_b = this.extraTags) === null || _b === void 0 ? void 0 : _b.has(jsDocTag.name)) {
          return parsed;
        } else {
          return void 0;
        }
      }
      parseJson(value) {
        try {
          return json5_1.default.parse(value);
        } catch (e) {
          return void 0;
        }
      }
    };
    exports2.BasicAnnotationsReader = BasicAnnotationsReader;
    BasicAnnotationsReader.requiresDollar = /* @__PURE__ */ new Set(["id", "comment", "ref"]);
    BasicAnnotationsReader.textTags = /* @__PURE__ */ new Set([
      "title",
      "description",
      "id",
      "format",
      "pattern",
      "ref",
      "comment",
      "contentMediaType",
      "contentEncoding",
      "discriminator"
    ]);
    BasicAnnotationsReader.jsonTags = /* @__PURE__ */ new Set([
      "minimum",
      "exclusiveMinimum",
      "maximum",
      "exclusiveMaximum",
      "multipleOf",
      "minLength",
      "maxLength",
      "minProperties",
      "maxProperties",
      "minItems",
      "maxItems",
      "uniqueItems",
      "propertyNames",
      "contains",
      "const",
      "examples",
      "default",
      "if",
      "then",
      "else",
      "readOnly",
      "writeOnly",
      "deprecated"
    ]);
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/AnnotationsReader/ExtendedAnnotationsReader.js
var require_ExtendedAnnotationsReader = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/AnnotationsReader/ExtendedAnnotationsReader.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ExtendedAnnotationsReader = void 0;
    var json5_1 = __importDefault2(require_lib());
    var symbolAtNode_1 = require_symbolAtNode();
    var BasicAnnotationsReader_1 = require_BasicAnnotationsReader();
    var ExtendedAnnotationsReader = class extends BasicAnnotationsReader_1.BasicAnnotationsReader {
      constructor(typeChecker, extraTags, markdownDescription) {
        super(extraTags);
        this.typeChecker = typeChecker;
        this.markdownDescription = markdownDescription;
      }
      getAnnotations(node) {
        const annotations = {
          ...this.getDescriptionAnnotation(node),
          ...this.getTypeAnnotation(node),
          ...this.getExampleAnnotation(node),
          ...super.getAnnotations(node)
        };
        return Object.keys(annotations).length ? annotations : void 0;
      }
      isNullable(node) {
        const symbol = (0, symbolAtNode_1.symbolAtNode)(node);
        if (!symbol) {
          return false;
        }
        const jsDocTags = symbol.getJsDocTags();
        if (!jsDocTags || !jsDocTags.length) {
          return false;
        }
        const jsDocTag = jsDocTags.find((tag) => tag.name === "nullable");
        return !!jsDocTag;
      }
      getDescriptionAnnotation(node) {
        const symbol = (0, symbolAtNode_1.symbolAtNode)(node);
        if (!symbol) {
          return void 0;
        }
        const comments = symbol.getDocumentationComment(this.typeChecker);
        if (!comments || !comments.length) {
          return void 0;
        }
        const markdownDescription = comments.map((comment) => comment.text).join(" ").replace(/\r/g, "").trim();
        const description = markdownDescription.replace(/(?<=[^\n])\n(?=[^\n*-])/g, " ").trim();
        return this.markdownDescription ? { description, markdownDescription } : { description };
      }
      getTypeAnnotation(node) {
        var _a;
        const symbol = (0, symbolAtNode_1.symbolAtNode)(node);
        if (!symbol) {
          return void 0;
        }
        const jsDocTags = symbol.getJsDocTags();
        if (!jsDocTags || !jsDocTags.length) {
          return void 0;
        }
        const jsDocTag = jsDocTags.find((tag) => tag.name === "asType");
        if (!jsDocTag) {
          return void 0;
        }
        const text = ((_a = jsDocTag.text) !== null && _a !== void 0 ? _a : []).map((part) => part.text).join("");
        return { type: text };
      }
      getExampleAnnotation(node) {
        var _a;
        const symbol = (0, symbolAtNode_1.symbolAtNode)(node);
        if (!symbol) {
          return void 0;
        }
        const jsDocTags = symbol.getJsDocTags();
        if (!jsDocTags || !jsDocTags.length) {
          return void 0;
        }
        const examples = [];
        for (const example of jsDocTags.filter((tag) => tag.name === "example")) {
          const text = ((_a = example.text) !== null && _a !== void 0 ? _a : []).map((part) => part.text).join("");
          try {
            examples.push(json5_1.default.parse(text));
          } catch (e) {
          }
        }
        if (examples.length === 0) {
          return void 0;
        }
        return { examples };
      }
    };
    exports2.ExtendedAnnotationsReader = ExtendedAnnotationsReader;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Error/UnknownNodeError.js
var require_UnknownNodeError = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Error/UnknownNodeError.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UnknownNodeError = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var BaseError_12 = require_BaseError();
    var UnknownNodeError = class extends BaseError_12.BaseError {
      constructor(node, reference) {
        super(`Unknown node "${node.getSourceFile() ? node.getFullText() : "<unknown>"}" of kind "${typescript_1.default.SyntaxKind[node.kind]}"`);
        this.node = node;
        this.reference = reference;
      }
      getNode() {
        return this.node;
      }
      getReference() {
        return this.reference;
      }
    };
    exports2.UnknownNodeError = UnknownNodeError;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/ChainNodeParser.js
var require_ChainNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/ChainNodeParser.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ChainNodeParser = void 0;
    var UnknownNodeError_1 = require_UnknownNodeError();
    var ReferenceType_1 = require_ReferenceType();
    var ChainNodeParser = class {
      constructor(typeChecker, nodeParsers) {
        this.typeChecker = typeChecker;
        this.nodeParsers = nodeParsers;
        this.typeCaches = /* @__PURE__ */ new WeakMap();
      }
      addNodeParser(nodeParser) {
        this.nodeParsers.push(nodeParser);
        return this;
      }
      supportsNode(node) {
        return this.nodeParsers.some((nodeParser) => nodeParser.supportsNode(node));
      }
      createType(node, context, reference) {
        let typeCache = this.typeCaches.get(node);
        if (typeCache == null) {
          typeCache = /* @__PURE__ */ new Map();
          this.typeCaches.set(node, typeCache);
        }
        const contextCacheKey = context.getCacheKey();
        let type = typeCache.get(contextCacheKey);
        if (!type) {
          type = this.getNodeParser(node, context).createType(node, context, reference);
          if (!(type instanceof ReferenceType_1.ReferenceType)) {
            typeCache.set(contextCacheKey, type);
          }
        }
        return type;
      }
      getNodeParser(node, context) {
        for (const nodeParser of this.nodeParsers) {
          if (nodeParser.supportsNode(node)) {
            return nodeParser;
          }
        }
        throw new UnknownNodeError_1.UnknownNodeError(node, context.getReference());
      }
    };
    exports2.ChainNodeParser = ChainNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/CircularReferenceNodeParser.js
var require_CircularReferenceNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/CircularReferenceNodeParser.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CircularReferenceNodeParser = void 0;
    var ReferenceType_1 = require_ReferenceType();
    var nodeKey_1 = require_nodeKey();
    var CircularReferenceNodeParser = class {
      constructor(childNodeParser) {
        this.childNodeParser = childNodeParser;
        this.circular = /* @__PURE__ */ new Map();
      }
      supportsNode(node) {
        return this.childNodeParser.supportsNode(node);
      }
      createType(node, context) {
        const key = (0, nodeKey_1.getKey)(node, context);
        if (this.circular.has(key)) {
          return this.circular.get(key);
        }
        const reference = new ReferenceType_1.ReferenceType();
        this.circular.set(key, reference);
        const type = this.childNodeParser.createType(node, context, reference);
        if (type) {
          reference.setType(type);
        }
        this.circular.delete(key);
        return type;
      }
    };
    exports2.CircularReferenceNodeParser = CircularReferenceNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Config.js
var require_Config = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Config.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DEFAULT_CONFIG = void 0;
    exports2.DEFAULT_CONFIG = {
      expose: "export",
      topRef: true,
      jsDoc: "extended",
      markdownDescription: false,
      sortProps: true,
      strictTuples: false,
      skipTypeCheck: false,
      encodeRefs: true,
      minify: false,
      extraTags: [],
      additionalProperties: false,
      discriminatorType: "json-schema"
    };
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/ExposeNodeParser.js
var require_ExposeNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/ExposeNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ExposeNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var DefinitionType_1 = require_DefinitionType();
    var hasJsDocTag_1 = require_hasJsDocTag();
    var symbolAtNode_1 = require_symbolAtNode();
    var ExposeNodeParser = class {
      constructor(typeChecker, subNodeParser, expose, jsDoc) {
        this.typeChecker = typeChecker;
        this.subNodeParser = subNodeParser;
        this.expose = expose;
        this.jsDoc = jsDoc;
      }
      supportsNode(node) {
        return this.subNodeParser.supportsNode(node);
      }
      createType(node, context, reference) {
        const baseType = this.subNodeParser.createType(node, context, reference);
        if (!this.isExportNode(node)) {
          return baseType;
        }
        return new DefinitionType_1.DefinitionType(this.getDefinitionName(node, context), baseType);
      }
      isExportNode(node) {
        if (this.expose === "all") {
          return node.kind !== typescript_1.default.SyntaxKind.TypeLiteral;
        } else if (this.expose === "none") {
          return false;
        } else if (this.jsDoc !== "none" && (0, hasJsDocTag_1.hasJsDocTag)(node, "internal")) {
          return false;
        }
        const localSymbol = node.localSymbol;
        return localSymbol ? "exportSymbol" in localSymbol : false;
      }
      getDefinitionName(node, context) {
        const symbol = (0, symbolAtNode_1.symbolAtNode)(node);
        const fullName = this.typeChecker.getFullyQualifiedName(symbol).replace(/^".*"\./, "");
        const argumentIds = context.getArguments().map((arg) => arg === null || arg === void 0 ? void 0 : arg.getName());
        return argumentIds.length ? `${fullName}<${argumentIds.join(",")}>` : fullName;
      }
    };
    exports2.ExposeNodeParser = ExposeNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/AnnotatedNodeParser.js
var require_AnnotatedNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/AnnotatedNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AnnotatedNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var ExtendedAnnotationsReader_1 = require_ExtendedAnnotationsReader();
    var AnnotatedType_1 = require_AnnotatedType();
    var removeUndefined_1 = require_removeUndefined();
    var DefinitionType_1 = require_DefinitionType();
    var UnionType_1 = require_UnionType();
    var AnyType_1 = require_AnyType();
    var AnnotatedNodeParser = class {
      constructor(childNodeParser, annotationsReader) {
        this.childNodeParser = childNodeParser;
        this.annotationsReader = annotationsReader;
      }
      supportsNode(node) {
        return this.childNodeParser.supportsNode(node);
      }
      createType(node, context, reference) {
        var _a;
        const annotatedNode = this.getAnnotatedNode(node);
        let annotations = this.annotationsReader.getAnnotations(annotatedNode);
        const nullable = this.getNullable(annotatedNode);
        if (annotations && "$ref" in annotations) {
          return new AnnotatedType_1.AnnotatedType(new AnyType_1.AnyType(), annotations, nullable);
        }
        const baseType = this.childNodeParser.createType(node, context, reference);
        if ((_a = node.getSourceFile()) === null || _a === void 0 ? void 0 : _a.fileName.match(/[/\\]typescript[/\\]lib[/\\]lib\.[^/\\]+\.d\.ts$/i)) {
          let specialCase = false;
          if (node.kind === typescript_1.default.SyntaxKind.TypeAliasDeclaration && node.name.text === "Exclude") {
            let t = context.getArgument("T");
            if (t instanceof UnionType_1.UnionType) {
              t = (0, removeUndefined_1.removeUndefined)(t).newType;
            }
            if (t instanceof DefinitionType_1.DefinitionType) {
              t = t.getType();
            }
            if (t instanceof AnnotatedType_1.AnnotatedType) {
              annotations = t.getAnnotations();
              specialCase = true;
            }
          }
          if (!specialCase) {
            return baseType;
          }
        }
        return !annotations && !nullable ? baseType : new AnnotatedType_1.AnnotatedType(baseType, annotations || {}, nullable);
      }
      getNullable(annotatedNode) {
        return this.annotationsReader instanceof ExtendedAnnotationsReader_1.ExtendedAnnotationsReader ? this.annotationsReader.isNullable(annotatedNode) : false;
      }
      getAnnotatedNode(node) {
        if (!node.parent) {
          return node;
        } else if (node.parent.kind === typescript_1.default.SyntaxKind.PropertySignature) {
          return node.parent;
        } else if (node.parent.kind === typescript_1.default.SyntaxKind.PropertyDeclaration) {
          return node.parent;
        } else if (node.parent.kind === typescript_1.default.SyntaxKind.IndexSignature) {
          return node.parent;
        } else if (node.parent.kind === typescript_1.default.SyntaxKind.Parameter) {
          return node.parent;
        } else {
          return node;
        }
      }
    };
    exports2.AnnotatedNodeParser = AnnotatedNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/AnyTypeNodeParser.js
var require_AnyTypeNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/AnyTypeNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AnyTypeNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var AnyType_1 = require_AnyType();
    var AnyTypeNodeParser = class {
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.AnyKeyword || node.kind === typescript_1.default.SyntaxKind.SymbolKeyword;
      }
      createType(node, context) {
        return new AnyType_1.AnyType();
      }
    };
    exports2.AnyTypeNodeParser = AnyTypeNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/ArrayLiteralExpressionNodeParser.js
var require_ArrayLiteralExpressionNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/ArrayLiteralExpressionNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ArrayLiteralExpressionNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var TupleType_1 = require_TupleType();
    var ArrayLiteralExpressionNodeParser = class {
      constructor(childNodeParser) {
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.ArrayLiteralExpression;
      }
      createType(node, context) {
        const elements = node.elements.map((t) => this.childNodeParser.createType(t, context));
        return new TupleType_1.TupleType(elements);
      }
    };
    exports2.ArrayLiteralExpressionNodeParser = ArrayLiteralExpressionNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/ArrayNodeParser.js
var require_ArrayNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/ArrayNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ArrayNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var ArrayType_1 = require_ArrayType();
    var ArrayNodeParser = class {
      constructor(childNodeParser) {
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.ArrayType;
      }
      createType(node, context) {
        const type = this.childNodeParser.createType(node.elementType, context);
        return new ArrayType_1.ArrayType(type);
      }
    };
    exports2.ArrayNodeParser = ArrayNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/AsExpressionNodeParser.js
var require_AsExpressionNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/AsExpressionNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AsExpressionNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var AsExpressionNodeParser = class {
      constructor(childNodeParser) {
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.AsExpression;
      }
      createType(node, context) {
        return this.childNodeParser.createType(node.expression, context);
      }
    };
    exports2.AsExpressionNodeParser = AsExpressionNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/BooleanLiteralNodeParser.js
var require_BooleanLiteralNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/BooleanLiteralNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BooleanLiteralNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var LiteralType_1 = require_LiteralType();
    var BooleanLiteralNodeParser = class {
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.TrueKeyword || node.kind === typescript_1.default.SyntaxKind.FalseKeyword;
      }
      createType(node, context) {
        return new LiteralType_1.LiteralType(node.kind === typescript_1.default.SyntaxKind.TrueKeyword);
      }
    };
    exports2.BooleanLiteralNodeParser = BooleanLiteralNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/BooleanTypeNodeParser.js
var require_BooleanTypeNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/BooleanTypeNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BooleanTypeNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var BooleanType_1 = require_BooleanType();
    var BooleanTypeNodeParser = class {
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.BooleanKeyword;
      }
      createType(node, context) {
        return new BooleanType_1.BooleanType();
      }
    };
    exports2.BooleanTypeNodeParser = BooleanTypeNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/CallExpressionParser.js
var require_CallExpressionParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/CallExpressionParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CallExpressionParser = void 0;
    var TupleType_1 = require_TupleType();
    var typescript_1 = __importDefault2(require("typescript"));
    var NodeParser_1 = require_NodeParser();
    var UnionType_1 = require_UnionType();
    var LiteralType_1 = require_LiteralType();
    var SymbolType_1 = require_SymbolType();
    var CallExpressionParser = class {
      constructor(typeChecker, childNodeParser) {
        this.typeChecker = typeChecker;
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.CallExpression;
      }
      createType(node, context) {
        const type = this.typeChecker.getTypeAtLocation(node);
        if (type === null || type === void 0 ? void 0 : type.typeArguments) {
          return new TupleType_1.TupleType([
            new UnionType_1.UnionType(type.typeArguments[0].types.map((t) => new LiteralType_1.LiteralType(t.value)))
          ]);
        }
        if (type.flags === typescript_1.default.TypeFlags.UniqueESSymbol) {
          return new SymbolType_1.SymbolType();
        }
        const symbol = type.symbol || type.aliasSymbol;
        const decl = symbol.valueDeclaration || symbol.declarations[0];
        const subContext = this.createSubContext(node, context);
        return this.childNodeParser.createType(decl, subContext);
      }
      createSubContext(node, parentContext) {
        const subContext = new NodeParser_1.Context(node);
        for (const arg of node.arguments) {
          const type = this.childNodeParser.createType(arg, parentContext);
          subContext.pushArgument(type);
        }
        return subContext;
      }
    };
    exports2.CallExpressionParser = CallExpressionParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/InferType.js
var require_InferType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/InferType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InferType = void 0;
    var BaseType_1 = require_BaseType();
    var InferType = class extends BaseType_1.BaseType {
      constructor(id) {
        super();
        this.id = id;
      }
      getId() {
        return this.id;
      }
    };
    exports2.InferType = InferType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/isAssignableTo.js
var require_isAssignableTo = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/isAssignableTo.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isAssignableTo = void 0;
    var AnyType_1 = require_AnyType();
    var ArrayType_1 = require_ArrayType();
    var EnumType_1 = require_EnumType();
    var IntersectionType_1 = require_IntersectionType();
    var NullType_1 = require_NullType();
    var ObjectType_1 = require_ObjectType();
    var OptionalType_1 = require_OptionalType();
    var TupleType_1 = require_TupleType();
    var UndefinedType_1 = require_UndefinedType();
    var UnionType_1 = require_UnionType();
    var UnknownType_1 = require_UnknownType();
    var VoidType_1 = require_VoidType();
    var derefType_1 = require_derefType();
    var LiteralType_1 = require_LiteralType();
    var StringType_1 = require_StringType();
    var NumberType_1 = require_NumberType();
    var BooleanType_1 = require_BooleanType();
    var InferType_1 = require_InferType();
    var RestType_1 = require_RestType();
    var NeverType_1 = require_NeverType();
    function combineIntersectingTypes(intersection) {
      const objectTypes = [];
      const combined = intersection.getTypes().filter((type) => {
        if (type instanceof ObjectType_1.ObjectType) {
          objectTypes.push(type);
        } else {
          return true;
        }
        return false;
      });
      if (objectTypes.length === 1) {
        combined.push(objectTypes[0]);
      } else if (objectTypes.length > 1) {
        combined.push(new ObjectType_1.ObjectType(`combined-objects-${intersection.getId()}`, objectTypes, [], false));
      }
      return combined;
    }
    function getObjectProperties(type) {
      type = (0, derefType_1.derefType)(type);
      const properties = [];
      if (type instanceof ObjectType_1.ObjectType) {
        properties.push(...type.getProperties());
        for (const baseType of type.getBaseTypes()) {
          properties.push(...getObjectProperties(baseType));
        }
      }
      return properties;
    }
    function getPrimitiveType(value) {
      switch (typeof value) {
        case "string":
          return new StringType_1.StringType();
        case "number":
          return new NumberType_1.NumberType();
        case "boolean":
          return new BooleanType_1.BooleanType();
      }
    }
    function isAssignableTo(target, source, inferMap = /* @__PURE__ */ new Map(), insideTypes = /* @__PURE__ */ new Set()) {
      var _a;
      source = (0, derefType_1.derefType)(source);
      target = (0, derefType_1.derefType)(target);
      if (source instanceof NeverType_1.NeverType) {
        return true;
      }
      if (target instanceof NeverType_1.NeverType) {
        return false;
      }
      if (target instanceof InferType_1.InferType) {
        const key = target.getName();
        const infer = inferMap.get(key);
        if (infer === void 0) {
          inferMap.set(key, source);
        } else {
          inferMap.set(key, new UnionType_1.UnionType([infer, source]));
        }
        return true;
      }
      if (source.getId() === target.getId()) {
        return true;
      }
      if (insideTypes.has(source) || insideTypes.has(target)) {
        return true;
      }
      if (source instanceof AnyType_1.AnyType || target instanceof AnyType_1.AnyType) {
        return true;
      }
      if (target instanceof UnknownType_1.UnknownType) {
        return true;
      }
      if (target instanceof VoidType_1.VoidType) {
        return source instanceof NullType_1.NullType || source instanceof UndefinedType_1.UndefinedType;
      }
      if (source instanceof UnionType_1.UnionType || source instanceof EnumType_1.EnumType) {
        return source.getTypes().every((type) => isAssignableTo(target, type, inferMap, insideTypes));
      }
      if (source instanceof IntersectionType_1.IntersectionType) {
        return combineIntersectingTypes(source).some((type) => isAssignableTo(target, type, inferMap, insideTypes));
      }
      if (target instanceof ArrayType_1.ArrayType) {
        const targetItemType = target.getItem();
        if (source instanceof ArrayType_1.ArrayType) {
          return isAssignableTo(targetItemType, source.getItem(), inferMap, insideTypes);
        } else if (source instanceof TupleType_1.TupleType) {
          return isAssignableTo(targetItemType, new UnionType_1.UnionType(source.getTypes()), inferMap, insideTypes);
        } else {
          return false;
        }
      }
      if (target instanceof UnionType_1.UnionType || target instanceof EnumType_1.EnumType) {
        return target.getTypes().some((type) => isAssignableTo(type, source, inferMap, insideTypes));
      }
      if (target instanceof IntersectionType_1.IntersectionType) {
        return combineIntersectingTypes(target).every((type) => isAssignableTo(type, source, inferMap, insideTypes));
      }
      if (source instanceof LiteralType_1.LiteralType) {
        return isAssignableTo(target, getPrimitiveType(source.getValue()), inferMap);
      }
      if (target instanceof ObjectType_1.ObjectType) {
        if (target.getNonPrimitive() && (source instanceof NumberType_1.NumberType || source instanceof StringType_1.StringType || source instanceof BooleanType_1.BooleanType)) {
          return false;
        }
        const targetMembers = getObjectProperties(target);
        if (targetMembers.length === 0) {
          return !isAssignableTo(new UnionType_1.UnionType([new UndefinedType_1.UndefinedType(), new NullType_1.NullType()]), source, inferMap, insideTypes);
        } else if (source instanceof ObjectType_1.ObjectType) {
          const sourceMembers = getObjectProperties(source);
          const inCommon = targetMembers.some((targetMember) => sourceMembers.some((sourceMember) => targetMember.getName() === sourceMember.getName()));
          return targetMembers.every((targetMember) => {
            const sourceMember = sourceMembers.find((member) => targetMember.getName() === member.getName());
            return sourceMember == null ? inCommon && !targetMember.isRequired() : true;
          }) && sourceMembers.every((sourceMember) => {
            const targetMember = targetMembers.find((member) => member.getName() === sourceMember.getName());
            if (targetMember == null) {
              return true;
            }
            return isAssignableTo(targetMember.getType(), sourceMember.getType(), inferMap, new Set(insideTypes).add(source).add(target));
          });
        }
        const isArrayLikeType = source instanceof ArrayType_1.ArrayType || source instanceof TupleType_1.TupleType;
        if (isArrayLikeType) {
          const lengthPropType = (_a = targetMembers.find((prop) => prop.getName() === "length" && prop.isRequired())) === null || _a === void 0 ? void 0 : _a.getType();
          if (source instanceof ArrayType_1.ArrayType) {
            return lengthPropType instanceof NumberType_1.NumberType;
          }
          if (source instanceof TupleType_1.TupleType) {
            if (lengthPropType instanceof LiteralType_1.LiteralType) {
              const types = source.getTypes();
              const lengthPropValue = lengthPropType.getValue();
              return types.length === lengthPropValue;
            }
          }
        }
      }
      if (target instanceof TupleType_1.TupleType) {
        if (source instanceof TupleType_1.TupleType) {
          const sourceMembers = source.getTypes();
          const targetMembers = target.getTypes();
          return targetMembers.every((targetMember, i) => {
            const numTarget = targetMembers.length;
            const numSource = sourceMembers.length;
            if (i == numTarget - 1) {
              if (numTarget <= numSource + 1) {
                if (targetMember instanceof RestType_1.RestType) {
                  const remaining = [];
                  for (let j = i; j < numSource; j++) {
                    remaining.push(sourceMembers[j]);
                  }
                  return isAssignableTo(targetMember.getType(), new TupleType_1.TupleType(remaining), inferMap, insideTypes);
                } else if (numTarget < numSource) {
                  return false;
                }
              }
            }
            const sourceMember = sourceMembers[i];
            if (targetMember instanceof OptionalType_1.OptionalType) {
              if (sourceMember) {
                return isAssignableTo(targetMember, sourceMember, inferMap, insideTypes) || isAssignableTo(targetMember.getType(), sourceMember, inferMap, insideTypes);
              } else {
                return true;
              }
            } else {
              if (sourceMember === void 0) {
                return false;
              }
              return isAssignableTo(targetMember, sourceMember, inferMap, insideTypes);
            }
          });
        }
      }
      return false;
    }
    exports2.isAssignableTo = isAssignableTo;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/narrowType.js
var require_narrowType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/narrowType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.narrowType = void 0;
    var EnumType_1 = require_EnumType();
    var NeverType_1 = require_NeverType();
    var UnionType_1 = require_UnionType();
    var derefType_1 = require_derefType();
    function narrowType(type, predicate) {
      const derefed = (0, derefType_1.derefType)(type);
      if (derefed instanceof UnionType_1.UnionType || derefed instanceof EnumType_1.EnumType) {
        let changed = false;
        const types = [];
        for (const sub of derefed.getTypes()) {
          const derefedSub = (0, derefType_1.derefType)(sub);
          const narrowed = narrowType(derefedSub, predicate);
          if (!(narrowed instanceof NeverType_1.NeverType)) {
            if (narrowed === derefedSub) {
              types.push(sub);
            } else {
              types.push(narrowed);
              changed = true;
            }
          } else {
            changed = true;
          }
        }
        if (changed) {
          if (types.length === 0) {
            return new NeverType_1.NeverType();
          } else if (types.length === 1) {
            return types[0];
          } else {
            return new UnionType_1.UnionType(types);
          }
        }
        return type;
      }
      return predicate(derefed) ? type : new NeverType_1.NeverType();
    }
    exports2.narrowType = narrowType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/ConditionalTypeNodeParser.js
var require_ConditionalTypeNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/ConditionalTypeNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConditionalTypeNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var NodeParser_1 = require_NodeParser();
    var isAssignableTo_1 = require_isAssignableTo();
    var narrowType_1 = require_narrowType();
    var UnionType_1 = require_UnionType();
    var NeverType_1 = require_NeverType();
    var CheckType = class {
      constructor(parameterName, type) {
        this.parameterName = parameterName;
        this.type = type;
      }
    };
    var ConditionalTypeNodeParser = class {
      constructor(typeChecker, childNodeParser) {
        this.typeChecker = typeChecker;
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.ConditionalType;
      }
      createType(node, context) {
        const checkType = this.childNodeParser.createType(node.checkType, context);
        const extendsType = this.childNodeParser.createType(node.extendsType, context);
        const checkTypeParameterName = this.getTypeParameterName(node.checkType);
        const inferMap = /* @__PURE__ */ new Map();
        if (checkTypeParameterName == null) {
          const result = (0, isAssignableTo_1.isAssignableTo)(extendsType, checkType, inferMap);
          return this.childNodeParser.createType(result ? node.trueType : node.falseType, this.createSubContext(node, context, void 0, result ? inferMap : /* @__PURE__ */ new Map()));
        }
        const trueCheckType = (0, narrowType_1.narrowType)(checkType, (type) => (0, isAssignableTo_1.isAssignableTo)(extendsType, type, inferMap));
        const falseCheckType = (0, narrowType_1.narrowType)(checkType, (type) => !(0, isAssignableTo_1.isAssignableTo)(extendsType, type));
        const results = [];
        if (!(trueCheckType instanceof NeverType_1.NeverType)) {
          const result = this.childNodeParser.createType(node.trueType, this.createSubContext(node, context, new CheckType(checkTypeParameterName, trueCheckType), inferMap));
          if (result) {
            results.push(result);
          }
        }
        if (!(falseCheckType instanceof NeverType_1.NeverType)) {
          const result = this.childNodeParser.createType(node.falseType, this.createSubContext(node, context, new CheckType(checkTypeParameterName, falseCheckType)));
          if (result) {
            results.push(result);
          }
        }
        return new UnionType_1.UnionType(results).normalize();
      }
      getTypeParameterName(node) {
        if (typescript_1.default.isTypeReferenceNode(node)) {
          const typeSymbol = this.typeChecker.getSymbolAtLocation(node.typeName);
          if (typeSymbol.flags & typescript_1.default.SymbolFlags.TypeParameter) {
            return typeSymbol.name;
          }
        }
        return null;
      }
      createSubContext(node, parentContext, checkType, inferMap = /* @__PURE__ */ new Map()) {
        const subContext = new NodeParser_1.Context(node);
        inferMap.forEach((value, key) => {
          subContext.pushParameter(key);
          subContext.pushArgument(value);
        });
        if (checkType !== void 0) {
          if (!(checkType.parameterName in inferMap)) {
            subContext.pushParameter(checkType.parameterName);
            subContext.pushArgument(checkType.type);
          }
        }
        parentContext.getParameters().forEach((parentParameter) => {
          if (parentParameter !== (checkType === null || checkType === void 0 ? void 0 : checkType.parameterName) && !(parentParameter in inferMap)) {
            subContext.pushParameter(parentParameter);
            subContext.pushArgument(parentContext.getArgument(parentParameter));
          }
        });
        return subContext;
      }
    };
    exports2.ConditionalTypeNodeParser = ConditionalTypeNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/ConstructorType.js
var require_ConstructorType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/ConstructorType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConstructorType = void 0;
    var BaseType_1 = require_BaseType();
    var ConstructorType = class extends BaseType_1.BaseType {
      getId() {
        return "constructor";
      }
    };
    exports2.ConstructorType = ConstructorType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/ConstructorNodeParser.js
var require_ConstructorNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/ConstructorNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConstructorNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var ConstructorType_1 = require_ConstructorType();
    var ConstructorNodeParser = class {
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.ConstructorType;
      }
      createType() {
        return new ConstructorType_1.ConstructorType();
      }
    };
    exports2.ConstructorNodeParser = ConstructorNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/isHidden.js
var require_isHidden = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/isHidden.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isNodeHidden = void 0;
    var hasJsDocTag_1 = require_hasJsDocTag();
    function isNodeHidden(node) {
      return (0, hasJsDocTag_1.hasJsDocTag)(node, "hidden");
    }
    exports2.isNodeHidden = isNodeHidden;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/EnumNodeParser.js
var require_EnumNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/EnumNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EnumNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var EnumType_1 = require_EnumType();
    var isHidden_1 = require_isHidden();
    var nodeKey_1 = require_nodeKey();
    var EnumNodeParser = class {
      constructor(typeChecker) {
        this.typeChecker = typeChecker;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.EnumDeclaration || node.kind === typescript_1.default.SyntaxKind.EnumMember;
      }
      createType(node, context) {
        const members = node.kind === typescript_1.default.SyntaxKind.EnumDeclaration ? node.members.slice() : [node];
        return new EnumType_1.EnumType(`enum-${(0, nodeKey_1.getKey)(node, context)}`, members.filter((member) => !(0, isHidden_1.isNodeHidden)(member)).map((member, index) => this.getMemberValue(member, index)));
      }
      getMemberValue(member, index) {
        const constantValue = this.typeChecker.getConstantValue(member);
        if (constantValue !== void 0) {
          return constantValue;
        }
        const initializer = member.initializer;
        if (!initializer) {
          return index;
        } else if (initializer.kind === typescript_1.default.SyntaxKind.NoSubstitutionTemplateLiteral) {
          return member.name.getText();
        } else {
          return this.parseInitializer(initializer);
        }
      }
      parseInitializer(initializer) {
        if (initializer.kind === typescript_1.default.SyntaxKind.TrueKeyword) {
          return true;
        } else if (initializer.kind === typescript_1.default.SyntaxKind.FalseKeyword) {
          return false;
        } else if (initializer.kind === typescript_1.default.SyntaxKind.NullKeyword) {
          return null;
        } else if (initializer.kind === typescript_1.default.SyntaxKind.StringLiteral) {
          return initializer.text;
        } else if (initializer.kind === typescript_1.default.SyntaxKind.ParenthesizedExpression) {
          return this.parseInitializer(initializer.expression);
        } else if (initializer.kind === typescript_1.default.SyntaxKind.AsExpression) {
          return this.parseInitializer(initializer.expression);
        } else if (initializer.kind === typescript_1.default.SyntaxKind.TypeAssertionExpression) {
          return this.parseInitializer(initializer.expression);
        } else {
          return initializer.getText();
        }
      }
    };
    exports2.EnumNodeParser = EnumNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/ExpressionWithTypeArgumentsNodeParser.js
var require_ExpressionWithTypeArgumentsNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/ExpressionWithTypeArgumentsNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ExpressionWithTypeArgumentsNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var NodeParser_1 = require_NodeParser();
    var ExpressionWithTypeArgumentsNodeParser = class {
      constructor(typeChecker, childNodeParser) {
        this.typeChecker = typeChecker;
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.ExpressionWithTypeArguments;
      }
      createType(node, context) {
        const typeSymbol = this.typeChecker.getSymbolAtLocation(node.expression);
        if (typeSymbol.flags & typescript_1.default.SymbolFlags.Alias) {
          const aliasedSymbol = this.typeChecker.getAliasedSymbol(typeSymbol);
          return this.childNodeParser.createType(aliasedSymbol.declarations[0], this.createSubContext(node, context));
        } else if (typeSymbol.flags & typescript_1.default.SymbolFlags.TypeParameter) {
          return context.getArgument(typeSymbol.name);
        } else {
          return this.childNodeParser.createType(typeSymbol.declarations[0], this.createSubContext(node, context));
        }
      }
      createSubContext(node, parentContext) {
        var _a;
        const subContext = new NodeParser_1.Context(node);
        if ((_a = node.typeArguments) === null || _a === void 0 ? void 0 : _a.length) {
          node.typeArguments.forEach((typeArg) => {
            const type = this.childNodeParser.createType(typeArg, parentContext);
            subContext.pushArgument(type);
          });
        }
        return subContext;
      }
    };
    exports2.ExpressionWithTypeArgumentsNodeParser = ExpressionWithTypeArgumentsNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Type/FunctionType.js
var require_FunctionType = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Type/FunctionType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.FunctionType = void 0;
    var BaseType_1 = require_BaseType();
    var FunctionType = class extends BaseType_1.BaseType {
      getId() {
        return "function";
      }
    };
    exports2.FunctionType = FunctionType;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/FunctionNodeParser.js
var require_FunctionNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/FunctionNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.FunctionNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var FunctionType_1 = require_FunctionType();
    var FunctionNodeParser = class {
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.FunctionType;
      }
      createType() {
        return new FunctionType_1.FunctionType();
      }
    };
    exports2.FunctionNodeParser = FunctionNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/FunctionParser.js
var require_FunctionParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/FunctionParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.FunctionParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var ObjectType_1 = require_ObjectType();
    var nodeKey_1 = require_nodeKey();
    var DefinitionType_1 = require_DefinitionType();
    var FunctionParser = class {
      constructor(childNodeParser) {
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        if (node.kind === typescript_1.default.SyntaxKind.FunctionDeclaration) {
          return Boolean(node.name);
        }
        return (node.kind === typescript_1.default.SyntaxKind.ArrowFunction || node.kind === typescript_1.default.SyntaxKind.FunctionExpression) && typescript_1.default.isVariableDeclaration(node.parent);
      }
      createType(node, context) {
        const parameterTypes = node.parameters.map((parameter) => {
          return this.childNodeParser.createType(parameter, context);
        });
        const namedArguments = new ObjectType_1.ObjectType(`object-${(0, nodeKey_1.getKey)(node, context)}`, [], parameterTypes.map((parameterType, index) => {
          const required = node.parameters[index].questionToken ? false : !node.parameters[index].initializer;
          return new ObjectType_1.ObjectProperty(node.parameters[index].name.getText(), parameterType, required);
        }), false);
        return new DefinitionType_1.DefinitionType(this.getTypeName(node, context), namedArguments);
      }
      getTypeName(node, context) {
        if (typescript_1.default.isArrowFunction(node) || typescript_1.default.isFunctionExpression(node)) {
          const parent = node.parent;
          if (typescript_1.default.isVariableDeclaration(parent)) {
            return `NamedParameters<typeof ${parent.name.getText()}>`;
          }
        }
        if (typescript_1.default.isFunctionDeclaration(node)) {
          return `NamedParameters<typeof ${node.name.getText()}>`;
        }
        throw new Error("Expected to find a name for function but couldn't");
      }
    };
    exports2.FunctionParser = FunctionParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/HiddenTypeNodeParser.js
var require_HiddenTypeNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/HiddenTypeNodeParser.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.HiddenNodeParser = void 0;
    var HiddenType_1 = require_HiddenType();
    var isHidden_1 = require_isHidden();
    var HiddenNodeParser = class {
      constructor(typeChecker) {
        this.typeChecker = typeChecker;
      }
      supportsNode(node) {
        return (0, isHidden_1.isNodeHidden)(node);
      }
      createType(_node, _context) {
        return new HiddenType_1.HiddenType();
      }
    };
    exports2.HiddenNodeParser = HiddenNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/IndexedAccessTypeNodeParser.js
var require_IndexedAccessTypeNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/IndexedAccessTypeNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IndexedAccessTypeNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var LogicError_1 = require_LogicError();
    var LiteralType_1 = require_LiteralType();
    var NeverType_1 = require_NeverType();
    var NumberType_1 = require_NumberType();
    var ReferenceType_1 = require_ReferenceType();
    var StringType_1 = require_StringType();
    var TupleType_1 = require_TupleType();
    var UnionType_1 = require_UnionType();
    var derefType_1 = require_derefType();
    var typeKeys_1 = require_typeKeys();
    var IndexedAccessTypeNodeParser = class {
      constructor(typeChecker, childNodeParser) {
        this.typeChecker = typeChecker;
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.IndexedAccessType;
      }
      createIndexedType(objectType, context, indexType) {
        var _a, _b;
        if (typescript_1.default.isTypeReferenceNode(objectType) && indexType instanceof LiteralType_1.LiteralType) {
          const declaration = (_b = (_a = this.typeChecker.getSymbolAtLocation(objectType.typeName)) === null || _a === void 0 ? void 0 : _a.declarations) === null || _b === void 0 ? void 0 : _b[0];
          if (!declaration || !typescript_1.default.isTypeAliasDeclaration(declaration) || !typescript_1.default.isTypeLiteralNode(declaration.type)) {
            return void 0;
          }
          const member = declaration.type.members.find((m) => typescript_1.default.isPropertySignature(m) && Boolean(m.type) && typescript_1.default.isIdentifier(m.name) && m.name.text === indexType.getValue());
          return member && this.childNodeParser.createType(member.type, context);
        }
        return void 0;
      }
      createType(node, context) {
        const indexType = (0, derefType_1.derefType)(this.childNodeParser.createType(node.indexType, context));
        const indexedType = this.createIndexedType(node.objectType, context, indexType);
        if (indexedType) {
          return indexedType;
        }
        const objectType = (0, derefType_1.derefType)(this.childNodeParser.createType(node.objectType, context));
        if (objectType instanceof NeverType_1.NeverType || indexType instanceof NeverType_1.NeverType) {
          return new NeverType_1.NeverType();
        }
        const indexTypes = indexType instanceof UnionType_1.UnionType ? indexType.getTypes() : [indexType];
        const propertyTypes = indexTypes.map((type) => {
          if (!(type instanceof LiteralType_1.LiteralType || type instanceof StringType_1.StringType || type instanceof NumberType_1.NumberType)) {
            throw new LogicError_1.LogicError(`Unexpected type "${type.getId()}" (expected "LiteralType" or "StringType" or "NumberType")`);
          }
          const propertyType = (0, typeKeys_1.getTypeByKey)(objectType, type);
          if (!propertyType) {
            if (type instanceof NumberType_1.NumberType && objectType instanceof TupleType_1.TupleType) {
              return new UnionType_1.UnionType(objectType.getTypes());
            } else if (type instanceof LiteralType_1.LiteralType) {
              if (objectType instanceof ReferenceType_1.ReferenceType) {
                return objectType;
              }
              throw new LogicError_1.LogicError(`Invalid index "${type.getValue()}" in type "${objectType.getId()}"`);
            } else {
              throw new LogicError_1.LogicError(`No additional properties in type "${objectType.getId()}"`);
            }
          }
          return propertyType;
        });
        return propertyTypes.length === 1 ? propertyTypes[0] : new UnionType_1.UnionType(propertyTypes);
      }
    };
    exports2.IndexedAccessTypeNodeParser = IndexedAccessTypeNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/InferTypeNodeParser.js
var require_InferTypeNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/InferTypeNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InferTypeNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var InferType_1 = require_InferType();
    var InferTypeNodeParser = class {
      constructor(typeChecker, childNodeParser) {
        this.typeChecker = typeChecker;
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.InferType;
      }
      createType(node, _context) {
        return new InferType_1.InferType(node.typeParameter.name.escapedText.toString());
      }
    };
    exports2.InferTypeNodeParser = InferTypeNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/modifiers.js
var require_modifiers = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/modifiers.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isStatic = exports2.isPublic = exports2.hasModifier = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    function hasModifier(node, modifier) {
      const nodeModifiers = node.modifiers;
      if (nodeModifiers == null) {
        return false;
      } else {
        return nodeModifiers.some((nodeModifier) => nodeModifier.kind === modifier);
      }
    }
    exports2.hasModifier = hasModifier;
    function isPublic(node) {
      return !(hasModifier(node, typescript_1.default.SyntaxKind.PrivateKeyword) || hasModifier(node, typescript_1.default.SyntaxKind.ProtectedKeyword));
    }
    exports2.isPublic = isPublic;
    function isStatic(node) {
      return hasModifier(node, typescript_1.default.SyntaxKind.StaticKeyword);
    }
    exports2.isStatic = isStatic;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/InterfaceAndClassNodeParser.js
var require_InterfaceAndClassNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/InterfaceAndClassNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InterfaceAndClassNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var ArrayType_1 = require_ArrayType();
    var NeverType_1 = require_NeverType();
    var ObjectType_1 = require_ObjectType();
    var isHidden_1 = require_isHidden();
    var modifiers_1 = require_modifiers();
    var nodeKey_1 = require_nodeKey();
    var InterfaceAndClassNodeParser = class {
      constructor(typeChecker, childNodeParser, additionalProperties) {
        this.typeChecker = typeChecker;
        this.childNodeParser = childNodeParser;
        this.additionalProperties = additionalProperties;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.InterfaceDeclaration || node.kind === typescript_1.default.SyntaxKind.ClassDeclaration;
      }
      createType(node, context, reference) {
        var _a;
        if ((_a = node.typeParameters) === null || _a === void 0 ? void 0 : _a.length) {
          node.typeParameters.forEach((typeParam) => {
            const nameSymbol = this.typeChecker.getSymbolAtLocation(typeParam.name);
            context.pushParameter(nameSymbol.name);
            if (typeParam.default) {
              const type = this.childNodeParser.createType(typeParam.default, context);
              context.setDefault(nameSymbol.name, type);
            }
          });
        }
        const id = this.getTypeId(node, context);
        if (reference) {
          reference.setId(id);
          reference.setName(id);
        }
        const properties = this.getProperties(node, context);
        if (properties === void 0) {
          return new NeverType_1.NeverType();
        }
        const additionalProperties = this.getAdditionalProperties(node, context);
        if (properties.length === 0 && additionalProperties === false) {
          const arrayItemType = this.getArrayItemType(node);
          if (arrayItemType) {
            return new ArrayType_1.ArrayType(this.childNodeParser.createType(arrayItemType, context));
          }
        }
        return new ObjectType_1.ObjectType(id, this.getBaseTypes(node, context), properties, additionalProperties);
      }
      getArrayItemType(node) {
        if (node.heritageClauses && node.heritageClauses.length === 1) {
          const clause = node.heritageClauses[0];
          if (clause.types.length === 1) {
            const type = clause.types[0];
            const symbol = this.typeChecker.getSymbolAtLocation(type.expression);
            if (symbol && (symbol.name === "Array" || symbol.name === "ReadonlyArray")) {
              const typeArguments = type.typeArguments;
              if ((typeArguments === null || typeArguments === void 0 ? void 0 : typeArguments.length) === 1) {
                return typeArguments[0];
              }
            }
          }
        }
        return null;
      }
      getBaseTypes(node, context) {
        if (!node.heritageClauses) {
          return [];
        }
        return node.heritageClauses.reduce((result, baseType) => [
          ...result,
          ...baseType.types.map((expression) => this.childNodeParser.createType(expression, context))
        ], []);
      }
      getProperties(node, context) {
        let hasRequiredNever = false;
        const properties = node.members.reduce((members, member) => {
          if (typescript_1.default.isConstructorDeclaration(member)) {
            const params = member.parameters.filter((param) => typescript_1.default.isParameterPropertyDeclaration(param, param.parent));
            members.push(...params);
          } else if (typescript_1.default.isPropertySignature(member) || typescript_1.default.isPropertyDeclaration(member)) {
            members.push(member);
          }
          return members;
        }, []).filter((member) => (0, modifiers_1.isPublic)(member) && !(0, modifiers_1.isStatic)(member) && !(0, isHidden_1.isNodeHidden)(member)).reduce((entries, member) => {
          let memberType = member.type;
          if (memberType === void 0 && (member === null || member === void 0 ? void 0 : member.initializer) !== void 0) {
            const type = this.typeChecker.getTypeAtLocation(member);
            memberType = this.typeChecker.typeToTypeNode(type, node, typescript_1.default.NodeBuilderFlags.NoTruncation);
          }
          if (memberType !== void 0) {
            return [...entries, { member, memberType }];
          }
          return entries;
        }, []).map(({ member, memberType }) => new ObjectType_1.ObjectProperty(this.getPropertyName(member.name), this.childNodeParser.createType(memberType, context), !member.questionToken)).filter((prop) => {
          if (prop.isRequired() && prop.getType() instanceof NeverType_1.NeverType) {
            hasRequiredNever = true;
          }
          return !(prop.getType() instanceof NeverType_1.NeverType);
        });
        if (hasRequiredNever) {
          return void 0;
        }
        return properties;
      }
      getAdditionalProperties(node, context) {
        var _a;
        const indexSignature = node.members.find(typescript_1.default.isIndexSignatureDeclaration);
        if (!indexSignature) {
          return this.additionalProperties;
        }
        return (_a = this.childNodeParser.createType(indexSignature.type, context)) !== null && _a !== void 0 ? _a : this.additionalProperties;
      }
      getTypeId(node, context) {
        const nodeType = typescript_1.default.isInterfaceDeclaration(node) ? "interface" : "class";
        return `${nodeType}-${(0, nodeKey_1.getKey)(node, context)}`;
      }
      getPropertyName(propertyName) {
        if (propertyName.kind === typescript_1.default.SyntaxKind.ComputedPropertyName) {
          const symbol = this.typeChecker.getSymbolAtLocation(propertyName);
          if (symbol) {
            return symbol.getName();
          }
        }
        return propertyName.getText();
      }
    };
    exports2.InterfaceAndClassNodeParser = InterfaceAndClassNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/assert.js
var require_assert = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/assert.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var LogicError_1 = require_LogicError();
    function assert(value, message) {
      if (!value) {
        throw new LogicError_1.LogicError(message);
      }
    }
    exports2.default = assert;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/extractLiterals.js
var require_extractLiterals = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/extractLiterals.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.extractLiterals = void 0;
    var UnknownTypeError_1 = require_UnknownTypeError();
    var AliasType_1 = require_AliasType();
    var BooleanType_1 = require_BooleanType();
    var DefinitionType_1 = require_DefinitionType();
    var EnumType_1 = require_EnumType();
    var LiteralType_1 = require_LiteralType();
    var UnionType_1 = require_UnionType();
    function* _extractLiterals(type) {
      if (!type) {
        return;
      }
      if (type instanceof LiteralType_1.LiteralType) {
        yield type.getValue().toString();
        return;
      }
      if (type instanceof UnionType_1.UnionType || type instanceof EnumType_1.EnumType) {
        for (const t of type.getTypes()) {
          yield* _extractLiterals(t);
        }
        return;
      }
      if (type instanceof AliasType_1.AliasType || type instanceof DefinitionType_1.DefinitionType) {
        yield* _extractLiterals(type.getType());
        return;
      }
      if (type instanceof BooleanType_1.BooleanType) {
        yield* _extractLiterals(new UnionType_1.UnionType([new LiteralType_1.LiteralType("true"), new LiteralType_1.LiteralType("false")]));
        return;
      }
      throw new UnknownTypeError_1.UnknownTypeError(type);
    }
    function extractLiterals(type) {
      return [..._extractLiterals(type)];
    }
    exports2.extractLiterals = extractLiterals;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/IntrinsicNodeParser.js
var require_IntrinsicNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/IntrinsicNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IntrinsicNodeParser = exports2.intrinsicMethods = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var LiteralType_1 = require_LiteralType();
    var UnionType_1 = require_UnionType();
    var assert_1 = __importDefault2(require_assert());
    var extractLiterals_1 = require_extractLiterals();
    exports2.intrinsicMethods = {
      Uppercase: (v) => v.toUpperCase(),
      Lowercase: (v) => v.toLowerCase(),
      Capitalize: (v) => v[0].toUpperCase() + v.slice(1),
      Uncapitalize: (v) => v[0].toLowerCase() + v.slice(1)
    };
    var IntrinsicNodeParser = class {
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.IntrinsicKeyword;
      }
      createType(node, context) {
        const methodName = getParentName(node);
        const method = exports2.intrinsicMethods[methodName];
        (0, assert_1.default)(method, `Unknown intrinsic method: ${methodName}`);
        const literals = (0, extractLiterals_1.extractLiterals)(context.getArguments()[0]).map(method).map((literal) => new LiteralType_1.LiteralType(literal));
        if (literals.length === 1) {
          return literals[0];
        }
        return new UnionType_1.UnionType(literals);
      }
    };
    exports2.IntrinsicNodeParser = IntrinsicNodeParser;
    function getParentName(node) {
      const parent = node.parent;
      (0, assert_1.default)(typescript_1.default.isTypeAliasDeclaration(parent), "Only intrinsics part of a TypeAliasDeclaration are supported.");
      return parent.name.text;
    }
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/LiteralNodeParser.js
var require_LiteralNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/LiteralNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LiteralNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var LiteralNodeParser = class {
      constructor(childNodeParser) {
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.LiteralType;
      }
      createType(node, context) {
        return this.childNodeParser.createType(node.literal, context);
      }
    };
    exports2.LiteralNodeParser = LiteralNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/MappedTypeNodeParser.js
var require_MappedTypeNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/MappedTypeNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MappedTypeNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var LogicError_1 = require_LogicError();
    var NodeParser_1 = require_NodeParser();
    var AnnotatedType_1 = require_AnnotatedType();
    var ArrayType_1 = require_ArrayType();
    var DefinitionType_1 = require_DefinitionType();
    var EnumType_1 = require_EnumType();
    var LiteralType_1 = require_LiteralType();
    var NeverType_1 = require_NeverType();
    var NumberType_1 = require_NumberType();
    var ObjectType_1 = require_ObjectType();
    var StringType_1 = require_StringType();
    var SymbolType_1 = require_SymbolType();
    var UnionType_1 = require_UnionType();
    var derefType_1 = require_derefType();
    var nodeKey_1 = require_nodeKey();
    var preserveAnnotation_1 = require_preserveAnnotation();
    var removeUndefined_1 = require_removeUndefined();
    var MappedTypeNodeParser = class {
      constructor(childNodeParser, additionalProperties) {
        this.childNodeParser = childNodeParser;
        this.additionalProperties = additionalProperties;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.MappedType;
      }
      createType(node, context) {
        const constraintType = this.childNodeParser.createType(node.typeParameter.constraint, context);
        const keyListType = (0, derefType_1.derefType)(constraintType);
        const id = `indexed-type-${(0, nodeKey_1.getKey)(node, context)}`;
        if (keyListType instanceof UnionType_1.UnionType) {
          return new ObjectType_1.ObjectType(id, [], this.getProperties(node, keyListType, context), this.getAdditionalProperties(node, keyListType, context));
        } else if (keyListType instanceof LiteralType_1.LiteralType) {
          return new ObjectType_1.ObjectType(id, [], this.getProperties(node, new UnionType_1.UnionType([keyListType]), context), false);
        } else if (keyListType instanceof StringType_1.StringType || keyListType instanceof NumberType_1.NumberType || keyListType instanceof SymbolType_1.SymbolType) {
          if ((constraintType === null || constraintType === void 0 ? void 0 : constraintType.getId()) === "number") {
            const type2 = this.childNodeParser.createType(node.type, this.createSubContext(node, keyListType, context));
            return type2 instanceof NeverType_1.NeverType ? new NeverType_1.NeverType() : new ArrayType_1.ArrayType(type2);
          }
          const type = this.childNodeParser.createType(node.type, context);
          const resultType = new ObjectType_1.ObjectType(id, [], [], type);
          if (resultType) {
            let annotations;
            if (constraintType instanceof AnnotatedType_1.AnnotatedType) {
              annotations = constraintType.getAnnotations();
            } else if (constraintType instanceof DefinitionType_1.DefinitionType) {
              const childType = constraintType.getType();
              if (childType instanceof AnnotatedType_1.AnnotatedType) {
                annotations = childType.getAnnotations();
              }
            }
            if (annotations) {
              return new AnnotatedType_1.AnnotatedType(resultType, { propertyNames: annotations }, false);
            }
          }
          return resultType;
        } else if (keyListType instanceof EnumType_1.EnumType) {
          return new ObjectType_1.ObjectType(id, [], this.getValues(node, keyListType, context), false);
        } else if (keyListType instanceof NeverType_1.NeverType) {
          return new ObjectType_1.ObjectType(id, [], [], false);
        } else {
          throw new LogicError_1.LogicError(`Unexpected key type "${constraintType ? constraintType.getId() : constraintType}" for type "${node.getText()}" (expected "UnionType" or "StringType")`);
        }
      }
      mapKey(node, rawKey, context) {
        if (!node.nameType) {
          return rawKey;
        }
        const key = (0, derefType_1.derefType)(this.childNodeParser.createType(node.nameType, this.createSubContext(node, rawKey, context)));
        return key;
      }
      getProperties(node, keyListType, context) {
        return keyListType.getTypes().filter((type) => type instanceof LiteralType_1.LiteralType).map((type) => [type, this.mapKey(node, type, context)]).filter((value) => value[1] instanceof LiteralType_1.LiteralType).reduce((result, [key, mappedKey]) => {
          const propertyType = this.childNodeParser.createType(node.type, this.createSubContext(node, key, context));
          let newType = (0, derefType_1.derefAnnotatedType)(propertyType);
          let hasUndefined = false;
          if (newType instanceof UnionType_1.UnionType) {
            const { newType: newType_, numRemoved } = (0, removeUndefined_1.removeUndefined)(newType);
            hasUndefined = numRemoved > 0;
            newType = newType_;
          }
          const objectProperty = new ObjectType_1.ObjectProperty(mappedKey.getValue().toString(), (0, preserveAnnotation_1.preserveAnnotation)(propertyType, newType), !node.questionToken && !hasUndefined);
          result.push(objectProperty);
          return result;
        }, []);
      }
      getValues(node, keyListType, context) {
        return keyListType.getValues().filter((value) => value != null).map((value) => {
          const type = this.childNodeParser.createType(node.type, this.createSubContext(node, new LiteralType_1.LiteralType(value), context));
          return new ObjectType_1.ObjectProperty(value.toString(), type, !node.questionToken);
        });
      }
      getAdditionalProperties(node, keyListType, context) {
        var _a;
        const key = keyListType.getTypes().filter((type) => !(type instanceof LiteralType_1.LiteralType))[0];
        if (key) {
          return (_a = this.childNodeParser.createType(node.type, this.createSubContext(node, key, context))) !== null && _a !== void 0 ? _a : this.additionalProperties;
        } else {
          return this.additionalProperties;
        }
      }
      createSubContext(node, key, parentContext) {
        const subContext = new NodeParser_1.Context(node);
        parentContext.getParameters().forEach((parentParameter) => {
          subContext.pushParameter(parentParameter);
          subContext.pushArgument(parentContext.getArgument(parentParameter));
        });
        subContext.pushParameter(node.typeParameter.name.text);
        subContext.pushArgument(key);
        return subContext;
      }
    };
    exports2.MappedTypeNodeParser = MappedTypeNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/NamedTupleMemberNodeParser.js
var require_NamedTupleMemberNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/NamedTupleMemberNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NamedTupleMemberNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var AnnotatedType_1 = require_AnnotatedType();
    var ArrayType_1 = require_ArrayType();
    var RestType_1 = require_RestType();
    var NamedTupleMemberNodeParser = class {
      constructor(childNodeParser) {
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.NamedTupleMember;
      }
      createType(node, context, reference) {
        const baseType = this.childNodeParser.createType(node.type, context, reference);
        if (baseType instanceof ArrayType_1.ArrayType && node.getChildAt(0).kind === typescript_1.default.SyntaxKind.DotDotDotToken) {
          return new RestType_1.RestType(baseType, node.name.text);
        }
        return baseType && new AnnotatedType_1.AnnotatedType(baseType, { title: node.name.text }, false);
      }
    };
    exports2.NamedTupleMemberNodeParser = NamedTupleMemberNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/NeverTypeNodeParser.js
var require_NeverTypeNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/NeverTypeNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NeverTypeNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var NeverType_1 = require_NeverType();
    var NeverTypeNodeParser = class {
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.NeverKeyword;
      }
      createType(_node, _context) {
        return new NeverType_1.NeverType();
      }
    };
    exports2.NeverTypeNodeParser = NeverTypeNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/NullLiteralNodeParser.js
var require_NullLiteralNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/NullLiteralNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NullLiteralNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var NullType_1 = require_NullType();
    var NullLiteralNodeParser = class {
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.NullKeyword;
      }
      createType(node, context) {
        return new NullType_1.NullType();
      }
    };
    exports2.NullLiteralNodeParser = NullLiteralNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/NumberLiteralNodeParser.js
var require_NumberLiteralNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/NumberLiteralNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NumberLiteralNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var LiteralType_1 = require_LiteralType();
    var NumberLiteralNodeParser = class {
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.NumericLiteral;
      }
      createType(node, context) {
        return new LiteralType_1.LiteralType(parseFloat(node.text));
      }
    };
    exports2.NumberLiteralNodeParser = NumberLiteralNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/NumberTypeNodeParser.js
var require_NumberTypeNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/NumberTypeNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NumberTypeNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var NumberType_1 = require_NumberType();
    var NumberTypeNodeParser = class {
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.NumberKeyword;
      }
      createType(node, context) {
        return new NumberType_1.NumberType();
      }
    };
    exports2.NumberTypeNodeParser = NumberTypeNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/ObjectLiteralExpressionNodeParser.js
var require_ObjectLiteralExpressionNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/ObjectLiteralExpressionNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ObjectLiteralExpressionNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var nodeKey_1 = require_nodeKey();
    var ObjectType_1 = require_ObjectType();
    var ObjectLiteralExpressionNodeParser = class {
      constructor(childNodeParser) {
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.ObjectLiteralExpression;
      }
      createType(node, context) {
        const properties = node.properties.map((t) => new ObjectType_1.ObjectProperty(t.name.getText(), this.childNodeParser.createType(t.initializer, context), !t.questionToken));
        return new ObjectType_1.ObjectType(`object-${(0, nodeKey_1.getKey)(node, context)}`, [], properties, false);
      }
    };
    exports2.ObjectLiteralExpressionNodeParser = ObjectLiteralExpressionNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/ObjectTypeNodeParser.js
var require_ObjectTypeNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/ObjectTypeNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ObjectTypeNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var ObjectType_1 = require_ObjectType();
    var nodeKey_1 = require_nodeKey();
    var ObjectTypeNodeParser = class {
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.ObjectKeyword;
      }
      createType(node, context) {
        return new ObjectType_1.ObjectType(`object-${(0, nodeKey_1.getKey)(node, context)}`, [], [], true, true);
      }
    };
    exports2.ObjectTypeNodeParser = ObjectTypeNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/OptionalTypeNodeParser.js
var require_OptionalTypeNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/OptionalTypeNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.OptionalTypeNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var OptionalType_1 = require_OptionalType();
    var OptionalTypeNodeParser = class {
      constructor(childNodeParser) {
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.OptionalType;
      }
      createType(node, context) {
        const type = this.childNodeParser.createType(node.type, context);
        return new OptionalType_1.OptionalType(type);
      }
    };
    exports2.OptionalTypeNodeParser = OptionalTypeNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/ParameterParser.js
var require_ParameterParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/ParameterParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ParameterParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var ParameterParser = class {
      constructor(childNodeParser) {
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.Parameter;
      }
      createType(node, context) {
        return this.childNodeParser.createType(node.type, context);
      }
    };
    exports2.ParameterParser = ParameterParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/ParenthesizedNodeParser.js
var require_ParenthesizedNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/ParenthesizedNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ParenthesizedNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var ParenthesizedNodeParser = class {
      constructor(childNodeParser) {
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.ParenthesizedType;
      }
      createType(node, context) {
        return this.childNodeParser.createType(node.type, context);
      }
    };
    exports2.ParenthesizedNodeParser = ParenthesizedNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/PrefixUnaryExpressionNodeParser.js
var require_PrefixUnaryExpressionNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/PrefixUnaryExpressionNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PrefixUnaryExpressionNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var LiteralType_1 = require_LiteralType();
    var PrefixUnaryExpressionNodeParser = class {
      constructor(childNodeParser) {
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.PrefixUnaryExpression;
      }
      createType(node, context) {
        const operand = this.childNodeParser.createType(node.operand, context);
        if (operand instanceof LiteralType_1.LiteralType) {
          switch (node.operator) {
            case typescript_1.default.SyntaxKind.PlusToken:
              return new LiteralType_1.LiteralType(+operand.getValue());
            case typescript_1.default.SyntaxKind.MinusToken:
              return new LiteralType_1.LiteralType(-operand.getValue());
            case typescript_1.default.SyntaxKind.TildeToken:
              return new LiteralType_1.LiteralType(~operand.getValue());
            case typescript_1.default.SyntaxKind.ExclamationToken:
              return new LiteralType_1.LiteralType(!operand.getValue());
            default:
              throw new Error(`Unsupported prefix unary operator: ${node.operator}`);
          }
        } else {
          throw new Error(`Expected operand to be "LiteralType" but is "${operand ? operand.constructor.name : operand}"`);
        }
      }
    };
    exports2.PrefixUnaryExpressionNodeParser = PrefixUnaryExpressionNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/PropertyAccessExpressionParser.js
var require_PropertyAccessExpressionParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/PropertyAccessExpressionParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PropertyAccessExpressionParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var PropertyAccessExpressionParser = class {
      constructor(typeChecker, childNodeParser) {
        this.typeChecker = typeChecker;
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.PropertyAccessExpression;
      }
      createType(node, context) {
        const type = this.typeChecker.getTypeAtLocation(node);
        return this.childNodeParser.createType(type.symbol.declarations[0], context);
      }
    };
    exports2.PropertyAccessExpressionParser = PropertyAccessExpressionParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/RestTypeNodeParser.js
var require_RestTypeNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/RestTypeNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RestTypeNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var RestType_1 = require_RestType();
    var RestTypeNodeParser = class {
      constructor(childNodeParser) {
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.RestType;
      }
      createType(node, context) {
        return new RestType_1.RestType(this.childNodeParser.createType(node.type, context));
      }
    };
    exports2.RestTypeNodeParser = RestTypeNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/StringLiteralNodeParser.js
var require_StringLiteralNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/StringLiteralNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StringLiteralNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var LiteralType_1 = require_LiteralType();
    var StringLiteralNodeParser = class {
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.StringLiteral;
      }
      createType(node, context) {
        return new LiteralType_1.LiteralType(node.text);
      }
    };
    exports2.StringLiteralNodeParser = StringLiteralNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/StringTemplateLiteralNodeParser.js
var require_StringTemplateLiteralNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/StringTemplateLiteralNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StringTemplateLiteralNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var UnknownTypeError_1 = require_UnknownTypeError();
    var LiteralType_1 = require_LiteralType();
    var StringType_1 = require_StringType();
    var UnionType_1 = require_UnionType();
    var extractLiterals_1 = require_extractLiterals();
    var StringTemplateLiteralNodeParser = class {
      constructor(childNodeParser) {
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.NoSubstitutionTemplateLiteral || node.kind === typescript_1.default.SyntaxKind.TemplateLiteralType;
      }
      createType(node, context) {
        if (node.kind === typescript_1.default.SyntaxKind.NoSubstitutionTemplateLiteral) {
          return new LiteralType_1.LiteralType(node.text);
        }
        try {
          const prefix = node.head.text;
          const matrix = [[prefix]].concat(node.templateSpans.map((span) => {
            const suffix = span.literal.text;
            const type = this.childNodeParser.createType(span.type, context);
            return (0, extractLiterals_1.extractLiterals)(type).map((value) => value + suffix);
          }));
          const expandedLiterals = expand(matrix);
          const expandedTypes = expandedLiterals.map((literal) => new LiteralType_1.LiteralType(literal));
          if (expandedTypes.length === 1) {
            return expandedTypes[0];
          }
          return new UnionType_1.UnionType(expandedTypes);
        } catch (error) {
          if (error instanceof UnknownTypeError_1.UnknownTypeError) {
            return new StringType_1.StringType();
          }
          throw error;
        }
      }
    };
    exports2.StringTemplateLiteralNodeParser = StringTemplateLiteralNodeParser;
    function expand(matrix) {
      if (matrix.length === 1) {
        return matrix[0];
      }
      const head = matrix[0];
      const nested = expand(matrix.slice(1));
      const combined = head.map((prefix) => nested.map((suffix) => prefix + suffix));
      return [].concat(...combined);
    }
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/StringTypeNodeParser.js
var require_StringTypeNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/StringTypeNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StringTypeNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var StringType_1 = require_StringType();
    var StringTypeNodeParser = class {
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.StringKeyword;
      }
      createType(node, context) {
        return new StringType_1.StringType();
      }
    };
    exports2.StringTypeNodeParser = StringTypeNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/SymbolTypeNodeParser.js
var require_SymbolTypeNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/SymbolTypeNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SymbolTypeNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var SymbolType_1 = require_SymbolType();
    var SymbolTypeNodeParser = class {
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.SymbolKeyword;
      }
      createType(node, context) {
        return new SymbolType_1.SymbolType();
      }
    };
    exports2.SymbolTypeNodeParser = SymbolTypeNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/TupleNodeParser.js
var require_TupleNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/TupleNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TupleNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var TupleType_1 = require_TupleType();
    var TupleNodeParser = class {
      constructor(typeChecker, childNodeParser) {
        this.typeChecker = typeChecker;
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.TupleType;
      }
      createType(node, context) {
        return new TupleType_1.TupleType(node.elements.map((item) => {
          return this.childNodeParser.createType(item, context);
        }));
      }
    };
    exports2.TupleNodeParser = TupleNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/TypeAliasNodeParser.js
var require_TypeAliasNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/TypeAliasNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TypeAliasNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var AliasType_1 = require_AliasType();
    var NeverType_1 = require_NeverType();
    var nodeKey_1 = require_nodeKey();
    var TypeAliasNodeParser = class {
      constructor(typeChecker, childNodeParser) {
        this.typeChecker = typeChecker;
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.TypeAliasDeclaration;
      }
      createType(node, context, reference) {
        var _a;
        if ((_a = node.typeParameters) === null || _a === void 0 ? void 0 : _a.length) {
          for (const typeParam of node.typeParameters) {
            const nameSymbol = this.typeChecker.getSymbolAtLocation(typeParam.name);
            context.pushParameter(nameSymbol.name);
            if (typeParam.default) {
              const type2 = this.childNodeParser.createType(typeParam.default, context);
              context.setDefault(nameSymbol.name, type2);
            }
          }
        }
        const id = this.getTypeId(node, context);
        const name = this.getTypeName(node, context);
        if (reference) {
          reference.setId(id);
          reference.setName(name);
        }
        const type = this.childNodeParser.createType(node.type, context);
        if (type instanceof NeverType_1.NeverType) {
          return new NeverType_1.NeverType();
        }
        return new AliasType_1.AliasType(id, type);
      }
      getTypeId(node, context) {
        return `alias-${(0, nodeKey_1.getKey)(node, context)}`;
      }
      getTypeName(node, context) {
        const argumentIds = context.getArguments().map((arg) => arg === null || arg === void 0 ? void 0 : arg.getName());
        const fullName = node.name.getText();
        return argumentIds.length ? `${fullName}<${argumentIds.join(",")}>` : fullName;
      }
    };
    exports2.TypeAliasNodeParser = TypeAliasNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/TypeLiteralNodeParser.js
var require_TypeLiteralNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/TypeLiteralNodeParser.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TypeLiteralNodeParser = void 0;
    var typescript_1 = __importStar2(require("typescript"));
    var FunctionType_1 = require_FunctionType();
    var NeverType_1 = require_NeverType();
    var ObjectType_1 = require_ObjectType();
    var isHidden_1 = require_isHidden();
    var nodeKey_1 = require_nodeKey();
    var TypeLiteralNodeParser = class {
      constructor(typeChecker, childNodeParser, additionalProperties) {
        this.typeChecker = typeChecker;
        this.childNodeParser = childNodeParser;
        this.additionalProperties = additionalProperties;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.TypeLiteral;
      }
      createType(node, context, reference) {
        const id = this.getTypeId(node, context);
        if (reference) {
          reference.setId(id);
          reference.setName(id);
        }
        const properties = this.getProperties(node, context);
        if (properties === void 0) {
          return new NeverType_1.NeverType();
        }
        return new ObjectType_1.ObjectType(id, [], properties, this.getAdditionalProperties(node, context));
      }
      getProperties(node, context) {
        let hasRequiredNever = false;
        const properties = node.members.filter((element) => typescript_1.default.isPropertySignature(element) || typescript_1.default.isMethodSignature(element)).filter((propertyNode) => !(0, isHidden_1.isNodeHidden)(propertyNode)).map((propertyNode) => new ObjectType_1.ObjectProperty(this.getPropertyName(propertyNode.name), (0, typescript_1.isPropertySignature)(propertyNode) ? this.childNodeParser.createType(propertyNode.type, context) : new FunctionType_1.FunctionType(), !propertyNode.questionToken)).filter((prop) => {
          if (prop.isRequired() && prop.getType() instanceof NeverType_1.NeverType) {
            hasRequiredNever = true;
          }
          return !(prop.getType() instanceof NeverType_1.NeverType);
        });
        if (hasRequiredNever) {
          return void 0;
        }
        return properties;
      }
      getAdditionalProperties(node, context) {
        var _a;
        const indexSignature = node.members.find(typescript_1.default.isIndexSignatureDeclaration);
        if (!indexSignature) {
          return this.additionalProperties;
        }
        return (_a = this.childNodeParser.createType(indexSignature.type, context)) !== null && _a !== void 0 ? _a : this.additionalProperties;
      }
      getTypeId(node, context) {
        return `structure-${(0, nodeKey_1.getKey)(node, context)}`;
      }
      getPropertyName(propertyName) {
        if (propertyName.kind === typescript_1.default.SyntaxKind.ComputedPropertyName) {
          const symbol = this.typeChecker.getSymbolAtLocation(propertyName);
          if (symbol) {
            return symbol.getName();
          }
        }
        try {
          return propertyName.getText();
        } catch {
          return propertyName.escapedText;
        }
      }
    };
    exports2.TypeLiteralNodeParser = TypeLiteralNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/TypeofNodeParser.js
var require_TypeofNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/TypeofNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TypeofNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var LogicError_1 = require_LogicError();
    var ObjectType_1 = require_ObjectType();
    var nodeKey_1 = require_nodeKey();
    var LiteralType_1 = require_LiteralType();
    var UnknownType_1 = require_UnknownType();
    var TypeofNodeParser = class {
      constructor(typeChecker, childNodeParser) {
        this.typeChecker = typeChecker;
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.TypeQuery;
      }
      createType(node, context, reference) {
        var _a;
        let symbol = this.typeChecker.getSymbolAtLocation(node.exprName);
        if (symbol.flags & typescript_1.default.SymbolFlags.Alias) {
          symbol = this.typeChecker.getAliasedSymbol(symbol);
        }
        const valueDec = symbol.valueDeclaration;
        if (typescript_1.default.isEnumDeclaration(valueDec)) {
          return this.createObjectFromEnum(valueDec, context, reference);
        } else if (typescript_1.default.isVariableDeclaration(valueDec) || typescript_1.default.isPropertySignature(valueDec) || typescript_1.default.isPropertyDeclaration(valueDec)) {
          let initializer;
          if (valueDec.type) {
            return this.childNodeParser.createType(valueDec.type, context);
          } else if (initializer = valueDec === null || valueDec === void 0 ? void 0 : valueDec.initializer) {
            return this.childNodeParser.createType(initializer, context);
          }
        } else if (typescript_1.default.isClassDeclaration(valueDec)) {
          return this.childNodeParser.createType(valueDec, context);
        } else if (typescript_1.default.isPropertyAssignment(valueDec)) {
          return this.childNodeParser.createType(valueDec.initializer, context);
        } else if (valueDec.kind === typescript_1.default.SyntaxKind.FunctionDeclaration) {
          return new UnknownType_1.UnknownType(`(${valueDec.parameters.map((p) => p.getFullText()).join(",")}) -> ${(_a = valueDec.type) === null || _a === void 0 ? void 0 : _a.getFullText()}`);
        }
        throw new LogicError_1.LogicError(`Invalid type query "${valueDec.getFullText()}" (ts.SyntaxKind = ${valueDec.kind})`);
      }
      createObjectFromEnum(node, context, reference) {
        const id = `typeof-enum-${(0, nodeKey_1.getKey)(node, context)}`;
        if (reference) {
          reference.setId(id);
          reference.setName(id);
        }
        let type = null;
        const properties = node.members.map((member) => {
          const name = member.name.getText();
          if (member.initializer) {
            type = this.childNodeParser.createType(member.initializer, context);
          } else if (type === null) {
            type = new LiteralType_1.LiteralType(0);
          } else if (type instanceof LiteralType_1.LiteralType && typeof type.getValue() === "number") {
            type = new LiteralType_1.LiteralType(+type.getValue() + 1);
          } else {
            throw new LogicError_1.LogicError(`Enum initializer missing for "${name}"`);
          }
          return new ObjectType_1.ObjectProperty(name, type, true);
        });
        return new ObjectType_1.ObjectType(id, [], properties, false);
      }
    };
    exports2.TypeofNodeParser = TypeofNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/TypeOperatorNodeParser.js
var require_TypeOperatorNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/TypeOperatorNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TypeOperatorNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var ArrayType_1 = require_ArrayType();
    var NumberType_1 = require_NumberType();
    var ObjectType_1 = require_ObjectType();
    var StringType_1 = require_StringType();
    var UnionType_1 = require_UnionType();
    var derefType_1 = require_derefType();
    var typeKeys_1 = require_typeKeys();
    var TypeOperatorNodeParser = class {
      constructor(childNodeParser) {
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.TypeOperator;
      }
      createType(node, context) {
        const type = this.childNodeParser.createType(node.type, context);
        const derefed = (0, derefType_1.derefType)(type);
        if (node.operator === typescript_1.default.SyntaxKind.ReadonlyKeyword && derefed) {
          return derefed;
        }
        if (derefed instanceof ArrayType_1.ArrayType) {
          return new NumberType_1.NumberType();
        }
        const keys = (0, typeKeys_1.getTypeKeys)(type);
        if (derefed instanceof ObjectType_1.ObjectType && derefed.getAdditionalProperties()) {
          return new UnionType_1.UnionType([...keys, new StringType_1.StringType()]);
        }
        if (keys.length === 1) {
          return keys[0];
        }
        return new UnionType_1.UnionType(keys);
      }
    };
    exports2.TypeOperatorNodeParser = TypeOperatorNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/TypeReferenceNodeParser.js
var require_TypeReferenceNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/TypeReferenceNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TypeReferenceNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var NodeParser_1 = require_NodeParser();
    var AnnotatedType_1 = require_AnnotatedType();
    var AnyType_1 = require_AnyType();
    var ArrayType_1 = require_ArrayType();
    var StringType_1 = require_StringType();
    var invalidTypes = {
      [typescript_1.default.SyntaxKind.ModuleDeclaration]: true,
      [typescript_1.default.SyntaxKind.VariableDeclaration]: true
    };
    var TypeReferenceNodeParser = class {
      constructor(typeChecker, childNodeParser) {
        this.typeChecker = typeChecker;
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.TypeReference;
      }
      createType(node, context) {
        var _a, _b;
        const typeSymbol = (_a = this.typeChecker.getSymbolAtLocation(node.typeName)) !== null && _a !== void 0 ? _a : node.typeName.symbol;
        if (typeSymbol.name === "Promise") {
          return this.childNodeParser.createType(node.typeArguments[0], this.createSubContext(node, context));
        }
        if (typeSymbol.flags & typescript_1.default.SymbolFlags.Alias) {
          const aliasedSymbol = this.typeChecker.getAliasedSymbol(typeSymbol);
          const declaration = (_b = aliasedSymbol.declarations) === null || _b === void 0 ? void 0 : _b.filter((n) => !invalidTypes[n.kind])[0];
          if (!declaration) {
            return new AnyType_1.AnyType();
          }
          return this.childNodeParser.createType(declaration, this.createSubContext(node, context));
        }
        if (typeSymbol.flags & typescript_1.default.SymbolFlags.TypeParameter) {
          return context.getArgument(typeSymbol.name);
        }
        if (typeSymbol.name === "Array" || typeSymbol.name === "ReadonlyArray") {
          const type = this.createSubContext(node, context).getArguments()[0];
          return type === void 0 ? new AnyType_1.AnyType() : new ArrayType_1.ArrayType(type);
        }
        if (typeSymbol.name === "Date") {
          return new AnnotatedType_1.AnnotatedType(new StringType_1.StringType(), { format: "date-time" }, false);
        }
        if (typeSymbol.name === "RegExp") {
          return new AnnotatedType_1.AnnotatedType(new StringType_1.StringType(), { format: "regex" }, false);
        }
        if (typeSymbol.name === "URL") {
          return new AnnotatedType_1.AnnotatedType(new StringType_1.StringType(), { format: "uri" }, false);
        }
        return this.childNodeParser.createType(typeSymbol.declarations.filter((n) => !invalidTypes[n.kind])[0], this.createSubContext(node, context));
      }
      createSubContext(node, parentContext) {
        var _a;
        const subContext = new NodeParser_1.Context(node);
        if ((_a = node.typeArguments) === null || _a === void 0 ? void 0 : _a.length) {
          for (const typeArg of node.typeArguments) {
            subContext.pushArgument(this.childNodeParser.createType(typeArg, parentContext));
          }
        }
        return subContext;
      }
    };
    exports2.TypeReferenceNodeParser = TypeReferenceNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/UndefinedTypeNodeParser.js
var require_UndefinedTypeNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/UndefinedTypeNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UndefinedTypeNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var UndefinedType_1 = require_UndefinedType();
    var UndefinedTypeNodeParser = class {
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.UndefinedKeyword;
      }
      createType(node, context) {
        return new UndefinedType_1.UndefinedType();
      }
    };
    exports2.UndefinedTypeNodeParser = UndefinedTypeNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/UnionNodeParser.js
var require_UnionNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/UnionNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UnionNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var UnionType_1 = require_UnionType();
    var notNever_1 = require_notNever();
    var NeverType_1 = require_NeverType();
    var UnionNodeParser = class {
      constructor(typeChecker, childNodeParser) {
        this.typeChecker = typeChecker;
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.UnionType;
      }
      createType(node, context) {
        const types = node.types.map((subnode) => {
          return this.childNodeParser.createType(subnode, context);
        }).filter(notNever_1.notNever);
        if (types.length === 1) {
          return types[0];
        } else if (types.length === 0) {
          return new NeverType_1.NeverType();
        }
        return new UnionType_1.UnionType(types);
      }
    };
    exports2.UnionNodeParser = UnionNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/UnknownTypeNodeParser.js
var require_UnknownTypeNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/UnknownTypeNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.UnknownTypeNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var UnknownType_1 = require_UnknownType();
    var UnknownTypeNodeParser = class {
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.UnknownKeyword;
      }
      createType(node, context) {
        return new UnknownType_1.UnknownType();
      }
    };
    exports2.UnknownTypeNodeParser = UnknownTypeNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/VoidTypeNodeParser.js
var require_VoidTypeNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/VoidTypeNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.VoidTypeNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var VoidType_1 = require_VoidType();
    var VoidTypeNodeParser = class {
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.VoidKeyword;
      }
      createType(node, context) {
        return new VoidType_1.VoidType();
      }
    };
    exports2.VoidTypeNodeParser = VoidTypeNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/TopRefNodeParser.js
var require_TopRefNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/TopRefNodeParser.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TopRefNodeParser = void 0;
    var DefinitionType_1 = require_DefinitionType();
    var TopRefNodeParser = class {
      constructor(childNodeParser, fullName, topRef) {
        this.childNodeParser = childNodeParser;
        this.fullName = fullName;
        this.topRef = topRef;
      }
      createType(node, context) {
        const baseType = this.childNodeParser.createType(node, context);
        if (this.topRef && !(baseType instanceof DefinitionType_1.DefinitionType)) {
          return new DefinitionType_1.DefinitionType(this.fullName, baseType);
        } else if (!this.topRef && baseType instanceof DefinitionType_1.DefinitionType) {
          return baseType.getType();
        } else {
          return baseType;
        }
      }
    };
    exports2.TopRefNodeParser = TopRefNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/SatisfiesNodeParser.js
var require_SatisfiesNodeParser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/NodeParser/SatisfiesNodeParser.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SatisfiesNodeParser = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var SatisfiesNodeParser = class {
      constructor(childNodeParser) {
        this.childNodeParser = childNodeParser;
      }
      supportsNode(node) {
        return node.kind === typescript_1.default.SyntaxKind.SatisfiesExpression;
      }
      createType(node, context) {
        return this.childNodeParser.createType(node.expression, context);
      }
    };
    exports2.SatisfiesNodeParser = SatisfiesNodeParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/factory/parser.js
var require_parser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/factory/parser.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createParser = void 0;
    var BasicAnnotationsReader_1 = require_BasicAnnotationsReader();
    var ExtendedAnnotationsReader_1 = require_ExtendedAnnotationsReader();
    var ChainNodeParser_1 = require_ChainNodeParser();
    var CircularReferenceNodeParser_1 = require_CircularReferenceNodeParser();
    var Config_12 = require_Config();
    var ExposeNodeParser_1 = require_ExposeNodeParser();
    var AnnotatedNodeParser_1 = require_AnnotatedNodeParser();
    var AnyTypeNodeParser_1 = require_AnyTypeNodeParser();
    var ArrayLiteralExpressionNodeParser_1 = require_ArrayLiteralExpressionNodeParser();
    var ArrayNodeParser_1 = require_ArrayNodeParser();
    var AsExpressionNodeParser_1 = require_AsExpressionNodeParser();
    var BooleanLiteralNodeParser_1 = require_BooleanLiteralNodeParser();
    var BooleanTypeNodeParser_1 = require_BooleanTypeNodeParser();
    var CallExpressionParser_1 = require_CallExpressionParser();
    var ConditionalTypeNodeParser_1 = require_ConditionalTypeNodeParser();
    var ConstructorNodeParser_1 = require_ConstructorNodeParser();
    var EnumNodeParser_1 = require_EnumNodeParser();
    var ExpressionWithTypeArgumentsNodeParser_1 = require_ExpressionWithTypeArgumentsNodeParser();
    var FunctionNodeParser_1 = require_FunctionNodeParser();
    var FunctionParser_1 = require_FunctionParser();
    var HiddenTypeNodeParser_1 = require_HiddenTypeNodeParser();
    var IndexedAccessTypeNodeParser_1 = require_IndexedAccessTypeNodeParser();
    var InferTypeNodeParser_1 = require_InferTypeNodeParser();
    var InterfaceAndClassNodeParser_1 = require_InterfaceAndClassNodeParser();
    var IntersectionNodeParser_1 = require_IntersectionNodeParser();
    var IntrinsicNodeParser_1 = require_IntrinsicNodeParser();
    var LiteralNodeParser_1 = require_LiteralNodeParser();
    var MappedTypeNodeParser_1 = require_MappedTypeNodeParser();
    var NamedTupleMemberNodeParser_1 = require_NamedTupleMemberNodeParser();
    var NeverTypeNodeParser_1 = require_NeverTypeNodeParser();
    var NullLiteralNodeParser_1 = require_NullLiteralNodeParser();
    var NumberLiteralNodeParser_1 = require_NumberLiteralNodeParser();
    var NumberTypeNodeParser_1 = require_NumberTypeNodeParser();
    var ObjectLiteralExpressionNodeParser_1 = require_ObjectLiteralExpressionNodeParser();
    var ObjectTypeNodeParser_1 = require_ObjectTypeNodeParser();
    var OptionalTypeNodeParser_1 = require_OptionalTypeNodeParser();
    var ParameterParser_1 = require_ParameterParser();
    var ParenthesizedNodeParser_1 = require_ParenthesizedNodeParser();
    var PrefixUnaryExpressionNodeParser_1 = require_PrefixUnaryExpressionNodeParser();
    var PropertyAccessExpressionParser_1 = require_PropertyAccessExpressionParser();
    var RestTypeNodeParser_1 = require_RestTypeNodeParser();
    var StringLiteralNodeParser_1 = require_StringLiteralNodeParser();
    var StringTemplateLiteralNodeParser_1 = require_StringTemplateLiteralNodeParser();
    var StringTypeNodeParser_1 = require_StringTypeNodeParser();
    var SymbolTypeNodeParser_1 = require_SymbolTypeNodeParser();
    var TupleNodeParser_1 = require_TupleNodeParser();
    var TypeAliasNodeParser_1 = require_TypeAliasNodeParser();
    var TypeLiteralNodeParser_1 = require_TypeLiteralNodeParser();
    var TypeofNodeParser_1 = require_TypeofNodeParser();
    var TypeOperatorNodeParser_1 = require_TypeOperatorNodeParser();
    var TypeReferenceNodeParser_1 = require_TypeReferenceNodeParser();
    var UndefinedTypeNodeParser_1 = require_UndefinedTypeNodeParser();
    var UnionNodeParser_1 = require_UnionNodeParser();
    var UnknownTypeNodeParser_1 = require_UnknownTypeNodeParser();
    var VoidTypeNodeParser_1 = require_VoidTypeNodeParser();
    var TopRefNodeParser_1 = require_TopRefNodeParser();
    var SatisfiesNodeParser_1 = require_SatisfiesNodeParser();
    function createParser(program, config2, augmentor) {
      const typeChecker = program.getTypeChecker();
      const chainNodeParser = new ChainNodeParser_1.ChainNodeParser(typeChecker, []);
      const mergedConfig = { ...Config_12.DEFAULT_CONFIG, ...config2 };
      function withExpose(nodeParser) {
        return new ExposeNodeParser_1.ExposeNodeParser(typeChecker, nodeParser, mergedConfig.expose, mergedConfig.jsDoc);
      }
      function withTopRef(nodeParser) {
        return new TopRefNodeParser_1.TopRefNodeParser(chainNodeParser, mergedConfig.type, mergedConfig.topRef);
      }
      function withJsDoc(nodeParser) {
        const extraTags = new Set(mergedConfig.extraTags);
        if (mergedConfig.jsDoc === "extended") {
          return new AnnotatedNodeParser_1.AnnotatedNodeParser(nodeParser, new ExtendedAnnotationsReader_1.ExtendedAnnotationsReader(typeChecker, extraTags, mergedConfig.markdownDescription));
        } else if (mergedConfig.jsDoc === "basic") {
          return new AnnotatedNodeParser_1.AnnotatedNodeParser(nodeParser, new BasicAnnotationsReader_1.BasicAnnotationsReader(extraTags));
        } else {
          return nodeParser;
        }
      }
      function withCircular(nodeParser) {
        return new CircularReferenceNodeParser_1.CircularReferenceNodeParser(nodeParser);
      }
      if (augmentor) {
        augmentor(chainNodeParser);
      }
      chainNodeParser.addNodeParser(new HiddenTypeNodeParser_1.HiddenNodeParser(typeChecker)).addNodeParser(new StringTypeNodeParser_1.StringTypeNodeParser()).addNodeParser(new SymbolTypeNodeParser_1.SymbolTypeNodeParser()).addNodeParser(new NumberTypeNodeParser_1.NumberTypeNodeParser()).addNodeParser(new BooleanTypeNodeParser_1.BooleanTypeNodeParser()).addNodeParser(new AnyTypeNodeParser_1.AnyTypeNodeParser()).addNodeParser(new UnknownTypeNodeParser_1.UnknownTypeNodeParser()).addNodeParser(new VoidTypeNodeParser_1.VoidTypeNodeParser()).addNodeParser(new UndefinedTypeNodeParser_1.UndefinedTypeNodeParser()).addNodeParser(new NeverTypeNodeParser_1.NeverTypeNodeParser()).addNodeParser(new ObjectTypeNodeParser_1.ObjectTypeNodeParser()).addNodeParser(new AsExpressionNodeParser_1.AsExpressionNodeParser(chainNodeParser)).addNodeParser(new SatisfiesNodeParser_1.SatisfiesNodeParser(chainNodeParser)).addNodeParser(new FunctionParser_1.FunctionParser(chainNodeParser)).addNodeParser(withJsDoc(new ParameterParser_1.ParameterParser(chainNodeParser))).addNodeParser(new StringLiteralNodeParser_1.StringLiteralNodeParser()).addNodeParser(new StringTemplateLiteralNodeParser_1.StringTemplateLiteralNodeParser(chainNodeParser)).addNodeParser(new IntrinsicNodeParser_1.IntrinsicNodeParser()).addNodeParser(new NumberLiteralNodeParser_1.NumberLiteralNodeParser()).addNodeParser(new BooleanLiteralNodeParser_1.BooleanLiteralNodeParser()).addNodeParser(new NullLiteralNodeParser_1.NullLiteralNodeParser()).addNodeParser(new FunctionNodeParser_1.FunctionNodeParser()).addNodeParser(new ConstructorNodeParser_1.ConstructorNodeParser()).addNodeParser(new ObjectLiteralExpressionNodeParser_1.ObjectLiteralExpressionNodeParser(chainNodeParser)).addNodeParser(new ArrayLiteralExpressionNodeParser_1.ArrayLiteralExpressionNodeParser(chainNodeParser)).addNodeParser(new PrefixUnaryExpressionNodeParser_1.PrefixUnaryExpressionNodeParser(chainNodeParser)).addNodeParser(new LiteralNodeParser_1.LiteralNodeParser(chainNodeParser)).addNodeParser(new ParenthesizedNodeParser_1.ParenthesizedNodeParser(chainNodeParser)).addNodeParser(new TypeReferenceNodeParser_1.TypeReferenceNodeParser(typeChecker, chainNodeParser)).addNodeParser(new ExpressionWithTypeArgumentsNodeParser_1.ExpressionWithTypeArgumentsNodeParser(typeChecker, chainNodeParser)).addNodeParser(new IndexedAccessTypeNodeParser_1.IndexedAccessTypeNodeParser(typeChecker, chainNodeParser)).addNodeParser(new InferTypeNodeParser_1.InferTypeNodeParser(typeChecker, chainNodeParser)).addNodeParser(new TypeofNodeParser_1.TypeofNodeParser(typeChecker, chainNodeParser)).addNodeParser(new MappedTypeNodeParser_1.MappedTypeNodeParser(chainNodeParser, mergedConfig.additionalProperties)).addNodeParser(new ConditionalTypeNodeParser_1.ConditionalTypeNodeParser(typeChecker, chainNodeParser)).addNodeParser(new TypeOperatorNodeParser_1.TypeOperatorNodeParser(chainNodeParser)).addNodeParser(new UnionNodeParser_1.UnionNodeParser(typeChecker, chainNodeParser)).addNodeParser(new IntersectionNodeParser_1.IntersectionNodeParser(typeChecker, chainNodeParser)).addNodeParser(new TupleNodeParser_1.TupleNodeParser(typeChecker, chainNodeParser)).addNodeParser(new NamedTupleMemberNodeParser_1.NamedTupleMemberNodeParser(chainNodeParser)).addNodeParser(new OptionalTypeNodeParser_1.OptionalTypeNodeParser(chainNodeParser)).addNodeParser(new RestTypeNodeParser_1.RestTypeNodeParser(chainNodeParser)).addNodeParser(new CallExpressionParser_1.CallExpressionParser(typeChecker, chainNodeParser)).addNodeParser(new PropertyAccessExpressionParser_1.PropertyAccessExpressionParser(typeChecker, chainNodeParser)).addNodeParser(withCircular(withExpose(withJsDoc(new TypeAliasNodeParser_1.TypeAliasNodeParser(typeChecker, chainNodeParser))))).addNodeParser(withExpose(withJsDoc(new EnumNodeParser_1.EnumNodeParser(typeChecker)))).addNodeParser(withCircular(withExpose(withJsDoc(new InterfaceAndClassNodeParser_1.InterfaceAndClassNodeParser(typeChecker, withJsDoc(chainNodeParser), mergedConfig.additionalProperties))))).addNodeParser(withCircular(withExpose(withJsDoc(new TypeLiteralNodeParser_1.TypeLiteralNodeParser(typeChecker, withJsDoc(chainNodeParser), mergedConfig.additionalProperties))))).addNodeParser(new ArrayNodeParser_1.ArrayNodeParser(chainNodeParser));
      return withTopRef(chainNodeParser);
    }
    exports2.createParser = createParser;
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/fs.realpath/old.js
var require_old = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/fs.realpath/old.js"(exports2) {
    var pathModule = require("path");
    var isWindows = process.platform === "win32";
    var fs = require("fs");
    var DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);
    function rethrow() {
      var callback;
      if (DEBUG) {
        var backtrace = new Error();
        callback = debugCallback;
      } else
        callback = missingCallback;
      return callback;
      function debugCallback(err) {
        if (err) {
          backtrace.message = err.message;
          err = backtrace;
          missingCallback(err);
        }
      }
      function missingCallback(err) {
        if (err) {
          if (process.throwDeprecation)
            throw err;
          else if (!process.noDeprecation) {
            var msg = "fs: missing callback " + (err.stack || err.message);
            if (process.traceDeprecation)
              console.trace(msg);
            else
              console.error(msg);
          }
        }
      }
    }
    function maybeCallback(cb) {
      return typeof cb === "function" ? cb : rethrow();
    }
    var normalize = pathModule.normalize;
    if (isWindows) {
      nextPartRe = /(.*?)(?:[\/\\]+|$)/g;
    } else {
      nextPartRe = /(.*?)(?:[\/]+|$)/g;
    }
    var nextPartRe;
    if (isWindows) {
      splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
    } else {
      splitRootRe = /^[\/]*/;
    }
    var splitRootRe;
    exports2.realpathSync = function realpathSync(p, cache) {
      p = pathModule.resolve(p);
      if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
        return cache[p];
      }
      var original = p, seenLinks = {}, knownHard = {};
      var pos;
      var current;
      var base;
      var previous;
      start();
      function start() {
        var m = splitRootRe.exec(p);
        pos = m[0].length;
        current = m[0];
        base = m[0];
        previous = "";
        if (isWindows && !knownHard[base]) {
          fs.lstatSync(base);
          knownHard[base] = true;
        }
      }
      while (pos < p.length) {
        nextPartRe.lastIndex = pos;
        var result = nextPartRe.exec(p);
        previous = current;
        current += result[0];
        base = previous + result[1];
        pos = nextPartRe.lastIndex;
        if (knownHard[base] || cache && cache[base] === base) {
          continue;
        }
        var resolvedLink;
        if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
          resolvedLink = cache[base];
        } else {
          var stat = fs.lstatSync(base);
          if (!stat.isSymbolicLink()) {
            knownHard[base] = true;
            if (cache)
              cache[base] = base;
            continue;
          }
          var linkTarget = null;
          if (!isWindows) {
            var id = stat.dev.toString(32) + ":" + stat.ino.toString(32);
            if (seenLinks.hasOwnProperty(id)) {
              linkTarget = seenLinks[id];
            }
          }
          if (linkTarget === null) {
            fs.statSync(base);
            linkTarget = fs.readlinkSync(base);
          }
          resolvedLink = pathModule.resolve(previous, linkTarget);
          if (cache)
            cache[base] = resolvedLink;
          if (!isWindows)
            seenLinks[id] = linkTarget;
        }
        p = pathModule.resolve(resolvedLink, p.slice(pos));
        start();
      }
      if (cache)
        cache[original] = p;
      return p;
    };
    exports2.realpath = function realpath(p, cache, cb) {
      if (typeof cb !== "function") {
        cb = maybeCallback(cache);
        cache = null;
      }
      p = pathModule.resolve(p);
      if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
        return process.nextTick(cb.bind(null, null, cache[p]));
      }
      var original = p, seenLinks = {}, knownHard = {};
      var pos;
      var current;
      var base;
      var previous;
      start();
      function start() {
        var m = splitRootRe.exec(p);
        pos = m[0].length;
        current = m[0];
        base = m[0];
        previous = "";
        if (isWindows && !knownHard[base]) {
          fs.lstat(base, function(err) {
            if (err)
              return cb(err);
            knownHard[base] = true;
            LOOP();
          });
        } else {
          process.nextTick(LOOP);
        }
      }
      function LOOP() {
        if (pos >= p.length) {
          if (cache)
            cache[original] = p;
          return cb(null, p);
        }
        nextPartRe.lastIndex = pos;
        var result = nextPartRe.exec(p);
        previous = current;
        current += result[0];
        base = previous + result[1];
        pos = nextPartRe.lastIndex;
        if (knownHard[base] || cache && cache[base] === base) {
          return process.nextTick(LOOP);
        }
        if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
          return gotResolvedLink(cache[base]);
        }
        return fs.lstat(base, gotStat);
      }
      function gotStat(err, stat) {
        if (err)
          return cb(err);
        if (!stat.isSymbolicLink()) {
          knownHard[base] = true;
          if (cache)
            cache[base] = base;
          return process.nextTick(LOOP);
        }
        if (!isWindows) {
          var id = stat.dev.toString(32) + ":" + stat.ino.toString(32);
          if (seenLinks.hasOwnProperty(id)) {
            return gotTarget(null, seenLinks[id], base);
          }
        }
        fs.stat(base, function(err2) {
          if (err2)
            return cb(err2);
          fs.readlink(base, function(err3, target) {
            if (!isWindows)
              seenLinks[id] = target;
            gotTarget(err3, target);
          });
        });
      }
      function gotTarget(err, target, base2) {
        if (err)
          return cb(err);
        var resolvedLink = pathModule.resolve(previous, target);
        if (cache)
          cache[base2] = resolvedLink;
        gotResolvedLink(resolvedLink);
      }
      function gotResolvedLink(resolvedLink) {
        p = pathModule.resolve(resolvedLink, p.slice(pos));
        start();
      }
    };
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/fs.realpath/index.js
var require_fs = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/fs.realpath/index.js"(exports2, module2) {
    module2.exports = realpath;
    realpath.realpath = realpath;
    realpath.sync = realpathSync;
    realpath.realpathSync = realpathSync;
    realpath.monkeypatch = monkeypatch;
    realpath.unmonkeypatch = unmonkeypatch;
    var fs = require("fs");
    var origRealpath = fs.realpath;
    var origRealpathSync = fs.realpathSync;
    var version = process.version;
    var ok = /^v[0-5]\./.test(version);
    var old = require_old();
    function newError(er) {
      return er && er.syscall === "realpath" && (er.code === "ELOOP" || er.code === "ENOMEM" || er.code === "ENAMETOOLONG");
    }
    function realpath(p, cache, cb) {
      if (ok) {
        return origRealpath(p, cache, cb);
      }
      if (typeof cache === "function") {
        cb = cache;
        cache = null;
      }
      origRealpath(p, cache, function(er, result) {
        if (newError(er)) {
          old.realpath(p, cache, cb);
        } else {
          cb(er, result);
        }
      });
    }
    function realpathSync(p, cache) {
      if (ok) {
        return origRealpathSync(p, cache);
      }
      try {
        return origRealpathSync(p, cache);
      } catch (er) {
        if (newError(er)) {
          return old.realpathSync(p, cache);
        } else {
          throw er;
        }
      }
    }
    function monkeypatch() {
      fs.realpath = realpath;
      fs.realpathSync = realpathSync;
    }
    function unmonkeypatch() {
      fs.realpath = origRealpath;
      fs.realpathSync = origRealpathSync;
    }
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/glob/node_modules/minimatch/lib/path.js
var require_path = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/glob/node_modules/minimatch/lib/path.js"(exports2, module2) {
    var isWindows = typeof process === "object" && process && process.platform === "win32";
    module2.exports = isWindows ? { sep: "\\" } : { sep: "/" };
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/balanced-match/index.js
var require_balanced_match = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/balanced-match/index.js"(exports2, module2) {
    "use strict";
    module2.exports = balanced;
    function balanced(a, b, str) {
      if (a instanceof RegExp)
        a = maybeMatch(a, str);
      if (b instanceof RegExp)
        b = maybeMatch(b, str);
      var r = range(a, b, str);
      return r && {
        start: r[0],
        end: r[1],
        pre: str.slice(0, r[0]),
        body: str.slice(r[0] + a.length, r[1]),
        post: str.slice(r[1] + b.length)
      };
    }
    function maybeMatch(reg, str) {
      var m = str.match(reg);
      return m ? m[0] : null;
    }
    balanced.range = range;
    function range(a, b, str) {
      var begs, beg, left, right, result;
      var ai = str.indexOf(a);
      var bi = str.indexOf(b, ai + 1);
      var i = ai;
      if (ai >= 0 && bi > 0) {
        if (a === b) {
          return [ai, bi];
        }
        begs = [];
        left = str.length;
        while (i >= 0 && !result) {
          if (i == ai) {
            begs.push(i);
            ai = str.indexOf(a, i + 1);
          } else if (begs.length == 1) {
            result = [begs.pop(), bi];
          } else {
            beg = begs.pop();
            if (beg < left) {
              left = beg;
              right = bi;
            }
            bi = str.indexOf(b, i + 1);
          }
          i = ai < bi && ai >= 0 ? ai : bi;
        }
        if (begs.length) {
          result = [left, right];
        }
      }
      return result;
    }
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/glob/node_modules/brace-expansion/index.js
var require_brace_expansion = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/glob/node_modules/brace-expansion/index.js"(exports2, module2) {
    var balanced = require_balanced_match();
    module2.exports = expandTop;
    var escSlash = "\0SLASH" + Math.random() + "\0";
    var escOpen = "\0OPEN" + Math.random() + "\0";
    var escClose = "\0CLOSE" + Math.random() + "\0";
    var escComma = "\0COMMA" + Math.random() + "\0";
    var escPeriod = "\0PERIOD" + Math.random() + "\0";
    function numeric(str) {
      return parseInt(str, 10) == str ? parseInt(str, 10) : str.charCodeAt(0);
    }
    function escapeBraces(str) {
      return str.split("\\\\").join(escSlash).split("\\{").join(escOpen).split("\\}").join(escClose).split("\\,").join(escComma).split("\\.").join(escPeriod);
    }
    function unescapeBraces(str) {
      return str.split(escSlash).join("\\").split(escOpen).join("{").split(escClose).join("}").split(escComma).join(",").split(escPeriod).join(".");
    }
    function parseCommaParts(str) {
      if (!str)
        return [""];
      var parts = [];
      var m = balanced("{", "}", str);
      if (!m)
        return str.split(",");
      var pre = m.pre;
      var body = m.body;
      var post = m.post;
      var p = pre.split(",");
      p[p.length - 1] += "{" + body + "}";
      var postParts = parseCommaParts(post);
      if (post.length) {
        p[p.length - 1] += postParts.shift();
        p.push.apply(p, postParts);
      }
      parts.push.apply(parts, p);
      return parts;
    }
    function expandTop(str) {
      if (!str)
        return [];
      if (str.substr(0, 2) === "{}") {
        str = "\\{\\}" + str.substr(2);
      }
      return expand(escapeBraces(str), true).map(unescapeBraces);
    }
    function embrace(str) {
      return "{" + str + "}";
    }
    function isPadded(el) {
      return /^-?0\d/.test(el);
    }
    function lte(i, y) {
      return i <= y;
    }
    function gte(i, y) {
      return i >= y;
    }
    function expand(str, isTop) {
      var expansions = [];
      var m = balanced("{", "}", str);
      if (!m)
        return [str];
      var pre = m.pre;
      var post = m.post.length ? expand(m.post, false) : [""];
      if (/\$$/.test(m.pre)) {
        for (var k = 0; k < post.length; k++) {
          var expansion = pre + "{" + m.body + "}" + post[k];
          expansions.push(expansion);
        }
      } else {
        var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
        var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
        var isSequence = isNumericSequence || isAlphaSequence;
        var isOptions = m.body.indexOf(",") >= 0;
        if (!isSequence && !isOptions) {
          if (m.post.match(/,.*\}/)) {
            str = m.pre + "{" + m.body + escClose + m.post;
            return expand(str);
          }
          return [str];
        }
        var n;
        if (isSequence) {
          n = m.body.split(/\.\./);
        } else {
          n = parseCommaParts(m.body);
          if (n.length === 1) {
            n = expand(n[0], false).map(embrace);
            if (n.length === 1) {
              return post.map(function(p) {
                return m.pre + n[0] + p;
              });
            }
          }
        }
        var N;
        if (isSequence) {
          var x = numeric(n[0]);
          var y = numeric(n[1]);
          var width = Math.max(n[0].length, n[1].length);
          var incr = n.length == 3 ? Math.abs(numeric(n[2])) : 1;
          var test = lte;
          var reverse = y < x;
          if (reverse) {
            incr *= -1;
            test = gte;
          }
          var pad = n.some(isPadded);
          N = [];
          for (var i = x; test(i, y); i += incr) {
            var c;
            if (isAlphaSequence) {
              c = String.fromCharCode(i);
              if (c === "\\")
                c = "";
            } else {
              c = String(i);
              if (pad) {
                var need = width - c.length;
                if (need > 0) {
                  var z = new Array(need + 1).join("0");
                  if (i < 0)
                    c = "-" + z + c.slice(1);
                  else
                    c = z + c;
                }
              }
            }
            N.push(c);
          }
        } else {
          N = [];
          for (var j = 0; j < n.length; j++) {
            N.push.apply(N, expand(n[j], false));
          }
        }
        for (var j = 0; j < N.length; j++) {
          for (var k = 0; k < post.length; k++) {
            var expansion = pre + N[j] + post[k];
            if (!isTop || isSequence || expansion)
              expansions.push(expansion);
          }
        }
      }
      return expansions;
    }
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/glob/node_modules/minimatch/minimatch.js
var require_minimatch = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/glob/node_modules/minimatch/minimatch.js"(exports2, module2) {
    var minimatch = module2.exports = (p, pattern, options = {}) => {
      assertValidPattern(pattern);
      if (!options.nocomment && pattern.charAt(0) === "#") {
        return false;
      }
      return new Minimatch(pattern, options).match(p);
    };
    module2.exports = minimatch;
    var path = require_path();
    minimatch.sep = path.sep;
    var GLOBSTAR = Symbol("globstar **");
    minimatch.GLOBSTAR = GLOBSTAR;
    var expand = require_brace_expansion();
    var plTypes = {
      "!": { open: "(?:(?!(?:", close: "))[^/]*?)" },
      "?": { open: "(?:", close: ")?" },
      "+": { open: "(?:", close: ")+" },
      "*": { open: "(?:", close: ")*" },
      "@": { open: "(?:", close: ")" }
    };
    var qmark = "[^/]";
    var star = qmark + "*?";
    var twoStarDot = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?";
    var twoStarNoDot = "(?:(?!(?:\\/|^)\\.).)*?";
    var charSet = (s) => s.split("").reduce((set, c) => {
      set[c] = true;
      return set;
    }, {});
    var reSpecials = charSet("().*{}+?[]^$\\!");
    var addPatternStartSet = charSet("[.(");
    var slashSplit = /\/+/;
    minimatch.filter = (pattern, options = {}) => (p, i, list) => minimatch(p, pattern, options);
    var ext = (a, b = {}) => {
      const t = {};
      Object.keys(a).forEach((k) => t[k] = a[k]);
      Object.keys(b).forEach((k) => t[k] = b[k]);
      return t;
    };
    minimatch.defaults = (def) => {
      if (!def || typeof def !== "object" || !Object.keys(def).length) {
        return minimatch;
      }
      const orig = minimatch;
      const m = (p, pattern, options) => orig(p, pattern, ext(def, options));
      m.Minimatch = class Minimatch extends orig.Minimatch {
        constructor(pattern, options) {
          super(pattern, ext(def, options));
        }
      };
      m.Minimatch.defaults = (options) => orig.defaults(ext(def, options)).Minimatch;
      m.filter = (pattern, options) => orig.filter(pattern, ext(def, options));
      m.defaults = (options) => orig.defaults(ext(def, options));
      m.makeRe = (pattern, options) => orig.makeRe(pattern, ext(def, options));
      m.braceExpand = (pattern, options) => orig.braceExpand(pattern, ext(def, options));
      m.match = (list, pattern, options) => orig.match(list, pattern, ext(def, options));
      return m;
    };
    minimatch.braceExpand = (pattern, options) => braceExpand(pattern, options);
    var braceExpand = (pattern, options = {}) => {
      assertValidPattern(pattern);
      if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) {
        return [pattern];
      }
      return expand(pattern);
    };
    var MAX_PATTERN_LENGTH = 1024 * 64;
    var assertValidPattern = (pattern) => {
      if (typeof pattern !== "string") {
        throw new TypeError("invalid pattern");
      }
      if (pattern.length > MAX_PATTERN_LENGTH) {
        throw new TypeError("pattern is too long");
      }
    };
    var SUBPARSE = Symbol("subparse");
    minimatch.makeRe = (pattern, options) => new Minimatch(pattern, options || {}).makeRe();
    minimatch.match = (list, pattern, options = {}) => {
      const mm = new Minimatch(pattern, options);
      list = list.filter((f) => mm.match(f));
      if (mm.options.nonull && !list.length) {
        list.push(pattern);
      }
      return list;
    };
    var globUnescape = (s) => s.replace(/\\(.)/g, "$1");
    var charUnescape = (s) => s.replace(/\\([^-\]])/g, "$1");
    var regExpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    var braExpEscape = (s) => s.replace(/[[\]\\]/g, "\\$&");
    var Minimatch = class {
      constructor(pattern, options) {
        assertValidPattern(pattern);
        if (!options)
          options = {};
        this.options = options;
        this.set = [];
        this.pattern = pattern;
        this.windowsPathsNoEscape = !!options.windowsPathsNoEscape || options.allowWindowsEscape === false;
        if (this.windowsPathsNoEscape) {
          this.pattern = this.pattern.replace(/\\/g, "/");
        }
        this.regexp = null;
        this.negate = false;
        this.comment = false;
        this.empty = false;
        this.partial = !!options.partial;
        this.make();
      }
      debug() {
      }
      make() {
        const pattern = this.pattern;
        const options = this.options;
        if (!options.nocomment && pattern.charAt(0) === "#") {
          this.comment = true;
          return;
        }
        if (!pattern) {
          this.empty = true;
          return;
        }
        this.parseNegate();
        let set = this.globSet = this.braceExpand();
        if (options.debug)
          this.debug = (...args2) => console.error(...args2);
        this.debug(this.pattern, set);
        set = this.globParts = set.map((s) => s.split(slashSplit));
        this.debug(this.pattern, set);
        set = set.map((s, si, set2) => s.map(this.parse, this));
        this.debug(this.pattern, set);
        set = set.filter((s) => s.indexOf(false) === -1);
        this.debug(this.pattern, set);
        this.set = set;
      }
      parseNegate() {
        if (this.options.nonegate)
          return;
        const pattern = this.pattern;
        let negate = false;
        let negateOffset = 0;
        for (let i = 0; i < pattern.length && pattern.charAt(i) === "!"; i++) {
          negate = !negate;
          negateOffset++;
        }
        if (negateOffset)
          this.pattern = pattern.slice(negateOffset);
        this.negate = negate;
      }
      // set partial to true to test if, for example,
      // "/a/b" matches the start of "/*/b/*/d"
      // Partial means, if you run out of file before you run
      // out of pattern, then that's fine, as long as all
      // the parts match.
      matchOne(file, pattern, partial) {
        var options = this.options;
        this.debug(
          "matchOne",
          { "this": this, file, pattern }
        );
        this.debug("matchOne", file.length, pattern.length);
        for (var fi = 0, pi = 0, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, pi++) {
          this.debug("matchOne loop");
          var p = pattern[pi];
          var f = file[fi];
          this.debug(pattern, p, f);
          if (p === false)
            return false;
          if (p === GLOBSTAR) {
            this.debug("GLOBSTAR", [pattern, p, f]);
            var fr = fi;
            var pr = pi + 1;
            if (pr === pl) {
              this.debug("** at the end");
              for (; fi < fl; fi++) {
                if (file[fi] === "." || file[fi] === ".." || !options.dot && file[fi].charAt(0) === ".")
                  return false;
              }
              return true;
            }
            while (fr < fl) {
              var swallowee = file[fr];
              this.debug("\nglobstar while", file, fr, pattern, pr, swallowee);
              if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
                this.debug("globstar found match!", fr, fl, swallowee);
                return true;
              } else {
                if (swallowee === "." || swallowee === ".." || !options.dot && swallowee.charAt(0) === ".") {
                  this.debug("dot detected!", file, fr, pattern, pr);
                  break;
                }
                this.debug("globstar swallow a segment, and continue");
                fr++;
              }
            }
            if (partial) {
              this.debug("\n>>> no match, partial?", file, fr, pattern, pr);
              if (fr === fl)
                return true;
            }
            return false;
          }
          var hit;
          if (typeof p === "string") {
            hit = f === p;
            this.debug("string match", p, f, hit);
          } else {
            hit = f.match(p);
            this.debug("pattern match", p, f, hit);
          }
          if (!hit)
            return false;
        }
        if (fi === fl && pi === pl) {
          return true;
        } else if (fi === fl) {
          return partial;
        } else if (pi === pl) {
          return fi === fl - 1 && file[fi] === "";
        }
        throw new Error("wtf?");
      }
      braceExpand() {
        return braceExpand(this.pattern, this.options);
      }
      parse(pattern, isSub) {
        assertValidPattern(pattern);
        const options = this.options;
        if (pattern === "**") {
          if (!options.noglobstar)
            return GLOBSTAR;
          else
            pattern = "*";
        }
        if (pattern === "")
          return "";
        let re = "";
        let hasMagic = false;
        let escaping = false;
        const patternListStack = [];
        const negativeLists = [];
        let stateChar;
        let inClass = false;
        let reClassStart = -1;
        let classStart = -1;
        let cs;
        let pl;
        let sp;
        let dotTravAllowed = pattern.charAt(0) === ".";
        let dotFileAllowed = options.dot || dotTravAllowed;
        const patternStart = () => dotTravAllowed ? "" : dotFileAllowed ? "(?!(?:^|\\/)\\.{1,2}(?:$|\\/))" : "(?!\\.)";
        const subPatternStart = (p) => p.charAt(0) === "." ? "" : options.dot ? "(?!(?:^|\\/)\\.{1,2}(?:$|\\/))" : "(?!\\.)";
        const clearStateChar = () => {
          if (stateChar) {
            switch (stateChar) {
              case "*":
                re += star;
                hasMagic = true;
                break;
              case "?":
                re += qmark;
                hasMagic = true;
                break;
              default:
                re += "\\" + stateChar;
                break;
            }
            this.debug("clearStateChar %j %j", stateChar, re);
            stateChar = false;
          }
        };
        for (let i = 0, c; i < pattern.length && (c = pattern.charAt(i)); i++) {
          this.debug("%s	%s %s %j", pattern, i, re, c);
          if (escaping) {
            if (c === "/") {
              return false;
            }
            if (reSpecials[c]) {
              re += "\\";
            }
            re += c;
            escaping = false;
            continue;
          }
          switch (c) {
            case "/": {
              return false;
            }
            case "\\":
              if (inClass && pattern.charAt(i + 1) === "-") {
                re += c;
                continue;
              }
              clearStateChar();
              escaping = true;
              continue;
            case "?":
            case "*":
            case "+":
            case "@":
            case "!":
              this.debug("%s	%s %s %j <-- stateChar", pattern, i, re, c);
              if (inClass) {
                this.debug("  in class");
                if (c === "!" && i === classStart + 1)
                  c = "^";
                re += c;
                continue;
              }
              this.debug("call clearStateChar %j", stateChar);
              clearStateChar();
              stateChar = c;
              if (options.noext)
                clearStateChar();
              continue;
            case "(": {
              if (inClass) {
                re += "(";
                continue;
              }
              if (!stateChar) {
                re += "\\(";
                continue;
              }
              const plEntry = {
                type: stateChar,
                start: i - 1,
                reStart: re.length,
                open: plTypes[stateChar].open,
                close: plTypes[stateChar].close
              };
              this.debug(this.pattern, "	", plEntry);
              patternListStack.push(plEntry);
              re += plEntry.open;
              if (plEntry.start === 0 && plEntry.type !== "!") {
                dotTravAllowed = true;
                re += subPatternStart(pattern.slice(i + 1));
              }
              this.debug("plType %j %j", stateChar, re);
              stateChar = false;
              continue;
            }
            case ")": {
              const plEntry = patternListStack[patternListStack.length - 1];
              if (inClass || !plEntry) {
                re += "\\)";
                continue;
              }
              patternListStack.pop();
              clearStateChar();
              hasMagic = true;
              pl = plEntry;
              re += pl.close;
              if (pl.type === "!") {
                negativeLists.push(Object.assign(pl, { reEnd: re.length }));
              }
              continue;
            }
            case "|": {
              const plEntry = patternListStack[patternListStack.length - 1];
              if (inClass || !plEntry) {
                re += "\\|";
                continue;
              }
              clearStateChar();
              re += "|";
              if (plEntry.start === 0 && plEntry.type !== "!") {
                dotTravAllowed = true;
                re += subPatternStart(pattern.slice(i + 1));
              }
              continue;
            }
            case "[":
              clearStateChar();
              if (inClass) {
                re += "\\" + c;
                continue;
              }
              inClass = true;
              classStart = i;
              reClassStart = re.length;
              re += c;
              continue;
            case "]":
              if (i === classStart + 1 || !inClass) {
                re += "\\" + c;
                continue;
              }
              cs = pattern.substring(classStart + 1, i);
              try {
                RegExp("[" + braExpEscape(charUnescape(cs)) + "]");
                re += c;
              } catch (er) {
                re = re.substring(0, reClassStart) + "(?:$.)";
              }
              hasMagic = true;
              inClass = false;
              continue;
            default:
              clearStateChar();
              if (reSpecials[c] && !(c === "^" && inClass)) {
                re += "\\";
              }
              re += c;
              break;
          }
        }
        if (inClass) {
          cs = pattern.slice(classStart + 1);
          sp = this.parse(cs, SUBPARSE);
          re = re.substring(0, reClassStart) + "\\[" + sp[0];
          hasMagic = hasMagic || sp[1];
        }
        for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
          let tail;
          tail = re.slice(pl.reStart + pl.open.length);
          this.debug("setting tail", re, pl);
          tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, (_, $1, $2) => {
            if (!$2) {
              $2 = "\\";
            }
            return $1 + $1 + $2 + "|";
          });
          this.debug("tail=%j\n   %s", tail, tail, pl, re);
          const t = pl.type === "*" ? star : pl.type === "?" ? qmark : "\\" + pl.type;
          hasMagic = true;
          re = re.slice(0, pl.reStart) + t + "\\(" + tail;
        }
        clearStateChar();
        if (escaping) {
          re += "\\\\";
        }
        const addPatternStart = addPatternStartSet[re.charAt(0)];
        for (let n = negativeLists.length - 1; n > -1; n--) {
          const nl = negativeLists[n];
          const nlBefore = re.slice(0, nl.reStart);
          const nlFirst = re.slice(nl.reStart, nl.reEnd - 8);
          let nlAfter = re.slice(nl.reEnd);
          const nlLast = re.slice(nl.reEnd - 8, nl.reEnd) + nlAfter;
          const closeParensBefore = nlBefore.split(")").length;
          const openParensBefore = nlBefore.split("(").length - closeParensBefore;
          let cleanAfter = nlAfter;
          for (let i = 0; i < openParensBefore; i++) {
            cleanAfter = cleanAfter.replace(/\)[+*?]?/, "");
          }
          nlAfter = cleanAfter;
          const dollar = nlAfter === "" && isSub !== SUBPARSE ? "(?:$|\\/)" : "";
          re = nlBefore + nlFirst + nlAfter + dollar + nlLast;
        }
        if (re !== "" && hasMagic) {
          re = "(?=.)" + re;
        }
        if (addPatternStart) {
          re = patternStart() + re;
        }
        if (isSub === SUBPARSE) {
          return [re, hasMagic];
        }
        if (options.nocase && !hasMagic) {
          hasMagic = pattern.toUpperCase() !== pattern.toLowerCase();
        }
        if (!hasMagic) {
          return globUnescape(pattern);
        }
        const flags = options.nocase ? "i" : "";
        try {
          return Object.assign(new RegExp("^" + re + "$", flags), {
            _glob: pattern,
            _src: re
          });
        } catch (er) {
          return new RegExp("$.");
        }
      }
      makeRe() {
        if (this.regexp || this.regexp === false)
          return this.regexp;
        const set = this.set;
        if (!set.length) {
          this.regexp = false;
          return this.regexp;
        }
        const options = this.options;
        const twoStar = options.noglobstar ? star : options.dot ? twoStarDot : twoStarNoDot;
        const flags = options.nocase ? "i" : "";
        let re = set.map((pattern) => {
          pattern = pattern.map(
            (p) => typeof p === "string" ? regExpEscape(p) : p === GLOBSTAR ? GLOBSTAR : p._src
          ).reduce((set2, p) => {
            if (!(set2[set2.length - 1] === GLOBSTAR && p === GLOBSTAR)) {
              set2.push(p);
            }
            return set2;
          }, []);
          pattern.forEach((p, i) => {
            if (p !== GLOBSTAR || pattern[i - 1] === GLOBSTAR) {
              return;
            }
            if (i === 0) {
              if (pattern.length > 1) {
                pattern[i + 1] = "(?:\\/|" + twoStar + "\\/)?" + pattern[i + 1];
              } else {
                pattern[i] = twoStar;
              }
            } else if (i === pattern.length - 1) {
              pattern[i - 1] += "(?:\\/|" + twoStar + ")?";
            } else {
              pattern[i - 1] += "(?:\\/|\\/" + twoStar + "\\/)" + pattern[i + 1];
              pattern[i + 1] = GLOBSTAR;
            }
          });
          return pattern.filter((p) => p !== GLOBSTAR).join("/");
        }).join("|");
        re = "^(?:" + re + ")$";
        if (this.negate)
          re = "^(?!" + re + ").*$";
        try {
          this.regexp = new RegExp(re, flags);
        } catch (ex) {
          this.regexp = false;
        }
        return this.regexp;
      }
      match(f, partial = this.partial) {
        this.debug("match", f, this.pattern);
        if (this.comment)
          return false;
        if (this.empty)
          return f === "";
        if (f === "/" && partial)
          return true;
        const options = this.options;
        if (path.sep !== "/") {
          f = f.split(path.sep).join("/");
        }
        f = f.split(slashSplit);
        this.debug(this.pattern, "split", f);
        const set = this.set;
        this.debug(this.pattern, "set", set);
        let filename;
        for (let i = f.length - 1; i >= 0; i--) {
          filename = f[i];
          if (filename)
            break;
        }
        for (let i = 0; i < set.length; i++) {
          const pattern = set[i];
          let file = f;
          if (options.matchBase && pattern.length === 1) {
            file = [filename];
          }
          const hit = this.matchOne(file, pattern, partial);
          if (hit) {
            if (options.flipNegate)
              return true;
            return !this.negate;
          }
        }
        if (options.flipNegate)
          return false;
        return this.negate;
      }
      static defaults(def) {
        return minimatch.defaults(def).Minimatch;
      }
    };
    minimatch.Minimatch = Minimatch;
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/inherits/inherits_browser.js"(exports2, module2) {
    if (typeof Object.create === "function") {
      module2.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        }
      };
    } else {
      module2.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function() {
          };
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
      };
    }
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/inherits/inherits.js
var require_inherits = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/inherits/inherits.js"(exports2, module2) {
    try {
      util = require("util");
      if (typeof util.inherits !== "function")
        throw "";
      module2.exports = util.inherits;
    } catch (e) {
      module2.exports = require_inherits_browser();
    }
    var util;
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/glob/common.js
var require_common = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/glob/common.js"(exports2) {
    exports2.setopts = setopts;
    exports2.ownProp = ownProp;
    exports2.makeAbs = makeAbs;
    exports2.finish = finish;
    exports2.mark = mark;
    exports2.isIgnored = isIgnored;
    exports2.childrenIgnored = childrenIgnored;
    function ownProp(obj, field) {
      return Object.prototype.hasOwnProperty.call(obj, field);
    }
    var fs = require("fs");
    var path = require("path");
    var minimatch = require_minimatch();
    var isAbsolute = require("path").isAbsolute;
    var Minimatch = minimatch.Minimatch;
    function alphasort(a, b) {
      return a.localeCompare(b, "en");
    }
    function setupIgnores(self, options) {
      self.ignore = options.ignore || [];
      if (!Array.isArray(self.ignore))
        self.ignore = [self.ignore];
      if (self.ignore.length) {
        self.ignore = self.ignore.map(ignoreMap);
      }
    }
    function ignoreMap(pattern) {
      var gmatcher = null;
      if (pattern.slice(-3) === "/**") {
        var gpattern = pattern.replace(/(\/\*\*)+$/, "");
        gmatcher = new Minimatch(gpattern, { dot: true });
      }
      return {
        matcher: new Minimatch(pattern, { dot: true }),
        gmatcher
      };
    }
    function setopts(self, pattern, options) {
      if (!options)
        options = {};
      if (options.matchBase && -1 === pattern.indexOf("/")) {
        if (options.noglobstar) {
          throw new Error("base matching requires globstar");
        }
        pattern = "**/" + pattern;
      }
      self.windowsPathsNoEscape = !!options.windowsPathsNoEscape || options.allowWindowsEscape === false;
      if (self.windowsPathsNoEscape) {
        pattern = pattern.replace(/\\/g, "/");
      }
      self.silent = !!options.silent;
      self.pattern = pattern;
      self.strict = options.strict !== false;
      self.realpath = !!options.realpath;
      self.realpathCache = options.realpathCache || /* @__PURE__ */ Object.create(null);
      self.follow = !!options.follow;
      self.dot = !!options.dot;
      self.mark = !!options.mark;
      self.nodir = !!options.nodir;
      if (self.nodir)
        self.mark = true;
      self.sync = !!options.sync;
      self.nounique = !!options.nounique;
      self.nonull = !!options.nonull;
      self.nosort = !!options.nosort;
      self.nocase = !!options.nocase;
      self.stat = !!options.stat;
      self.noprocess = !!options.noprocess;
      self.absolute = !!options.absolute;
      self.fs = options.fs || fs;
      self.maxLength = options.maxLength || Infinity;
      self.cache = options.cache || /* @__PURE__ */ Object.create(null);
      self.statCache = options.statCache || /* @__PURE__ */ Object.create(null);
      self.symlinks = options.symlinks || /* @__PURE__ */ Object.create(null);
      setupIgnores(self, options);
      self.changedCwd = false;
      var cwd = process.cwd();
      if (!ownProp(options, "cwd"))
        self.cwd = path.resolve(cwd);
      else {
        self.cwd = path.resolve(options.cwd);
        self.changedCwd = self.cwd !== cwd;
      }
      self.root = options.root || path.resolve(self.cwd, "/");
      self.root = path.resolve(self.root);
      self.cwdAbs = isAbsolute(self.cwd) ? self.cwd : makeAbs(self, self.cwd);
      self.nomount = !!options.nomount;
      if (process.platform === "win32") {
        self.root = self.root.replace(/\\/g, "/");
        self.cwd = self.cwd.replace(/\\/g, "/");
        self.cwdAbs = self.cwdAbs.replace(/\\/g, "/");
      }
      options.nonegate = true;
      options.nocomment = true;
      self.minimatch = new Minimatch(pattern, options);
      self.options = self.minimatch.options;
    }
    function finish(self) {
      var nou = self.nounique;
      var all = nou ? [] : /* @__PURE__ */ Object.create(null);
      for (var i = 0, l = self.matches.length; i < l; i++) {
        var matches = self.matches[i];
        if (!matches || Object.keys(matches).length === 0) {
          if (self.nonull) {
            var literal = self.minimatch.globSet[i];
            if (nou)
              all.push(literal);
            else
              all[literal] = true;
          }
        } else {
          var m = Object.keys(matches);
          if (nou)
            all.push.apply(all, m);
          else
            m.forEach(function(m2) {
              all[m2] = true;
            });
        }
      }
      if (!nou)
        all = Object.keys(all);
      if (!self.nosort)
        all = all.sort(alphasort);
      if (self.mark) {
        for (var i = 0; i < all.length; i++) {
          all[i] = self._mark(all[i]);
        }
        if (self.nodir) {
          all = all.filter(function(e) {
            var notDir = !/\/$/.test(e);
            var c = self.cache[e] || self.cache[makeAbs(self, e)];
            if (notDir && c)
              notDir = c !== "DIR" && !Array.isArray(c);
            return notDir;
          });
        }
      }
      if (self.ignore.length)
        all = all.filter(function(m2) {
          return !isIgnored(self, m2);
        });
      self.found = all;
    }
    function mark(self, p) {
      var abs = makeAbs(self, p);
      var c = self.cache[abs];
      var m = p;
      if (c) {
        var isDir = c === "DIR" || Array.isArray(c);
        var slash = p.slice(-1) === "/";
        if (isDir && !slash)
          m += "/";
        else if (!isDir && slash)
          m = m.slice(0, -1);
        if (m !== p) {
          var mabs = makeAbs(self, m);
          self.statCache[mabs] = self.statCache[abs];
          self.cache[mabs] = self.cache[abs];
        }
      }
      return m;
    }
    function makeAbs(self, f) {
      var abs = f;
      if (f.charAt(0) === "/") {
        abs = path.join(self.root, f);
      } else if (isAbsolute(f) || f === "") {
        abs = f;
      } else if (self.changedCwd) {
        abs = path.resolve(self.cwd, f);
      } else {
        abs = path.resolve(f);
      }
      if (process.platform === "win32")
        abs = abs.replace(/\\/g, "/");
      return abs;
    }
    function isIgnored(self, path2) {
      if (!self.ignore.length)
        return false;
      return self.ignore.some(function(item) {
        return item.matcher.match(path2) || !!(item.gmatcher && item.gmatcher.match(path2));
      });
    }
    function childrenIgnored(self, path2) {
      if (!self.ignore.length)
        return false;
      return self.ignore.some(function(item) {
        return !!(item.gmatcher && item.gmatcher.match(path2));
      });
    }
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/glob/sync.js
var require_sync = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/glob/sync.js"(exports2, module2) {
    module2.exports = globSync;
    globSync.GlobSync = GlobSync;
    var rp = require_fs();
    var minimatch = require_minimatch();
    var Minimatch = minimatch.Minimatch;
    var Glob = require_glob().Glob;
    var util = require("util");
    var path = require("path");
    var assert = require("assert");
    var isAbsolute = require("path").isAbsolute;
    var common = require_common();
    var setopts = common.setopts;
    var ownProp = common.ownProp;
    var childrenIgnored = common.childrenIgnored;
    var isIgnored = common.isIgnored;
    function globSync(pattern, options) {
      if (typeof options === "function" || arguments.length === 3)
        throw new TypeError("callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167");
      return new GlobSync(pattern, options).found;
    }
    function GlobSync(pattern, options) {
      if (!pattern)
        throw new Error("must provide pattern");
      if (typeof options === "function" || arguments.length === 3)
        throw new TypeError("callback provided to sync glob\nSee: https://github.com/isaacs/node-glob/issues/167");
      if (!(this instanceof GlobSync))
        return new GlobSync(pattern, options);
      setopts(this, pattern, options);
      if (this.noprocess)
        return this;
      var n = this.minimatch.set.length;
      this.matches = new Array(n);
      for (var i = 0; i < n; i++) {
        this._process(this.minimatch.set[i], i, false);
      }
      this._finish();
    }
    GlobSync.prototype._finish = function() {
      assert.ok(this instanceof GlobSync);
      if (this.realpath) {
        var self = this;
        this.matches.forEach(function(matchset, index) {
          var set = self.matches[index] = /* @__PURE__ */ Object.create(null);
          for (var p in matchset) {
            try {
              p = self._makeAbs(p);
              var real = rp.realpathSync(p, self.realpathCache);
              set[real] = true;
            } catch (er) {
              if (er.syscall === "stat")
                set[self._makeAbs(p)] = true;
              else
                throw er;
            }
          }
        });
      }
      common.finish(this);
    };
    GlobSync.prototype._process = function(pattern, index, inGlobStar) {
      assert.ok(this instanceof GlobSync);
      var n = 0;
      while (typeof pattern[n] === "string") {
        n++;
      }
      var prefix;
      switch (n) {
        case pattern.length:
          this._processSimple(pattern.join("/"), index);
          return;
        case 0:
          prefix = null;
          break;
        default:
          prefix = pattern.slice(0, n).join("/");
          break;
      }
      var remain = pattern.slice(n);
      var read;
      if (prefix === null)
        read = ".";
      else if (isAbsolute(prefix) || isAbsolute(pattern.map(function(p) {
        return typeof p === "string" ? p : "[*]";
      }).join("/"))) {
        if (!prefix || !isAbsolute(prefix))
          prefix = "/" + prefix;
        read = prefix;
      } else
        read = prefix;
      var abs = this._makeAbs(read);
      if (childrenIgnored(this, read))
        return;
      var isGlobStar = remain[0] === minimatch.GLOBSTAR;
      if (isGlobStar)
        this._processGlobStar(prefix, read, abs, remain, index, inGlobStar);
      else
        this._processReaddir(prefix, read, abs, remain, index, inGlobStar);
    };
    GlobSync.prototype._processReaddir = function(prefix, read, abs, remain, index, inGlobStar) {
      var entries = this._readdir(abs, inGlobStar);
      if (!entries)
        return;
      var pn = remain[0];
      var negate = !!this.minimatch.negate;
      var rawGlob = pn._glob;
      var dotOk = this.dot || rawGlob.charAt(0) === ".";
      var matchedEntries = [];
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (e.charAt(0) !== "." || dotOk) {
          var m;
          if (negate && !prefix) {
            m = !e.match(pn);
          } else {
            m = e.match(pn);
          }
          if (m)
            matchedEntries.push(e);
        }
      }
      var len = matchedEntries.length;
      if (len === 0)
        return;
      if (remain.length === 1 && !this.mark && !this.stat) {
        if (!this.matches[index])
          this.matches[index] = /* @__PURE__ */ Object.create(null);
        for (var i = 0; i < len; i++) {
          var e = matchedEntries[i];
          if (prefix) {
            if (prefix.slice(-1) !== "/")
              e = prefix + "/" + e;
            else
              e = prefix + e;
          }
          if (e.charAt(0) === "/" && !this.nomount) {
            e = path.join(this.root, e);
          }
          this._emitMatch(index, e);
        }
        return;
      }
      remain.shift();
      for (var i = 0; i < len; i++) {
        var e = matchedEntries[i];
        var newPattern;
        if (prefix)
          newPattern = [prefix, e];
        else
          newPattern = [e];
        this._process(newPattern.concat(remain), index, inGlobStar);
      }
    };
    GlobSync.prototype._emitMatch = function(index, e) {
      if (isIgnored(this, e))
        return;
      var abs = this._makeAbs(e);
      if (this.mark)
        e = this._mark(e);
      if (this.absolute) {
        e = abs;
      }
      if (this.matches[index][e])
        return;
      if (this.nodir) {
        var c = this.cache[abs];
        if (c === "DIR" || Array.isArray(c))
          return;
      }
      this.matches[index][e] = true;
      if (this.stat)
        this._stat(e);
    };
    GlobSync.prototype._readdirInGlobStar = function(abs) {
      if (this.follow)
        return this._readdir(abs, false);
      var entries;
      var lstat;
      var stat;
      try {
        lstat = this.fs.lstatSync(abs);
      } catch (er) {
        if (er.code === "ENOENT") {
          return null;
        }
      }
      var isSym = lstat && lstat.isSymbolicLink();
      this.symlinks[abs] = isSym;
      if (!isSym && lstat && !lstat.isDirectory())
        this.cache[abs] = "FILE";
      else
        entries = this._readdir(abs, false);
      return entries;
    };
    GlobSync.prototype._readdir = function(abs, inGlobStar) {
      var entries;
      if (inGlobStar && !ownProp(this.symlinks, abs))
        return this._readdirInGlobStar(abs);
      if (ownProp(this.cache, abs)) {
        var c = this.cache[abs];
        if (!c || c === "FILE")
          return null;
        if (Array.isArray(c))
          return c;
      }
      try {
        return this._readdirEntries(abs, this.fs.readdirSync(abs));
      } catch (er) {
        this._readdirError(abs, er);
        return null;
      }
    };
    GlobSync.prototype._readdirEntries = function(abs, entries) {
      if (!this.mark && !this.stat) {
        for (var i = 0; i < entries.length; i++) {
          var e = entries[i];
          if (abs === "/")
            e = abs + e;
          else
            e = abs + "/" + e;
          this.cache[e] = true;
        }
      }
      this.cache[abs] = entries;
      return entries;
    };
    GlobSync.prototype._readdirError = function(f, er) {
      switch (er.code) {
        case "ENOTSUP":
        case "ENOTDIR":
          var abs = this._makeAbs(f);
          this.cache[abs] = "FILE";
          if (abs === this.cwdAbs) {
            var error = new Error(er.code + " invalid cwd " + this.cwd);
            error.path = this.cwd;
            error.code = er.code;
            throw error;
          }
          break;
        case "ENOENT":
        case "ELOOP":
        case "ENAMETOOLONG":
        case "UNKNOWN":
          this.cache[this._makeAbs(f)] = false;
          break;
        default:
          this.cache[this._makeAbs(f)] = false;
          if (this.strict)
            throw er;
          if (!this.silent)
            console.error("glob error", er);
          break;
      }
    };
    GlobSync.prototype._processGlobStar = function(prefix, read, abs, remain, index, inGlobStar) {
      var entries = this._readdir(abs, inGlobStar);
      if (!entries)
        return;
      var remainWithoutGlobStar = remain.slice(1);
      var gspref = prefix ? [prefix] : [];
      var noGlobStar = gspref.concat(remainWithoutGlobStar);
      this._process(noGlobStar, index, false);
      var len = entries.length;
      var isSym = this.symlinks[abs];
      if (isSym && inGlobStar)
        return;
      for (var i = 0; i < len; i++) {
        var e = entries[i];
        if (e.charAt(0) === "." && !this.dot)
          continue;
        var instead = gspref.concat(entries[i], remainWithoutGlobStar);
        this._process(instead, index, true);
        var below = gspref.concat(entries[i], remain);
        this._process(below, index, true);
      }
    };
    GlobSync.prototype._processSimple = function(prefix, index) {
      var exists = this._stat(prefix);
      if (!this.matches[index])
        this.matches[index] = /* @__PURE__ */ Object.create(null);
      if (!exists)
        return;
      if (prefix && isAbsolute(prefix) && !this.nomount) {
        var trail = /[\/\\]$/.test(prefix);
        if (prefix.charAt(0) === "/") {
          prefix = path.join(this.root, prefix);
        } else {
          prefix = path.resolve(this.root, prefix);
          if (trail)
            prefix += "/";
        }
      }
      if (process.platform === "win32")
        prefix = prefix.replace(/\\/g, "/");
      this._emitMatch(index, prefix);
    };
    GlobSync.prototype._stat = function(f) {
      var abs = this._makeAbs(f);
      var needDir = f.slice(-1) === "/";
      if (f.length > this.maxLength)
        return false;
      if (!this.stat && ownProp(this.cache, abs)) {
        var c = this.cache[abs];
        if (Array.isArray(c))
          c = "DIR";
        if (!needDir || c === "DIR")
          return c;
        if (needDir && c === "FILE")
          return false;
      }
      var exists;
      var stat = this.statCache[abs];
      if (!stat) {
        var lstat;
        try {
          lstat = this.fs.lstatSync(abs);
        } catch (er) {
          if (er && (er.code === "ENOENT" || er.code === "ENOTDIR")) {
            this.statCache[abs] = false;
            return false;
          }
        }
        if (lstat && lstat.isSymbolicLink()) {
          try {
            stat = this.fs.statSync(abs);
          } catch (er) {
            stat = lstat;
          }
        } else {
          stat = lstat;
        }
      }
      this.statCache[abs] = stat;
      var c = true;
      if (stat)
        c = stat.isDirectory() ? "DIR" : "FILE";
      this.cache[abs] = this.cache[abs] || c;
      if (needDir && c === "FILE")
        return false;
      return c;
    };
    GlobSync.prototype._mark = function(p) {
      return common.mark(this, p);
    };
    GlobSync.prototype._makeAbs = function(f) {
      return common.makeAbs(this, f);
    };
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/wrappy/wrappy.js
var require_wrappy = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/wrappy/wrappy.js"(exports2, module2) {
    module2.exports = wrappy;
    function wrappy(fn, cb) {
      if (fn && cb)
        return wrappy(fn)(cb);
      if (typeof fn !== "function")
        throw new TypeError("need wrapper function");
      Object.keys(fn).forEach(function(k) {
        wrapper[k] = fn[k];
      });
      return wrapper;
      function wrapper() {
        var args2 = new Array(arguments.length);
        for (var i = 0; i < args2.length; i++) {
          args2[i] = arguments[i];
        }
        var ret = fn.apply(this, args2);
        var cb2 = args2[args2.length - 1];
        if (typeof ret === "function" && ret !== cb2) {
          Object.keys(cb2).forEach(function(k) {
            ret[k] = cb2[k];
          });
        }
        return ret;
      }
    }
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/once/once.js
var require_once = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/once/once.js"(exports2, module2) {
    var wrappy = require_wrappy();
    module2.exports = wrappy(once);
    module2.exports.strict = wrappy(onceStrict);
    once.proto = once(function() {
      Object.defineProperty(Function.prototype, "once", {
        value: function() {
          return once(this);
        },
        configurable: true
      });
      Object.defineProperty(Function.prototype, "onceStrict", {
        value: function() {
          return onceStrict(this);
        },
        configurable: true
      });
    });
    function once(fn) {
      var f = function() {
        if (f.called)
          return f.value;
        f.called = true;
        return f.value = fn.apply(this, arguments);
      };
      f.called = false;
      return f;
    }
    function onceStrict(fn) {
      var f = function() {
        if (f.called)
          throw new Error(f.onceError);
        f.called = true;
        return f.value = fn.apply(this, arguments);
      };
      var name = fn.name || "Function wrapped with `once`";
      f.onceError = name + " shouldn't be called more than once";
      f.called = false;
      return f;
    }
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/inflight/inflight.js
var require_inflight = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/inflight/inflight.js"(exports2, module2) {
    var wrappy = require_wrappy();
    var reqs = /* @__PURE__ */ Object.create(null);
    var once = require_once();
    module2.exports = wrappy(inflight);
    function inflight(key, cb) {
      if (reqs[key]) {
        reqs[key].push(cb);
        return null;
      } else {
        reqs[key] = [cb];
        return makeres(key);
      }
    }
    function makeres(key) {
      return once(function RES() {
        var cbs = reqs[key];
        var len = cbs.length;
        var args2 = slice(arguments);
        try {
          for (var i = 0; i < len; i++) {
            cbs[i].apply(null, args2);
          }
        } finally {
          if (cbs.length > len) {
            cbs.splice(0, len);
            process.nextTick(function() {
              RES.apply(null, args2);
            });
          } else {
            delete reqs[key];
          }
        }
      });
    }
    function slice(args2) {
      var length = args2.length;
      var array = [];
      for (var i = 0; i < length; i++)
        array[i] = args2[i];
      return array;
    }
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/glob/glob.js
var require_glob = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/glob/glob.js"(exports2, module2) {
    module2.exports = glob;
    var rp = require_fs();
    var minimatch = require_minimatch();
    var Minimatch = minimatch.Minimatch;
    var inherits = require_inherits();
    var EE = require("events").EventEmitter;
    var path = require("path");
    var assert = require("assert");
    var isAbsolute = require("path").isAbsolute;
    var globSync = require_sync();
    var common = require_common();
    var setopts = common.setopts;
    var ownProp = common.ownProp;
    var inflight = require_inflight();
    var util = require("util");
    var childrenIgnored = common.childrenIgnored;
    var isIgnored = common.isIgnored;
    var once = require_once();
    function glob(pattern, options, cb) {
      if (typeof options === "function")
        cb = options, options = {};
      if (!options)
        options = {};
      if (options.sync) {
        if (cb)
          throw new TypeError("callback provided to sync glob");
        return globSync(pattern, options);
      }
      return new Glob(pattern, options, cb);
    }
    glob.sync = globSync;
    var GlobSync = glob.GlobSync = globSync.GlobSync;
    glob.glob = glob;
    function extend(origin, add) {
      if (add === null || typeof add !== "object") {
        return origin;
      }
      var keys = Object.keys(add);
      var i = keys.length;
      while (i--) {
        origin[keys[i]] = add[keys[i]];
      }
      return origin;
    }
    glob.hasMagic = function(pattern, options_) {
      var options = extend({}, options_);
      options.noprocess = true;
      var g = new Glob(pattern, options);
      var set = g.minimatch.set;
      if (!pattern)
        return false;
      if (set.length > 1)
        return true;
      for (var j = 0; j < set[0].length; j++) {
        if (typeof set[0][j] !== "string")
          return true;
      }
      return false;
    };
    glob.Glob = Glob;
    inherits(Glob, EE);
    function Glob(pattern, options, cb) {
      if (typeof options === "function") {
        cb = options;
        options = null;
      }
      if (options && options.sync) {
        if (cb)
          throw new TypeError("callback provided to sync glob");
        return new GlobSync(pattern, options);
      }
      if (!(this instanceof Glob))
        return new Glob(pattern, options, cb);
      setopts(this, pattern, options);
      this._didRealPath = false;
      var n = this.minimatch.set.length;
      this.matches = new Array(n);
      if (typeof cb === "function") {
        cb = once(cb);
        this.on("error", cb);
        this.on("end", function(matches) {
          cb(null, matches);
        });
      }
      var self = this;
      this._processing = 0;
      this._emitQueue = [];
      this._processQueue = [];
      this.paused = false;
      if (this.noprocess)
        return this;
      if (n === 0)
        return done();
      var sync = true;
      for (var i = 0; i < n; i++) {
        this._process(this.minimatch.set[i], i, false, done);
      }
      sync = false;
      function done() {
        --self._processing;
        if (self._processing <= 0) {
          if (sync) {
            process.nextTick(function() {
              self._finish();
            });
          } else {
            self._finish();
          }
        }
      }
    }
    Glob.prototype._finish = function() {
      assert(this instanceof Glob);
      if (this.aborted)
        return;
      if (this.realpath && !this._didRealpath)
        return this._realpath();
      common.finish(this);
      this.emit("end", this.found);
    };
    Glob.prototype._realpath = function() {
      if (this._didRealpath)
        return;
      this._didRealpath = true;
      var n = this.matches.length;
      if (n === 0)
        return this._finish();
      var self = this;
      for (var i = 0; i < this.matches.length; i++)
        this._realpathSet(i, next);
      function next() {
        if (--n === 0)
          self._finish();
      }
    };
    Glob.prototype._realpathSet = function(index, cb) {
      var matchset = this.matches[index];
      if (!matchset)
        return cb();
      var found = Object.keys(matchset);
      var self = this;
      var n = found.length;
      if (n === 0)
        return cb();
      var set = this.matches[index] = /* @__PURE__ */ Object.create(null);
      found.forEach(function(p, i) {
        p = self._makeAbs(p);
        rp.realpath(p, self.realpathCache, function(er, real) {
          if (!er)
            set[real] = true;
          else if (er.syscall === "stat")
            set[p] = true;
          else
            self.emit("error", er);
          if (--n === 0) {
            self.matches[index] = set;
            cb();
          }
        });
      });
    };
    Glob.prototype._mark = function(p) {
      return common.mark(this, p);
    };
    Glob.prototype._makeAbs = function(f) {
      return common.makeAbs(this, f);
    };
    Glob.prototype.abort = function() {
      this.aborted = true;
      this.emit("abort");
    };
    Glob.prototype.pause = function() {
      if (!this.paused) {
        this.paused = true;
        this.emit("pause");
      }
    };
    Glob.prototype.resume = function() {
      if (this.paused) {
        this.emit("resume");
        this.paused = false;
        if (this._emitQueue.length) {
          var eq = this._emitQueue.slice(0);
          this._emitQueue.length = 0;
          for (var i = 0; i < eq.length; i++) {
            var e = eq[i];
            this._emitMatch(e[0], e[1]);
          }
        }
        if (this._processQueue.length) {
          var pq = this._processQueue.slice(0);
          this._processQueue.length = 0;
          for (var i = 0; i < pq.length; i++) {
            var p = pq[i];
            this._processing--;
            this._process(p[0], p[1], p[2], p[3]);
          }
        }
      }
    };
    Glob.prototype._process = function(pattern, index, inGlobStar, cb) {
      assert(this instanceof Glob);
      assert(typeof cb === "function");
      if (this.aborted)
        return;
      this._processing++;
      if (this.paused) {
        this._processQueue.push([pattern, index, inGlobStar, cb]);
        return;
      }
      var n = 0;
      while (typeof pattern[n] === "string") {
        n++;
      }
      var prefix;
      switch (n) {
        case pattern.length:
          this._processSimple(pattern.join("/"), index, cb);
          return;
        case 0:
          prefix = null;
          break;
        default:
          prefix = pattern.slice(0, n).join("/");
          break;
      }
      var remain = pattern.slice(n);
      var read;
      if (prefix === null)
        read = ".";
      else if (isAbsolute(prefix) || isAbsolute(pattern.map(function(p) {
        return typeof p === "string" ? p : "[*]";
      }).join("/"))) {
        if (!prefix || !isAbsolute(prefix))
          prefix = "/" + prefix;
        read = prefix;
      } else
        read = prefix;
      var abs = this._makeAbs(read);
      if (childrenIgnored(this, read))
        return cb();
      var isGlobStar = remain[0] === minimatch.GLOBSTAR;
      if (isGlobStar)
        this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb);
      else
        this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb);
    };
    Glob.prototype._processReaddir = function(prefix, read, abs, remain, index, inGlobStar, cb) {
      var self = this;
      this._readdir(abs, inGlobStar, function(er, entries) {
        return self._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
      });
    };
    Glob.prototype._processReaddir2 = function(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
      if (!entries)
        return cb();
      var pn = remain[0];
      var negate = !!this.minimatch.negate;
      var rawGlob = pn._glob;
      var dotOk = this.dot || rawGlob.charAt(0) === ".";
      var matchedEntries = [];
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (e.charAt(0) !== "." || dotOk) {
          var m;
          if (negate && !prefix) {
            m = !e.match(pn);
          } else {
            m = e.match(pn);
          }
          if (m)
            matchedEntries.push(e);
        }
      }
      var len = matchedEntries.length;
      if (len === 0)
        return cb();
      if (remain.length === 1 && !this.mark && !this.stat) {
        if (!this.matches[index])
          this.matches[index] = /* @__PURE__ */ Object.create(null);
        for (var i = 0; i < len; i++) {
          var e = matchedEntries[i];
          if (prefix) {
            if (prefix !== "/")
              e = prefix + "/" + e;
            else
              e = prefix + e;
          }
          if (e.charAt(0) === "/" && !this.nomount) {
            e = path.join(this.root, e);
          }
          this._emitMatch(index, e);
        }
        return cb();
      }
      remain.shift();
      for (var i = 0; i < len; i++) {
        var e = matchedEntries[i];
        var newPattern;
        if (prefix) {
          if (prefix !== "/")
            e = prefix + "/" + e;
          else
            e = prefix + e;
        }
        this._process([e].concat(remain), index, inGlobStar, cb);
      }
      cb();
    };
    Glob.prototype._emitMatch = function(index, e) {
      if (this.aborted)
        return;
      if (isIgnored(this, e))
        return;
      if (this.paused) {
        this._emitQueue.push([index, e]);
        return;
      }
      var abs = isAbsolute(e) ? e : this._makeAbs(e);
      if (this.mark)
        e = this._mark(e);
      if (this.absolute)
        e = abs;
      if (this.matches[index][e])
        return;
      if (this.nodir) {
        var c = this.cache[abs];
        if (c === "DIR" || Array.isArray(c))
          return;
      }
      this.matches[index][e] = true;
      var st = this.statCache[abs];
      if (st)
        this.emit("stat", e, st);
      this.emit("match", e);
    };
    Glob.prototype._readdirInGlobStar = function(abs, cb) {
      if (this.aborted)
        return;
      if (this.follow)
        return this._readdir(abs, false, cb);
      var lstatkey = "lstat\0" + abs;
      var self = this;
      var lstatcb = inflight(lstatkey, lstatcb_);
      if (lstatcb)
        self.fs.lstat(abs, lstatcb);
      function lstatcb_(er, lstat) {
        if (er && er.code === "ENOENT")
          return cb();
        var isSym = lstat && lstat.isSymbolicLink();
        self.symlinks[abs] = isSym;
        if (!isSym && lstat && !lstat.isDirectory()) {
          self.cache[abs] = "FILE";
          cb();
        } else
          self._readdir(abs, false, cb);
      }
    };
    Glob.prototype._readdir = function(abs, inGlobStar, cb) {
      if (this.aborted)
        return;
      cb = inflight("readdir\0" + abs + "\0" + inGlobStar, cb);
      if (!cb)
        return;
      if (inGlobStar && !ownProp(this.symlinks, abs))
        return this._readdirInGlobStar(abs, cb);
      if (ownProp(this.cache, abs)) {
        var c = this.cache[abs];
        if (!c || c === "FILE")
          return cb();
        if (Array.isArray(c))
          return cb(null, c);
      }
      var self = this;
      self.fs.readdir(abs, readdirCb(this, abs, cb));
    };
    function readdirCb(self, abs, cb) {
      return function(er, entries) {
        if (er)
          self._readdirError(abs, er, cb);
        else
          self._readdirEntries(abs, entries, cb);
      };
    }
    Glob.prototype._readdirEntries = function(abs, entries, cb) {
      if (this.aborted)
        return;
      if (!this.mark && !this.stat) {
        for (var i = 0; i < entries.length; i++) {
          var e = entries[i];
          if (abs === "/")
            e = abs + e;
          else
            e = abs + "/" + e;
          this.cache[e] = true;
        }
      }
      this.cache[abs] = entries;
      return cb(null, entries);
    };
    Glob.prototype._readdirError = function(f, er, cb) {
      if (this.aborted)
        return;
      switch (er.code) {
        case "ENOTSUP":
        case "ENOTDIR":
          var abs = this._makeAbs(f);
          this.cache[abs] = "FILE";
          if (abs === this.cwdAbs) {
            var error = new Error(er.code + " invalid cwd " + this.cwd);
            error.path = this.cwd;
            error.code = er.code;
            this.emit("error", error);
            this.abort();
          }
          break;
        case "ENOENT":
        case "ELOOP":
        case "ENAMETOOLONG":
        case "UNKNOWN":
          this.cache[this._makeAbs(f)] = false;
          break;
        default:
          this.cache[this._makeAbs(f)] = false;
          if (this.strict) {
            this.emit("error", er);
            this.abort();
          }
          if (!this.silent)
            console.error("glob error", er);
          break;
      }
      return cb();
    };
    Glob.prototype._processGlobStar = function(prefix, read, abs, remain, index, inGlobStar, cb) {
      var self = this;
      this._readdir(abs, inGlobStar, function(er, entries) {
        self._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
      });
    };
    Glob.prototype._processGlobStar2 = function(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
      if (!entries)
        return cb();
      var remainWithoutGlobStar = remain.slice(1);
      var gspref = prefix ? [prefix] : [];
      var noGlobStar = gspref.concat(remainWithoutGlobStar);
      this._process(noGlobStar, index, false, cb);
      var isSym = this.symlinks[abs];
      var len = entries.length;
      if (isSym && inGlobStar)
        return cb();
      for (var i = 0; i < len; i++) {
        var e = entries[i];
        if (e.charAt(0) === "." && !this.dot)
          continue;
        var instead = gspref.concat(entries[i], remainWithoutGlobStar);
        this._process(instead, index, true, cb);
        var below = gspref.concat(entries[i], remain);
        this._process(below, index, true, cb);
      }
      cb();
    };
    Glob.prototype._processSimple = function(prefix, index, cb) {
      var self = this;
      this._stat(prefix, function(er, exists) {
        self._processSimple2(prefix, index, er, exists, cb);
      });
    };
    Glob.prototype._processSimple2 = function(prefix, index, er, exists, cb) {
      if (!this.matches[index])
        this.matches[index] = /* @__PURE__ */ Object.create(null);
      if (!exists)
        return cb();
      if (prefix && isAbsolute(prefix) && !this.nomount) {
        var trail = /[\/\\]$/.test(prefix);
        if (prefix.charAt(0) === "/") {
          prefix = path.join(this.root, prefix);
        } else {
          prefix = path.resolve(this.root, prefix);
          if (trail)
            prefix += "/";
        }
      }
      if (process.platform === "win32")
        prefix = prefix.replace(/\\/g, "/");
      this._emitMatch(index, prefix);
      cb();
    };
    Glob.prototype._stat = function(f, cb) {
      var abs = this._makeAbs(f);
      var needDir = f.slice(-1) === "/";
      if (f.length > this.maxLength)
        return cb();
      if (!this.stat && ownProp(this.cache, abs)) {
        var c = this.cache[abs];
        if (Array.isArray(c))
          c = "DIR";
        if (!needDir || c === "DIR")
          return cb(null, c);
        if (needDir && c === "FILE")
          return cb();
      }
      var exists;
      var stat = this.statCache[abs];
      if (stat !== void 0) {
        if (stat === false)
          return cb(null, stat);
        else {
          var type = stat.isDirectory() ? "DIR" : "FILE";
          if (needDir && type === "FILE")
            return cb();
          else
            return cb(null, type, stat);
        }
      }
      var self = this;
      var statcb = inflight("stat\0" + abs, lstatcb_);
      if (statcb)
        self.fs.lstat(abs, statcb);
      function lstatcb_(er, lstat) {
        if (lstat && lstat.isSymbolicLink()) {
          return self.fs.stat(abs, function(er2, stat2) {
            if (er2)
              self._stat2(f, abs, null, lstat, cb);
            else
              self._stat2(f, abs, er2, stat2, cb);
          });
        } else {
          self._stat2(f, abs, er, lstat, cb);
        }
      }
    };
    Glob.prototype._stat2 = function(f, abs, er, stat, cb) {
      if (er && (er.code === "ENOENT" || er.code === "ENOTDIR")) {
        this.statCache[abs] = false;
        return cb();
      }
      var needDir = f.slice(-1) === "/";
      this.statCache[abs] = stat;
      if (abs.slice(-1) === "/" && stat && !stat.isDirectory())
        return cb(null, false, stat);
      var c = true;
      if (stat)
        c = stat.isDirectory() ? "DIR" : "FILE";
      this.cache[abs] = this.cache[abs] || c;
      if (needDir && c === "FILE")
        return cb();
      return cb(null, c, stat);
    };
  }
});

// ../../../../code/clones/ts-json-schema-generator/node_modules/normalize-path/index.js
var require_normalize_path = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/node_modules/normalize-path/index.js"(exports2, module2) {
    module2.exports = function(path, stripTrailing) {
      if (typeof path !== "string") {
        throw new TypeError("expected path to be a string");
      }
      if (path === "\\" || path === "/")
        return "/";
      var len = path.length;
      if (len <= 1)
        return path;
      var prefix = "";
      if (len > 4 && path[3] === "\\") {
        var ch = path[2];
        if ((ch === "?" || ch === ".") && path.slice(0, 2) === "\\\\") {
          path = path.slice(2);
          prefix = "//";
        }
      }
      var segs = path.split(/[/\\]+/);
      if (stripTrailing !== false && segs[segs.length - 1] === "") {
        segs.pop();
      }
      return prefix + segs.join("/");
    };
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Error/DiagnosticError.js
var require_DiagnosticError = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Error/DiagnosticError.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DiagnosticError = void 0;
    var typescript_1 = __importDefault2(require("typescript"));
    var BaseError_12 = require_BaseError();
    var DiagnosticError = class extends BaseError_12.BaseError {
      constructor(diagnostics) {
        super(diagnostics.map((diagnostic) => typescript_1.default.flattenDiagnosticMessageText(diagnostic.messageText, "\n")).join("\n\n"));
        this.diagnostics = diagnostics;
      }
      getDiagnostics() {
        return this.diagnostics;
      }
    };
    exports2.DiagnosticError = DiagnosticError;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Error/NoRootNamesError.js
var require_NoRootNamesError = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Error/NoRootNamesError.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NoRootNamesError = void 0;
    var BaseError_12 = require_BaseError();
    var NoRootNamesError = class extends BaseError_12.BaseError {
      get name() {
        return "NoRootNamesError";
      }
      get message() {
        return `No source files found`;
      }
    };
    exports2.NoRootNamesError = NoRootNamesError;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Error/NoTSConfigError.js
var require_NoTSConfigError = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Error/NoTSConfigError.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NoTSConfigError = void 0;
    var BaseError_12 = require_BaseError();
    var NoTSConfigError = class extends BaseError_12.BaseError {
      get name() {
        return "NoTSConfigError";
      }
      get message() {
        return `No tsconfig file found`;
      }
    };
    exports2.NoTSConfigError = NoTSConfigError;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/factory/program.js
var require_program = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/factory/program.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createProgram = void 0;
    var glob = __importStar2(require_glob());
    var path = __importStar2(require("path"));
    var typescript_1 = __importDefault2(require("typescript"));
    var normalize_path_1 = __importDefault2(require_normalize_path());
    var DiagnosticError_1 = require_DiagnosticError();
    var LogicError_1 = require_LogicError();
    var NoRootNamesError_1 = require_NoRootNamesError();
    var NoTSConfigError_1 = require_NoTSConfigError();
    function loadTsConfigFile(configFile) {
      const raw = typescript_1.default.sys.readFile(configFile);
      if (raw) {
        const config2 = typescript_1.default.parseConfigFileTextToJson(configFile, raw);
        if (config2.error) {
          throw new DiagnosticError_1.DiagnosticError([config2.error]);
        } else if (!config2.config) {
          throw new LogicError_1.LogicError(`Invalid parsed config file "${configFile}"`);
        }
        const parseResult = typescript_1.default.parseJsonConfigFileContent(config2.config, typescript_1.default.sys, path.resolve(path.dirname(configFile)), {}, configFile);
        parseResult.options.noEmit = true;
        delete parseResult.options.out;
        delete parseResult.options.outDir;
        delete parseResult.options.outFile;
        delete parseResult.options.declaration;
        delete parseResult.options.declarationDir;
        delete parseResult.options.declarationMap;
        return parseResult;
      } else {
        throw new NoTSConfigError_1.NoTSConfigError();
      }
    }
    function getTsConfig(config2) {
      if (config2.tsconfig) {
        return loadTsConfigFile(config2.tsconfig);
      }
      return {
        fileNames: [],
        options: {
          noEmit: true,
          emitDecoratorMetadata: true,
          experimentalDecorators: true,
          target: typescript_1.default.ScriptTarget.ES5,
          module: typescript_1.default.ModuleKind.CommonJS,
          strictNullChecks: false
        }
      };
    }
    function createProgram(config2) {
      const rootNamesFromPath = config2.path ? glob.sync((0, normalize_path_1.default)(path.resolve(config2.path))) : [];
      const tsconfig = getTsConfig(config2);
      const rootNames = rootNamesFromPath.length ? rootNamesFromPath : tsconfig.fileNames;
      if (!rootNames.length) {
        throw new NoRootNamesError_1.NoRootNamesError();
      }
      const program = typescript_1.default.createProgram(rootNames, tsconfig.options);
      if (!config2.skipTypeCheck) {
        const diagnostics = typescript_1.default.getPreEmitDiagnostics(program);
        if (diagnostics.length) {
          throw new DiagnosticError_1.DiagnosticError(diagnostics);
        }
      }
      return program;
    }
    exports2.createProgram = createProgram;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/factory/generator.js
var require_generator = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/factory/generator.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createGenerator = void 0;
    var SchemaGenerator_1 = require_SchemaGenerator();
    var formatter_1 = require_formatter();
    var parser_1 = require_parser();
    var program_1 = require_program();
    function createGenerator(config2) {
      const program = (0, program_1.createProgram)(config2);
      const parser = (0, parser_1.createParser)(program, config2);
      const formatter = (0, formatter_1.createFormatter)(config2);
      return new SchemaGenerator_1.SchemaGenerator(program, parser, formatter, config2);
    }
    exports2.createGenerator = createGenerator;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/src/Utils/formatError.js
var require_formatError = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/src/Utils/formatError.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.formatError = void 0;
    var path = __importStar2(require("path"));
    var typescript_1 = __importDefault2(require("typescript"));
    var DiagnosticError_1 = require_DiagnosticError();
    var UnknownNodeError_1 = require_UnknownNodeError();
    function getNodeLocation(node) {
      const sourceFile = node.getSourceFile();
      if (!sourceFile) {
        return ["<unknown file>", 0, 0];
      }
      const lineAndChar = typescript_1.default.getLineAndCharacterOfPosition(sourceFile, node.getStart(sourceFile));
      return [sourceFile.fileName, lineAndChar.line + 1, lineAndChar.character];
    }
    function formatError(error) {
      if (error instanceof DiagnosticError_1.DiagnosticError) {
        const rootDir = process.cwd().split(path.sep)[0] || "/";
        return typescript_1.default.formatDiagnostics(error.getDiagnostics(), {
          getCanonicalFileName: (fileName) => fileName,
          getCurrentDirectory: () => rootDir,
          getNewLine: () => "\n"
        });
      } else if (error instanceof UnknownNodeError_1.UnknownNodeError) {
        const unknownNode = error.getReference() || error.getNode();
        const nodeFullText = unknownNode.getFullText().trim().split("\n")[0].trim();
        const [sourceFile, lineNumber, charPos] = getNodeLocation(unknownNode);
        return `${error.name}: Unknown node "${nodeFullText}" (ts.SyntaxKind = ${error.getNode().kind}) at ${sourceFile}(${lineNumber},${charPos})
`;
      }
      return `${error.name}: ${error.message}
`;
    }
    exports2.formatError = formatError;
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/package.json
var require_package = __commonJS({
  "../../../../code/clones/ts-json-schema-generator/dist/package.json"(exports2, module2) {
    module2.exports = {
      name: "ts-json-schema-generator",
      version: "1.0.0",
      description: "Generate JSON schema from your Typescript sources",
      main: "dist/index.js",
      types: "dist/index.d.ts",
      bin: {
        "ts-json-schema-generator": "./bin/ts-json-schema-generator"
      },
      files: [
        "dist",
        "src",
        "factory",
        "index.*",
        "ts-json-schema-generator.*"
      ],
      author: {
        name: "Alexander Evtushenko",
        email: "aevtushenko@xiag.ch"
      },
      contributors: [
        {
          name: "Dominik Moritz",
          email: "domoritz@gmail.com"
        },
        {
          name: "MooYeol Prescott Lee",
          email: "mooyoul@gmail.com"
        }
      ],
      repository: {
        type: "git",
        url: "https://github.com/vega/ts-json-schema-generator.git"
      },
      license: "MIT",
      keywords: [
        "ts",
        "typescript",
        "json",
        "schema",
        "jsonschema"
      ],
      engines: {
        node: ">=10.0.0"
      },
      dependencies: {
        "@types/json-schema": "^7.0.12",
        commander: "^11.0.0",
        glob: "^8.0.3",
        json5: "^2.2.3",
        "normalize-path": "^3.0.0",
        "safe-stable-stringify": "^2.4.3",
        typescript: "~5.2.2"
      },
      devDependencies: {
        "@auto-it/conventional-commits": "^11.0.0",
        "@auto-it/first-time-contributor": "^11.0.0",
        "@babel/core": "^7.22.9",
        "@babel/preset-env": "^7.22.9",
        "@babel/preset-typescript": "^7.22.5",
        "@types/glob": "^8.1.0",
        "@types/jest": "^29.5.3",
        "@types/node": "^20.4.5",
        "@types/normalize-path": "^3.0.0",
        "@typescript-eslint/eslint-plugin": "^6.2.1",
        "@typescript-eslint/parser": "^6.2.1",
        ajv: "^8.12.0",
        "ajv-formats": "^2.1.1",
        auto: "^11.0.0",
        chai: "^4.3.7",
        "cross-env": "^7.0.3",
        eslint: "^8.46.0",
        "eslint-config-prettier": "^9.0.0",
        "eslint-plugin-prettier": "^5.0.0",
        jest: "^29.6.2",
        "jest-junit": "^16.0.0",
        prettier: "^3.0.0",
        "ts-node": "^10.9.1",
        vega: "^5.25.0",
        "vega-lite": "^5.14.1"
      },
      scripts: {
        prepublishOnly: "yarn build",
        build: "tsc",
        watch: "tsc -w",
        lint: 'eslint "{src,test,factory}/**/*.ts"',
        format: "yarn lint --fix",
        test: "jest test/ --verbose",
        "test:fast": "cross-env FAST_TEST=1 jest test/ --verbose",
        "test:coverage": "yarn jest test/ --collectCoverage=true",
        "test:update": "cross-env UPDATE_SCHEMA=true yarn test:fast",
        debug: "node -r ts-node/register --inspect-brk ts-json-schema-generator.ts",
        run: "ts-node-transpile-only ts-json-schema-generator.ts",
        release: "yarn build && auto shipit"
      }
    };
  }
});

// ../../../../code/clones/ts-json-schema-generator/dist/ts-json-schema-generator.js
var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = { enumerable: true, get: function() {
      return m[k];
    } };
  }
  Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar = exports && exports.__importStar || function(mod) {
  if (mod && mod.__esModule)
    return mod;
  var result = {};
  if (mod != null) {
    for (var k in mod)
      if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
        __createBinding(result, mod, k);
  }
  __setModuleDefault(result, mod);
  return result;
};
var __importDefault = exports && exports.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = require_commander();
var safe_stable_stringify_1 = __importDefault(require_safe_stable_stringify());
var generator_1 = require_generator();
var Config_1 = require_Config();
var BaseError_1 = require_BaseError();
var formatError_1 = require_formatError();
var pkg = __importStar(require_package());
var path_1 = require("path");
var fs_1 = require("fs");
var args = new commander_1.Command().option("-p, --path <path>", "Source file path").option("-t, --type <name>", "Type name").option("-i, --id <name>", "$id for generated schema").option("-f, --tsconfig <path>", "Custom tsconfig.json path").addOption(new commander_1.Option("-e, --expose <expose>", "Type exposing").choices(["all", "none", "export"]).default("export")).addOption(new commander_1.Option("-j, --jsDoc <extended>", "Read JsDoc annotations").choices(["none", "basic", "extended"]).default("extended")).addOption(new commander_1.Option("--markdown-description", "Generate `markdownDescription` in addition to `description`.").implies({
  jsDoc: "extended"
})).option("--minify", "Minify generated schema", false).option("--unstable", "Do not sort properties").option("--strict-tuples", "Do not allow additional items on tuples").option("--no-top-ref", "Do not create a top-level $ref definition").option("--no-type-check", "Skip type checks to improve performance").option("--no-ref-encode", "Do not encode references").option("-o, --out <file>", "Set the output file (default: stdout)").option("--validation-keywords [value]", "Provide additional validation keywords to include", (value, list) => list.concat(value), []).option("--additional-properties", "Allow additional properties for objects with no index signature (default: false)", false).version(pkg.version).parse(process.argv).opts();
var config = {
  ...Config_1.DEFAULT_CONFIG,
  minify: args.minify,
  path: args.path,
  tsconfig: args.tsconfig,
  type: args.type,
  schemaId: args.id,
  expose: args.expose,
  topRef: args.topRef,
  jsDoc: args.jsDoc,
  markdownDescription: args.markdownDescription,
  sortProps: !args.unstable,
  strictTuples: args.strictTuples,
  skipTypeCheck: !args.typeCheck,
  encodeRefs: args.refEncode,
  extraTags: args.validationKeywords,
  additionalProperties: args.additionalProperties
};
try {
  const schema = (0, generator_1.createGenerator)(config).createSchema(args.type);
  const stringify = config.sortProps ? safe_stable_stringify_1.default : JSON.stringify;
  const schemaString = config.minify ? stringify(schema) : stringify(schema, null, 2);
  if (args.out) {
    const outPath = (0, path_1.dirname)(args.out);
    (0, fs_1.mkdirSync)(outPath, { recursive: true });
    (0, fs_1.writeFileSync)(args.out, schemaString);
  } else {
    process.stdout.write(`${schemaString}
`);
  }
} catch (error) {
  if (error instanceof BaseError_1.BaseError) {
    process.stderr.write((0, formatError_1.formatError)(error));
    process.exit(1);
  } else {
    throw error;
  }
}
/*! Bundled license information:

normalize-path/index.js:
  (*!
   * normalize-path <https://github.com/jonschlinkert/normalize-path>
   *
   * Copyright (c) 2014-2018, Jon Schlinkert.
   * Released under the MIT License.
   *)
*/
