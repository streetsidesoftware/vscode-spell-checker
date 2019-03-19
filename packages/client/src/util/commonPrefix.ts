
export function commonPrefix(values: string[]): string {
    if (!values.length) return '';
    const min = values.reduce((min, curr) => (min <= curr ? min : curr));
    const max = values.reduce((max, curr) => (max >= curr ? max : curr));
    return pfx(min, max);
}

function pfx(a: string, b: string): string {
    const s = Math.min(a.length, b.length);
    let i = 0;
    while (i < s && a[i] === b[i]) {
        i++;
    }
    return a.slice(0, i);
}