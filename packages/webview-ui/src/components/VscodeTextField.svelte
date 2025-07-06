<!-- @migration-task Error while migrating Svelte code: migrating this component would require adding a `$props` rune but there's already a variable named props.
     Rename the variable and try again or migrate by hand. -->
<script lang="ts">
  import type { TextInputEvent } from '../types';

  interface Props {
    /** Determines if the element should receive document focus on page load. */
    autofocus?: boolean | undefined;
    /** Prevents the user from interacting with the button––it cannot be pressed or focused. */
    disabled?: true | undefined;
    /** When true, the control will be immutable by user interaction. */
    makeReadonly?: boolean | undefined;
    /** The string to use as the value of the checkbox when submitting the form */
    value?: string | undefined;
    /** The maximum number of characters a user can enter. */
    maxlength?: number | undefined;
    /** The name of the component. */
    name?: string | undefined;
    /** Sets the placeholder value of the component, generally used to provide a hint to the user. */
    placeholder?: string | undefined;
    /** Sets the width of the element to a specified number of characters. */
    size?: number | undefined;
    /** Sets the text field type. */
    inputType?: string | undefined;
    /** Set the focus to this element. */
    focus?: boolean | undefined;
    start?: import('svelte').Snippet;
    children?: import('svelte').Snippet;
    end?: import('svelte').Snippet;
    oninput?: (e: TextInputEvent) => void;
    onchange?: (e: Event) => void;
    onfocus?: (e: FocusEvent) => void;
    onblur?: (e: FocusEvent) => void;
  }

  let {
    autofocus = undefined,
    disabled = undefined,
    makeReadonly = undefined,
    value = $bindable(undefined),
    maxlength = undefined,
    name = undefined,
    placeholder = undefined,
    size = undefined,
    inputType = undefined,
    focus = undefined,
    start,
    children,
    end,
    oninput,
    onblur,
    onchange,
    onfocus,
  }: Props = $props();

  let extraProps = $derived({ autofocus, disabled, readonly: makeReadonly, maxlength, name, placeholder, size, type: inputType });
  let itemProps = $derived(Object.fromEntries(Object.entries(extraProps).filter(([_k, v]) => typeof v !== 'undefined')));

  function init(node: HTMLInputElement, useFocus: boolean | undefined) {
    function update(focus: boolean | undefined) {
      if (!focus) return;

      const sNode = node.shadowRoot?.querySelector('input');
      sNode?.focus() ?? node?.focus();
    }

    update(useFocus);
    return { update };
  }

  const start_render = $derived(start);
  const end_render = $derived(end);
</script>

<!-- svelte-ignore a11y_autofocus -->
<vscode-text-field {...itemProps} {value} {oninput} {onchange} use:init={focus} {onfocus} {onblur}>
  {#if start}
    <section slot="start">{@render start_render?.()}</section>
  {/if}
  {@render children?.()}
  {#if end}
    <section slot="end">{@render end_render?.()}</section>
  {/if}
</vscode-text-field>

<style>
</style>
