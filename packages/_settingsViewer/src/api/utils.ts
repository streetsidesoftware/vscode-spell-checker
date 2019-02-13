
export function tf(v?: boolean): string {
    return v === true ? 'true'
    : v === false ? 'false'
    : v ? 'true like'
    : v === undefined ? 'undefined'
    : v === null ? 'null'
    : 'false like';
}

