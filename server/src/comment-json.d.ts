declare module 'comment-json' {
    type Reviver = (k: number | string, v: any) => any;

    export interface CommentedObject {
        [index: string]: string[];  // the comments.
    }

    export function parse(json: string, reviver?: Reviver, removes_comments?: boolean): Object;
    export function stringify(value: any, replacer?: any, space?: string | number): string;
}

