import {
    TextDocument,
} from 'vscode-languageserver';

export class DocChecker {
    /**
     *
     */
    constructor(private _doc: TextDocument) {
    }

    public get doc() { return this._doc; }

}