<script lang="ts">
  import { provideVSCodeDesignSystem, allComponents } from '@vscode/webview-ui-toolkit';
  import Todo from './views/Todo.svelte';
  import HelloWorld from './views/HelloWorld.svelte';

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
</script>

<main>
  <div class="main-container">
    {#if view == 'hello-world'}
      <HelloWorld {name} />
    {:else if view == 'todo'}
      <Todo />
    {:else}
      <h1>Unknown View {view}</h1>
    {/if}
  </div>
</main>

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
