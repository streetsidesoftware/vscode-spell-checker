/* eslint-disable @typescript-eslint/no-explicit-any */
export type Func = (...p: any) => any;

export type FuncVoid = (...p: any) => void;

export type AsyncFunc = (...p: any) => Promise<any>;

export type AsyncFuncVoid = (...p: any) => Promise<void>;

export type KeepFieldsOfType<T, Keep> = {
    [K in keyof T as T[K] extends Keep ? K : never]: T[K];
};

export type ReturnPromise<T> = T extends Func ? (T extends AsyncFunc ? T : (...p: Parameters<T>) => Promise<ReturnType<T>>) : never;

export type MakeMethodsAsync<T> = {
    [K in keyof T]: ReturnPromise<T[K]>;
};
