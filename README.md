# Stand Up Summariser (Claude)

Ever get to the end of the day and think "wait, what did I even do today?" Yeah, me too.

This Obsidian plugin is your personal work journal assistant. It looks at all the notes you edited today and the git commits you made across all your projects, then uses Claude AI to write you a nice summary of what you actually accomplished. Perfect for daily stand-ups, end-of-day reflections, or just remembering what the heck you were working on.

## What It Does

- Automatically finds all the notes you edited today
- **Tracks git commits across multiple repositories** - not just your vault, but all your code projects too
- Uses Claude AI to turn all that into an actual readable summary
- Saves everything to a daily note so you have a record
- Quick access via ribbon icon or command palette

## Setup

### 1. Install the Plugin

Copy these files to your vault's `.obsidian/plugins/stand-up-summariser/` folder:
- `main.js`
- `manifest.json`

Then enable the plugin in Obsidian Settings → Community Plugins.

### 2. Configure the Plugin

1. Go to Settings → Stand Up Summariser (Claude)
2. Add your Anthropic API Key (grab one from [https://console.anthropic.com/](https://console.anthropic.com/) if you don't have one)
3. Configure the basics:
   - **Model**: Which Claude model to use (default: `claude-sonnet-4-20250514`)
   - **Diary folder**: Where to save your summaries (default: `Diary`)
   - **Character budget**: How much of your notes to send to Claude (default: 60,000 - should be plenty)
   - **Include backlinks**: Whether to include backlinks in the context (default: true)

4. Set up Git tracking (optional but recommended):
   - **Include vault git commits**: Check this if your Obsidian vault is a git repo
   - **External Git Repositories**: Add paths to your other code projects
     - Click "Add Repository" and paste the full path (like `C:\Users\Josh\Projects\my-app` or `/home/josh/code/my-project`)
     - Add as many as you want - this is how it knows about all your work, not just your notes

## Usage

### Generate a Summary

Three ways to do this:

1. **Click the calendar icon** in the left sidebar
2. **Open command palette** (`Ctrl/Cmd + P`) and search for "Generate Stand-Up Summary"
3. **Set a hotkey** in Obsidian settings if you're fancy like that

### What Gets Included

The plugin grabs:

- All the notes you edited today
- Git commits from today across all your configured repos
- Everything gets organized by repository so you can see what you worked on where

### What You Get

<img width="746" height="593" alt="image" src="https://github.com/user-attachments/assets/56e806fc-b1f4-4458-b155-1f8022836559" />

Your summary will be saved as `YYYY-MM-DD - EOD Summary.md` in your Diary folder, and it'll include:

- All your git commits, organized by project
- A Claude-generated summary that actually makes sense, covering:
  - What you worked on
  - Key decisions or insights
  - Problems you solved (or are still wrestling with)
  - What's next

### Example Summary Structure

```markdown
# End-of-Day Summary - 2025-01-15

## Summary

### Git Commits

#### my-web-app
- abc1234 - Add user authentication (John Doe, 2 hours ago)
- def5678 - Fix navigation bug (John Doe, 4 hours ago)

#### obsidian-plugin
- 9ab0123 - Implement new feature (John Doe, 6 hours ago)

#### Obsidian Vault
- 4cd5678 - Updated project notes (John Doe, 1 hour ago)

## Modified Notes

### Project Planning
...

[Claude's intelligent summary of your day]
```

## Development

Want to hack on this? Cool.

### Build from Source

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Development mode (watch for changes)
npm run dev
```

### Project Structure

The code is now nicely organized into modules:

- `src/main.ts` - Main plugin orchestration
- `src/types/settings.ts` - Settings interface and defaults
- `src/utils/date.ts` - Date utilities
- `src/services/git.ts` - Git commit fetching
- `src/services/notes.ts` - Note collection and context building
- `src/services/claude.ts` - Claude API integration
- `src/ui/settings-tab.ts` - Settings UI

## Requirements

- Obsidian v1.5.0 or higher
- An Anthropic API key (they're pretty cheap)
- Git installed if you want commit tracking (optional but recommended)

## Privacy & Security

Your data stays private:

- API key is stored locally in your vault
- Notes and commits are only sent to Anthropic's Claude API for the summary
- Nothing is stored anywhere else
- Uses Obsidian's native secure HTTP requests

## Troubleshooting

### "Browser-like environment" error

This has been fixed! The plugin now uses Obsidian's native HTTP API, so it just works.

### No commits showing up

- Make sure Git is installed (try running `git --version` in your terminal)
- Double-check your repository paths in settings
- Verify you actually made commits today (we've all been there)
- The commits have to be from today - yesterday doesn't count!

### API errors

- Check your Anthropic API key is correct
- Make sure you have credits in your Anthropic account
- Verify you're connected to the internet

## License

MIT - do whatever you want with it.

## Support & Contributing

Find a bug? Have an idea? Open an issue on GitHub and let's chat.

If this plugin saves you time (or sanity), consider buying me a coffee! It helps keep the project going.

<a href="https://www.buymeacoffee.com/jobrien874" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
