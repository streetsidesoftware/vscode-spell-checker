<script lang="ts">
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
  import { onDestroy } from 'svelte';
  import { createDisposableList } from 'utils-disposables';
  import { supportedViewsByName } from './api';
  import CSpellInfo from './views/CSpellInfo.svelte';
  import HelloWorld from './views/HelloWorld.svelte';
  import Todo from './views/Todo.svelte';

  interface Props {
    name: string;
    view: string | undefined | null;
  }

  let { name, view }: Props = $props();

  const disposable = createDisposableList();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000,
        enabled: true,
      },
    },
  });

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
