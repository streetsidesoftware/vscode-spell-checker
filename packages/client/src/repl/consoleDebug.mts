const debugMode = false;
export const consoleDebug: typeof console.error = debugMode ? console.debug : () => undefined;
