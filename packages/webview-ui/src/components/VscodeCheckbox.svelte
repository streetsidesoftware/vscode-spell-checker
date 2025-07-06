<script lang="ts">
  import type { ChangeEvent } from '../types';
  import type { Checkbox } from '@vscode/webview-ui-toolkit';

  interface Props {
    /** Determines if the element should receive document focus on page load. */
    autofocus?: boolean | undefined;
    /** When true, the checkbox is toggled on by default. */
    checked?: boolean;
    /** Prevents the user from interacting with the button––it cannot be pressed or focused. */
    disabled?: boolean | undefined;
    /** When true, the control will be immutable by user interaction. */
    makeReadonly?: boolean | undefined;
    /** Indicates that the user must check the checkbox before the owning form can be submitted. */
    required?: boolean | undefined;
    /** The string to use as the value of the checkbox when submitting the form */
    value?: string | undefined;
    children?: import('svelte').Snippet;

    onchange?: (e: ChangeEvent<Checkbox>) => void;
    onfocus?: (e: FocusEvent) => void;
    onblur?: (e: FocusEvent) => void;
    oninput?: (e: InputEvent) => void;
  }

  let {
    autofocus = undefined,
    checked = $bindable(false),
    disabled = undefined,
    makeReadonly = undefined,
    required = undefined,
    value = undefined,
    children,
    onchange,
    onfocus,
    onblur,
    oninput,
  }: Props = $props();

  let extraProps = $derived({ autofocus, disabled, readonly: makeReadonly, required, value });
  let itemProps = $derived(Object.fromEntries(Object.entries(extraProps).filter(([_k, v]) => typeof v !== 'undefined')));
</script>

<!-- svelte-ignore a11y_autofocus -->
<vscode-checkbox {onchange} {onfocus} {onblur} {oninput} {checked} {...itemProps}>{@render children?.()}</vscode-checkbox>
<checkbox {onchange}></checkbox>
