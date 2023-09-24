<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  /**
   * Determines the visual appearance (primary, secondary, icon) of the button.
   */
  export let appearance: 'primary' | 'secondary' | 'icon' | undefined = undefined;
  /**
   * Defines a label for buttons that screen readers can use.
   */
  export let ariaLabel: string | undefined = undefined;
  /**
   * Determines if the element should receive document focus on page load.
   */
  export let autofocus: boolean | undefined = undefined;
  /**
   * Prevents the user from interacting with the button––it cannot be pressed or focused.
   */
  export let disabled: boolean | undefined = undefined;
  /** See MDN. */
  export let form: string | undefined = undefined;
  /** See MDN. */
  export let formaction: string | undefined = undefined;
  /** See MDN. */
  export let formenctype: string | undefined = undefined;
  /** See MDN. */
  export let formmethod: string | undefined = undefined;
  /** See MDN. */
  export let formnovalidate: string | undefined = undefined;
  /** See MDN. */
  export let formtarget: string | undefined = undefined;
  /** See MDN. */
  export let name: string | undefined = undefined;
  /** See MDN. */
  export let inputType: string | undefined = undefined;
  /** See MDN. */
  export let value: string | undefined = undefined;

  $: extraProps = {
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
  };
  $: props = Object.fromEntries(Object.entries(extraProps).filter(([_k, v]) => typeof v !== 'undefined'));

  function click(e: Event) {
    return dispatch('click', e);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<vscode-button {...props} on:click={click}><slot /></vscode-button>

<style>
</style>
