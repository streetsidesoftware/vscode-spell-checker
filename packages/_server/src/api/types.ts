/* eslint-disable @typescript-eslint/no-explicit-any */
export type Func = (...p: any) => any;
export type AsyncFunc = (...p: any) => Promise<any>;
export type ReturnPromise<T> = T extends Func ? (T extends AsyncFunc ? T : (...p: Parameters<T>) => Promise<ReturnType<T>>) : never;
export type OrPromise<T> = Promise<T> | T;
