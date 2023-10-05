import type { SubscribableSubscriber } from '../Subscribables';
import { AbstractSubscribable } from './AbstractSubscribable';

export class EmitterImpl<T> extends AbstractSubscribable<T> implements SubscribableSubscriber<T> {
    constructor() {
        super();
    }

    public notify(value: T) {
        super.notify(value);
    }

    public done() {
        super.done();
    }
}
