<script lang="ts">
  import '@vscode-elements/elements/dist/vscode-label/index.js';
  import '@vscode-elements/elements/dist/vscode-textfield/index.js';
  import type { VscodeTextfield } from '@vscode-elements/elements/dist/vscode-textfield/index.js';
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
    /** Sets the text field type. */
    inputType?: string | undefined;
    /** Set the focus to this element. */
    focus?: boolean | undefined;
    start?: import('svelte').Snippet;
    /** The label shown above the text field. */
    children?: import('svelte').Snippet;
    end?: import('svelte').Snippet;
    oninput?: (e: TextInputEvent<VscodeTextfield>) => void;
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

  const id = $props.id();

  let extraProps = $derived({ autofocus, disabled, readonly: makeReadonly, maxLength: maxlength, name, placeholder, type: inputType });
  let itemProps = $derived(Object.fromEntries(Object.entries(extraProps).filter(([_k, v]) => typeof v !== 'undefined')));

  function handleInput(e: TextInputEvent<VscodeTextfield>) {
    value = e.target.value;
    oninput?.(e);
  }

  function init(node: VscodeTextfield, useFocus: boolean | undefined) {
    function update(focus: boolean | undefined) {
      if (!focus) return;
      // The inner input exists only after the element's first render.
      node.updateComplete.then(() => node.focus()).catch(() => undefined);
    }

    update(useFocus);
    return { update };
  }
</script>

{#if children}
  <vscode-label for={id}>{@render children()}</vscode-label>
{/if}
<!-- svelte-ignore a11y_autofocus -->
<vscode-textfield {id} {...itemProps} {value} oninput={handleInput} {onchange} use:init={focus} {onfocus} {onblur}>
  {#if start}
    <section slot="content-before">{@render start()}</section>
  {/if}
  {#if end}
    <section slot="content-after">{@render end()}</section>
  {/if}
</vscode-textfield>
