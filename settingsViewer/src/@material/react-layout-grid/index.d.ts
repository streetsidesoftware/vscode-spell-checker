declare module '@material/react-layout-grid' {
    import { ReactNodeLike, NumericRange12, NumericRange4, NumericRange8 } from "@material/types";

    export interface GridProps {
        align?: 'left' | 'right';
        children: ReactNodeLike;
        className?: string;
        fixedColumnWidth?: boolean;
        tag?: string;
    }

    export function Grid(props: GridProps): JSX.Element;

    export interface RowProps {
        children: ReactNodeLike;
        className?: string;
        tag?: string;
    }

    export function Row(props: RowProps): JSX.Element;

    export type ColumnCount = NumericRange12
    export type PhoneColumnCount = NumericRange4
    export type TabletColumnCount = NumericRange8
    export type ColumnOrder = NumericRange12

    export interface CellProps {
        align?: 'bottom' | 'middle' | 'top';
        children?: ReactNodeLike;
        className?: string;
        columns?: ColumnCount;
        desktopColumns?: ColumnCount;
        phoneColumns?: PhoneColumnCount;
        tabletColumns?: TabletColumnCount;
        order?: ColumnOrder;
        tag?: string;
    }

    export function Cell(props: CellProps): JSX.Element;
}
