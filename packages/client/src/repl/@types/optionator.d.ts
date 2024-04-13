// See https://github.com/gkz/optionator#settings-format
declare module 'optionator' {

    // eslint-disable-next-line
    module optionator {

        interface OptionatorHeading {
            heading: string;
        }

        interface OptionatorOption {
            option: string;
            alias?: string | string[];
            type: string;
            enum?: string[];
            default?: string;
            restPositional?: boolean;
            required?: boolean;
            overrideRequired?: boolean;
            dependsOn?: string | string[];
            concatRepeatedArrays?: boolean | [boolean, object];
            mergeRepeatedObjects?: boolean;
            description?: string;
            longDescription?: string;
            example?: string | string[];
        }

        interface OptionatorHelpStyle {
            aliasSeparator?: string;
            typeSeparator?: string;
            descriptionSeparator?: string;
            initialIndent?: number;
            secondaryIndent?: number;
            maxPadFactor?: number;
        }

        interface OptionatorArgs {
            prepend?: string;
            append?: string;
            options: (OptionatorHeading | OptionatorOption)[];
            helpStyle?: OptionatorHelpStyle;
            mutuallyExclusive?: (string | string[])[];
            positionalAnywhere?: boolean;
            typeAliases?: object;
            defaults?: Partial<OptionatorOption>;
            stdout?:  NodeJS.WritableStream;
        }

        interface Optionator {
            parse(input: string | string[] | object, parseOptions?: { slice?: number }): any;
            parseArgv(input: string[]): any;
            generateHelp(helpOptions?: { showHidden?: boolean; interpolate?: any }): string;
            generateHelpForOption(optionName: string): string;
        }
    }

    function optionator(args: optionator.OptionatorArgs): optionator.Optionator;
    export = optionator;
}

// cspell:word optionator
