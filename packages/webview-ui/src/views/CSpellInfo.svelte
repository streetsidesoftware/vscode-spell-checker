<script lang="ts">
  import { appState } from '../state/appState';

  $: currentDoc = appState.currentDocument();
  $: docUrl = $currentDoc?.url ? new URL($currentDoc.url) : undefined;
  $: name = docUrl ? docUrl.pathname.split('/').at(-1) : '<unknown>';
  $: logLevel = appState.logLevel();
</script>

<section>
  <h1>Spell Checker</h1>

  <ul>
    <li>name: {name}</li>
    <li>file: {docUrl ?? 'none'}</li>
    <li>version: {$currentDoc?.version ?? 'n/a'}</li>
    <li>State LogLevel: {$logLevel}</li>
  </ul>
</section>

<style>
</style>
