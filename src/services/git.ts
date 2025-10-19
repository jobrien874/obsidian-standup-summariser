import { formatDate } from '../utils/date';

export interface GitCommitInfo {
  repo: string;
  commits: string[];
}

export async function getGitCommitsFromRepo(
  repoPath: string,
  repoName?: string
): Promise<GitCommitInfo> {
  try {
    const today = formatDate(new Date());
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    const { stdout } = await execAsync(
      `git log --since="${today} 00:00:00" --pretty=format:"%h - %s (%an, %ar)" --no-merges`,
      { cwd: repoPath }
    );

    const commits = stdout.trim() ? stdout.split('\n') : [];
    const displayName = repoName || repoPath.split(/[/\\]/).pop() || repoPath;

    return { repo: displayName, commits };
  } catch (error) {
    console.log(`Git not available or not a git repository at: ${repoPath}`);
    return { repo: repoPath, commits: [] };
  }
}

export async function getTodaysGitCommits(
  vaultPath: string,
  includeVaultGit: boolean,
  externalRepositories: string[]
): Promise<GitCommitInfo[]> {
  const allRepoCommits: GitCommitInfo[] = [];

  if (includeVaultGit) {
    const vaultCommits = await getGitCommitsFromRepo(vaultPath, 'Obsidian Vault');
    if (vaultCommits.commits.length > 0) {
      allRepoCommits.push(vaultCommits);
    }
  }

  for (const repoPath of externalRepositories) {
    if (!repoPath.trim()) continue;

    const repoCommits = await getGitCommitsFromRepo(repoPath.trim());
    if (repoCommits.commits.length > 0) {
      allRepoCommits.push(repoCommits);
    }
  }

  return allRepoCommits;
}
