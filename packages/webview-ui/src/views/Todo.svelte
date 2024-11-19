<script lang="ts">
  import { createBubbler, preventDefault } from 'svelte/legacy';

  const bubble = createBubbler();
  import type { Todo } from '../api';
  import { getClientApi } from '../api';
  import VscodeButton from '../components/VscodeButton.svelte';
  import VscodeCheckbox from '../components/VscodeCheckbox.svelte';
  import VscodeTextField from '../components/VscodeTextField.svelte';
  import { appState } from '../state/appState';

  const api = getClientApi();
  const sTodos = appState.todos();
  let updates = $state(0);

  let todos = $derived($sTodos);
  let remaining = $derived(todos.filter((t) => !t.done).length || 0);
  let logDebug = $derived(appState.logDebug());

  let focusTodo: Todo | undefined = $state();

  let currTodo: Todo | undefined = $state(undefined);

  sTodos.subscribe(() => (console.log('subscribe todos.'), (updates = updates + 1)));

  async function add() {
    const nextTodos = todos;
    const todo = {
      uuid: Math.random() * 100000 + Date.now(),
      done: false,
      text: '',
    };
    nextTodos.push(todo);
    sTodos.set(nextTodos);
    focusTodo = todo;
    currTodo = todo;
  }

  function clear() {
    const nextTodos = todos.filter((t) => !t.done);
    sTodos.set(nextTodos);
  }

  function reset() {
    return api.serverRequest.resetTodos();
  }

  function changed(index: number) {
    if (index + 1 === todos.length) {
      add();
    }
  }

  function selectTodo(todo: Todo, active: boolean) {
    currTodo = active ? todo : currTodo === todo ? undefined : currTodo;
  }

  function onInput() {
    // Set todos to write to the server.
    sTodos.set(todos);
  }
</script>

<div>
  <h1>todos</h1>

  <p>Updates: {updates}</p>

  <form onsubmit={preventDefault(bubble('submit'))}>
    {#if todos.length}
      <ul class="todos">
        {#each todos as todo, index (todo.uuid)}
          <li class="todo-item" class:done={todo.done}>
            <VscodeTextField
              inputType="text"
              placeholder="What needs to be done?"
              bind:value={todo.text}
              on:change={() => changed(index)}
              on:blur={() => selectTodo(todo, false)}
              on:focus={() => selectTodo(todo, true)}
              on:input={onInput}
              focus={todo === focusTodo}
              >{#snippet start()}
                <section class="slot">
                  <VscodeCheckbox
                    bind:checked={todo.done}
                    on:blur={() => selectTodo(todo, false)}
                    on:focus={() => selectTodo(todo, true)}
                    on:change={onInput}
                  />
                </section>
              {/snippet}</VscodeTextField
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
    <p>Log Debug: {$logDebug}</p>

    <div class="todo-actions">
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <VscodeButton on:click={add}>Add New</VscodeButton>

      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <VscodeButton on:click={clear}>Clear Completed</VscodeButton>

      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
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
