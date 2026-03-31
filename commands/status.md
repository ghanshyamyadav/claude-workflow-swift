Show the current workflow status for this Swift project.

---

## Step 1: Check for `.workflow/`

If `.workflow/` does not exist in the project root:
- Tell the user: "Workflow is not initialized for this project. Run `/workflow:init` to get started."
- Stop.

---

## Step 2: Load all task states

Scan `.workflow/tasks/` for task directories (TASK-XXX format).

For each task directory found:
- Read `state.json`
- Read each step entry's `steps/STEP-XXX/state.json`

---

## Step 3: Display status

Group tasks by status and display:

```
## Workflow Status

### Active Tasks

TASK-002: Add user preferences screen  [feature]
  Status: in-progress (2 of 4 steps complete)
  Current: STEP-003 — Add PreferencesViewModel
  ✓ STEP-001: Add UserPreferences model
  ✓ STEP-002: Add PreferencesService
  ● STEP-003: Add PreferencesViewModel [in-progress]
  ○ STEP-004: Add PreferencesView [pending]

TASK-003: Fix login crash on iOS 16  [bug fix]
  Status: blocked
  ✗ STEP-002: Update AuthViewModel async handling [failed]
  Error: "Expression is 'async' but is not marked with 'await'"
  → Run `/workflow:resume TASK-003` to retry

---

### Completed Tasks

✓ TASK-001: Add dark mode support  [feature]  (completed 2026-03-28)

---

### Summary
Active: 1 | Blocked: 1 | Completed: 1
```

Status icons:
- `✓` completed
- `●` in-progress
- `○` pending
- `✗` failed

---

## Step 4: Suggest next actions

Based on what's active:
- If a task is `blocked` → "Run `/workflow:resume TASK-XXX` to retry from the failed step"
- If all steps complete but not closed → "Run `/workflow:close TASK-XXX` to write the summary"
- If nothing active → "Run `/workflow:task <description>` to start a new task"
