/// <reference path="../node_modules/rx/ts/rx.all.d.ts" />

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

/**
 * The Thenable (E.g. PromiseLike) and Promise declarations are taken from TypeScript's
 * lib.core.es6.d.ts file. See above Copyright notice.
 */

/**
 * Thenable is a common denominator between ES6 promises, Q, jQuery.Deferred, WinJS.Promise,
 * and others. This API makes no assumption about what promise library is being used which
 * enables reusing existing code without migrating to a specific promise implementation. Still,
 * we recommend the use of native promises which are available in VS Code.
 */
interface Thenable<R> {
    /**
    * Attaches callbacks for the resolution and/or rejection of the Promise.
    * @param onFulfilled The callback to execute when the Promise is resolved.
    * @param onRejected The callback to execute when the Promise is rejected.
    * @returns A Promise for the completion of which ever callback is executed.
    */
    then<TResult>(onFulfilled?: (value: R) => TResult | Thenable<TResult>, onRejected?: (reason: any) => TResult | Thenable<TResult>): Thenable<TResult>;
    then<TResult>(onFulfilled?: (value: R) => TResult | Thenable<TResult>, onRejected?: (reason: any) => void): Thenable<TResult>;
}


declare module Rx {
    export interface ObservableStatic {
        /**
         * This method creates a new Observable sequence from an array-like or iterable object.
         * @param {Any} arrayLike An array-like or iterable object to convert to an Observable sequence.
         * @param {Function} [mapFn] Map function to call on every element of the array.
         * @param {Any} [thisArg] The context to use calling the mapFn if provided.
         * @param {Scheduler} [scheduler] Optional scheduler to use for scheduling.  If not provided, defaults to Scheduler.currentThread.
         */
        from<T>(iterator: Iterable<T>): Rx.Observable<T>;
        from<T>(iterator: IterableIterator<T>): Rx.Observable<T>;
    }
}
