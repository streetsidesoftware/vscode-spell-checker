export async function createTerminal() {
    const { createTerminal } = await import('./repl.mjs');
    return createTerminal();
}
