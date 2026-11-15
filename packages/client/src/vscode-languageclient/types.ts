import type { TextEdit } from 'vscode';
import type { TextEdit as LsTextEdit } from 'vscode-languageclient/node';

export interface Converter {
    asTextEdit(textEdit: LsTextEdit): TextEdit;
}
