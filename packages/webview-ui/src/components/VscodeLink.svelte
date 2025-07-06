<script lang="ts">
  interface Props {
    href: string;
    children?: import('svelte').Snippet;
    onclick?: (e: Event) => void;
  }

  let { href, children, onclick }: Props = $props();
</script>

<!-- svelte-ignore a11y_autofocus -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<vscode-link {href} {onclick}>
  {@render children?.()}
</vscode-link>
