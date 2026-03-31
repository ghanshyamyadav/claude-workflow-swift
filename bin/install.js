#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SOURCE = path.join(__dirname, '..', 'commands');
const TARGET = path.join(process.env.HOME, '.claude', 'commands', 'workflow-swift');

function copyFiles() {
  fs.mkdirSync(TARGET, { recursive: true });
  const files = fs.readdirSync(SOURCE).filter(f => f.endsWith('.md'));
  for (const file of files) {
    fs.copyFileSync(path.join(SOURCE, file), path.join(TARGET, file));
  }
  printSuccess();
}

function printSuccess() {
  console.log('');
  console.log(`workflow-swift installed to ${TARGET}`);
  console.log('');
  console.log('Available commands (in any Swift/Xcode project):');
  console.log('  /workflow-swift:init    — Scan project and create .workflow/project/ memory files');
  console.log('  /workflow-swift:task    — Start a new task: plan, decompose into steps, execute');
  console.log('  /workflow-swift:status  — Show all tasks and their step-level progress');
  console.log('  /workflow-swift:resume  — Resume a blocked or in-progress task from last step');
  console.log('  /workflow-swift:close   — Finalize a task: write summary, update project memory');
  console.log('  /workflow-swift:update  — Refresh stale project memory after merges or refactors');
  console.log('');
  console.log('Getting started:');
  console.log('  1. cd into your Xcode or SPM project root');
  console.log('  2. Run /workflow-swift:init to build Swift project memory');
  console.log('  3. Run /workflow-swift:task <description> to start working');
  console.log('');
  console.log('Tip: Run /workflow-swift:init once per project. It maps your Swift types,');
  console.log('     architecture pattern, and data flows so future tasks stay focused.');
}

if (fs.existsSync(TARGET)) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question(`Existing workflow installation found at ${TARGET}\nOverwrite with workflow-swift? (y/n) `, (answer) => {
    rl.close();
    if (answer.toLowerCase() === 'y') {
      copyFiles();
    } else {
      console.log('Aborted.');
    }
  });
} else {
  copyFiles();
}
