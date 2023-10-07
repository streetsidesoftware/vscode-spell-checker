<script lang="ts">
  import type { Settings } from 'webview-api/dist/apiModels';
  import CheckboxLogDebug from '../components/CheckboxLogDebug.svelte';
  import { appState } from '../state/appState';
  import { writable } from 'svelte/store';
  import { useQuery, useQueryClient } from '@sveltestack/svelte-query';
  import { getClientApi } from '../api';

  const getDocSettings = (url: string | undefined) => getClientApi().serverRequest.getDocSettings(url);

  $: currentDoc = appState.currentDocument();
  $: docUrl = $currentDoc?.url ? new URL($currentDoc.url) : undefined;
  $: queryResult = useQuery(['docSettings', docUrl?.toString()], (ctx) => getDocSettings(ctx.queryKey[1]));
  $: settings = $queryResult.data;
  $: dictionaries = settings?.configs.file?.dictionaries;
  $: name = docUrl ? docUrl.pathname.split('/').at(-1) : '<unknown>';
  $: logDebug = appState.logDebug();
  $: fileUrl = settings?.configs.file?.uri ? new URL(settings.configs.file.uri) : undefined;
</script>

<section>
  <h1>Spell Checker</h1>

  <h2>File</h2>
  <ul>
    <li>name: {name}</li>
    <li>file: {docUrl ?? 'none'}</li>
    <li>version: {$currentDoc?.version ?? 'n/a'}</li>
    <li>State LogLevel: {$logDebug}</li>
    <li>filename from settings: {fileUrl ? fileUrl.pathname.split('/').at(-1) : '<unknown>'}</li>
  </ul>

  <CheckboxLogDebug />

  {#if dictionaries && dictionaries.length}
    <h2>Dictionaries</h2>
    <ul>
      {#each dictionaries as dictionary}
        <li>
          <dl>
            <dt>{dictionary.name} <sup>{dictionary.locales.join(', ')}</sup></dt>
            <dd>{dictionary.description || ''}</dd>
            {#if dictionary.uriName}
              <dd><a href={dictionary.uri}>{dictionary.uriName}</a></dd>
            {/if}
          </dl>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  dd {
    opacity: 90%;
    font-size: smaller;
    margin-inline-start: 0;
  }

  dl {
    margin-block-start: 0;
    margin-block-end: 0.5em;
  }
</style>
