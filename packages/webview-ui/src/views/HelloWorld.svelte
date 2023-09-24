<script lang="ts">
    import { LogLevel } from 'vscode-webview-rpc/logger';
    import { getClientApi, getLocalState, setLocalState } from '../api';
    import VscodeButton from '../components/VscodeButton.svelte';
    import VscodeCheckbox from '../components/VscodeCheckbox.svelte';
    import { appState, todos } from '../state/appState';
    import { derivativeRWPassThrough } from '../state/store';
    import VsCodeComponents from './VSCodeComponents.svelte';

    export let showVsCodeComponents = getLocalState()?.showVsCodeComponents || false;
    export let name: string;

    const api = getClientApi();

    let logDebug = derivativeRWPassThrough(
        appState,
        ($appState) => ($appState.logLevel && $appState.logLevel >= LogLevel.debug) || false,
        ($logDebug, $appState) => {
            $appState.logLevel = $logDebug
                ? $appState.logLevel < LogLevel.debug
                    ? LogLevel.debug
                    : $appState.logLevel
                : $appState.logLevel >= LogLevel.debug
                ? LogLevel.none
                : $appState.logLevel;
            return $appState;
        }
    );

    let messages: string[] = [];

    $: reversed = [...messages].reverse();

    $: {
        updateState(showVsCodeComponents);
    }

    function handleHowdyClick() {
        api.serverNotification.showInformationMessage('Hey There.');
    }

    async function handleWhatTimeIsIt() {
        const response = await api.serverRequest.whatTimeIsIt();
        messages.push(response);
        messages = messages.slice(-10);
    }

    function updateState(showVsCodeComponents: boolean) {
        const state = getLocalState();
        if (state?.showVsCodeComponents !== showVsCodeComponents) {
            const newState = state || {};
            newState.showVsCodeComponents = showVsCodeComponents;
            setLocalState(newState);
        }
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

    {#if $todos.length}
        <ul>
            {#each $appState.todos as todo}
                <li>{todo.text} - {todo.done}</li>
            {/each}
        </ul>
    {/if}

    <VscodeCheckbox bind:checked={showVsCodeComponents}>Show VSCode Component Samples</VscodeCheckbox>
    <VscodeCheckbox bind:checked={$logDebug}>Log Debug Info</VscodeCheckbox>

    {#if showVsCodeComponents}
        <VsCodeComponents />
    {/if}
</div>

<style>
</style>
