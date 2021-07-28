import type * as vscode from 'vscode';

export class MarkdownString implements vscode.MarkdownString {
    public value: string;
    public isTrusted?: boolean;
    public supportThemeIcons?: boolean;

    constructor(value: string = '', isTrustedOrOptions: boolean | { isTrusted?: boolean; supportThemeIcons?: boolean } = false) {
        this.value = value;
        if (typeof this.value !== 'string') {
            throw illegalArgument('value');
        }

        if (typeof isTrustedOrOptions === 'boolean') {
            this.isTrusted = isTrustedOrOptions;
            this.supportThemeIcons = false;
        } else {
            this.isTrusted = isTrustedOrOptions.isTrusted ?? undefined;
            this.supportThemeIcons = isTrustedOrOptions.supportThemeIcons ?? false;
        }
    }

    appendText(value: string): MarkdownString {
        this.value += value;
        return this;
    }

    appendMarkdown(value: string): MarkdownString {
        this.value += value;
        return this;
    }

    appendCodeblock(langId: string, code: string): MarkdownString {
        this.value += '\n```';
        this.value += langId;
        this.value += '\n';
        this.value += code;
        this.value += '\n```\n';
        return this;
    }
}

function illegalArgument(msg: string) {
    return new IllegalArgument(msg);
}

class IllegalArgument extends Error {
    constructor(msg: string) {
        super('Illegal Argument: ' + msg);
    }
}
