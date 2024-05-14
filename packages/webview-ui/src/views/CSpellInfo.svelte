<script lang="ts">
  import CheckboxLogDebug from '../components/CheckboxLogDebug.svelte';
  import { appState } from '../state/appState';
  import { useQuery } from '@sveltestack/svelte-query';
  import { getClientApi } from '../api';

  const getDocSettings = (url: string | undefined) => getClientApi().serverRequest.getDocSettings(url);

  $: currentDoc = appState.currentDocument();
  $: docUrl = $currentDoc?.url ? new URL($currentDoc.url) : undefined;
  $: queryResult = useQuery(['docSettings', docUrl?.toString()], (ctx) => getDocSettings(ctx.queryKey[1]));
  $: settings = $queryResult.data;
  $: fileConfig = settings?.configs.file;
  $: dictionaries = fileConfig?.dictionaries;
  $: name = fileConfig?.name || (docUrl ? docUrl.pathname.split('/').at(-1) : '<unknown>');
  $: uriActual = fileConfig?.uriActual || fileConfig?.uri;
  $: fileUrl = uriActual ? new URL(uriActual) : undefined;
  $: fileInfo = [
    { key: 'Name', value: name },
    // { key: 'Version', value: $currentDoc?.version ?? 'n/a' },
    // { key: 'File Name', value: fileUrl ? fileUrl.pathname.split('/').slice(-2).join('/') : '<unknown>' },
    { key: 'Workspace', value: fileConfig?.workspaceFolder?.name || 'n/a' },
    { key: 'File Type', value: fileConfig?.languageId ?? 'n/a' },
    { key: 'File Scheme', value: fileUrl?.protocol ?? 'n/a' },
    { key: 'Language', value: fileConfig?.locales?.join(', ') || 'n/a' },
  ];
</script>

<section>
  <h1>Spell Checker</h1>

  <h2>File Information</h2>
  <dl class="file-info">
    {#each fileInfo as entry}
      <dt>{entry.key}:</dt>
      <dd>{entry.value}</dd>
    {/each}
    {#if fileConfig?.configFiles.length}
      <dt>Config Files:</dt>
      <dd>
        <ul>
          {#each fileConfig.configFiles as configFile}
            <li>
              <a href={configFile.uri} on:click={() => getClientApi().serverNotification.openTextDocument(configFile.uri)}
                >{configFile.name}</a
              >
            </li>
          {/each}
        </ul>
      </dd>
    {/if}
  </dl>

  <CheckboxLogDebug />

  {#if dictionaries && dictionaries.length}
    <h2>Dictionaries</h2>
    <ul>
      {#each dictionaries as dictionary}
        <li>
          <dl class="dictionary-entry">
            <dt>{dictionary.name} <sup>{dictionary.locales.join(', ')}</sup></dt>
            <dd>{dictionary.description || ''}</dd>
            {#if dictionary.uriName}
              <dd>
                {#if dictionary.uri}
                  <a
                    href={dictionary.uri}
                    on:click={() => dictionary.uri && getClientApi().serverNotification.openTextDocument(dictionary.uri)}
                    >{dictionary.uriName}</a
                  >
                {:else}
                  {dictionary.uriName}
                {/if}
              </dd>
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
    margin-inline-start: 1em;
  }

  dt {
    font-weight: bold;
  }

  dt sup {
    font-size: smaller;
    font-weight: normal;
    opacity: 80%;
  }

  .file-info dd {
    margin: 0 0 0 80px;
    padding: 0 0 0.5em 0;
  }

  .file-info dt {
    float: left;
    clear: left;
    width: 110px;
    /* color: green; */
  }

  /*
  dt::after {
    content: ':';
  }
  */

  .dictionary-entry dd {
    margin-inline-start: 0;
  }

  dl {
    margin-block-start: 0;
    margin-block-end: 0.5em;
  }

  ul {
    padding-inline-start: 1.5em;
  }
</style>
