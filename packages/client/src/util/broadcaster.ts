import { Disposable } from 'vscode';

type Listener<P> = (p: P) => void;

export class Broadcaster<P> {
    private listeners = new Set<Listener<P>>();

    public send(p: P): void {
        for (const fn of this.listeners) {
            fn(p);
        }
    }

    public listen(fn: Listener<P>): Disposable {
        this.listeners.add(fn);
        return new Disposable(() => this.listeners.delete(fn));
    }
}

export function createBroadcaster<P>(): Broadcaster<P> {
    return new Broadcaster<P>();
}
