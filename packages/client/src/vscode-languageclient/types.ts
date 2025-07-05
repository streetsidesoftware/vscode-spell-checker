import type { TextEdit } from 'vscode';

import type { TextEdit as LsTextEdit } from './node.cjs';

export interface Converter {
    asTextEdit(textEdit: LsTextEdit): TextEdit;
}
