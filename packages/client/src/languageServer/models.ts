import type { Range } from 'vscode';

import type { Position as LcPosition, Range as LcRange } from '../vscode-languageclient/node.cjs';

export type RangeLike = Range | LcRange | [LcPosition, LcPosition];
