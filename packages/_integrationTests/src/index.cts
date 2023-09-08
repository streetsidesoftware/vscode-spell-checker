export async function run(): Promise<void> {
    const { run } = await import('./runner.mjs');
    await run();
}
