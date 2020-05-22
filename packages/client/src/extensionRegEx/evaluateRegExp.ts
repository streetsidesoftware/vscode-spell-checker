
export interface NamedRegExpOrString {
    name: string;
    regExp: RegExpOrString;
}

export interface NamedRegExp {
    name: string;
    regExp: RegExp;
}

export interface Range {
    startIndex: number;
    endIndex: number;
}

export interface EvalRegExpResult {
    ranges: Range[];
    elapsedTimeMs: number;
}

export interface NamedRegExpEntryResult extends EvalRegExpResult {
    name: string;
}

export interface EvaluateNamedRegularExpressionsResult {
    elapsedTimeMs: number;
    entries: NamedRegExpEntryResult[];
}

export function evaluateRegExp(regExp: RegExp, text: string): Range[] {
    const re = new RegExp(regExp);

    const results: Range[] = [];
    let lastPos = -1;
    let match;
    while (match = re.exec(text)) {
        if (match.index === lastPos) {
            if (!re.global) { break; }
            re.lastIndex = re.lastIndex + 1;
            continue;
        }
        lastPos = match.index;
        results.push({
            startIndex: match.index,
            endIndex: match.index + match[0].length,
        });
    }

    return results;
}

export interface EvaluateRegExpAsyncResult {
    completed: boolean;
    matches: RegExpExecArray[];
    processingTimeMs: number;
}

export interface EvaluateRegExpAsyncRequest  {
    regExp: RegExp;
    text: string;
    limit?: number;
    yieldLimitMs?: number;
    processingTimeLimitMs?: number;
};

export async function *evaluateRegExpAsync({ regExp, text, limit = 10000, yieldLimitMs = 1, processingTimeLimitMs = 100, }: EvaluateRegExpAsyncRequest) {

    const result: EvaluateRegExpAsyncResult = {
        completed: false,
        matches: [],
        processingTimeMs: 0,
    }

    function *execute() {
        const re = new RegExp(regExp);
        const r = result;
        const matches = r.matches;
        let lastPos = -1;
        let match;
        let time = process.hrtime();
        let retry = true;
        let elapsedTime = 0;
        while (matches.length < limit && r.processingTimeMs < processingTimeLimitMs && (match = re.exec(text))) {
            if (match.index === lastPos) {
                if (!re.global || !retry) { break; }
                re.lastIndex = re.lastIndex + 1;
                retry = false;
                continue;
            }
            retry = true;
            lastPos = match.index;
            matches.push(match);
            const deltaT = hrTimeToMs(process.hrtime(time));
            r.processingTimeMs += deltaT;
            elapsedTime += deltaT;
            if (elapsedTime > yieldLimitMs) {
                yield r;
                elapsedTime = 0;
            }
            time = process.hrtime();
        }
        r.processingTimeMs += hrTimeToMs(process.hrtime(time));
        r.completed = true;
        yield r;
    }

    for (const r of execute()) {
        yield Promise.resolve(r);
    }
    return;
}

function hrTimeToMs(hrTime: [number, number]): number {
    return hrTime[0] * 1.0e-3 + hrTime[1] * 1.0e-6
}

export function evaluateNamedRegularExpressions(text: string, namedRegExpArray: NamedRegExpOrString[]): EvaluateNamedRegularExpressionsResult {
    const { elapsedTimeMs, r: entries } = measureExecution(() => {
        const names = namedRegExpArray.map(convertNamedRegExpOrString);
        return names.map(n => evaluateNamedExpression(n, text));
    });

    return {
        elapsedTimeMs,
        entries,
    }
}

export function evaluateNamedExpression(named: NamedRegExp, text: string): NamedRegExpEntryResult {
    const r = evaluateExpression(named.regExp, text);
    return {
        name: named.name,
        ...r,
    }
}

export function evaluateExpression(regExp: RegExpOrString, text: string): EvalRegExpResult {
    const { elapsedTimeMs, r: ranges } = measureExecution(() => evaluateRegExp(toRegExp(regExp), text));
    return {
        ranges,
        elapsedTimeMs,
    }
}

export function convertNamedRegExpOrString(nr: NamedRegExpOrString | NamedRegExp): NamedRegExp {
    return {
        name: nr.name,
        regExp: toRegExp(nr.regExp),
    }
}

export type RegExpOrString = RegExp | string;

export function toRegExp(r: RegExp | string): RegExp {
    if (isRegExp(r)) return r;

    const match = r.match(/^\/(.*)\/([gimsuy]*)$/);
    if (match) {
        return new RegExp(match[1], match[2] || undefined);
    }
    return new RegExp(r);
}

export function isRegExp(r: RegExp | any): r is RegExp {
    return r instanceof RegExp;
}

function measureExecution<T>(fn: () => T): { elapsedTimeMs: number; r: T } {
    const start = process.hrtime();
    const r = fn();
    const elapsedTimeMs = hrTimeToMs(process.hrtime(start));
    return {
        elapsedTimeMs,
        r
    }
}
