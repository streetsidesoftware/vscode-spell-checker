export function splitIntoLines(text: string, width: number): string[] {
    const lines: string[] = [];

    const words = splitLinesKeepNewLine(text.replace(/\t/g, '    ')).flatMap((line) => line.split(/ /));

    let w = 0;
    let line = '';
    let space = '';
    for (const word of words) {
        if (word === '\n' || word === '\r') {
            lines.push(line);
            line = '';
            space = '';
            w = 0;
            continue;
        }
        if (line && w + space.length + word.length > width) {
            lines.push(line);
            line = '';
            space = '';
            w = 0;
        }
        line += space + word;
        w += space.length + word.length;
        space = ' ';
    }

    lines.push(line);

    return lines.map((line) => line.trimEnd());
}

export function removeLeftPad(s: string) {
    const lines = s.split('\n');
    const indents = lines
        .map((line) => line.replace(/^\s+$/, ''))
        .map((line) => line.replace(/^(\s*).*/, '$1').length)
        .filter((n) => n > 0);
    const minIndent = Math.min(...indents);
    return lines.map((line) => line.slice(minIndent)).join('\n');
}

function splitLinesKeepNewLine(text: string): string[] {
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = text.split('\n');
    return lines.flatMap((line) => [line, '\n']).slice(0, -1);
}
