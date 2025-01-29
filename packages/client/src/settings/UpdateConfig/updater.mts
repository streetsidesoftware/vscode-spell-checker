export interface Child<P extends CommentedCollectionNode> {
    parent?: P | undefined;
}

export interface NodeComments {
    comment?: Comment;
    commentBefore?: Comment;
}

export interface CommentedBaseNode extends NodeComments {
    parent?: CommentedCollectionNode;
}

export interface CommentedScalar<T> extends CommentedBaseNode {
    readonly value: T;
    set(value: T): void;
}

export type ScalarNumber = CommentedScalar<number>;
export type ScalarString = CommentedScalar<string>;
export type ScalarBoolean = CommentedScalar<boolean>;
export type ScalarUndefined = CommentedScalar<undefined>;
export type ScalarNull = CommentedScalar<null>;

export interface Comment {
    comment: string;
    block?: boolean;
}

export type CommentedNode<T> = T extends number | string | boolean | null | undefined
    ? CommentedScalar<T>
    : T extends unknown[]
      ? CommentedArrayNode<T>
      : T extends object
        ? CommentedRecordNode<T>
        : never;

export interface CommentedCollectionNode extends CommentedBaseNode {
    /**
     * Check if a node exists in the collection.
     * @param n - node to check for.
     * @returns true if the node is in the collection.
     */
    has(n: CommentedBaseNode): boolean;
    /**
     * Remove a node from the collection.
     * @param n - node to remove
     * @returns true if the node was removed
     */
    remove(n: CommentedBaseNode): boolean;
    /**
     * The number of items in the collection.
     */
    readonly size: number;
}

export interface CommentedArrayNode<T extends unknown[]> extends CommentedCollectionNode, Iterable<CommentedNode<T[number]>> {
    readonly value: T;
    readonly items: CommentedNode<T[number]>[];
    get(index: number): (CommentedNode<T[number]> & Child<CommentedArrayNode<T>>) | undefined;
    set(index: number, value: T[number] | CommentedNode<T[number]>): void;
    add(value: T[number] | CommentedNode<T[number]>): void;
}

export interface CommentedRecordNode<T extends object> extends CommentedCollectionNode, Iterable<[keyof T, CommentedNode<T[keyof T]>]> {
    readonly value: T;
    readonly items: [keyof T, CommentedNode<T[keyof T]>][];
    get<K extends keyof T>(key: K): (CommentedNode<T[K]> & Child<CommentedRecordNode<T>>) | undefined;
    set<K extends keyof T>(key: keyof K, value: T[K] | CommentedNode<T[K]>): void;
}

export function createCommentedScalar(value: number, comments?: NodeComments): CommentedScalar<number>;
export function createCommentedScalar(value: string, comments?: NodeComments): CommentedScalar<string>;
export function createCommentedScalar(value: boolean, comments?: NodeComments): CommentedScalar<boolean>;
export function createCommentedScalar(value: null, comments?: NodeComments): CommentedScalar<null>;
export function createCommentedScalar(value: undefined, comments?: NodeComments): CommentedScalar<undefined>;
export function createCommentedScalar<T>(value: T, comments?: NodeComments): CommentedScalar<T>;
export function createCommentedScalar<T>(value: T, comments?: NodeComments): CommentedScalar<T> {
    return new ScalarNode(value, comments);
}

export function isCommentedBaseNode(node: unknown): node is CommentedBaseNode {
    return node instanceof BaseNode;
}

export function isCommentedScalar(node: unknown): node is CommentedScalar<unknown> {
    return node instanceof ScalarNode;
}

class BaseNode {
    parent?: CommentedCollectionNode;
    comment?: Comment;
    commentBefore?: Comment;

    constructor(comments?: NodeComments) {
        this.comment = comments?.comment;
        this.commentBefore = comments?.commentBefore;
    }
}

class ScalarNode<T> extends BaseNode implements CommentedScalar<T> {
    constructor(
        public value: T,
        comments?: NodeComments,
    ) {
        super(comments);
    }

    set(value: T): void {
        this.value = value;
    }
}

abstract class CollectionNode extends BaseNode implements CommentedCollectionNode {
    abstract has(n: CommentedBaseNode): boolean;
    abstract remove(n: CommentedBaseNode): boolean;
    abstract get size(): number;
}

class ArrayNode<T extends unknown[]> extends CollectionNode implements CommentedArrayNode<T> {
    readonly items: CommentedNode<T[number]>[];

    constructor(items: CommentedNode<T[number]>[], comments?: NodeComments) {
        super(comments);
        this.items = items;
        this.items.forEach((item) => (item.parent?.remove(item), (item.parent = this)));
    }

    get value(): T {
        return this.items.map((item) => item.value) as T;
    }

    get size(): number {
        return this.items.length;
    }

    has(n: CommentedBaseNode): boolean {
        return this.items.includes(n as CommentedNode<T[number]>);
    }

    remove(n: CommentedBaseNode): boolean {
        const index = this.items.indexOf(n as CommentedNode<T[number]>);
        if (index >= 0) {
            this.items.splice(index, 1);
            return true;
        }
        return false;
    }

    get(index: number): (CommentedNode<T[number]> & Child<CommentedArrayNode<T>>) | undefined {
        return this.items[index] as CommentedNode<T[number]> & Child<CommentedArrayNode<T>>;
    }

    set(index: number, value: T[number] | CommentedNode<T[number]>): void {
        this.items[index] = isCommentedBaseNode(value) ? value : createCommentedNode(value);
    }

    add(value: T[number] | CommentedNode<T[number]>): void {
        this.items.push(isCommentedBaseNode(value) ? value : createCommentedNode(value));
    }

    [Symbol.iterator](): IterableIterator<CommentedNode<T[number]>> {
        return this.items[Symbol.iterator]();
    }
}

class RecordNode<T extends object> extends CollectionNode implements CommentedRecordNode<T> {
    $map: Map<keyof T, CommentedNode<T[keyof T]>>;

    constructor(items: [keyof T, CommentedNode<T[keyof T]>][], comments?: NodeComments) {
        super(comments);
        items.forEach(([_, item]) => (item.parent?.remove(item), (item.parent = this)));
        this.$map = new Map(items);
    }

    get value(): T {
        return Object.fromEntries(this.items.map(([key, n]) => [key, n.value])) as T;
    }

    get items() {
        return [...this.$map.entries()];
    }

    get size(): number {
        return this.items.length;
    }

    has(n: CommentedBaseNode): boolean {
        return this.items.some(([, item]) => item === n);
    }

    remove(n: CommentedBaseNode): boolean {
        const index = this.items.findIndex(([, item]) => item === n);
        if (index >= 0) {
            this.items.splice(index, 1);
            return true;
        }
        return false;
    }

    get<K extends keyof T>(key: K): (CommentedNode<T[K]> & Child<CommentedRecordNode<T>>) | undefined {
        return this.items.find(([k]) => k === key)?.[1] as CommentedNode<T[K]> & Child<CommentedRecordNode<T>>;
    }

    set<K extends keyof T>(key: keyof K, value: T[K] | CommentedNode<T[K]>): void {
        const index = this.items.findIndex(([k]) => k === key);
        if (index >= 0) {
            this.items[index][1] = isCommentedBaseNode(value) ? value : createCommentedNode(value);
        } else {
            this.items.push([key, isCommentedBaseNode(value) ? value : createCommentedNode(value)]);
        }
    }

    [Symbol.iterator](): IterableIterator<[keyof T, CommentedNode<T[keyof T]>]> {
        return this.items[Symbol.iterator]();
    }
}

export function createCommentedArrayNode<T extends unknown[]>(
    items: CommentedNode<T[number]>[],
    comments?: NodeComments,
): CommentedArrayNode<T> {
    return new ArrayNode(items, comments);
}

export function createCommentedNode<T>(value: T, comments?: NodeComments): CommentedNode<T> {
    switch (typeof value) {
        case 'number':
        case 'string':
        case 'boolean':
        case 'undefined':
            return createCommentedScalar(value, comments) as CommentedNode<T>;
        case 'object':
            if (!value) return createCommentedScalar(value, comments) as CommentedNode<T>;
            return Array.isArray(value)
                ? createCommentedArrayNode(
                      value.map((item) => createCommentedNode(item)),
                      comments,
                  )
                : new RecordNode(value, comments);
        default:
            throw new Error(`Unsupported value type: ${typeof value}`);
    }
}
