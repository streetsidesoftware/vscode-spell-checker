export interface Todo {
    done: boolean;
    text: string;
}

export type TodoList = Todo[];

export interface Todos {
    seq: number;
    todos: TodoList;
}
