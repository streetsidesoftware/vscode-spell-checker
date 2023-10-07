<script lang="ts">
  import { onDestroy } from 'svelte';
  import { allComponents, provideVSCodeDesignSystem } from '@vscode/webview-ui-toolkit';
  import { supportedViewsByName, getLogger } from './api';
  import CSpellInfo from './views/CSpellInfo.svelte';
  import HelloWorld from './views/HelloWorld.svelte';
  import Todo from './views/Todo.svelte';
  import { createDisposableList } from 'utils-disposables';
  import { appState } from './state/appState';
  import { QueryClient, QueryClientProvider } from '@sveltestack/svelte-query';
  import { LogLevel } from 'utils-logger';

  // In order to use the Webview UI Toolkit web components they
  // must be registered with the browser (i.e. webview) using the
  // syntax below.
  //
  // To register more toolkit components, simply import the component
  // registration function and call it from within the register
  // function, like so:
  //
  // provideVSCodeDesignSystem().register(
  //   vsCodeButton(),
  //   vsCodeCheckbox()
  // );
  //
  // Finally, if you would like to register all of the toolkit
  // components at once, there's a handy convenience function:
  //
  // provideVSCodeDesignSystem().register(allComponents);
  provideVSCodeDesignSystem().register(allComponents);

  export let name: string;
  export let view: string | undefined | null;

  const disposable = createDisposableList();

  const queryClient = new QueryClient();

  onDestroy(() => {
    disposable.dispose();
  });
</script>

<QueryClientProvider client={queryClient}>
  <main>
    <div class="main-container">
      {#if view == supportedViewsByName['hello-world']}
        <HelloWorld {name} />
      {:else if view == supportedViewsByName.todo}
        <Todo />
      {:else if view == supportedViewsByName['cspell-info']}
        <CSpellInfo />
      {:else}
        <h1>Unknown View {view}</h1>
      {/if}
    </div>
  </main>
</QueryClientProvider>

<style>
  main {
    display: flex;
    flex-direction: column;
    justify-content: left;
    align-items: flex-start;
    height: 100%;
  }

  .main-container {
    width: 100%;
  }
</style>
