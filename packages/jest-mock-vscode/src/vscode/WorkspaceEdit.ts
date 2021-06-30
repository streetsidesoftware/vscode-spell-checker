import type * as vscode from 'vscode';
import type { Range, Uri as URI, TextEdit } from 'vscode';
import { IFileOperation, IFileTextEdit } from './extHostTypes';
import { FileEditType } from './baseTypes';
import * as vsMock from './extHostTypes';
import { coalesceInPlace } from './arrays';
import { ResourceMap } from './ResourceMap';

type WorkspaceEditEntry = IFileOperation | IFileTextEdit | IFileCellEdit | ICellEdit;

export interface IFileCellEdit {
    _type: FileEditType.Cell;
    uri: URI;
    // edit?: ICellPartialMetadataEdit | IDocumentMetadataEdit;
    notebookMetadata?: Record<string, any>;
    metadata?: vscode.WorkspaceEditEntryMetadata;
}

export interface ICellEdit {
    _type: FileEditType.CellReplace;
    metadata?: vscode.WorkspaceEditEntryMetadata;
    uri: URI;
    index: number;
    count: number;
    cells: vscode.NotebookCellData[];
}

export class WorkspaceEdit implements vscode.WorkspaceEdit {
    private readonly _edits: WorkspaceEditEntry[] = [];

    _allEntries(): ReadonlyArray<WorkspaceEditEntry> {
        return this._edits;
    }

    // --- file

    renameFile(
        from: vscode.Uri,
        to: vscode.Uri,
        options?: { overwrite?: boolean; ignoreIfExists?: boolean },
        metadata?: vscode.WorkspaceEditEntryMetadata
    ): void {
        this._edits.push({ _type: FileEditType.File, from, to, options, metadata });
    }

    createFile(
        uri: vscode.Uri,
        options?: { overwrite?: boolean; ignoreIfExists?: boolean },
        metadata?: vscode.WorkspaceEditEntryMetadata
    ): void {
        this._edits.push({ _type: FileEditType.File, from: undefined, to: uri, options, metadata });
    }

    deleteFile(
        uri: vscode.Uri,
        options?: { recursive?: boolean; ignoreIfNotExists?: boolean },
        metadata?: vscode.WorkspaceEditEntryMetadata
    ): void {
        this._edits.push({ _type: FileEditType.File, from: uri, to: undefined, options, metadata });
    }

    // --- notebook

    replaceNotebookMetadata(_uri: URI, _value: Record<string, any>, _metadata?: vscode.WorkspaceEditEntryMetadata): void {
        throw new Error('Method not implemented.');
    }

    replaceNotebookCells(
        uri: URI,
        range: vscode.NotebookRange,
        cells: vscode.NotebookCellData[],
        metadata?: vscode.WorkspaceEditEntryMetadata
    ): void;
    replaceNotebookCells(
        uri: URI,
        start: number,
        end: number,
        cells: vscode.NotebookCellData[],
        metadata?: vscode.WorkspaceEditEntryMetadata
    ): void;
    replaceNotebookCells(
        _uri: URI,
        _startOrRange: number | vscode.NotebookRange,
        _endOrCells: number | vscode.NotebookCellData[],
        _cellsOrMetadata?: vscode.NotebookCellData[] | vscode.WorkspaceEditEntryMetadata,
        _metadata?: vscode.WorkspaceEditEntryMetadata
    ): void {
        throw new Error('Method not implemented.');
    }

    replaceNotebookCellMetadata(
        _uri: URI,
        _index: number,
        _cellMetadata: Record<string, any>,
        _metadata?: vscode.WorkspaceEditEntryMetadata
    ): void {
        throw new Error('Method not implemented.');
    }

    // --- text

    replace(uri: URI, range: Range, newText: string, metadata?: vscode.WorkspaceEditEntryMetadata): void {
        this._edits.push({ _type: FileEditType.Text, uri, edit: new vsMock.TextEdit(range, newText), metadata });
    }

    insert(resource: URI, position: vscode.Position, newText: string, metadata?: vscode.WorkspaceEditEntryMetadata): void {
        this.replace(resource, new vsMock.Range(position, position), newText, metadata);
    }

    delete(resource: URI, range: Range, metadata?: vscode.WorkspaceEditEntryMetadata): void {
        this.replace(resource, range, '', metadata);
    }

    // --- text (Map-like)

    has(uri: URI): boolean {
        return this._edits.some((edit) => edit._type === FileEditType.Text && edit.uri.toString() === uri.toString());
    }

    set(uri: URI, edits: TextEdit[]): void {
        if (!edits) {
            // remove all text edits for `uri`
            for (let i = 0; i < this._edits.length; i++) {
                const element = this._edits[i];
                if (element._type === FileEditType.Text && element.uri.toString() === uri.toString()) {
                    this._edits[i] = undefined!; // will be coalesced down below
                }
            }
            coalesceInPlace(this._edits);
        } else {
            // append edit to the end
            for (const edit of edits) {
                if (edit) {
                    this._edits.push({ _type: FileEditType.Text, uri, edit });
                }
            }
        }
    }

    get(uri: URI): TextEdit[] {
        const res: TextEdit[] = [];
        for (const candidate of this._edits) {
            if (candidate._type === FileEditType.Text && candidate.uri.toString() === uri.toString()) {
                res.push(candidate.edit);
            }
        }
        return res;
    }

    entries(): [URI, TextEdit[]][] {
        const textEdits = new ResourceMap<[URI, TextEdit[]]>();
        for (const candidate of this._edits) {
            if (candidate._type === FileEditType.Text) {
                let textEdit = textEdits.get(candidate.uri);
                if (!textEdit) {
                    textEdit = [candidate.uri, []];
                    textEdits.set(candidate.uri, textEdit);
                }
                textEdit[1].push(candidate.edit);
            }
        }
        return [...textEdits.values()];
    }

    get size(): number {
        return this.entries().length;
    }

    toJSON(): any {
        return this.entries();
    }
}
