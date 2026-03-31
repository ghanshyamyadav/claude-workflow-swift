You are resuming an in-progress or blocked workflow task in a Swift project.

Task ID: $ARGUMENTS  (e.g. TASK-001)

---

## Step 1: Load task state

Read `.workflow/tasks/TASK-XXX/state.json`

- If status is `"completed"` → tell user: "TASK-XXX is already complete. Run `/workflow:close TASK-XXX` if you haven't already."
- If status is `"pending"` → tell user: "TASK-XXX hasn't started yet. Run `/workflow:task` to begin."

---

## Step 2: Find the first incomplete step

Scan the `steps` array in task `state.json`. Find the first step where status is `"pending"`, `"in-progress"`, or `"failed"`.

Read that step's `steps/STEP-XXX/state.json` for details.

**If status is `"in-progress"`**: the subagent was spawned but crashed or stalled before updating state. Treat it as `"failed"` with error: "Step was in-progress but never completed — likely a subagent crash. Re-running from scratch." Reset status to `"pending"` and proceed to Step 3.

---

## Step 3: Handle failed steps

If the step status is `"failed"`:
1. Read `steps/STEP-XXX/state.json` — note the `error` field
2. Read `steps/STEP-XXX/step.md` and `steps/STEP-XXX/plan.md`
3. Diagnose the failure:
   - Is the plan incorrect or missing information?
   - Was there a Swift compile error (type mismatch, missing conformance, actor isolation violation)?
   - Was there a missing import or SPM dependency?
   - Was it an Xcode / toolchain environment issue?
4. If the plan needs correction:
   - Update `steps/STEP-XXX/plan.md` with the fix
   - Tell the user what was wrong and what was corrected
5. Reset the step state:
   - `"status": "pending"`, `"error": null`, `"started_at": null`, `"completed_at": null`

---

## Step 4: Show resume point to user

```
Resuming TASK-XXX: [Task Name]

Completed steps:
  ✓ STEP-001: [title]
  ✓ STEP-002: [title]

Resuming from:
  ○ STEP-003: [title] — [one-line description]

Remaining steps:
  ○ STEP-003: [title]
  ○ STEP-004: [title]

Proceed? (yes/no)
```

Wait for user confirmation.

---

## Step 5: Execute remaining steps

For each remaining step in order:

1. Update `steps/STEP-XXX/state.json`: `"status": "in-progress"`, set `started_at`
2. Update task `state.json`: `"current_step": "STEP-XXX"`, update step entry status
3. Spawn subagent with this prompt:

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
- Use weak self in closures that could cause retain cycles
- Conform new types to Sendable if they cross actor boundaries
- Do not change access control beyond what the plan specifies
- Do not add force unwraps (!) or try! unless explicitly specified in the plan

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

4. After subagent completes, read step `state.json`:
   - `"completed"` → update task state, continue to next step
   - `"failed"` → update task state to `"blocked"`, report error to user, stop

---

## Step 6: On full completion

Update task `state.json`:
- `"status": "completed"`
- `"completed_at": "[YYYY-MM-DD]"`

Tell user: "TASK-XXX complete. Run `/workflow:close TASK-XXX` to finalize."
