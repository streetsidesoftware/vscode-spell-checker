import type { SubscribableSubscriber } from '../Subscribables.js';
import { AbstractSubscribable } from './AbstractSubscribable.js';

export class EmitterImpl<T> extends AbstractSubscribable<T> implements SubscribableSubscriber<T> {
    public override notify(value: T) {
        super.notify(value);
    }

    public override done() {
        super.done();
    }
}
