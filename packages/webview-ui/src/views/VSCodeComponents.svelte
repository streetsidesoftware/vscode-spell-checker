<script lang="ts">
  import VscodeButton from '../components/VscodeButton.svelte';
  import VscodeCheckbox from '../components/VscodeCheckbox.svelte';
  import VscodeTextField from '../components/VscodeTextField.svelte';
  import Todo from './Todo.svelte';
</script>

<div>
  <h1>Elements</h1>

  <section>
    <h3>Samples</h3>

    <ul>
      <li>Link: <vscode-link href="#">Link Text</vscode-link></li>
      <li>Checkbox: <VscodeCheckbox>Label</VscodeCheckbox></li>
      <li>Divider: <vscode-divider /></li>
      <li>
        <div class="dropdown-container">
          <label for="my-dropdown">Choose an option:</label>
          <vscode-dropdown id="my-dropdown">
            <vscode-option>Option Label #1</vscode-option>
            <vscode-option>Option Label #2</vscode-option>
            <vscode-option>Option Label #3</vscode-option>
          </vscode-dropdown>
        </div>
      </li>
    </ul>
  </section>

  <section>
    <vscode-panels aria-label="Default">
      <vscode-panel-tab id="tab-1">Buttons</vscode-panel-tab>
      <vscode-panel-tab id="tab-2">Inputs</vscode-panel-tab>
      <vscode-panel-tab id="tab-3">More Inputs</vscode-panel-tab>
      <vscode-panel-tab id="tab-4">Todos</vscode-panel-tab>
      <vscode-panel-tab id="tab-5">misc</vscode-panel-tab>
      <vscode-panel-view id="view-1">
        <section>
          <h3>Buttons</h3>

          <VscodeButton appearance="primary">Primary</VscodeButton>
          <VscodeButton appearance="secondary">Secondary</VscodeButton>
          Icon: <VscodeButton appearance="icon" ariaLabel="Use Regular Expression">
            <span class="codicon codicon-regex" />
          </VscodeButton>
        </section>
      </vscode-panel-view>
      <vscode-panel-view id="view-2">
        <section>
          <h3>Inputs</h3>

          <VscodeTextField>
            Text Field Label
            <section slot="end" style="display:flex; align-items: center;">
              <VscodeButton appearance="icon" ariaLabel="Match Case">
                <span class="codicon codicon-case-sensitive" />
              </VscodeButton>
              <VscodeButton appearance="icon" ariaLabel="Match Whole Word">
                <span class="codicon codicon-whole-word" />
              </VscodeButton>
              <VscodeButton appearance="icon" ariaLabel="Use Regular Expression">
                <span class="codicon codicon-regex" />
              </VscodeButton>
            </section>
          </VscodeTextField>
        </section>
      </vscode-panel-view>
      <vscode-panel-view id="view-3">
        <section>
          <!-- Basic text field -->
          <p>Basic text field</p>
          <vscode-text-field>Text Field Label</vscode-text-field>

          <!-- Text field with placeholder text -->
          <p>With placeholder text</p>
          <vscode-text-field placeholder="Placeholder Text"> Text Field Label </vscode-text-field>

          <!-- Readonly text field -->
          <p>Readonly text field</p>
          <vscode-text-field readonly> Text Field Label </vscode-text-field>

          <!-- Disabled text field -->
          <p>Disabled text field</p>
          <vscode-text-field disabled> Text Field Label </vscode-text-field>

          <!-- Text field with max length -->
          <p>With max length</p>
          <vscode-text-field maxlength="10"> Text Field Label </vscode-text-field>

          <!-- Text field with type email -->
          <p>With type email</p>
          <vscode-text-field type="email">Text Field Label</vscode-text-field>

          <!-- Text field with type password -->
          <p>With type password</p>
          <vscode-text-field type="password">Text Field Label</vscode-text-field>

          <!-- Text field with type tel -->
          <p>With type tel</p>
          <vscode-text-field type="tel">Text Field Label</vscode-text-field>

          <!-- Text field with type text -->
          <p>With type text</p>
          <vscode-text-field type="text">Text Field Label</vscode-text-field>

          <!-- Text field with type url -->
          <p>With type url</p>
          <vscode-text-field type="url">Text Field Label</vscode-text-field>

          <!-- Text field with custom size -->
          <p>With custom size</p>
          <vscode-text-field size="50"> Text Field Label </vscode-text-field>

          <!-- Text field with autofocus -->
          <p>With autofocus</p>
          <!-- svelte-ignore a11y-autofocus -->
          <vscode-text-field autofocus> Text Field Label </vscode-text-field>

          <!-- Text field with start icon -->
          <p>With start icon</p>
          <vscode-text-field>
            Text Field Label
            <span slot="start" class="codicon codicon-search" />
          </vscode-text-field>

          <!-- Text field with end icon -->
          <p>With end icon</p>
          <vscode-text-field>
            Text Field Label
            <span slot="end" class="codicon codicon-text-size" />
          </vscode-text-field>

          <!-- Text field with multiple icons -->
          <p>With multiple icons</p>
          <vscode-text-field>
            Text Field Label
            <section
              slot="end"
              style="
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
          "
            >
              <vscode-button appearance="icon" aria-label="Match Case">
                <span class="codicon codicon-case-sensitive" />
              </vscode-button>
              <vscode-button appearance="icon" aria-label="Match Whole Word">
                <span class="codicon codicon-whole-word" />
              </vscode-button>
              <vscode-button appearance="icon" aria-label="Use Regular Expression">
                <span class="codicon codicon-regex" />
              </vscode-button>
            </section>
          </vscode-text-field>
        </section>
      </vscode-panel-view>
      <vscode-panel-view id="view-4"> <Todo /> </vscode-panel-view>
      <vscode-panel-view id="view-5"> Terminal Content </vscode-panel-view>
    </vscode-panels>
  </section>
</div>

<style>
  .dropdown-container {
    box-sizing: border-box;
    display: flex;
    flex-flow: column nowrap;
    align-items: flex-start;
    justify-content: flex-start;
  }

  .dropdown-container label {
    display: block;
    color: var(--vscode-foreground);
    cursor: pointer;
    font-size: var(--vscode-font-size);
    line-height: normal;
    margin-bottom: 2px;
  }
</style>
