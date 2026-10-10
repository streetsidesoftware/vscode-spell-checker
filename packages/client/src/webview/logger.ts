let debugMode = false

// oxlint-disable-next-line typescript/no-explicit-any
export function log(...params: any[]): void {
  if (!debugMode) return
  console.log(...params)
}

export function setDebugMode(mode: boolean): void {
  debugMode = mode
}
