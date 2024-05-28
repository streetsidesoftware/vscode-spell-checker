<script lang="ts">
  import { appState } from '../state/appState';
  import { createMutation, createQuery, getQueryClientContext } from '@tanstack/svelte-query';
  import { getServerApi, getServerNotificationApi } from '../api';
  import type { Settings } from 'webview-api';
  import VscodeLink from '../components/VscodeLink.svelte';
  import VscodeCheckbox from '../components/VscodeCheckbox.svelte';
  import type { TextDocumentRef, UpdateEnabledFileTypesRequest } from 'webview-api/dist/apiModels';

  const queryClient = getQueryClientContext();
  const api = getServerApi();
  const getDocSettings = (url: string | undefined) => api.getDocSettings(url);

  const mutateEnabledFileType = (request: UpdateEnabledFileTypesRequest) => api.updateEnabledFileTypes(request);

  interface DisplayInfo {
    key: string;
    value: string | undefined;
  }

  const maxDelay = 10000;
  const initialDelay = 1000;
  let fileInfo: DisplayInfo[] = [];
  let delay = initialDelay;

  $: currentDoc = appState.currentDocument();
  $: docUrl = $currentDoc?.url ? new URL($currentDoc.url) : undefined;
  $: queryResult = createQuery({
    queryKey: ['docSettings', docUrl?.toString()],
    queryFn: (ctx) => getDocSettings(ctx.queryKey[1]),
    refetchInterval: delay,
  });
  $: mutation = createMutation({
    mutationFn: mutateEnabledFileType,
    onSettled: async () => {
      await queryClient.resetQueries({ queryKey: ['docSettings'] });
      delay = initialDelay;
      // await $queryResult.refetch();
      setTimeout(() => $queryResult.refetch().catch(() => undefined), 300);
    },
  });
  $: settings = $queryResult.data;
  $: configFiles = settings?.configs.file?.configFiles;
  $: excludedBy = settings?.configs.file?.excludedBy;
  $: dictionaries = settings?.configs.file?.dictionaries;
  $: dictionariesInUse = new Set(dictionaries?.map((d) => d.name) || []);
  $: unusedDictionaries = settings?.dictionaries.filter((d) => !dictionariesInUse.has(d.name));
  $: fileInfo = calcDisplayInfo($currentDoc || undefined, settings);
  $: languageIdEnabled = settings?.configs.file?.languageIdEnabled;
  $: languageId = settings?.configs.file?.languageId;

  function openTextDocument(uri: string) {
    getServerNotificationApi().openTextDocument(uri);
  }

  async function updateEnabledFileType(fileType: string | undefined, enable: boolean, url: URL | undefined) {
    if (!fileType || !url) return;
    return $mutation.mutateAsync({ enabledFileTypes: { [fileType]: enable }, url: url?.toString() });
  }

  function calcDisplayInfo(doc: TextDocumentRef | undefined, settings: Settings | undefined | null): DisplayInfo[] {
    if (!settings) return [];
    const info: (DisplayInfo | undefined)[] = [];
    const fileConfig = settings.configs.file;
    const docUrl = doc?.url ? new URL(doc.url) : undefined;
    const name = fileConfig?.name || (docUrl ? docUrl.pathname.split('/').at(-1) : '<unknown>');
    const uriActual = fileConfig?.uriActual || fileConfig?.uri;
    const fileUrl = uriActual ? new URL(uriActual) : undefined;
    const blocked = fileConfig?.blockedReason;
    const enabled = fileConfig?.fileEnabled && fileConfig?.languageIdEnabled && !fileConfig?.fileIsExcluded;
    const fileIsIncluded = fileConfig?.fileIsIncluded;
    const fileIsExcluded = fileConfig?.fileIsExcluded;

    info.push(
      { key: 'Name', value: name },
      { key: 'Enabled', value: (enabled === undefined && 'n/a') || (enabled && 'Yes') || 'No' },
      (!fileIsIncluded && { key: 'In Files', value: 'No' }) || undefined,
      (fileIsExcluded && { key: 'Excluded', value: 'Yes' }) || undefined,
      // { key: 'Version', value: $currentDoc?.version ?? 'n/a' },
      // { key: 'File Name', value: fileUrl ? fileUrl.pathname.split('/').slice(-2).join('/') : '<unknown>' },
      { key: 'Workspace', value: fileConfig?.workspaceFolder?.name || 'n/a' },
      { key: 'File Type', value: fileConfig?.languageId ?? 'n/a' },
      { key: 'File Scheme', value: (docUrl || fileUrl)?.protocol.replaceAll(':', '') ?? 'n/a' },
      { key: 'Language', value: fileConfig?.locales?.join(', ') || 'n/a' },
      (fileConfig?.fileIsExcluded && { key: 'Excluded', value: 'Yes' }) || undefined,
      (fileConfig?.fileIsInWorkspace === false && { key: 'In Workspace', value: 'No' }) || undefined,
      (blocked && { key: 'Blocked Message', value: blocked.message }) || undefined,
      (blocked && { key: 'Blocked Code', value: blocked.code }) || undefined,
      (blocked && { key: 'Blocked Dock Ref Uri', value: blocked.documentationRefUri }) || undefined,
    );

    return info.filter((a): a is DisplayInfo => !!a?.value);
  }
</script>

<section>
  <h1>Spell Checker</h1>

  <h2>File Information</h2>
  <dl class="file-info">
    {#each fileInfo as entry}
      <dt>{entry.key}:</dt>
      <dd>{entry.value}</dd>
    {/each}
  </dl>
  <dl>
    {#if configFiles?.length}
      <dt>Config Files:</dt>
      <dd>
        <ul>
          {#each configFiles as configFile}
            <li>
              <VscodeLink href={configFile.uri} on:click={() => openTextDocument(configFile.uri)}>{configFile.name}</VscodeLink>
            </li>
          {/each}
        </ul>
      </dd>
    {/if}
    {#if excludedBy}
      <dt>Excluded By</dt>
      <dd>
        <ul>
          {#each excludedBy as excluded}
            <li>
              <dl>
                <dt>{excluded.name}</dt>
                <dd>Glob: {excluded.glob}</dd>
                {#if excluded.configUri}
                  <dd>
                    Config File:
                    <VscodeLink href={excluded.configUri} on:click={() => openTextDocument(excluded.configUri || '')}
                      >{excluded.configUri?.split('/').slice(-2).join('/')}</VscodeLink
                    >
                  </dd>
                {/if}
              </dl>
            </li>
          {/each}
        </ul>
      </dd>
    {/if}
  </dl>

  {#if languageIdEnabled !== undefined}
    <VscodeCheckbox
      checked={languageIdEnabled}
      on:change={(e) => {
        return e.detail.checked === !languageIdEnabled && updateEnabledFileType(languageId, !languageIdEnabled, docUrl);
      }}>{languageId}</VscodeCheckbox
    >
  {/if}

  <!-- <CheckboxLogDebug /> -->

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
                  <VscodeLink href={dictionary.uri} on:click={() => dictionary.uri && openTextDocument(dictionary.uri)}
                    >{dictionary.uriName}</VscodeLink
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

  {#if unusedDictionaries && unusedDictionaries.length}
    <h2>Other Dictionaries</h2>
    <ul>
      {#each unusedDictionaries as dictionary}
        <li>
          <dl class="dictionary-entry">
            <dt>{dictionary.name} <sup>{dictionary.locales.join(', ')}</sup></dt>
            <dd>{dictionary.description || ''}</dd>
            {#if dictionary.uriName}
              <dd>
                {#if dictionary.uri}
                  <VscodeLink href={dictionary.uri} on:click={() => dictionary.uri && openTextDocument(dictionary.uri)}
                    >{dictionary.uriName}</VscodeLink
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

  @media (min-width: 230px) {
    dl.file-info {
      display: grid;
      grid-gap: 4px 1em;
      grid-template-columns: auto auto;
      /*
      margin-block-start: 0;
      margin-block-end: 0.5em;
      */
    }

    .file-info dd {
      margin: 0.25em 0;
      word-break: break-word;
      /* grid-column-start: 2; */
    }

    .file-info dt {
      /* color: green; */
      font-weight: bolder;
      word-break: break-word;
    }
  }

  dd ul {
    margin-block-start: 0.25em;
    margin-block-end: 0.5em;
    padding-inline-start: 1em;
  }

  dd ul dd {
    margin: 0.25em 0;
  }

  .dictionary-entry dd {
    margin-inline-start: 0;
  }

  dl {
    margin-block-start: 0.25em;
    margin-block-end: 0.5em;
  }

  dl + dl {
    margin-block-start: 0em;
  }

  ul {
    padding-inline-start: 1.5em;
  }
</style>
