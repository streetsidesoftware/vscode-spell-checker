<script lang="ts">
  import VscodeCheckbox from '../components/VscodeCheckbox.svelte';
  import { appState } from '../state/appState';

  const sLogLevel = appState.logDebug();
</script>

<VscodeCheckbox bind:checked={$sLogLevel}>Log Debug Info</VscodeCheckbox>
