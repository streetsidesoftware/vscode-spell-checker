import styles from 'ansi-styles';

export function green(text: string): string {
    return styles.green.open + text + styles.green.close;
}

export function red(text: string): string {
    return styles.red.open + text + styles.red.close;
}

export function yellow(text: string): string {
    return styles.yellow.open + text + styles.yellow.close;
}

export function crlf(text: string): string {
    return text.replace(/\n/g, '\r\n').replace(/\r+\r/g, '\r');
}

export function dim(text: string): string {
    return styles.dim.open + text + styles.dim.close;
}
