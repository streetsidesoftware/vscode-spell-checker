import type * as vscode from 'vscode';
import { Uri } from './uri';
import { SymbolKind, SymbolTag, Range } from './extHostTypes';

/**
 * Represents an item of a type hierarchy, like a class or an interface.
 */
export class TypeHierarchyItem implements vscode.TypeHierarchyItem {
    /**
     * The name of this item.
     */
    name: string;

    /**
     * The kind of this item.
     */
    kind: SymbolKind;

    /**
     * Tags for this item.
     */
    tags?: ReadonlyArray<SymbolTag>;

    /**
     * More detail for this item, e.g. the signature of a function.
     */
    detail?: string;

    /**
     * The resource identifier of this item.
     */
    uri: Uri;

    /**
     * The range enclosing this symbol not including leading/trailing whitespace
     * but everything else, e.g. comments and code.
     */
    range: Range;

    /**
     * The range that should be selected and revealed when this symbol is being
     * picked, e.g. the name of a class. Must be contained by the {@link TypeHierarchyItem.range range}-property.
     */
    selectionRange: Range;

    /**
     * Creates a new type hierarchy item.
     *
     * @param kind The kind of the item.
     * @param name The name of the item.
     * @param detail The details of the item.
     * @param uri The Uri of the item.
     * @param range The whole range of the item.
     * @param selectionRange The selection range of the item.
     */
    constructor(kind: SymbolKind, name: string, detail: string, uri: Uri, range: Range, selectionRange: Range) {
        this.kind = kind;
        this.name = name;
        this.detail = detail;
        this.uri = uri;
        this.range = range;
        this.selectionRange = selectionRange;
    }
}
