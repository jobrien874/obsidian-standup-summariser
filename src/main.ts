import { Notice, Plugin, TFile } from "obsidian";
import { callClaudeAPI } from "./services/claude";
import { getTodaysGitCommits } from "./services/git";
import { compileContext, getTodaysModifiedNotes } from "./services/notes";
import { DEFAULT_SETTINGS, DiarySettings } from "./types/settings";
import { DiarySettingTab } from "./ui/settings-tab";
import { formatDate } from "./utils/date";

export default class StandUpSummariserPlugin extends Plugin {
  settings: DiarySettings = DEFAULT_SETTINGS;

  async onload() {
    console.log('Loading Stand Up Summariser Plugin');
    await this.loadSettings();

    this.addCommand({
      id: 'generate-standup-summary',
      name: 'Generate Stand-Up Summary',
      callback: async () => {
        await this.generateSummary();
      }
    });

    this.addRibbonIcon('calendar-check', 'Generate Stand-Up Summary', async () => {
      await this.generateSummary();
    });

    this.addSettingTab(new DiarySettingTab(this.app, this));
  }

  onunload() {
    console.log('Unloading Stand Up Summariser Plugin');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private upsertSection(doc: string, sectionHeader: string, content: string): string {
    const headerRegex = new RegExp(`(^|\n)${this.escapeRegex(sectionHeader)}\n`, "m");
    const match = doc.match(headerRegex);
    if (!match) {
      return doc.trimEnd() + `\n\n${sectionHeader}\n\n${content}\n`;
    }

    const startIdx = match.index! + match[0].length;
    const rest = doc.slice(startIdx);
    const nextHeader = rest.search(/^#{1,6} /m);
    if (nextHeader === -1) {
      return doc.slice(0, startIdx) + "\n" + content + "\n";
    } else {
      const endIdx = startIdx + nextHeader;
      return doc.slice(0, startIdx) + "\n" + content + "\n" + doc.slice(endIdx);
    }
  }

  private escapeRegex(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  async generateSummary() {
    try {
      new Notice('Generating stand-up summary...');

      if (!this.settings.anthropicApiKey) {
        new Notice('Please set your Anthropic API key in settings first!');
        return;
      }

      const todaysNotes = await getTodaysModifiedNotes(this.app.vault);
      const vaultPath = (this.app.vault.adapter as any).basePath;
      const gitCommits = await getTodaysGitCommits(
        vaultPath,
        this.settings.includeVaultGit,
        this.settings.gitRepositories
      );

      const totalCommits = gitCommits.reduce((sum, repo) => sum + repo.commits.length, 0);

      if (todaysNotes.length === 0 && totalCommits === 0) {
        new Notice('No notes or commits found for today.');
        return;
      }

      const context = compileContext(todaysNotes, gitCommits, this.settings.charBudget);
      const summary = await callClaudeAPI(
        context,
        this.settings.anthropicApiKey,
        this.settings.model
      );

      await this.saveSummaryNote(summary);
      new Notice('Stand-up summary generated successfully!');
    } catch (error) {
      console.error('Error generating summary:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      new Notice(`Error: ${errorMessage}`);
    }
  }

  private async saveSummaryNote(summary: string) {
    const today = formatDate(new Date());
    const fileName = `${today} - EOD Summary.md`;
    const folderPath = this.settings.diaryFolder;
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

    if (folderPath) {
      const folder = this.app.vault.getAbstractFileByPath(folderPath);
      if (!folder) {
        await this.app.vault.createFolder(folderPath);
      }
    }

    const existingFile = this.app.vault.getAbstractFileByPath(filePath);

    if (existingFile instanceof TFile) {
      const existingContent = await this.app.vault.read(existingFile);
      const updatedContent = this.upsertSection(
        existingContent,
        '## Summary',
        summary
      );
      await this.app.vault.modify(existingFile, updatedContent);
    } else {
      const content = `# End-of-Day Summary - ${today}\n\n## Summary\n\n${summary}\n`;
      await this.app.vault.create(filePath, content);
    }

    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (file instanceof TFile) {
      await this.app.workspace.getLeaf().openFile(file);
    }
  }
}

