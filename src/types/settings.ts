export interface DiarySettings {
  anthropicApiKey: string;
  model: string;
  diaryFolder: string;
  charBudget: number;
  includeBacklinks: boolean;
  gitRepositories: string[];
  includeVaultGit: boolean;
}

export const DEFAULT_SETTINGS: DiarySettings = {
  anthropicApiKey: "",
  model: "claude-sonnet-4-20250514",
  diaryFolder: "Diary",
  charBudget: 60_000,
  includeBacklinks: true,
  gitRepositories: [],
  includeVaultGit: true,
};
