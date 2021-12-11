/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type * as vscode from 'vscode';
import { Uri as URI } from './uri';
import { FileEditType } from './baseTypes';

export class Disposable {
    static from(...inDisposables: { dispose(): any }[]): Disposable {
        let disposables: ReadonlyArray<{ dispose(): any }> | undefined = inDisposables;
        return new Disposable(function () {
            if (disposables) {
                for (const disposable of disposables) {
                    if (disposable && typeof disposable.dispose === 'function') {
                        disposable.dispose();
                    }
                }
                disposables = undefined;
            }
        });
    }

    #callOnDispose?: () => any;

    constructor(callOnDispose: () => any) {
        this.#callOnDispose = callOnDispose;
    }

    dispose(): any {
        if (typeof this.#callOnDispose === 'function') {
            this.#callOnDispose();
            this.#callOnDispose = undefined;
        }
    }
}

export class Position implements vscode.Position {
    static Min(...positions: vscode.Position[]): vscode.Position {
        if (positions.length === 0) {
            throw new TypeError();
        }
        let result = positions[0];
        for (let i = 1; i < positions.length; i++) {
            const p = positions[i];
            if (p.isBefore(result!)) {
                result = p;
            }
        }
        return result;
    }

    static Max(...positions: vscode.Position[]): vscode.Position {
        if (positions.length === 0) {
            throw new TypeError();
        }
        let result = positions[0];
        for (let i = 1; i < positions.length; i++) {
            const p = positions[i];
            if (p.isAfter(result!)) {
                result = p;
            }
        }
        return result;
    }

    static isPosition(other: any): other is Position {
        if (!other) {
            return false;
        }
        if (other instanceof Position) {
            return true;
        }
        const { line, character } = <Position>other;
        if (typeof line === 'number' && typeof character === 'number') {
            return true;
        }
        return false;
    }

    private _line: number;
    private _character: number;

    get line(): number {
        return this._line;
    }

    get character(): number {
        return this._character;
    }

    constructor(line: number, character: number) {
        if (line < 0) {
            throw illegalArgument('line must be non-negative');
        }
        if (character < 0) {
            throw illegalArgument('character must be non-negative');
        }
        this._line = line;
        this._character = character;
    }

    isBefore(other: vscode.Position): boolean {
        if (this._line < other.line) {
            return true;
        }
        if (other.line < this._line) {
            return false;
        }
        return this._character < other.character;
    }

    isBeforeOrEqual(other: vscode.Position): boolean {
        if (this._line < other.line) {
            return true;
        }
        if (other.line < this._line) {
            return false;
        }
        return this._character <= other.character;
    }

    isAfter(other: vscode.Position): boolean {
        return !this.isBeforeOrEqual(other);
    }

    isAfterOrEqual(other: vscode.Position): boolean {
        return !this.isBefore(other);
    }

    isEqual(other: vscode.Position): boolean {
        return this._line === other.line && this._character === other.character;
    }

    compareTo(other: vscode.Position): number {
        if (this._line < other.line) {
            return -1;
        } else if (this._line > other.line) {
            return 1;
        } else {
            // equal line
            if (this._character < other.character) {
                return -1;
            } else if (this._character > other.character) {
                return 1;
            } else {
                // equal line and character
                return 0;
            }
        }
    }

    translate(change: { lineDelta?: number; characterDelta?: number }): Position;
    translate(lineDelta?: number, characterDelta?: number): Position;
    translate(
        lineDeltaOrChange: number | undefined | { lineDelta?: number; characterDelta?: number },
        characterDelta: number = 0
    ): Position {
        if (lineDeltaOrChange === null || characterDelta === null) {
            throw illegalArgument();
        }

        let lineDelta: number;
        if (typeof lineDeltaOrChange === 'undefined') {
            lineDelta = 0;
        } else if (typeof lineDeltaOrChange === 'number') {
            lineDelta = lineDeltaOrChange;
        } else {
            lineDelta = typeof lineDeltaOrChange.lineDelta === 'number' ? lineDeltaOrChange.lineDelta : 0;
            characterDelta = typeof lineDeltaOrChange.characterDelta === 'number' ? lineDeltaOrChange.characterDelta : 0;
        }

        if (lineDelta === 0 && characterDelta === 0) {
            return this;
        }
        return new Position(this.line + lineDelta, this.character + characterDelta);
    }

    with(change: { line?: number; character?: number }): Position;
    with(line?: number, character?: number): Position;
    with(lineOrChange: number | undefined | { line?: number; character?: number }, character: number = this.character): Position {
        if (lineOrChange === null || character === null) {
            throw illegalArgument();
        }

        let line: number;
        if (typeof lineOrChange === 'undefined') {
            line = this.line;
        } else if (typeof lineOrChange === 'number') {
            line = lineOrChange;
        } else {
            line = typeof lineOrChange.line === 'number' ? lineOrChange.line : this.line;
            character = typeof lineOrChange.character === 'number' ? lineOrChange.character : this.character;
        }

        if (line === this.line && character === this.character) {
            return this;
        }
        return new Position(line, character);
    }

    toJSON(): unknown {
        return { line: this.line, character: this.character };
    }
}

export class Range implements vscode.Range {
    static isRange(thing: any): thing is vscode.Range {
        if (thing instanceof Range) {
            return true;
        }
        if (!thing) {
            return false;
        }
        return Position.isPosition((<Range>thing).start) && Position.isPosition(<Range>thing.end);
    }

    protected _start: Position;
    protected _end: Position;

    get start(): Position {
        return this._start;
    }

    get end(): Position {
        return this._end;
    }

    constructor(start: vscode.Position, end: vscode.Position);
    constructor(startLine: number, startColumn: number, endLine: number, endColumn: number);
    constructor(
        startLineOrStart: number | vscode.Position,
        startColumnOrEnd: number | vscode.Position,
        endLine?: number,
        endColumn?: number
    ) {
        let start: Position | undefined;
        let end: Position | undefined;

        if (
            typeof startLineOrStart === 'number' &&
            typeof startColumnOrEnd === 'number' &&
            typeof endLine === 'number' &&
            typeof endColumn === 'number'
        ) {
            start = new Position(startLineOrStart, startColumnOrEnd);
            end = new Position(endLine, endColumn);
        } else if (startLineOrStart instanceof Position && startColumnOrEnd instanceof Position) {
            start = startLineOrStart;
            end = startColumnOrEnd;
        }

        if (!start || !end) {
            throw new Error('Invalid arguments');
        }

        if (start.isBefore(end)) {
            this._start = start;
            this._end = end;
        } else {
            this._start = end;
            this._end = start;
        }
    }

    contains(positionOrRange: vscode.Position | vscode.Range): boolean {
        if (positionOrRange instanceof Range) {
            return this.contains(positionOrRange._start) && this.contains(positionOrRange._end);
        } else if (positionOrRange instanceof Position) {
            if (positionOrRange.isBefore(this._start)) {
                return false;
            }
            if (this._end.isBefore(positionOrRange)) {
                return false;
            }
            return true;
        }
        return false;
    }

    isEqual(other: vscode.Range): boolean {
        return this._start.isEqual(other.start) && this._end.isEqual(other.end);
    }

    intersection(other: vscode.Range): vscode.Range | undefined {
        const start = Position.Max(other.start, this._start);
        const end = Position.Min(other.end, this._end);
        if (start.isAfter(end)) {
            // this happens when there is no overlap:
            // |-----|
            //          |----|
            return undefined;
        }
        return new Range(start, end);
    }

    union(other: Range): Range {
        if (this.contains(other)) {
            return this;
        } else if (other.contains(this)) {
            return other;
        }
        const start = Position.Min(other.start, this._start);
        const end = Position.Max(other.end, this.end);
        return new Range(start, end);
    }

    get isEmpty(): boolean {
        return this._start.isEqual(this._end);
    }

    get isSingleLine(): boolean {
        return this._start.line === this._end.line;
    }

    with(change: { start?: Position; end?: Position }): Range;
    with(start?: Position, end?: Position): Range;
    with(startOrChange: Position | undefined | { start?: Position; end?: Position }, end: Position = this.end): Range {
        if (startOrChange === null || end === null) {
            throw illegalArgument();
        }

        let start: Position;
        if (!startOrChange) {
            start = this.start;
        } else if (Position.isPosition(startOrChange)) {
            start = startOrChange;
        } else {
            start = startOrChange.start || this.start;
            end = startOrChange.end || this.end;
        }

        if (start.isEqual(this._start) && end.isEqual(this.end)) {
            return this;
        }
        return new Range(start, end);
    }

    toJSON(): any {
        return [this.start, this.end];
    }
}

export class Selection extends Range implements vscode.Selection {
    static isSelection(thing: any): thing is Selection {
        if (thing instanceof Selection) {
            return true;
        }
        if (!thing) {
            return false;
        }
        return (
            Range.isRange(thing) &&
            Position.isPosition((<Selection>thing).anchor) &&
            Position.isPosition((<Selection>thing).active) &&
            typeof (<Selection>thing).isReversed === 'boolean'
        );
    }

    private _anchor: Position;

    public get anchor(): Position {
        return this._anchor;
    }

    private _active: Position;

    public get active(): Position {
        return this._active;
    }

    constructor(anchor: vscode.Position, active: vscode.Position);
    constructor(anchorLine: number, anchorColumn: number, activeLine: number, activeColumn: number);
    constructor(
        anchorLineOrAnchor: number | vscode.Position,
        anchorColumnOrActive: number | vscode.Position,
        activeLine?: number,
        activeColumn?: number
    ) {
        let anchor: Position | undefined;
        let active: Position | undefined;

        if (
            typeof anchorLineOrAnchor === 'number' &&
            typeof anchorColumnOrActive === 'number' &&
            typeof activeLine === 'number' &&
            typeof activeColumn === 'number'
        ) {
            anchor = new Position(anchorLineOrAnchor, anchorColumnOrActive);
            active = new Position(activeLine, activeColumn);
        } else if (anchorLineOrAnchor instanceof Position && anchorColumnOrActive instanceof Position) {
            anchor = anchorLineOrAnchor;
            active = anchorColumnOrActive;
        }

        if (!anchor || !active) {
            throw new Error('Invalid arguments');
        }

        super(anchor, active);

        this._anchor = anchor;
        this._active = active;
    }

    get isReversed(): boolean {
        return this._anchor === this._end;
    }

    toJSON() {
        return {
            start: this.start,
            end: this.end,
            active: this.active,
            anchor: this.anchor,
        };
    }
}

export class TextEdit {
    static isTextEdit(thing: any): thing is TextEdit {
        if (thing instanceof TextEdit) {
            return true;
        }
        if (!thing) {
            return false;
        }
        return Range.isRange(<TextEdit>thing) && typeof (<TextEdit>thing).newText === 'string';
    }

    static replace(range: Range, newText: string): TextEdit {
        return new TextEdit(range, newText);
    }

    static insert(position: Position, newText: string): TextEdit {
        return TextEdit.replace(new Range(position, position), newText);
    }

    static delete(range: Range): TextEdit {
        return TextEdit.replace(range, '');
    }

    static setEndOfLine(eol: vscode.EndOfLine): TextEdit {
        const ret = new TextEdit(new Range(new Position(0, 0), new Position(0, 0)), '');
        ret.newEol = eol;
        return ret;
    }

    protected _range: vscode.Range;
    protected _newText: string | null;
    protected _newEol?: vscode.EndOfLine;

    get range(): vscode.Range {
        return this._range;
    }

    set range(value: vscode.Range) {
        if (value && !Range.isRange(value)) {
            throw illegalArgument('range');
        }
        this._range = value;
    }

    get newText(): string {
        return this._newText || '';
    }

    set newText(value: string) {
        if (value && typeof value !== 'string') {
            throw illegalArgument('newText');
        }
        this._newText = value;
    }

    get newEol(): vscode.EndOfLine | undefined {
        return this._newEol;
    }

    set newEol(value: vscode.EndOfLine | undefined) {
        if (value && typeof value !== 'number') {
            throw illegalArgument('newEol');
        }
        this._newEol = value;
    }

    constructor(range: vscode.Range, newText: string | null) {
        this._range = range;
        this._newText = newText;
    }

    toJSON(): any {
        return {
            range: this.range,
            newText: this.newText,
            newEol: this._newEol,
        };
    }
}

export interface IFileOperationOptions {
    overwrite?: boolean;
    ignoreIfExists?: boolean;
    ignoreIfNotExists?: boolean;
    recursive?: boolean;
}

export interface IFileOperation {
    _type: FileEditType.File;
    from?: URI;
    to?: URI;
    options?: IFileOperationOptions;
    metadata?: vscode.WorkspaceEditEntryMetadata;
}

export interface IFileTextEdit {
    _type: FileEditType.Text;
    uri: URI;
    edit: vscode.TextEdit;
    metadata?: vscode.WorkspaceEditEntryMetadata;
}

export class SnippetString {
    static isSnippetString(thing: any): thing is SnippetString {
        if (thing instanceof SnippetString) {
            return true;
        }
        if (!thing) {
            return false;
        }
        return typeof (<SnippetString>thing).value === 'string';
    }

    private static _escape(value: string): string {
        return value.replace(/\$|}|\\/g, '\\$&');
    }

    private _tabstop: number = 1;

    value: string;

    constructor(value?: string) {
        this.value = value || '';
    }

    appendText(string: string): SnippetString {
        this.value += SnippetString._escape(string);
        return this;
    }

    appendTabstop(number: number = this._tabstop++): SnippetString {
        this.value += '$';
        this.value += number;
        return this;
    }

    appendPlaceholder(value: string | ((snippet: SnippetString) => any), number: number = this._tabstop++): SnippetString {
        if (typeof value === 'function') {
            const nested = new SnippetString();
            nested._tabstop = this._tabstop;
            value(nested);
            this._tabstop = nested._tabstop;
            value = nested.value;
        } else {
            value = SnippetString._escape(value);
        }

        this.value += '${';
        this.value += number;
        this.value += ':';
        this.value += value;
        this.value += '}';

        return this;
    }

    appendChoice(values: string[], number: number = this._tabstop++): SnippetString {
        const value = SnippetString._escape(values.toString());

        this.value += '${';
        this.value += number;
        this.value += '|';
        this.value += value;
        this.value += '|}';

        return this;
    }

    appendVariable(name: string, defaultValue?: string | ((snippet: SnippetString) => any)): SnippetString {
        if (typeof defaultValue === 'function') {
            const nested = new SnippetString();
            nested._tabstop = this._tabstop;
            defaultValue(nested);
            this._tabstop = nested._tabstop;
            defaultValue = nested.value;
        } else if (typeof defaultValue === 'string') {
            defaultValue = defaultValue.replace(/\$|}/g, '\\$&');
        }

        this.value += '${';
        this.value += name;
        if (defaultValue) {
            this.value += ':';
            this.value += defaultValue;
        }
        this.value += '}';

        return this;
    }
}

export enum DiagnosticTag {
    Unnecessary = 1,
    Deprecated = 2,
}

export enum DiagnosticSeverity {
    Hint = 3,
    Information = 2,
    Warning = 1,
    Error = 0,
}

export class Location {
    static isLocation(thing: any): thing is Location {
        if (thing instanceof Location) {
            return true;
        }
        if (!thing) {
            return false;
        }
        return Range.isRange((<Location>thing).range) && URI.isUri((<Location>thing).uri);
    }

    uri: URI;
    range!: Range;

    constructor(uri: URI, rangeOrPosition: Range | Position) {
        this.uri = uri;

        if (!rangeOrPosition) {
            //that's OK
        } else if (rangeOrPosition instanceof Range) {
            this.range = rangeOrPosition;
        } else if (rangeOrPosition instanceof Position) {
            this.range = new Range(rangeOrPosition, rangeOrPosition);
        } else {
            throw new Error('Illegal argument');
        }
    }

    toJSON(): any {
        return {
            uri: this.uri,
            range: this.range,
        };
    }
}

export class DiagnosticRelatedInformation {
    static is(thing: any): thing is DiagnosticRelatedInformation {
        if (!thing) {
            return false;
        }
        return (
            typeof (<DiagnosticRelatedInformation>thing).message === 'string' &&
            (<DiagnosticRelatedInformation>thing).location &&
            Range.isRange((<DiagnosticRelatedInformation>thing).location.range) &&
            URI.isUri((<DiagnosticRelatedInformation>thing).location.uri)
        );
    }

    location: Location;
    message: string;

    constructor(location: Location, message: string) {
        this.location = location;
        this.message = message;
    }

    static isEqual(a: DiagnosticRelatedInformation, b: DiagnosticRelatedInformation): boolean {
        if (a === b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        return (
            a.message === b.message && a.location.range.isEqual(b.location.range) && a.location.uri.toString() === b.location.uri.toString()
        );
    }
}

export class Diagnostic {
    range: Range;
    message: string;
    severity: DiagnosticSeverity;
    source?: string;
    code?: string | number;
    relatedInformation?: DiagnosticRelatedInformation[];
    tags?: DiagnosticTag[];

    constructor(range: Range, message: string, severity: DiagnosticSeverity = DiagnosticSeverity.Error) {
        if (!Range.isRange(range)) {
            throw new TypeError('range must be set');
        }
        if (!message) {
            throw new TypeError('message must be set');
        }
        this.range = range;
        this.message = message;
        this.severity = severity;
    }

    toJSON(): any {
        return {
            severity: DiagnosticSeverity[this.severity],
            message: this.message,
            range: this.range,
            source: this.source,
            code: this.code,
        };
    }

    static isEqual(a: Diagnostic | undefined, b: Diagnostic | undefined): boolean {
        if (a === b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        return (
            a.message === b.message &&
            a.severity === b.severity &&
            a.code === b.code &&
            a.severity === b.severity &&
            a.source === b.source &&
            a.range.isEqual(b.range) &&
            equals(a.tags, b.tags) &&
            equals(a.relatedInformation, b.relatedInformation, DiagnosticRelatedInformation.isEqual)
        );
    }
}

export enum DocumentHighlightKind {
    Text = 0,
    Read = 1,
    Write = 2,
}

export class DocumentHighlight {
    range: Range;
    kind: DocumentHighlightKind;

    constructor(range: Range, kind: DocumentHighlightKind = DocumentHighlightKind.Text) {
        this.range = range;
        this.kind = kind;
    }

    toJSON(): any {
        return {
            range: this.range,
            kind: DocumentHighlightKind[this.kind],
        };
    }
}

export enum SymbolKind {
    File = 0,
    Module = 1,
    Namespace = 2,
    Package = 3,
    Class = 4,
    Method = 5,
    Property = 6,
    Field = 7,
    Constructor = 8,
    Enum = 9,
    Interface = 10,
    Function = 11,
    Variable = 12,
    Constant = 13,
    String = 14,
    Number = 15,
    Boolean = 16,
    Array = 17,
    Object = 18,
    Key = 19,
    Null = 20,
    EnumMember = 21,
    Struct = 22,
    Event = 23,
    Operator = 24,
    TypeParameter = 25,
}

export enum SymbolTag {
    Deprecated = 1,
}

export class SymbolInformation {
    static validate(candidate: SymbolInformation): void {
        if (!candidate.name) {
            throw new Error('name must not be falsy');
        }
    }

    name: string;
    location!: Location;
    kind: SymbolKind;
    tags?: SymbolTag[];
    containerName: string | undefined;

    constructor(name: string, kind: SymbolKind, containerName: string | undefined, location: Location);
    constructor(name: string, kind: SymbolKind, range: Range, uri?: URI, containerName?: string);
    constructor(
        name: string,
        kind: SymbolKind,
        rangeOrContainer: string | undefined | Range,
        locationOrUri?: Location | URI,
        containerName?: string
    ) {
        this.name = name;
        this.kind = kind;
        this.containerName = containerName;

        if (typeof rangeOrContainer === 'string') {
            this.containerName = rangeOrContainer;
        }

        if (locationOrUri instanceof Location) {
            this.location = locationOrUri;
        } else if (rangeOrContainer instanceof Range) {
            this.location = new Location(locationOrUri!, rangeOrContainer);
        }

        SymbolInformation.validate(this);
    }

    toJSON(): any {
        return {
            name: this.name,
            kind: SymbolKind[this.kind],
            location: this.location,
            containerName: this.containerName,
        };
    }
}

export class DocumentSymbol {
    static validate(candidate: DocumentSymbol): void {
        if (!candidate.name) {
            throw new Error('name must not be falsy');
        }
        if (!candidate.range.contains(candidate.selectionRange)) {
            throw new Error('selectionRange must be contained in fullRange');
        }
        if (candidate.children) {
            candidate.children.forEach(DocumentSymbol.validate);
        }
    }

    name: string;
    detail: string;
    kind: SymbolKind;
    tags?: SymbolTag[];
    range: Range;
    selectionRange: Range;
    children: DocumentSymbol[];

    constructor(name: string, detail: string, kind: SymbolKind, range: Range, selectionRange: Range) {
        this.name = name;
        this.detail = detail;
        this.kind = kind;
        this.range = range;
        this.selectionRange = selectionRange;
        this.children = [];

        DocumentSymbol.validate(this);
    }
}

export enum CodeActionTrigger {
    Automatic = 1,
    Manual = 2,
}

export class CodeActionKind {
    private static readonly sep = '.';

    public static Empty: CodeActionKind;
    public static QuickFix: CodeActionKind;
    public static Refactor: CodeActionKind;
    public static RefactorExtract: CodeActionKind;
    public static RefactorInline: CodeActionKind;
    public static RefactorRewrite: CodeActionKind;
    public static Source: CodeActionKind;
    public static SourceOrganizeImports: CodeActionKind;
    public static SourceFixAll: CodeActionKind;

    constructor(public readonly value: string) {}

    public append(parts: string): CodeActionKind {
        return new CodeActionKind(this.value ? this.value + CodeActionKind.sep + parts : parts);
    }

    public intersects(other: CodeActionKind): boolean {
        return this.contains(other) || other.contains(this);
    }

    public contains(other: CodeActionKind): boolean {
        return this.value === other.value || other.value.startsWith(this.value + CodeActionKind.sep);
    }
}
CodeActionKind.Empty = new CodeActionKind('');
CodeActionKind.QuickFix = CodeActionKind.Empty.append('quickfix');
CodeActionKind.Refactor = CodeActionKind.Empty.append('refactor');
CodeActionKind.RefactorExtract = CodeActionKind.Refactor.append('extract');
CodeActionKind.RefactorInline = CodeActionKind.Refactor.append('inline');
CodeActionKind.RefactorRewrite = CodeActionKind.Refactor.append('rewrite');
CodeActionKind.Source = CodeActionKind.Empty.append('source');
CodeActionKind.SourceOrganizeImports = CodeActionKind.Source.append('organizeImports');
CodeActionKind.SourceFixAll = CodeActionKind.Source.append('fixAll');

export class SelectionRange {
    range: Range;
    parent?: SelectionRange;

    constructor(range: Range, parent?: SelectionRange) {
        this.range = range;
        this.parent = parent;

        if (parent && !parent.range.contains(this.range)) {
            throw new Error('Invalid argument: parent must contain this range');
        }
    }
}

export class CallHierarchyItem {
    _sessionId?: string;
    _itemId?: string;

    kind: SymbolKind;
    name: string;
    detail?: string;
    uri: URI;
    range: Range;
    selectionRange: Range;

    constructor(kind: SymbolKind, name: string, detail: string, uri: URI, range: Range, selectionRange: Range) {
        this.kind = kind;
        this.name = name;
        this.detail = detail;
        this.uri = uri;
        this.range = range;
        this.selectionRange = selectionRange;
    }
}

export class CallHierarchyIncomingCall {
    from: vscode.CallHierarchyItem;
    fromRanges: vscode.Range[];

    constructor(item: vscode.CallHierarchyItem, fromRanges: vscode.Range[]) {
        this.fromRanges = fromRanges;
        this.from = item;
    }
}
export class CallHierarchyOutgoingCall {
    to: vscode.CallHierarchyItem;
    fromRanges: vscode.Range[];

    constructor(item: vscode.CallHierarchyItem, fromRanges: vscode.Range[]) {
        this.fromRanges = fromRanges;
        this.to = item;
    }
}

export class CodeLens {
    range: Range;

    command: vscode.Command | undefined;

    constructor(range: Range, command?: vscode.Command) {
        this.range = range;
        this.command = command;
    }

    get isResolved(): boolean {
        return !!this.command;
    }
}

export class CodeInset {
    range: Range;
    height?: number;

    constructor(range: Range, height?: number) {
        this.range = range;
        this.height = height;
    }
}

export enum SignatureHelpTriggerKind {
    Invoke = 1,
    TriggerCharacter = 2,
    ContentChange = 3,
}

export enum CompletionTriggerKind {
    Invoke = 0,
    TriggerCharacter = 1,
    TriggerForIncompleteCompletions = 2,
}

export interface CompletionContext {
    readonly triggerKind: CompletionTriggerKind;
    readonly triggerCharacter?: string;
}

export enum CompletionItemKind {
    Text = 0,
    Method = 1,
    Function = 2,
    Constructor = 3,
    Field = 4,
    Variable = 5,
    Class = 6,
    Interface = 7,
    Module = 8,
    Property = 9,
    Unit = 10,
    Value = 11,
    Enum = 12,
    Keyword = 13,
    Snippet = 14,
    Color = 15,
    File = 16,
    Reference = 17,
    Folder = 18,
    EnumMember = 19,
    Constant = 20,
    Struct = 21,
    Event = 22,
    Operator = 23,
    TypeParameter = 24,
    User = 25,
    Issue = 26,
}

export enum CompletionItemTag {
    Deprecated = 1,
}

export interface CompletionItemLabel {
    name: string;
    parameters?: string;
    qualifier?: string;
    type?: string;
}

export class CompletionItem /* implements vscode.CompletionItem */ {
    label: string | CompletionItemLabel;
    kind?: CompletionItemKind;
    tags?: CompletionItemTag[];
    detail?: string;
    documentation?: string | vscode.MarkdownString;
    sortText?: string;
    filterText?: string;
    preselect?: boolean;
    insertText?: string | SnippetString;
    keepWhitespace?: boolean;
    range?: Range | { inserting: Range; replacing: Range };
    commitCharacters?: string[];
    textEdit?: TextEdit;
    additionalTextEdits?: TextEdit[];
    command?: vscode.Command;

    constructor(label: string | CompletionItemLabel, kind?: CompletionItemKind) {
        this.label = label;
        this.kind = kind;
    }

    toJSON(): any {
        return {
            label: this.label,
            kind: this.kind && CompletionItemKind[this.kind],
            detail: this.detail,
            documentation: this.documentation,
            sortText: this.sortText,
            filterText: this.filterText,
            preselect: this.preselect,
            insertText: this.insertText,
            textEdit: this.textEdit,
        };
    }
}

export class CompletionList {
    isIncomplete?: boolean;
    items: vscode.CompletionItem[];

    constructor(items: vscode.CompletionItem[] = [], isIncomplete: boolean = false) {
        this.items = items;
        this.isIncomplete = isIncomplete;
    }
}

export enum ViewColumn {
    Active = -1,
    Beside = -2,
    One = 1,
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9,
}

export enum StatusBarAlignment {
    Left = 1,
    Right = 2,
}

export enum TextEditorLineNumbersStyle {
    Off = 0,
    On = 1,
    Relative = 2,
}

export enum TextDocumentSaveReason {
    Manual = 1,
    AfterDelay = 2,
    FocusOut = 3,
}

export enum TextEditorRevealType {
    Default = 0,
    InCenter = 1,
    InCenterIfOutsideViewport = 2,
    AtTop = 3,
}

export enum TextEditorSelectionChangeKind {
    Keyboard = 1,
    Mouse = 2,
    Command = 3,
}

/**
 * These values match very carefully the values of `TrackedRangeStickiness`
 */
export enum DecorationRangeBehavior {
    /**
     * TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges
     */
    OpenOpen = 0,
    /**
     * TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
     */
    ClosedClosed = 1,
    /**
     * TrackedRangeStickiness.GrowsOnlyWhenTypingBefore
     */
    OpenClosed = 2,
    /**
     * TrackedRangeStickiness.GrowsOnlyWhenTypingAfter
     */
    ClosedOpen = 3,
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace TextEditorSelectionChangeKind {
    export function fromValue(s: string | undefined) {
        switch (s) {
            case 'keyboard':
                return TextEditorSelectionChangeKind.Keyboard;
            case 'mouse':
                return TextEditorSelectionChangeKind.Mouse;
            case 'api':
                return TextEditorSelectionChangeKind.Command;
        }
        return undefined;
    }
}

export class DocumentLink {
    range: Range;

    target?: URI;

    tooltip?: string;

    constructor(range: Range, target: URI | undefined) {
        if (target && !URI.isUri(target)) {
            throw illegalArgument('target');
        }
        if (!Range.isRange(range) || range.isEmpty) {
            throw illegalArgument('range');
        }
        this.range = range;
        this.target = target;
    }
}

export class Color {
    readonly red: number;
    readonly green: number;
    readonly blue: number;
    readonly alpha: number;

    constructor(red: number, green: number, blue: number, alpha: number) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }
}

export type IColorFormat = string | { opaque: string; transparent: string };

export class ColorInformation {
    range: Range;

    color: Color;

    constructor(range: Range, color: Color) {
        if (color && !(color instanceof Color)) {
            throw illegalArgument('color');
        }
        if (!Range.isRange(range) || range.isEmpty) {
            throw illegalArgument('range');
        }
        this.range = range;
        this.color = color;
    }
}

export class ColorPresentation {
    label: string;
    textEdit?: TextEdit;
    additionalTextEdits?: TextEdit[];

    constructor(label: string) {
        if (!label || typeof label !== 'string') {
            throw illegalArgument('label');
        }
        this.label = label;
    }
}

export enum ColorFormat {
    RGB = 0,
    HEX = 1,
    HSL = 2,
}

export enum SourceControlInputBoxValidationType {
    Error = 0,
    Warning = 1,
    Information = 2,
}

export enum TaskRevealKind {
    Always = 1,

    Silent = 2,

    Never = 3,
}

export enum TaskPanelKind {
    Shared = 1,

    Dedicated = 2,

    New = 3,
}

export class TaskGroup implements vscode.TaskGroup {
    private _id: string;
    readonly isDefault: boolean = false;

    public static Clean: TaskGroup = new TaskGroup('clean', 'Clean');

    public static Build: TaskGroup = new TaskGroup('build', 'Build');

    public static Rebuild: TaskGroup = new TaskGroup('rebuild', 'Rebuild');

    public static Test: TaskGroup = new TaskGroup('test', 'Test');

    public static from(value: string) {
        switch (value) {
            case 'clean':
                return TaskGroup.Clean;
            case 'build':
                return TaskGroup.Build;
            case 'rebuild':
                return TaskGroup.Rebuild;
            case 'test':
                return TaskGroup.Test;
            default:
                return undefined;
        }
    }

    constructor(id: string, _label: string) {
        if (typeof id !== 'string') {
            throw illegalArgument('name');
        }
        if (typeof _label !== 'string') {
            throw illegalArgument('name');
        }
        this._id = id;
    }

    get id(): string {
        return this._id;
    }
}

export enum ShellQuoting {
    Escape = 1,
    Strong = 2,
    Weak = 3,
}

export enum TaskScope {
    Global = 1,
    Workspace = 2,
}

export enum ProgressLocation {
    SourceControl = 1,
    Window = 10,
    Notification = 15,
}

export class TreeItem {
    label?: string | vscode.TreeItemLabel;
    resourceUri?: URI;
    iconPath?: string | URI | { light: string | URI; dark: string | URI };
    command?: vscode.Command;
    contextValue?: string;
    tooltip?: string | vscode.MarkdownString;

    constructor(label: string | vscode.TreeItemLabel, collapsibleState?: vscode.TreeItemCollapsibleState);
    constructor(resourceUri: URI, collapsibleState?: vscode.TreeItemCollapsibleState);
    constructor(
        arg1: string | vscode.TreeItemLabel | URI,
        public collapsibleState: vscode.TreeItemCollapsibleState = TreeItemCollapsibleState.None
    ) {
        if (URI.isUri(arg1)) {
            this.resourceUri = arg1;
        } else {
            this.label = arg1;
        }
    }
}

export enum TreeItemCollapsibleState {
    None = 0,
    Collapsed = 1,
    Expanded = 2,
}

export class ThemeIcon {
    static File: ThemeIcon;
    static Folder: ThemeIcon;

    readonly id: string;
    readonly themeColor?: ThemeColor;

    constructor(id: string, color?: ThemeColor) {
        this.id = id;
        this.themeColor = color;
    }

    with(color: ThemeColor): ThemeIcon {
        return new ThemeIcon(this.id, color);
    }
}
ThemeIcon.File = new ThemeIcon('file');
ThemeIcon.Folder = new ThemeIcon('folder');

export class ThemeColor {
    id: string;
    constructor(id: string) {
        this.id = id;
    }
}

export enum ConfigurationTarget {
    Global = 1,

    Workspace = 2,

    WorkspaceFolder = 3,
}

export class DebugAdapterInlineImplementation implements vscode.DebugAdapterInlineImplementation {
    readonly implementation: vscode.DebugAdapter;

    constructor(impl: vscode.DebugAdapter) {
        this.implementation = impl;
    }
}

export class EvaluatableExpression implements vscode.EvaluatableExpression {
    readonly range: vscode.Range;
    readonly expression?: string;

    constructor(range: vscode.Range, expression?: string) {
        this.range = range;
        this.expression = expression;
    }
}

export enum LogLevel {
    Trace = 1,
    Debug = 2,
    Info = 3,
    Warning = 4,
    Error = 5,
    Critical = 6,
    Off = 7,
}

//#region file api

export enum FileChangeType {
    Changed = 1,
    Created = 2,
    Deleted = 3,
}

//#endregion

//#region folding api

export class FoldingRange {
    start: number;

    end: number;

    kind?: FoldingRangeKind;

    constructor(start: number, end: number, kind?: FoldingRangeKind) {
        this.start = start;
        this.end = end;
        this.kind = kind;
    }
}

export enum FoldingRangeKind {
    Comment = 1,
    Imports = 2,
    Region = 3,
}

//#endregion

//#region Comment
export enum CommentThreadCollapsibleState {
    /**
     * Determines an item is collapsed
     */
    Collapsed = 0,
    /**
     * Determines an item is expanded
     */
    Expanded = 1,
}

export enum CommentMode {
    Editing = 0,
    Preview = 1,
}

//#endregion

//#region Semantic Coloring

export class SemanticTokensLegend {
    public readonly tokenTypes: string[];
    public readonly tokenModifiers: string[];

    constructor(tokenTypes: string[], tokenModifiers: string[] = []) {
        this.tokenTypes = tokenTypes;
        this.tokenModifiers = tokenModifiers;
    }
}

export class SemanticTokens {
    readonly resultId?: string;
    readonly data: Uint32Array;

    constructor(data: Uint32Array, resultId?: string) {
        this.resultId = resultId;
        this.data = data;
    }
}

export class SemanticTokensEdit {
    readonly start: number;
    readonly deleteCount: number;
    readonly data?: Uint32Array;

    constructor(start: number, deleteCount: number, data?: Uint32Array) {
        this.start = start;
        this.deleteCount = deleteCount;
        this.data = data;
    }
}

export class SemanticTokensEdits {
    readonly resultId?: string;
    readonly edits: SemanticTokensEdit[];

    constructor(edits: SemanticTokensEdit[], resultId?: string) {
        this.resultId = resultId;
        this.edits = edits;
    }
}

//#endregion

//#region debug
export enum DebugConsoleMode {
    /**
     * Debug session should have a separate debug console.
     */
    Separate = 0,

    /**
     * Debug session should share debug console with its parent session.
     * This value has no effect for sessions which do not have a parent session.
     */
    MergeWithParent = 1,
}

export enum DebugConfigurationProviderTriggerKind {
    /**
     *	`DebugConfigurationProvider.provideDebugConfigurations` is called to provide the initial debug configurations for a newly created launch.json.
     */
    Initial = 1,
    /**
     * `DebugConfigurationProvider.provideDebugConfigurations` is called to provide dynamically generated debug configurations when the user asks for them through the UI (e.g. via the "Select and Start Debugging" command).
     */
    Dynamic = 2,
}

//#endregion

export enum ExtensionKind {
    UI = 1,
    Workspace = 2,
}

export class Decoration {
    static validate(d: Decoration): void {
        if (d.letter && d.letter.length !== 1) {
            throw new Error("The 'letter'-property must be undefined or a single character");
        }
        if (!d.bubble && !d.color && !d.letter && !d.priority && !d.title) {
            throw new Error('The decoration is empty');
        }
    }

    letter?: string;
    title?: string;
    color?: vscode.ThemeColor;
    priority?: number;
    bubble?: boolean;
}

//#region Theming

export class ColorTheme implements vscode.ColorTheme {
    constructor(public readonly kind: ColorThemeKind) {}
}

export enum ColorThemeKind {
    Light = 1,
    Dark = 2,
    HighContrast = 3,
}

//#endregion Theming

//#region Notebook

export enum CellKind {
    Markdown = 1,
    Code = 2,
}

export enum CellOutputKind {
    Text = 1,
    Error = 2,
    Rich = 3,
}

export enum NotebookCellRunState {
    Running = 1,
    Idle = 2,
    Success = 3,
    Error = 4,
}

export enum NotebookRunState {
    Running = 1,
    Idle = 2,
}

export enum NotebookCellStatusBarAlignment {
    Left = 1,
    Right = 2,
}

export enum NotebookEditorRevealType {
    Default = 0,
    InCenter = 1,
    InCenterIfOutsideViewport = 2,
}

//#endregion

//#region Timeline

//#endregion Timeline

//#region ExtensionContext

export enum ExtensionMode {
    /**
     * The extension is installed normally (for example, from the marketplace
     * or VSIX) in VS Code.
     */
    Production = 1,

    /**
     * The extension is running from an `--extensionDevelopmentPath` provided
     * when launching VS Code.
     */
    Development = 2,

    /**
     * The extension is running from an `--extensionDevelopmentPath` and
     * the extension host is running unit tests.
     */
    Test = 3,
}

export enum ExtensionRuntime {
    /**
     * The extension is running in a NodeJS extension host. Runtime access to NodeJS APIs is available.
     */
    Node = 1,
    /**
     * The extension is running in a Webworker extension host. Runtime access is limited to Webworker APIs.
     */
    Webworker = 2,
}

//#endregion ExtensionContext

export enum StandardTokenType {
    Other = 0,
    Comment = 1,
    String = 2,
    RegEx = 4,
}

function illegalArgument(msg?: string) {
    return new Error(msg);
}

function equals<T>(
    one: ReadonlyArray<T> | undefined,
    other: ReadonlyArray<T> | undefined,
    itemEquals: (a: T, b: T) => boolean = (a, b) => a === b
): boolean {
    if (one === other) {
        return true;
    }

    if (!one || !other) {
        return false;
    }

    if (one.length !== other.length) {
        return false;
    }

    for (let i = 0, len = one.length; i < len; i++) {
        if (!itemEquals(one[i], other[i])) {
            return false;
        }
    }

    return true;
}
