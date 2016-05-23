
import * as Rx from 'rx';

export function observableToArray<T>(obs: Rx.Observable<T>): T[] {
    let a: T[];
    obs.toArray()
        .subscribe(items => a = items);
    return a;
}


