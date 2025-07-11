let debugMode = false;

 
export function log(...params: unknown[]): void {
    if (!debugMode) return;
    console.log(...params);
}

export function setDebugMode(mode: boolean) {
    debugMode = mode;
}
