<script lang="ts">
  interface Props {
    href: string;
    children?: import('svelte').Snippet;
    onclick?: (e: Event) => void;
  }

  let { href, children, onclick }: Props = $props();

  function handleClick(e: Event) {
    if (!onclick) return;
    e.preventDefault();
    onclick(e);
  }
</script>

<a {href} onclick={handleClick}>
  {@render children?.()}
</a>

<style>
  a {
    color: var(--vscode-textLink-foreground);
    text-decoration: none;
  }

  a:hover,
  a:active {
    color: var(--vscode-textLink-activeForeground);
    text-decoration: underline;
  }

  a:focus-visible {
    outline: 1px solid var(--vscode-focusBorder);
    outline-offset: 1px;
  }
</style>
