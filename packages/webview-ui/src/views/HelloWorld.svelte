<script lang="ts">
  import { getClientApi, getLocalState } from '../api';
  import VscodeButton from '../components/VscodeButton.svelte';
  import VscodeCheckbox from '../components/VscodeCheckbox.svelte';
  import VsCodeComponents from './VSCodeComponents.svelte';
  import { appState } from '../state/appState';
  import CheckboxLogDebug from '../components/CheckboxLogDebug.svelte';

  interface Props {
    showVsCodeComponents?: any;
    name: string;
  }

  let { showVsCodeComponents = $bindable(getLocalState()?.showVsCodeComponents || false), name }: Props = $props();

  const api = getClientApi();

  const sTodos = appState.todos();
  let todos = $derived($sTodos);

  let messages: string[] = $state([]);

  let reversed = $derived([...messages].reverse());

  function handleHowdyClick() {
    api.serverNotification.showInformationMessage('Hey There.');
  }

  async function handleWhatTimeIsIt() {
    const response = await api.serverRequest.whatTimeIsIt();
    messages.push(response);
    messages = messages.slice(-10);
  }
</script>

<div>
  <h1>Hello {name}!</h1>
  <VscodeButton onclick={handleHowdyClick}>Howdy!</VscodeButton>
  <VscodeButton onclick={handleWhatTimeIsIt}>What time is it?</VscodeButton>

  <ul>
    {#each reversed as msg}
      <li>{msg}</li>
    {/each}
  </ul>

  {#if todos?.length}
    <ul>
      {#each todos as todo}
        <li>{todo.text} - {todo.done}</li>
      {/each}
    </ul>
  {/if}

  <VscodeCheckbox bind:checked={showVsCodeComponents}>Show VSCode Component Samples</VscodeCheckbox>
  <CheckboxLogDebug />

  {#if showVsCodeComponents}
    <VsCodeComponents />
  {/if}
</div>

<style>
</style>
