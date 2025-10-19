import { App, PluginSettingTab, Setting } from 'obsidian';
import type StandUpSummariserPlugin from '../main';

const MIN_CHAR_BUDGET = 1000;
const MAX_CHAR_BUDGET = 500000;

export class DiarySettingTab extends PluginSettingTab {
  plugin: StandUpSummariserPlugin;

  constructor(app: App, plugin: StandUpSummariserPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Stand Up Summariser (Claude)" });

    this.addApiKeySetting(containerEl);
    this.addModelSetting(containerEl);
    this.addFolderSetting(containerEl);
    this.addCharacterBudgetSetting(containerEl);
    this.addBacklinksSetting(containerEl);
    this.addGitSettings(containerEl);
  }

  private async saveSettings(): Promise<void> {
    await this.plugin.saveSettings();
  }

  private addApiKeySetting(containerEl: HTMLElement): void {
    new Setting(containerEl)
      .setName("Anthropic API Key")
      .setDesc("Stored locally in this vault's plugin data.")
      .addText((t) => {
        t.setPlaceholder("sk-ant-...")
          .setValue(this.plugin.settings.anthropicApiKey)
          .onChange(async (v) => {
            this.plugin.settings.anthropicApiKey = v.trim();
            await this.saveSettings();
          });
        t.inputEl.type = 'password';
        return t;
      });
  }

  private addModelSetting(containerEl: HTMLElement): void {
    new Setting(containerEl)
      .setName("Model")
      .setDesc("Claude model (claude-sonnet-4-20250514, claude-3-5-sonnet-20240620, claude-3-opus-20240229)")
      .addText((t) => t
        .setPlaceholder("claude-sonnet-4-20250514")
        .setValue(this.plugin.settings.model)
        .onChange(async (v) => {
          this.plugin.settings.model = v.trim();
          await this.saveSettings();
        })
      );
  }

  private addFolderSetting(containerEl: HTMLElement): void {
    new Setting(containerEl)
      .setName("Diary folder")
      .setDesc("Where to write the daily note")
      .addText((t) => t
        .setPlaceholder("Diary")
        .setValue(this.plugin.settings.diaryFolder)
        .onChange(async (v) => {
          this.plugin.settings.diaryFolder = v.replace(/\/$/, "");
          await this.saveSettings();
        })
      );
  }

  private addCharacterBudgetSetting(containerEl: HTMLElement): void {
    new Setting(containerEl)
      .setName("Character budget")
      .setDesc(`Max characters to include from today's notes (${MIN_CHAR_BUDGET}-${MAX_CHAR_BUDGET})`)
      .addText((t) => t
        .setPlaceholder("60000")
        .setValue(String(this.plugin.settings.charBudget))
        .onChange(async (v) => {
          const n = Number(v);
          if (!Number.isNaN(n) && n >= MIN_CHAR_BUDGET && n <= MAX_CHAR_BUDGET) {
            this.plugin.settings.charBudget = n;
            await this.saveSettings();
          }
        })
      );
  }

  private addBacklinksSetting(containerEl: HTMLElement): void {
    new Setting(containerEl)
      .setName("Include backlinks list")
      .addToggle((t) => t
        .setValue(this.plugin.settings.includeBacklinks)
        .onChange(async (v) => {
          this.plugin.settings.includeBacklinks = v;
          await this.saveSettings();
        })
      );
  }

  private addGitSettings(containerEl: HTMLElement): void {
    containerEl.createEl("h3", { text: "Git Integration" });

    new Setting(containerEl)
      .setName("Include vault git commits")
      .setDesc("Check the vault folder for git commits")
      .addToggle((t) => t
        .setValue(this.plugin.settings.includeVaultGit)
        .onChange(async (v) => {
          this.plugin.settings.includeVaultGit = v;
          await this.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("External Git Repositories")
      .setDesc("Add paths to other git repositories to track commits from")
      .setHeading();

    this.addRepositoryList(containerEl);
    this.addRepositoryButton(containerEl);

    containerEl.createEl("p", {
      text: "Examples: C:\\Users\\YourName\\Projects\\my-app or /home/user/code/my-project",
      cls: "setting-item-description"
    });
  }

  private addRepositoryList(containerEl: HTMLElement): void {
    const repos = [...this.plugin.settings.gitRepositories];

    repos.forEach((repo, index) => {
      new Setting(containerEl)
        .setName(`Repository ${index + 1}`)
        .addText((t) => t
          .setPlaceholder("/path/to/your/repo")
          .setValue(repo)
          .onChange(async (v) => {
            this.plugin.settings.gitRepositories[index] = v;
            await this.saveSettings();
          })
        )
        .addButton((btn) => btn
          .setButtonText("Remove")
          .setWarning()
          .onClick(async () => {
            this.plugin.settings.gitRepositories.splice(index, 1);
            await this.saveSettings();
            this.display();
          })
        );
    });
  }

  private addRepositoryButton(containerEl: HTMLElement): void {
    new Setting(containerEl)
      .addButton((btn) => btn
        .setButtonText("Add Repository")
        .setCta()
        .onClick(async () => {
          this.plugin.settings.gitRepositories.push("");
          await this.saveSettings();
          this.display();
        })
      );
  }
}
