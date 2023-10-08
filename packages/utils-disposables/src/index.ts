export type {
    DisposableProposed as Disposable,
    DisposableClassic,
    DisposableHybrid,
    DisposableLike,
    DisposeFn,
    Logger,
} from './disposable.js';
export {
    createDisposable,
    createDisposableFromList,
    createDisposeMethodFromList,
    disposeOf,
    getDisposableTs,
    injectDisposable,
    makeDisposable,
    setLogger,
} from './disposable.js';
export { createDisposableList, DisposableList, InheritableDisposable } from './DisposableList.js';
