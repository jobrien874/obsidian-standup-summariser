import { TFile, Vault } from 'obsidian';
import { getStartOfToday } from '../utils/date';
import { GitCommitInfo } from './git';

export interface NoteInfo {
  file: TFile;
  content: string;
}

export async function getTodaysModifiedNotes(vault: Vault): Promise<NoteInfo[]> {
  const files = vault.getMarkdownFiles();
  const startOfToday = getStartOfToday();
  const todaysFiles: NoteInfo[] = [];

  for (const file of files) {
    const stat = await vault.adapter.stat(file.path);
    if (!stat) continue;

    if (stat.mtime >= startOfToday) {
      const content = await vault.read(file);
      todaysFiles.push({ file, content });
    }
  }

  return todaysFiles;
}

export function compileContext(
  notes: NoteInfo[],
  repoCommits: GitCommitInfo[],
  charBudget: number
): string {
  let context = '# Today\'s Activity\n\n';

  const totalCommits = repoCommits.reduce((sum, repo) => sum + repo.commits.length, 0);

  if (totalCommits > 0) {
    context += '## Git Commits\n\n';

    for (const { repo, commits } of repoCommits) {
      if (commits.length > 0) {
        context += `### ${repo}\n\n`;
        commits.forEach(commit => {
          context += `- ${commit}\n`;
        });
        context += '\n';
      }
    }
  }

  if (notes.length > 0) {
    context += '## Modified Notes\n\n';

    let totalChars = 0;
    for (const { file, content } of notes) {
      const noteHeader = `### ${file.basename}\n\n`;
      const noteContent = content + '\n\n';

      if (totalChars + noteHeader.length + noteContent.length > charBudget) {
        const remaining = charBudget - totalChars - noteHeader.length;
        if (remaining > 100) {
          context += noteHeader;
          context += noteContent.slice(0, remaining) + '\n...(truncated)\n\n';
        }
        break;
      }

      context += noteHeader + noteContent;
      totalChars += noteHeader.length + noteContent.length;
    }
  }

  return context;
}
