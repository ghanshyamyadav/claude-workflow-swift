You are refreshing the project memory for a Swift project after code changes that have made some `.workflow/project/` files stale.

Arguments: $ARGUMENTS
Valid targets: `all`, `structure`, `symbols`, `dependencies`, `callgraph`, `concepts`, `decisions`, or blank (shows menu)

---

## Step 1: Check prerequisites

- Verify `.workflow/project/` exists. If not, stop: "Run `/workflow:init` first."
- Read `.workflow/project/overview.md` to orient yourself on the project.

---

## Step 2: Determine what to update

If `$ARGUMENTS` is blank, show this menu and ask the user what to update:

```
Which project memory files do you want to refresh?

  [1] structure     — module-map.md + symbols-index.md (new/moved/deleted files or directories)
  [2] symbols       — symbols-index.md only (types renamed, moved, or added)
  [3] dependencies  — dependency-map.md (new packages, changed protocol conformances)
  [4] callgraph     — call-graph.md (add new entries, prune stale ones)
  [5] concepts      — concepts.md (domain terms, business rules, conventions, constraints)
  [6] decisions     — decisions.md (new or updated architectural decisions)
  [7] all           — refresh all of the above

Enter number(s) or target name(s), comma-separated (e.g. "1,4" or "structure,callgraph"):
```

Wait for the user's answer, then proceed with the selected targets.

If `$ARGUMENTS` is a valid target name or number, skip the menu and proceed directly.

---

## Step 3: Execute selected updates

Run only the steps for selected targets.

---

### `structure` — Refresh `module-map.md` and `symbols-index.md`

1. Re-scan the project directory to 2 levels deep
2. Read the current `module-map.md`
3. Identify: new directories not in module-map, removed directories still listed, renamed modules
4. Add entries for new directories (purpose, key files, exports)
5. Remove entries for directories that no longer exist
6. Update entries for renamed directories
7. Read the current `symbols-index.md`
8. For each changed directory: add new types, remove deleted types, update file paths for moved types
9. Report: added N entries, removed N entries, updated N entries

---

### `symbols` — Refresh `symbols-index.md` only

1. Read the current `symbols-index.md`
2. Re-scan Swift source files to find types (struct, class, enum, protocol, actor, extension)
3. For each entry in `symbols-index.md`: verify the file path still exists and the type name is still defined there
4. Remove entries where the file no longer exists or the type is not found
5. Add new types not currently indexed — apply the same judgment as init (only types likely to be touched during work: ViewModels, Services, Models, key Views)
6. Do NOT index every minor helper type
7. Report what changed

---

### `dependencies` — Refresh `dependency-map.md`

1. Re-read `Package.swift` or `Podfile` for external dependencies
2. Read the current `dependency-map.md`
3. Add new external dependencies not yet listed (note where they're used)
4. Remove external dependencies no longer in the manifest
5. Scan for new or changed protocol conformances: `grep -rn "extension.*:.*{" --include="*.swift"`
6. Add new conformances; remove conformances for deleted types
7. Report what changed

---

### `callgraph` — Refresh `call-graph.md`

1. Read the current `call-graph.md`
2. For each `##` entry, verify:
   - The listed file still exists
   - The function still appears in that file (`grep "func functionName" path/to/file.swift`)
   - If file or function is gone: remove the entry
3. Check recent task `touched_files` (scan `.workflow/tasks/*/steps/*/state.json`) to find recently-changed files
4. For those files, scan for exported functions, service methods, and view model actions not yet in the call graph
5. Add entries for new functions using the standard format:
   ```
   ## functionName
   File: path/to/file.swift
   Called by: [callers or "none (entry point)"]
   Calls: [callees or "none"]
   ```
6. Report: added N, pruned N stale

---

### `concepts` — Update `concepts.md`

This file contains manually-curated knowledge. Do NOT overwrite or reorganize existing entries.

1. Read the current `concepts.md`
2. Ask the user: "What prompted this update? (e.g., new feature merged, business rule discovered, convention changed)"
3. Based on their answer and recent task summaries (read `.workflow/tasks/*/summary.md` for recent tasks), identify what to add:
   - **Domain terms**: types or concepts introduced that aren't yet defined
   - **Business rules**: constraints discovered during implementation
   - **Conventions**: patterns established or confirmed
   - **Constraints**: limitations encountered (server, legal, platform)
4. For new items: add under the appropriate section using `##` header format
5. For updates to existing entries: edit in place — do not duplicate
6. Report what was added or updated

---

### `decisions` — Update `decisions.md`

This file contains manually-curated architectural decisions. Do NOT overwrite existing entries.

1. Read the current `decisions.md`
2. Ask the user: "What decision are you recording, or what changed?"
3. Add a new `###` entry with:
   - `**Decision**:` — what was chosen
   - `**Reason**:` — why
   - `**Rejected alternatives**:` — what else was considered and why it was not chosen
   - `**Impact on future work**:` — what this means for agents implementing future tasks
4. For updates to existing entries: edit in place, do not create a duplicate
5. Report what was added or updated

---

### `all` — Run all targets

Run `structure`, `dependencies`, `callgraph` in sequence (no interaction needed).

Then run `concepts` and `decisions` interactively — ask once for each.

If the user is clearly doing a post-refactor refresh and has no specific concepts or decisions to record, skip those two and tell them: "Run `/workflow:update concepts` or `/workflow:update decisions` when you have specific items to add."

---

## Step 4: Report

After all selected updates complete:

```
Project memory updated.

  module-map.md     — [N added, N removed / unchanged]
  symbols-index.md  — [N added, N removed / unchanged]
  dependency-map.md — [updated / unchanged]
  call-graph.md     — [N added, N pruned / unchanged]
  concepts.md       — [N entries added or updated / unchanged]
  decisions.md      — [N entries added or updated / unchanged]

Run `/workflow:task <description>` to start a new task with fresh context.
```
