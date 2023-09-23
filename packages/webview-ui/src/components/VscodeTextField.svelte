<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { TextInputEvent } from '../types';

  /** Determines if the element should receive document focus on page load. */
  export let autofocus: boolean | undefined = undefined;
  /** Prevents the user from interacting with the button––it cannot be pressed or focused. */
  export let disabled: true | undefined = undefined;
  /** When true, the control will be immutable by user interaction. */
  export let makeReadonly: boolean | undefined = undefined;
  /** The string to use as the value of the checkbox when submitting the form */
  export let value: string | undefined = undefined;
  /** The maximum number of characters a user can enter. */
  export let maxlength: number | undefined = undefined;
  /** The name of the component. */
  export let name: string | undefined = undefined;
  /** Sets the placeholder value of the component, generally used to provide a hint to the user. */
  export let placeholder: string | undefined = undefined;
  /** Sets the width of the element to a specified number of characters. */
  export let size: number | undefined = undefined;
  /** Sets the text field type. */
  export let inputType: string | undefined = undefined;

  /** Set the focus to this element. */
  export let focus: boolean | undefined = undefined;

  const dispatch = createEventDispatcher<{ input: TextInputEvent }>();

  $: extraProps = { autofocus, disabled, readonly: makeReadonly, maxlength, name, placeholder, size, type: inputType };
  $: props = Object.fromEntries(Object.entries(extraProps).filter(([_k, v]) => typeof v !== 'undefined'));

  function handleInput(e: TextInputEvent) {
    value = e.target.value;
    return dispatch('input', e);
  }

  function init(node: HTMLInputElement, useFocus: boolean | undefined) {
    function update(focus: boolean | undefined) {
      if (!focus) return;

      const sNode = node.shadowRoot?.querySelector('input');
      sNode?.focus() ?? node?.focus();
    }

    update(useFocus);
    return { update };
  }
</script>

<!-- svelte-ignore a11y-autofocus -->
<vscode-text-field {...props} {value} on:input={handleInput} on:change use:init={focus} on:focus on:blur>
  {#if $$slots.start}
    <section slot="start"><slot name="start" /></section>
  {/if}
  <slot />
  {#if $$slots.end}
    <section slot="end"><slot name="end" /></section>
  {/if}
</vscode-text-field>

<style>
</style>
