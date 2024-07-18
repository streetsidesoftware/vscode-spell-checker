import type { Uri } from 'vscode';
import * as vscode from 'vscode';

const urlLike = /^.*:/;
export function relative(uri: Uri | string): string {
    const rel = vscode.workspace.asRelativePath(uri, false);
    if (urlLike.test(rel)) return rel;

    return rel.split('\\').join('/');
}

export function formatPath(uri: Uri | string, width: number): string {
    let rel = typeof uri === 'string' ? uri : uri.path;
    if (rel.length > width) {
        const parts = rel.split('/');
        let i = 0;
        let j = parts.length;

        let leftSide = '';
        let rightSide = '';
        const middle = '…';
        rel = middle;
        let len = rel.length;

        while (i < j) {
            const left = parts[i];
            const right = parts[j - 1];
            if (leftSide.length + left.length <= rightSide.length + right.length) {
                if (len + left.length + 1 > width) break;
                len += left.length + 1;
                leftSide += left + '/';
                i++;
            } else {
                if (len + right.length + 1 > width) break;
                len += right.length + 1;
                rightSide = '/' + right + rightSide;
                j--;
            }
            // console.log('%o', {
            //     leftSide,
            //     rightSide,
            //     middle,
            //     rel: leftSide + middle + rightSide,
            //     len,
            //     len2: (leftSide + middle + rightSide).length,
            // });
        }
        rel = leftSide + middle + rightSide;
        if (rel === middle) {
            rightSide = parts[parts.length - 1];
            rel = middle + rightSide.slice(-width + 1);
        }
    }
    return rel;
}
