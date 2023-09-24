let debugMode = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function log(...params: any[]): void {
    if (!debugMode) return;
    console.log(...params);
}

export function setDebugMode(mode: boolean) {
    debugMode = mode;
}
