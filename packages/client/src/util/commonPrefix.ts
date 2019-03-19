
export function commonPrefix(values: string[]): string {
    if (!values.length) return '';
    const result = values.reduce(pfx);
    return result;
}

function pfx(a: string, b: string): string {
    const s = Math.min(a.length, b.length);
    let i = 0;
    while (i < s && a[i] === b[i]) {
        i++;
    }
    return a.slice(0, i);
}