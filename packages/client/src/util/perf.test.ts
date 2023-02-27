import { EVENT_TIMELINE_START, PerformanceTimeline } from './perf';

describe('Validate perf', () => {
    test('PerformanceTimeline', () => {
        const perf = new PerformanceTimeline();

        perf.mark('start');
        expect(perf.getLatestEntryByName('start')).toBeDefined();
        perf.mark('stop');
        perf.measure('total', 'start', 'stop');
        expect(perf.getEntries().map((t) => t.name)).toEqual([EVENT_TIMELINE_START, 'start', 'stop', 'total']);
        expect(perf.getLatestEntryByName('start')?.duration).toBe(0);
        expect(perf.getLatestEntryByName('total')?.duration).toBeGreaterThan(0);
        expect(perf.getEntriesByName('start')).toHaveLength(1);
        perf.mark('start');
        expect(perf.getEntriesByName('start')).toHaveLength(2);
        perf.mark('stop');
        perf.measure('backwards', 'stop', 'start');
        expect(perf.getLatestEntryByName('backwards')?.duration).toBeLessThan(0);
    });
});
