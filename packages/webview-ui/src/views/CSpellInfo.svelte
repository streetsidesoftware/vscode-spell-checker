<script lang="ts">
  import { useQuery } from '@sveltestack/svelte-query';
  import { getClientApi } from '../api';
  import { queryCurrentDocument, queryLogLevel } from '../state/query';

  const api = getClientApi();

  const qDoc = queryCurrentDocument();
  const qLogLevel = queryLogLevel();

  $: currentDoc = $qDoc.data;
  $: docUrl = currentDoc ? new URL(currentDoc.url) : undefined;
  $: name = docUrl ? docUrl.pathname.split('/').at(-1) : '<unknown>';
</script>

<section>
  <h1>Spell Checker</h1>

  <ul>
    <li>name: {name}</li>
    <li>file: {docUrl ?? 'none'}</li>
    <li>version: {currentDoc?.version ?? 'n/a'}</li>
    <li>LogLevel: {$qLogLevel.data}</li>
  </ul>
</section>

<style>
</style>
