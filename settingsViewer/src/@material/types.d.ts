
declare module '@material/types' {

    export type ReactElementLike =
        | JSX.Element
        | JSX.ElementClass;

    export interface ReactNodeArray extends Array<ReactNodeLike> { }

    export type ReactNodeLike =
        | {}
        | ReactElementLike
        | ReactNodeArray
        | JSX.IntrinsicElements;

    export type NumericRange12 = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    export type NumericRange8 = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    export type NumericRange4 = 1 | 2 | 3 | 4;

}

