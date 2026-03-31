You are creating a new workflow task for a Swift project and executing it via stateful, isolated steps.

Task request: $ARGUMENTS

---

## PHASE 1: Setup

### 1.1 Verify prerequisites
- Check that `.workflow/` exists in the current project root.
- If it does not exist, stop and tell the user: "Run `/workflow:init` first to initialize project memory."

### 1.2 Determine task ID
- List all directories inside `.workflow/tasks/`
- Find the highest existing TASK number
- Next ID = TASK-001 if none exist, otherwise increment (TASK-002, TASK-003, ...)
- Always zero-pad to 3 digits

### 1.3 Load project memory

Always read in full (kept small by design):
- `.workflow/project/overview.md`
- `.workflow/project/search-hints.md`
- `.workflow/project/decisions.md`

Search, don't load in full:
- Extract 3–5 keywords from the task request (use Swift type names, feature names, domain terms, verbs)
- Grep those keywords across:
  - `.workflow/project/module-map.md`
  - `.workflow/project/symbols-index.md`
  - `.workflow/project/dependency-map.md`
  - `.workflow/project/data-flow.md`
  - `.workflow/project/call-graph.md`
  - `.workflow/project/concepts.md`
- Read only the matching sections (with surrounding context) from each file
- Do not read these files in full unless fewer than 5 lines matched across all six
- If concepts.md contains a matching domain term or business rule, include it in the Relevant Context section of task.md

---

## PHASE 2: Focused exploration

### 2.1 Identify relevant Swift types and modules

Based on the task request and project memory, list which types and files are likely involved. Think in Swift terms:
- Which **Views** or **ViewControllers** are affected?
- Which **ViewModels** own the relevant state or logic?
- Which **Services** or **Repositories** handle the data?
- Which **Models** (struct/class/enum) are touched?
- Which **Protocols** define relevant contracts?
- Which **Extensions** add relevant behaviour?

Do NOT read source files yet.

### 2.2 Clarify ambiguities (if needed)
If the request is ambiguous or underspecified, ask the user up to 3 focused questions before continuing. Wait for answers.

### 2.3 Read relevant source files

Use `symbols-index.md` to find file paths, then grep source files using Swift patterns:

**Finding a function:**
```
grep -n "func functionName" path/to/file.swift
```

**Finding a type:**
```
grep -n "class\|struct\|enum\|protocol\|actor TypeName" path/to/file.swift
```

**Finding an extension:**
```
grep -n "extension TypeName" path/to/file.swift
```

**Finding a property wrapper or annotation:**
```
grep -n "@MainActor\|@Observable\|@Model\|@State\|@Published" path/to/file.swift
```

Rules:
- Read only the files needed to understand the implementation area
- **Hard limit: maximum 8 source files**
- For large files, read only the relevant sections (target type, function, extension block)
- Capture the exact code surrounding each change point — embed these snippets in step plans

---

## PHASE 3: Create task workspace

Create directory: `.workflow/tasks/TASK-XXX/`

### 3.1 Write `task.md`

```markdown
# TASK-XXX: [Task Name]

## Request
[Original request verbatim]

## Type
[bug fix / feature / refactor / chore / other]

## Swift Context
- Affected layers: [View / ViewModel / Service / Model / Protocol / Extension]
- Concurrency impact: [yes/no — async/await, @MainActor, actor isolation]
- UI framework: [SwiftUI / UIKit / both]
- Persistence impact: [yes/no — SwiftData/CoreData schema change?]

## Requirements
- [Bullet: what must be done]

## Acceptance Criteria
- [ ] [Specific, verifiable condition]
- [ ] Builds without errors (`xcodebuild build` or `swift build`)
- [ ] Existing tests pass
- [ ] [Any new tests required]

## Scope
**In scope**: [what will be touched]
**Out of scope**: [what will NOT be touched — be explicit]

## Relevant Context
[Key facts from exploration: existing patterns, protocol contracts, actor boundaries, property wrappers in use, SwiftUI view hierarchy, Combine pipelines]
```

### 3.2 Decompose into steps

Break the task into discrete, independently-executable steps. Rules:
- Each step touches a focused set of files (ideally 1-3 Swift files)
- Steps follow Swift layering order: Models → Protocols → Services → ViewModels → Views
- Each step must be completable by an agent with zero broader project knowledge
- A simple task may have 1-2 steps; a complex one may have 5-10
- Include a build/test verification step at the end for non-trivial tasks

### 3.3 For each step, create `steps/STEP-XXX/`

Zero-pad step numbers to 3 digits (STEP-001, STEP-002, ...).

**Write `steps/STEP-XXX/step.md`**:

```markdown
# STEP-XXX: [Step Name]

## Part of
TASK-XXX — [Task Name]

## What to do
[Clear, self-contained description. Written so an agent with no other context can understand it. Include Swift-specific details: which type to modify, which protocol to conform to, which property wrapper to use.]

## Files to read
- `path/to/File.swift` lines X–Y — [why: e.g., understand existing ViewModel structure]

## Files to modify
- `path/to/File.swift` — [what changes: e.g., add async func, add @Published property]

## New files to create
- `path/to/NewFile.swift` — [what it contains: e.g., @Model struct for SwiftData]

## Depends on
- STEP-00X must be completed first (or "None")

## Definition of done
- [ ] [Specific verifiable condition]
- [ ] Compiles without errors or warnings
```

**Write `steps/STEP-XXX/plan.md`**:

This is the surgical implementation guide. It must be detailed enough that the agent executes the step without reading any file not listed in step.md.

```markdown
# Plan: STEP-XXX — [Step Name]

## Step 1: [Action title]
**File**: `path/to/File.swift`
**Location**: [type name / function name / extension block]
**Action**: [add / modify / remove / create]
**What**: [Precise description of the change]

Existing code at this location:
```swift
[paste the exact surrounding Swift code the agent needs to see]
```

Change to / Insert after:
```swift
[the new or modified Swift code]
```

## Step 2: [Action title]
[repeat structure]

## Swift-specific notes
- [e.g., Mark with @MainActor if updating UI from async context]
- [e.g., Conform to Sendable if passing across actor boundaries]
- [e.g., Use weak self in Combine sink to avoid retain cycles]

## Verification
- Build: `xcodebuild build -scheme <Scheme>` or `swift build`
- Test: `xcodebuild test -scheme <Scheme> -destination 'platform=iOS Simulator,name=iPhone 16'` or `swift test`
- [Any specific behaviour to observe or output to check]
```

**Write `steps/STEP-XXX/state.json`**:

```json
{
  "id": "STEP-XXX",
  "task_id": "TASK-XXX",
  "title": "[Step title]",
  "status": "pending",
  "touched_files": [],
  "started_at": null,
  "completed_at": null,
  "error": null
}
```

### 3.4 Write task-level `state.json`

```json
{
  "id": "TASK-XXX",
  "title": "[Task Name]",
  "type": "[bug fix / feature / refactor / chore]",
  "status": "in-progress",
  "steps": [
    { "id": "STEP-001", "title": "...", "status": "pending" },
    { "id": "STEP-002", "title": "...", "status": "pending" }
  ],
  "current_step": "STEP-001",
  "started_at": "[YYYY-MM-DD]",
  "completed_at": null
}
```

---

## PHASE 4: Present plan and confirm

Show the user:

```
## TASK-XXX: [Task Name]  [type]

**Swift layers affected:** [View / ViewModel / Service / Model / ...]

**Steps:**
1. STEP-001: [title] — [one-line description]
2. STEP-002: [title] — [one-line description]
...

**Files that will be touched:**
- path/to/File.swift
- path/to/OtherFile.swift

Proceed with execution? (yes/no)
```

Wait for user confirmation before executing.

---

## PHASE 5: Execute steps sequentially

For each step in order (STEP-001, STEP-002, ...):

### 5.1 Mark step as in-progress
Update `steps/STEP-XXX/state.json`:
- `"status": "in-progress"`
- `"started_at": "[YYYY-MM-DD]"`

Update task `state.json`:
- `"current_step": "STEP-XXX"`
- Update the step entry's status in the `steps` array

### 5.2 Spawn a subagent for this step

Use the Agent tool with this prompt:

```
You are implementing STEP-XXX as part of TASK-XXX in a Swift project.

Your ONLY job is to implement what is described in the step files below. Do not read or modify any files not explicitly listed in step.md.

Step 1: Read `.workflow/tasks/TASK-XXX/steps/STEP-XXX/step.md` — understand what to do
Step 2: Read `.workflow/tasks/TASK-XXX/steps/STEP-XXX/plan.md` — follow the implementation steps exactly
Step 3: Read only the files listed under "Files to read" in step.md
Step 4: Implement the changes described in plan.md exactly as specified

Swift implementation rules:
- Respect existing concurrency patterns: if the project uses async/await, do not introduce Combine or GCD
- Mark functions or types @MainActor if they update UI from an async context
- Use weak self in closures that could cause retain cycles (Combine sinks, completion handlers)
- Conform new types to Sendable if they cross actor boundaries
- Do not change access control (public/internal/private) beyond what the plan specifies
- Do not add @discardableResult, force unwraps (!), or try! unless explicitly specified in the plan

Step 5: Run the verification commands listed in the Verification section of plan.md.
- If verification fails (build error, test failure), do NOT mark the step complete.
- Fix the issue first, then re-run verification until it passes.
- If you cannot fix it, proceed to Step 6 and report the error.

Step 6: Update ONLY `.workflow/tasks/TASK-XXX/steps/STEP-XXX/state.json` — do NOT touch the task-level state.json:
- On success:
  - Set "status" to "completed"
  - Set "touched_files" to the list of files you modified or created
  - Set "completed_at" to today's date (YYYY-MM-DD)
- On failure (unresolvable error or failed verification):
  - Set "status" to "failed"
  - Set "error" to a precise description — include compiler error text if applicable
```

### 5.3 After subagent completes

Read `steps/STEP-XXX/state.json` to check the result.

**If status is "completed"**:
- Update task `state.json` step entry status to `"completed"`
- Proceed to next step

**If status is "failed"**:
- Update task `state.json` status to `"blocked"`
- Report to user: which step failed, what the error was
- Stop execution. User should run `/workflow:resume TASK-XXX` after resolving.

### 5.4 After all steps complete

Update task `state.json`:
- `"status": "completed"`
- `"completed_at": "[YYYY-MM-DD]"`

Tell the user: "TASK-XXX complete. Run `/workflow:close TASK-XXX` to write the summary and update project memory."
