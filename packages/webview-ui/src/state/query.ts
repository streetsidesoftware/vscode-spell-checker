import type { MutationObserverOptions, QueryClient } from '@sveltestack/svelte-query';
import { useQuery } from '@sveltestack/svelte-query';
import { createDisposable, type DisposableHybrid } from 'utils-disposables';
import type { AppStateData, LogLevel, RequestResult, TodoList } from 'webview-api';

import { getClientApi } from '../api';

interface Context<T> {
    queryKey: [T];
}

const api = getClientApi();

type QueryMethodGuard = {
    readonly [K in keyof AppStateData]: (context: Context<K>) => Promise<AppStateData[K]>;
};

export const queryMethods = {
    todos: (_context: Context<'todos'>) => api.serverRequest.getTodos().then((res) => res.value),
    logLevel: (_context: Context<'logLevel'>) => api.serverRequest.getLogLevel().then((res) => res.value),
    currentDocument: (_context: Context<'currentDocument'>) => api.serverRequest.getCurrentDocument().then((res) => res.value),
} as const satisfies QueryMethodGuard;

type QueryMethods = typeof queryMethods;

export function queryTodos() {
    return useQuery('todos', queryMethods.todos);
}

export function queryLogLevel() {
    return useQuery('logLevel', queryMethods.logLevel);
}

export function queryCurrentDocument() {
    return useQuery('currentDocument', queryMethods.currentDocument);
}

export function bindQueryClientToApi(queryClient: QueryClient): DisposableHybrid {
    setMutation(queryClient, 'setTodos', 'todos', (value: TodoList) => api.serverRequest.setTodos({ value }));
    setMutation(queryClient, 'setLogLevel', 'logLevel', (value: LogLevel) => api.serverRequest.setLogLevel({ value }));

    return createDisposable(() => undefined);
}

type RequestMethod<T> = (value: T) => Promise<RequestResult<T>>;
interface MutationContext<T> {
    nextValue: T | undefined;
    prevValue: T | undefined;
}

function setMutation<T>(queryClient: QueryClient, mutationName: string, queryKey: keyof QueryMethods, method: RequestMethod<T>) {
    const options: MutationObserverOptions<RequestResult<T>, unknown, T, MutationContext<T>> = {
        mutationFn: method,
        onMutate: async (nextValue: T) => {
            const context: MutationContext<T> = {
                nextValue,
                prevValue: nextValue,
            };

            // Cancel current queries for the todos list
            await queryClient.cancelQueries(queryKey);

            // Add optimistic todo to todos list
            queryClient.setQueryData<T | undefined>(queryKey, (prevValue) => ((context.prevValue = prevValue), nextValue));

            // Return context with the optimistic todo
            return context;
        },
        onSuccess: (result, _variables, _context) => {
            // Replace optimistic todo in the todos list with the result
            queryClient.setQueryData(queryKey, () => result.value);
        },
        onError: (_error, _variables, context) => {
            // Remove optimistic todo from the todos list
            queryClient.setQueryData(queryKey, () => context?.prevValue);
        },
        retry: 3,
    };
    queryClient.setMutationDefaults(mutationName, options);
}
