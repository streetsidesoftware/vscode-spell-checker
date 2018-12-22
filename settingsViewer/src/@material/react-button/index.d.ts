declare module '@material/react-button' {
    export interface ButtonProps {
        raised?: boolean;
        unelevated?: boolean;
        outlined?: boolean;
        dense?: boolean;
        disabled?: boolean;
        unbounded?: boolean;
        // initRipple?: ,
        className?: string;
        icon?: JSX.Element;
        href?: string;
        children?: React.Key | React.Key[];
        onClick?: () => void;
    }

    export function Button(props: ButtonProps): JSX.Element;
    export default Button;
}
