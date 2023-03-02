interface MeasureResult<T> {
    elapsedTimeMs: number;
    r: T;
}

export function measureExecution<T>(fn: () => T): MeasureResult<T> {
    const start = process.hrtime();
    const r = fn();
    const elapsedTimeMs = hrTimeToMs(process.hrtime(start));
    return {
        elapsedTimeMs,
        r,
    };
}

export async function measurePromiseExecution<T>(fn: () => Promise<T>): Promise<MeasureResult<T>> {
    const start = process.hrtime();
    const r = await fn();
    const elapsedTimeMs = hrTimeToMs(process.hrtime(start));
    return {
        elapsedTimeMs,
        r,
    };
}

export function elapsedTimeMsFrom(relativeTo: [number, number]): number {
    return hrTimeToMs(process.hrtime(relativeTo));
}

export function hrTimeToMs(hrTime: [number, number]): number {
    return hrTime[0] * 1.0e3 + hrTime[1] * 1.0e-6;
}

export async function measurePromise<T>(fn: () => Promise<T> | T): Promise<MeasureResult<T>> {
    const start = process.hrtime();
    const r = await fn();
    const elapsedTimeMs = hrTimeToMs(process.hrtime(start));
    return {
        elapsedTimeMs,
        r,
    };
}
