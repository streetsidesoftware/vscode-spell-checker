export async function createTerminal() {
    const { createTerminal } = await import('./repl.mjs');
    return createTerminal();
}

export async function registerTerminalProfileProvider() {
    const { registerTerminalProfileProvider } = await import('./repl.mjs');
    return registerTerminalProfileProvider();
}
