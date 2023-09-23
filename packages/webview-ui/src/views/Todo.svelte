<script lang="ts">
    import type { Todo } from '../api';
    import { getClientApi } from '../api';
    import VscodeButton from '../components/VscodeButton.svelte';
    import VscodeCheckbox from '../components/VscodeCheckbox.svelte';
    import VscodeTextField from '../components/VscodeTextField.svelte';
    import { appState, todos } from '../state/appState';
    import type { TextInputEvent } from '../types';

    const api = getClientApi();

    $: remaining = $todos.filter((t) => !t.done).length || 0;

    let focusTodo: Todo | undefined;

    let currTodo: Todo | undefined = undefined;

    async function add() {
        todos.update((todos) => {
            const todo = {
                uuid: Math.random() * 100000 + Date.now(),
                done: false,
                text: '',
            };
            focusTodo = todo;
            currTodo = todo;
            todos.push(todo);
            return todos;
        });
    }

    function clear() {
        todos.update((todos) => todos.filter((t) => !t.done));
    }

    function reset() {
        return api.serverRequest.resetTodos();
    }

    function changed(index: number) {
        if (index + 1 === $todos.length) {
            add();
        }
    }

    function selectTodo(todo: Todo, active: boolean) {
        currTodo = active ? todo : currTodo === todo ? undefined : currTodo;
    }

    function onInput(_e: CustomEvent<TextInputEvent>) {}
</script>

<div>
    <h1>todos</h1>

    <form on:submit|preventDefault>
        {#if $todos}
            <ul class="todos">
                {#each $todos as todo, index (todo.uuid)}
                    <li class="todo-item" class:done={todo.done}>
                        <VscodeTextField
                            inputType="text"
                            placeholder="What needs to be done?"
                            bind:value={todo.text}
                            on:change={() => changed(index)}
                            on:blur={() => selectTodo(todo, false)}
                            on:focus={() => selectTodo(todo, true)}
                            on:input={(e) => onInput(e)}
                            focus={todo === focusTodo}
                            ><section class="slot" slot="start">
                                <VscodeCheckbox
                                    bind:checked={todo.done}
                                    on:blur={() => selectTodo(todo, false)}
                                    on:focus={() => selectTodo(todo, true)}
                                />
                            </section></VscodeTextField
                        >
                        {#if todo === currTodo}
                            <span>*</span>
                        {/if}
                    </li>
                {/each}
            </ul>
        {:else}
            <b>Get Started! Add a new Todo.</b>
        {/if}

        <p>{remaining} remaining</p>

        <div class="todo-actions">
            <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
            <VscodeButton on:click={add}>Add New</VscodeButton>

            <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
            <VscodeButton on:click={clear}>Clear Completed</VscodeButton>

            <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
            <VscodeButton on:click={reset}>Reset the List</VscodeButton>
        </div>
    </form>
</div>

<style>
    .done {
        opacity: 0.4;
    }

    li {
        display: flex;
    }

    .todos {
        padding-inline-start: 0;
        width: 100%;
    }

    .todo-actions {
        width: 100%;
    }

    .todo-actions > :global(vscode-button) {
        display: block;
        width: 100%;
        max-width: 300px;
        margin: 5px auto;
        text-align: center;
    }

    .todo-item {
        width: 100%;
    }

    /* input[type='text'] {
    flex: 1;
    padding: 0.5em;
    margin: -0.2em 0;
    border: none;
  } */
</style>
