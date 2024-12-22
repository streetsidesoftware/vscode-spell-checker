import type { SubscribableSubscriber } from '../Subscribables';
import { AbstractSubscribable } from './AbstractSubscribable';

export class EmitterImpl<T> extends AbstractSubscribable<T> implements SubscribableSubscriber<T> {
    public override notify(value: T) {
        super.notify(value);
    }

    public override done() {
        super.done();
    }
}
