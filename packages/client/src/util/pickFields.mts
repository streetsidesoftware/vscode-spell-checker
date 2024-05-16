export function pickFields<T extends object, K extends keyof T>(obj: T | undefined, fields: K[]): Pick<T, K> | undefined {
    if (!obj) return undefined;
    return Object.fromEntries(fields.filter((k) => k in obj).map((f) => [f, obj[f]])) as Pick<T, K>;
}
