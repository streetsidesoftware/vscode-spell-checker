import * as GS from 'gensequence';
import * as Text from './text';

export interface MatchRange {
    startPos: number;
    endPos: number;
}

export interface MatchRangeWithText extends MatchRange {
    text: string;
}

export function findMatchingRanges(pattern: string | RegExp, text: string) {
    if (pattern === '.*') {
        return [{ startPos: 0, endPos: text.length }];
    }
    const ranges: MatchRangeWithText[] = [];

    try {
        const regex = pattern instanceof RegExp ? new RegExp(pattern) : Text.stringToRegExp(pattern, 'gim', 'g');
        if (regex) {
            for (const found of GS.sequenceFromRegExpMatch(regex, text)) {
                ranges.push({ startPos: found.index, endPos: found.index + found[0].length, text: found[0] });
                if (!regex.global) {
                    break;
                }
            }
        }
    } catch (e) {
        // ignore any malformed regexp from the user.
        // console.log(e.message);
    }

    return ranges;
}

function fnSortRanges(a: MatchRange, b: MatchRange) {
    return (a.startPos - b.startPos) || (a.endPos - b.endPos);
}

export function unionRanges(ranges: MatchRange[]) {
    const sortedRanges = ranges.sort(fnSortRanges);
    const result = sortedRanges.slice(1).reduce((acc: MatchRange[], next) => {
        const last = acc[acc.length - 1];
        if (next.startPos > last.endPos) {
            acc.push(next);
        } else if (next.endPos > last.endPos) {
            acc[acc.length - 1] = {
                startPos: last.startPos,
                endPos: Math.max(last.endPos, next.endPos),
            };
        }
        return acc;
    }, sortedRanges.slice(0, 1));

    return result;
}

export function findMatchingRangesForPatterns(patterns: (string | RegExp)[], text: string) {
    const matchedPatterns = GS.genSequence(patterns)
        .concatMap((pattern) => findMatchingRanges(pattern, text));
    return unionRanges(matchedPatterns.toArray());
}

/**
 * Exclude range b from a
 */
function excludeRange(a: MatchRange, b: MatchRange) {
    // non-intersection
    if (b.endPos <= a.startPos || b.startPos >= a.endPos) {
        return [a];
    }

    // fully excluded
    if (b.startPos <= a.startPos && b.endPos >= a.endPos) {
        return [];
    }

    const result: MatchRange[] = [];

    if (a.startPos < b.startPos) {
        result.push({startPos: a.startPos, endPos: b.startPos });
    }

    if (a.endPos > b.endPos) {
        result.push({ startPos: b.endPos, endPos: a.endPos });
    }
    return result;
}


/**
 * Create a new set of positions that have the excluded position ranges removed.
 */
export function excludeRanges(includeRanges: MatchRange[], excludeRanges: MatchRange[]): MatchRange[] {
    interface MatchRangeWithType extends MatchRange {
        type: 'i' | 'e';
    }
    interface Result {
        ranges: MatchRange[];
        lastExclude?: MatchRange;
    }
    const tInclude: 'i' = 'i';
    const tExclude: 'e' = 'e';

    const sortedRanges: MatchRangeWithType[] = [
        ...includeRanges.map(r => ({...r, type: tInclude })),
        ...excludeRanges.map(r => ({...r, type: tExclude }))].sort(fnSortRanges);

    const result = sortedRanges.reduce((acc: Result, range: MatchRangeWithType) => {
        const { ranges, lastExclude } = acc;
        const lastInclude = ranges.length ? ranges[ranges.length - 1] : undefined;
        if (range.type === tExclude) {
            if (!lastInclude || lastInclude.endPos <= range.startPos) {
                // if the exclude is beyond the current include, save it for later
                return { ranges, lastExclude: range };
            }
            // we need to split the current include.
            return { ranges: [...ranges.slice(0, -1), ...excludeRange(ranges[ranges.length - 1], range)], lastExclude: range };
        }

        // The range is an include, we need to check it against the last exclude
        if (! lastExclude) {
            return { ranges: ranges.concat([range]) };
        }
        const nextExclude = lastExclude.endPos > range.endPos ? lastExclude : undefined;
        return { ranges: [...ranges, ...excludeRange(range, lastExclude)], lastExclude: nextExclude };
    }, { ranges: [] });

    return result.ranges;
}
