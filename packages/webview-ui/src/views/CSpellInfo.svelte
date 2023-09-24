<script lang="ts">
  import { appState } from '../state/appState';

  $: docUrl = $appState.currentDocument ? new URL($appState.currentDocument.url) : undefined;
  $: name = docUrl ? docUrl.pathname.split('/').at(-1) : '<unknown>';
</script>

<section>
  <h1>Spell Checker</h1>

  <ul>
    <li>name: {name}</li>
    <li>file: {$appState.currentDocument?.url ?? 'none'}</li>
    <li>version: {$appState.currentDocument?.version ?? 'n/a'}</li>
    <li>Seq: {$appState.seq}</li>
    <li>LogLevel: {$appState.logLevel}</li>
  </ul>
</section>

<style>
</style>
