export function breakTextAtLimit(text: string, limit: number): string {
    if (!text[limit]) return text;

    const regIsNotChar = /[^\p{L}._0-9-]/uy;

    regIsNotChar.lastIndex = limit;
    if (regIsNotChar.test(text)) return text.slice(0, limit);

    let idx = limit - 1;
    for (; idx > 0; --idx) {
        if ((text.charCodeAt(idx) & 0xfc00) === 0xdc00) continue;
        regIsNotChar.lastIndex = idx;
        if (regIsNotChar.test(text)) return text.slice(0, idx + 1);
    }
    return '';
}
