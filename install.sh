#!/bin/bash
# Installs workflow-swift commands to ~/.claude/commands/workflow/
# After installation, commands are available globally in any Swift project.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE="$SCRIPT_DIR/.claude/commands/workflow"
TARGET="$HOME/.claude/commands/workflow"

if [ ! -d "$SOURCE" ]; then
  echo "Error: commands not found at $SOURCE"
  echo "Make sure you're running this from the workflow-swift directory."
  exit 1
fi

if [ -d "$TARGET" ]; then
  echo "Existing workflow installation found at $TARGET"
  read -p "Overwrite with workflow-swift? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi
fi

mkdir -p "$TARGET"
cp "$SOURCE/"*.md "$TARGET/"

chmod +x "$TARGET/"*.md 2>/dev/null || true

echo ""
echo "workflow-swift installed to $TARGET"
echo ""
echo "Available commands (in any Swift/Xcode project):"
echo "  /workflow:init    — Scan project and create .workflow/project/ memory files"
echo "  /workflow:task    — Start a new task: plan, decompose into steps, execute"
echo "  /workflow:status  — Show all tasks and their step-level progress"
echo "  /workflow:resume  — Resume a blocked or in-progress task from last step"
echo "  /workflow:close   — Finalize a task: write summary, update project memory"
echo "  /workflow:update  — Refresh stale project memory after merges or refactors"
echo ""
echo "Getting started:"
echo "  1. cd into your Xcode or SPM project root"
echo "  2. Run /workflow:init to build Swift project memory"
echo "  3. Run /workflow:task <description> to start working"
echo ""
echo "Tip: Run /workflow:init once per project. It maps your Swift types,"
echo "     architecture pattern, and data flows so future tasks stay focused."
