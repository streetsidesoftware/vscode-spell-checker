export function whenClause(template: TemplateStringsArray | string, ...values: unknown[]): string {
    const str = typeof template === 'string' ? template : String.raw(template, ...values);

    return str.replaceAll(/\s+/g, ' ').trim();
}
