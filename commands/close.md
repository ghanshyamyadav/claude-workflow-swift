You are closing a completed workflow task in a Swift project and updating project memory.

Task ID: $ARGUMENTS  (e.g. TASK-001)

---

## Step 1: Load task state

Read:
- `.workflow/tasks/TASK-XXX/state.json`
- `.workflow/tasks/TASK-XXX/task.md`
- Each `steps/STEP-XXX/state.json`

---

## Step 2: Verify all steps are complete

Check that every step in the `steps` array has `"status": "completed"`.

If any step is `"pending"`, `"in-progress"`, or `"failed"`:
- Warn the user: "Not all steps are complete. Run `/workflow:resume TASK-XXX` to finish execution."
- Ask: "Force-close anyway? (yes/no)"
- If no: stop.
- If yes: proceed, noting incomplete steps in the summary.

---

## Step 3: Collect all touched files

Aggregate `touched_files` from every step's `state.json` into a deduplicated list.

---

## Step 4: Write `summary.md`

```markdown
# TASK-XXX: [Task Name] — Summary

## What was done
[2-4 sentences describing what was implemented/fixed/changed and how]

## Swift layers changed
- [e.g., Model: added `UserPreferences` struct]
- [e.g., Service: added `fetchPreferences()` async func to `UserService`]
- [e.g., ViewModel: added `@Published var preferences` and load logic]
- [e.g., View: added preferences section to `SettingsView`]

## Files changed
- `path/to/File.swift` — [what changed]

## New files created
- `path/to/NewFile.swift` — [what it does]

## Steps completed
- ✓ STEP-001: [title]
- ✓ STEP-002: [title]
- ✗ STEP-003: [title] (incomplete — forced close) [only if applicable]

## Notes for future agents
[Non-obvious decisions, Swift-specific tradeoffs, patterns introduced, actor boundaries established, Combine pipelines added, protocol conformances added — anything relevant when touching these files again]
```

---

## Step 5: Update project memory (if warranted)

Only update if the task introduced something meaningfully new. Ask yourself:
- Were new Swift types (struct/class/enum/actor/protocol) created?
- Were new services, view models, or views added?
- Were new protocol conformances established that affect the dependency map?
- Were new functions added that belong in the call graph?
- Was a new architectural pattern or concurrency approach introduced?
- Were new SPM packages or CocoaPods added?

If yes, update the relevant files:

**`.workflow/project/module-map.md`** — add entries for new feature modules or directories

**`.workflow/project/symbols-index.md`** — add new types with file paths (no line numbers)

**`.workflow/project/dependency-map.md`** — add new module dependencies or protocol conformances

**`.workflow/project/call-graph.md`** — add `##` blocks for new exported functions or service methods that other types will call. If an existing entry's callers or callees changed (function moved, renamed, or removed), update or remove that entry. Do not let stale entries accumulate.

**`.workflow/project/decisions.md`** — add entry if a non-obvious architectural decision was made (e.g., chose actor over class for thread safety, chose SwiftData over CoreData for a new model). Always include `**Rejected alternatives:**` — even if "none considered" — so future agents don't re-litigate the same decision.

**`.workflow/project/concepts.md`** — update if the task revealed:
- A domain term not yet defined (new model type, new business entity)
- A business rule enforced in this code (e.g., "only one active session per user — enforced in `SessionService.activate()`")
- A non-obvious project convention established or confirmed (e.g., "all async service methods are `nonisolated` — callers handle `@MainActor` transition")
- A constraint encountered (e.g., "API rate-limited to 60 req/min — observed in `NetworkClient` error handling")
Do NOT update for routine changes. Only add entries that would help a future agent avoid a wrong decision.

Do NOT update project memory for routine changes (fixing a bug, adding a field to an existing model, updating a label, tweaking layout).

---

## Step 6: Mark task complete

Update `.workflow/tasks/TASK-XXX/state.json`:
- `"status": "completed"`
- `"completed_at": "[YYYY-MM-DD]"`

---

## Done

Tell the user:
```
TASK-XXX closed.

Summary written to .workflow/tasks/TASK-XXX/summary.md
Files changed: [N files]
Project memory updated: [yes/no — what was updated]
```
