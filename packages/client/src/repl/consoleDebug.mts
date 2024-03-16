const debugMode = true;
export const consoleDebug: typeof console.error = debugMode ? console.debug : () => undefined;
