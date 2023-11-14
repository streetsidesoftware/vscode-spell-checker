function getTypeOf(t: unknown) {
    return typeof t;
}
type TypeOfTypes = ReturnType<typeof getTypeOf>;

type AllowedTypes = Partial<Record<TypeOfTypes, true>>;

const allowStringOrUndefined: AllowedTypes = {
    string: true,
    undefined: true,
};

const allowNumberOrUndefined: AllowedTypes = {
    number: true,
    undefined: true,
};

interface ErrorCodeException {
    code: string;
}

export function isErrorCodeException(e: unknown): e is ErrorCodeException {
    if (!e || typeof e !== 'object') return false;
    return typeof (<ErrorCodeException>e).code === 'string';
}

export function isErrnoException(e: unknown): e is NodeJS.ErrnoException {
    if (!e || typeof e !== 'object') return false;
    const ex = <NodeJS.ErrnoException>e;
    return (
        typeof ex.name == 'string' &&
        typeof ex.message == 'string' &&
        (typeof ex.errno) in allowNumberOrUndefined &&
        (typeof ex.code) in allowStringOrUndefined &&
        (typeof ex.path) in allowStringOrUndefined &&
        (typeof ex.stack) in allowStringOrUndefined
    );
}
