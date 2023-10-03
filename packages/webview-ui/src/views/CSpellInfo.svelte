<script lang="ts">
  import CheckboxLogDebug from '../components/CheckboxLogDebug.svelte';
  import { appState } from '../state/appState';

  $: currentDoc = appState.currentDocument();
  $: settings = appState.docSettings();
  $: dictionaries = $settings?.configs.file?.dictionaries;
  $: docUrl = $currentDoc?.url ? new URL($currentDoc.url) : undefined;
  $: name = docUrl ? docUrl.pathname.split('/').at(-1) : '<unknown>';
  $: logLevel = appState.logLevel();
  $: fileUrl = $settings?.configs.file?.uri ? new URL($settings.configs.file.uri) : undefined;
</script>

<section>
  <h1>Spell Checker</h1>

  <h2>File</h2>
  <ul>
    <li>name: {name}</li>
    <li>file: {docUrl ?? 'none'}</li>
    <li>version: {$currentDoc?.version ?? 'n/a'}</li>
    <li>State LogLevel: {$logLevel}</li>
    <li>filename from settings: {fileUrl ? fileUrl.pathname.split('/').at(-1) : '<unknown>'}</li>
  </ul>

  <CheckboxLogDebug />

  {#if dictionaries && dictionaries.length}
    <h2>Dictionaries</h2>
    {#each dictionaries as dictionary}
      <ul>
        <li>
          <dl>
            <dt>{dictionary.name}</dt>
            <dd>{dictionary.description || ''}</dd>
          </dl>
        </li>
      </ul>
    {/each}
  {/if}
</section>

<style>
  dd {
    opacity: 90%;
    font-size: smaller;
  }
</style>
