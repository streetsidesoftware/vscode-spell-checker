export type HTime = [number, number];

export interface TimeLineEvent {
    name: string;
    startTime: HTime;
    duration: number;
}

export const EVENT_MODULE_LOAD = 'module_load';
export const EVENT_TIMELINE_START = 'timeline_start';

const moduleStartTime: HTime = process.hrtime();

export class PerformanceTimeline {
    private timeLine: TimeLineEvent[] = [];
    private timeLineEvents = new Map<string, TimeLineEvent>();
    private startEvent: TimeLineEvent;

    constructor() {
        this.startEvent = this.createEvent(EVENT_TIMELINE_START);
        this.addEvent(this.startEvent);
    }

    public mark(name: string): void {
        const event = this.createEvent(name);
        this.addEvent(event);
    }

    public measure(name: string, nameStart: string, nameEnd: string): void {
        const eventStart = this.timeLineEvents.get(nameStart) || this.startEvent;
        const eventEnd = this.timeLineEvents.get(nameEnd) || this.startEvent;
        const duration = calcDuration(eventStart.startTime, eventEnd.startTime);
        const event = { name, startTime: process.hrtime(moduleStartTime), duration };
        this.addEvent(event);
    }

    private addEvent(event: TimeLineEvent) {
        this.timeLine.push(event);
        this.timeLineEvents.set(event.name, event);
    }

    public getEntries(): TimeLineEvent[] {
        return this.timeLine;
    }

    public getLatestEntryByName(name: string): TimeLineEvent | undefined {
        return this.timeLineEvents.get(name);
    }

    public getEntriesByName(name: string): TimeLineEvent[] {
        return this.timeLine.filter((e) => e.name === name);
    }

    private createEvent(name: string): TimeLineEvent {
        return { name, startTime: process.hrtime(moduleStartTime), duration: 0 };
    }
}

export function calcDuration(a: HTime, b: HTime): number {
    return toMilliseconds(b) - toMilliseconds(a);
}

export function toMilliseconds(t: HTime): number {
    return (t[0] + t[1] * 1e-9) * 1000;
}

export const performance = new PerformanceTimeline();
