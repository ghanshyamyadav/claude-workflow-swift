# claude-workflow-swift

Claude Code workflow commands for Swift/Xcode projects.

Installs `/workflow-swift:*` slash commands globally into Claude Code, enabling structured, memory-efficient feature development in any Swift or Xcode project.

## Installation

```bash
npx github:ghanshyamyadav/claude-workflow-swift
```

That's it. No cloning required.

## What Gets Installed

Commands are copied to `~/.claude/commands/workflow/`, making them available in every project:

| Command | Description |
|---|---|
| `/workflow-swift:init` | Scan project and build `.workflow/project/` memory files |
| `/workflow-swift:task` | Start a task: plan, decompose into steps, execute |
| `/workflow-swift:status` | Show all tasks and step-level progress |
| `/workflow-swift:resume` | Resume a blocked or in-progress task |
| `/workflow-swift:close` | Finalize a task: write summary, update project memory |
| `/workflow-swift:update` | Refresh stale project memory after merges or refactors |

## Quick Start

```bash
# 1. Install
npx github:ghanshyamyadav/claude-workflow-swift

# 2. In your Xcode or SPM project, open Claude Code and run:
/workflow-swift:init

# 3. Start a task
/workflow-swift:task Add dark mode support
```

## How It Works

Workflow gives Claude Code structured memory and disciplined exploration for your Swift projects:

- **`/workflow-swift:init`** — run once per project. Maps your Swift types, architecture pattern, and data flows into small indexed files under `.workflow/project/`.
- **`/workflow-swift:task`** — each task gets its own workspace with a plan, step tracker, and summary. Claude reads only what's relevant.
- **`/workflow-swift:update`** — keeps project memory fresh after merges or large refactors.

## Requirements

- [Claude Code](https://claude.ai/code)
- Node.js 14+

## Repository

[github.com/ghanshyamyadav/claude-workflow-swift](https://github.com/ghanshyamyadav/claude-workflow-swift)
