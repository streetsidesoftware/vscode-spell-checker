<script lang="ts">
  import type { Checkbox } from '@vscode/webview-ui-toolkit';
  import type { ChangeEvent } from '../types';
  import { LogLevel } from 'vscode-webview-rpc/logger';
  import VscodeCheckbox from '../components/VscodeCheckbox.svelte';
  import { appState } from '../state/appState';

  const sLogLevel = appState.logLevel();
  $: logLevel = $sLogLevel;
  $: logDebug = (logLevel && logLevel <= LogLevel.debug) || false;

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

<VscodeCheckbox checked={logDebug} on:change={changeLogDebug}>Log Debug Info</VscodeCheckbox>
