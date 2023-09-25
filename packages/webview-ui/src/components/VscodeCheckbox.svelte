<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  /** Determines if the element should receive document focus on page load. */
  export let autofocus: boolean | undefined = undefined;
  /** When true, the checkbox is toggled on by default. */
  export let checked: boolean = false;
  /** Prevents the user from interacting with the button––it cannot be pressed or focused. */
  export let disabled: boolean | undefined = undefined;
  /** When true, the control will be immutable by user interaction. */
  export let makeReadonly: boolean | undefined = undefined;
  /** Indicates that the user must check the checkbox before the owning form can be submitted. */
  export let required: boolean | undefined = undefined;
  /** The string to use as the value of the checkbox when submitting the form */
  export let value: string | undefined = undefined;

  $: extraProps = { autofocus, disabled, readonly: makeReadonly, required, value };
  $: props = Object.fromEntries(Object.entries(extraProps).filter(([_k, v]) => typeof v !== 'undefined'));
</script>

<!-- svelte-ignore a11y-autofocus -->
<vscode-checkbox {checked} {...props} on:change on:focus on:blur on:input><slot /></vscode-checkbox>
