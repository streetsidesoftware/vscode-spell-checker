export function toRegExp(r: RegExp | string, defaultFlags?: string): RegExp {
    if (isRegExp(r)) return r;

    const match = /^\/(.*)\/([gimsuy]*)$/.exec(r);
    if (match) {
        return new RegExp(match[1], match[2] || undefined);
    }
    return new RegExp(r, defaultFlags);
}

export function isRegExp(r: RegExp | unknown): r is RegExp {
    return r instanceof RegExp;
}
