<script lang="ts">
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
    form?: string | undefined;
    /** See MDN. */
    formaction?: string | undefined;
    /** See MDN. */
    formenctype?: string | undefined;
    /** See MDN. */
    formmethod?: string | undefined;
    /** See MDN. */
    formnovalidate?: string | undefined;
    /** See MDN. */
    formtarget?: string | undefined;
    /** See MDN. */
    name?: string | undefined;
    /** See MDN. */
    inputType?: string | undefined;
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
    form = undefined,
    formaction = undefined,
    formenctype = undefined,
    formmethod = undefined,
    formnovalidate = undefined,
    formtarget = undefined,
    name = undefined,
    inputType = undefined,
    value = undefined,
    children,
    onclick = () => {},
  }: Props = $props();

  let extraProps = $derived({
    appearance,
    autofocus,
    disabled,
    name,
    type: inputType,
    'aria-label': ariaLabel,
    form,
    formaction,
    formenctype,
    formmethod,
    formnovalidate,
    formtarget,
    value,
  });
  let itemProps = $derived(Object.fromEntries(Object.entries(extraProps).filter(([_k, v]) => typeof v !== 'undefined')));
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<vscode-button {...itemProps} {onclick}>{@render children?.()}</vscode-button>

<style>
</style>
