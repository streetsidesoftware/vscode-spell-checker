<script lang="ts">
  import '@vscode-elements/elements/dist/vscode-button/index.js';
  import '@vscode-elements/elements/dist/vscode-toolbar-button/index.js';

  interface Props {
    /**
     * Determines the visual appearance (primary, secondary, icon) of the button.
     */
    appearance?: 'primary' | 'secondary' | 'icon' | undefined;
    /**
     * Defines a label for buttons that screen readers can use.
     */
    ariaLabel?: string | undefined;
    /**
     * Determines if the element should receive document focus on page load.
     */
    autofocus?: boolean | undefined;
    /**
     * Prevents the user from interacting with the button––it cannot be pressed or focused.
     */
    disabled?: boolean | undefined;
    /** See MDN. */
    name?: string | undefined;
    /** See MDN. */
    inputType?: 'submit' | 'reset' | 'button' | undefined;
    /** See MDN. */
    value?: string | undefined;
    children?: import('svelte').Snippet;
    onclick?: (e: Event) => void;
  }

  let {
    appearance = undefined,
    ariaLabel = undefined,
    autofocus = undefined,
    disabled = undefined,
    name = undefined,
    inputType = undefined,
    value = undefined,
    children,
    onclick = () => {},
  }: Props = $props();

  let extraProps = $derived({
    secondary: appearance === 'secondary' || undefined,
    autofocus,
    disabled,
    name,
    type: inputType,
    'aria-label': ariaLabel,
    value,
  });
  let itemProps = $derived(Object.fromEntries(Object.entries(extraProps).filter(([_k, v]) => typeof v !== 'undefined')));
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
{#if appearance === 'icon'}
  <vscode-toolbar-button label={ariaLabel} {onclick}>{@render children?.()}</vscode-toolbar-button>
{:else}
  <vscode-button {...itemProps} {onclick}>{@render children?.()}</vscode-button>
{/if}
