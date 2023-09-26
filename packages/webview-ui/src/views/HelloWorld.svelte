<script lang="ts">
  import type { Checkbox } from '@vscode/webview-ui-toolkit';
  import type { ChangeEvent } from '../types';
  import { LogLevel } from 'vscode-webview-rpc/logger';
  import { getClientApi, getLocalState } from '../api';
  import VscodeButton from '../components/VscodeButton.svelte';
  import VscodeCheckbox from '../components/VscodeCheckbox.svelte';
  import VsCodeComponents from './VSCodeComponents.svelte';
  import { appState } from '../state/appState';

  export let showVsCodeComponents = getLocalState()?.showVsCodeComponents || false;
  export let name: string;

  const api = getClientApi();

  const sLogLevel = appState.logLevel();
  const sTodos = appState.todos();
  $: logLevel = $sLogLevel;
  $: logDebug = (logLevel && logLevel <= LogLevel.debug) || false;
  $: todos = $sTodos;

  let messages: string[] = [];

  $: reversed = [...messages].reverse();

  function handleHowdyClick() {
    api.serverNotification.showInformationMessage('Hey There.');
  }

  async function handleWhatTimeIsIt() {
    const response = await api.serverRequest.whatTimeIsIt();
    messages.push(response);
    messages = messages.slice(-10);
  }

  function setLogDebug(checked: boolean) {
    if (checked === undefined) return;
    if (checked === logDebug) return;
    const nextLogLevel = checked && (!logLevel || logLevel > LogLevel.debug) ? LogLevel.debug : LogLevel.none;
    if (nextLogLevel === logLevel) return;
    sLogLevel.set(nextLogLevel);
  }

  function changeLogDebug(e: CustomEvent<ChangeEvent<Checkbox>>) {
    e.preventDefault();
    setLogDebug(e.detail.currentTarget.checked);
  }
</script>

<div>
  <h1>Hello {name}!</h1>
  <VscodeButton on:click={handleHowdyClick}>Howdy!</VscodeButton>
  <VscodeButton on:click={handleWhatTimeIsIt}>What time is it?</VscodeButton>

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
  <VscodeCheckbox checked={logDebug} on:change={changeLogDebug}>Log Debug Info</VscodeCheckbox>

  {#if showVsCodeComponents}
    <VsCodeComponents />
  {/if}
</div>

<style>
</style>
