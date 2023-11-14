export function tf(v?: boolean): string {
    return v === true
        ? 'true'
        : v === false
          ? 'false'
          : v
            ? 'true like'
            : v === undefined
              ? 'undefined'
              : v === null
                ? 'null'
                : 'false like';
}

export function uniqueFilter<T>(): (v: T) => boolean {
    const seen = new Set<T>();
    return (v: T) => !!(!seen.has(v) && seen.add(v));
}
