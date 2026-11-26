<script lang="ts">
  import '@vscode-elements/elements/dist/vscode-divider/index.js';
  import '@vscode-elements/elements/dist/vscode-label/index.js';
  import '@vscode-elements/elements/dist/vscode-option/index.js';
  import '@vscode-elements/elements/dist/vscode-single-select/index.js';
  import '@vscode-elements/elements/dist/vscode-tab-header/index.js';
  import '@vscode-elements/elements/dist/vscode-tab-panel/index.js';
  import '@vscode-elements/elements/dist/vscode-tabs/index.js';
  import '@vscode-elements/elements/dist/vscode-textfield/index.js';
  import '@vscode-elements/elements/dist/vscode-toolbar-button/index.js';
  import VscodeButton from '../components/VscodeButton.svelte';
  import VscodeCheckbox from '../components/VscodeCheckbox.svelte';
  import VscodeLink from '../components/VscodeLink.svelte';
  import VscodeTextField from '../components/VscodeTextField.svelte';
  import Todo from './Todo.svelte';
</script>

<div>
  <h1>Elements</h1>

  <section>
    <h3>Samples</h3>

    <ul>
      <li>Link: <VscodeLink href="#">Link Text</VscodeLink></li>
      <li>Checkbox: <VscodeCheckbox>Label</VscodeCheckbox></li>
      <li>Divider: <vscode-divider></vscode-divider></li>
      <li>
        <div class="dropdown-container">
          <vscode-label for="my-dropdown">Choose an option:</vscode-label>
          <vscode-single-select id="my-dropdown">
            <vscode-option>Option Label #1</vscode-option>
            <vscode-option>Option Label #2</vscode-option>
            <vscode-option>Option Label #3</vscode-option>
          </vscode-single-select>
        </div>
      </li>
    </ul>
  </section>

  <section>
    <vscode-tabs aria-label="Default">
      <vscode-tab-header slot="header">Buttons</vscode-tab-header>
      <vscode-tab-panel>
        <section>
          <h3>Buttons</h3>

          <VscodeButton appearance="primary">Primary</VscodeButton>
          <VscodeButton appearance="secondary">Secondary</VscodeButton>
          Icon: <VscodeButton appearance="icon" ariaLabel="Use Regular Expression">
            <span class="codicon codicon-regex"></span>
          </VscodeButton>
        </section>
      </vscode-tab-panel>
      <vscode-tab-header slot="header">Inputs</vscode-tab-header>
      <vscode-tab-panel>
        <section>
          <h3>Inputs</h3>

          <VscodeTextField>
            Text Field Label
            {#snippet end()}
              <section style="display:flex; align-items: center;">
                <VscodeButton appearance="icon" ariaLabel="Match Case">
                  <span class="codicon codicon-case-sensitive"></span>
                </VscodeButton>
                <VscodeButton appearance="icon" ariaLabel="Match Whole Word">
                  <span class="codicon codicon-whole-word"></span>
                </VscodeButton>
                <VscodeButton appearance="icon" ariaLabel="Use Regular Expression">
                  <span class="codicon codicon-regex"></span>
                </VscodeButton>
              </section>
            {/snippet}
          </VscodeTextField>
        </section>
      </vscode-tab-panel>
      <vscode-tab-header slot="header">More Inputs</vscode-tab-header>
      <vscode-tab-panel>
        <section>
          <!-- Basic text field -->
          <p>Basic text field</p>
          <vscode-textfield></vscode-textfield>

          <!-- Text field with placeholder text -->
          <p>With placeholder text</p>
          <vscode-textfield placeholder="Placeholder Text"></vscode-textfield>

          <!-- Readonly text field -->
          <p>Readonly text field</p>
          <vscode-textfield readonly value="Read only"></vscode-textfield>

          <!-- Disabled text field -->
          <p>Disabled text field</p>
          <vscode-textfield disabled value="Disabled"></vscode-textfield>

          <!-- Text field with max length -->
          <p>With max length</p>
          <vscode-textfield maxLength={10}></vscode-textfield>

          <!-- Text field with type email -->
          <p>With type email</p>
          <vscode-textfield type="email"></vscode-textfield>

          <!-- Text field with type password -->
          <p>With type password</p>
          <vscode-textfield type="password"></vscode-textfield>

          <!-- Text field with type tel -->
          <p>With type tel</p>
          <vscode-textfield type="tel"></vscode-textfield>

          <!-- Text field with type text -->
          <p>With type text</p>
          <vscode-textfield type="text"></vscode-textfield>

          <!-- Text field with type url -->
          <p>With type url</p>
          <vscode-textfield type="url"></vscode-textfield>

          <!-- Text field with autofocus -->
          <p>With autofocus</p>
          <!-- svelte-ignore a11y_autofocus -->
          <vscode-textfield autofocus></vscode-textfield>

          <!-- Text field with start icon -->
          <p>With start icon</p>
          <vscode-textfield>
            <span slot="content-before" class="codicon codicon-search"></span>
          </vscode-textfield>

          <!-- Text field with end icon -->
          <p>With end icon</p>
          <vscode-textfield>
            <span slot="content-after" class="codicon codicon-text-size"></span>
          </vscode-textfield>

          <!-- Text field with multiple icons -->
          <p>With multiple icons</p>
          <vscode-textfield>
            <section
              slot="content-after"
              style="
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
          "
            >
              <vscode-toolbar-button label="Match Case">
                <span class="codicon codicon-case-sensitive"></span>
              </vscode-toolbar-button>
              <vscode-toolbar-button label="Match Whole Word">
                <span class="codicon codicon-whole-word"></span>
              </vscode-toolbar-button>
              <vscode-toolbar-button label="Use Regular Expression">
                <span class="codicon codicon-regex"></span>
              </vscode-toolbar-button>
            </section>
          </vscode-textfield>
        </section>
      </vscode-tab-panel>
      <vscode-tab-header slot="header">Todos</vscode-tab-header>
      <vscode-tab-panel><Todo /></vscode-tab-panel>
      <vscode-tab-header slot="header">misc</vscode-tab-header>
      <vscode-tab-panel>Terminal Content</vscode-tab-panel>
    </vscode-tabs>
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
</style>
