You are initializing the Workflow system for a Swift project. Your job is to create focused, searchable memory files that future agents can use to navigate this codebase without reading everything.

## Prerequisites
- Run this from the root of the Swift project you want to initialize.
- If `.workflow/` already exists, confirm with the user before overwriting.

---

## Step 1: Scan the project structure

Identify the build system and project type:
- Look for `Package.swift` → Swift Package Manager
- Look for `*.xcworkspace` → CocoaPods or multi-project Xcode workspace
- Look for `*.xcodeproj` → standard Xcode project
- Look for `Podfile` → CocoaPods
- Look for `Cartfile` → Carthage

Then:
- Map directory structure to 2 levels deep
- Identify the app target name (from `*.xcodeproj` or `Package.swift`)
- Identify deployment platform: iOS / macOS / watchOS / tvOS / visionOS
- Identify minimum deployment target
- Read `Package.swift` or `Podfile` for external dependencies
- Identify UI framework: SwiftUI / UIKit / Mixed (look for `import SwiftUI`, `import UIKit`, `@main`, `AppDelegate`, `SceneDelegate`)
- Identify concurrency model: async/await / Combine / GCD (look for `async`, `await`, `Publisher`, `DispatchQueue`)
- Identify persistence: SwiftData / CoreData / UserDefaults / Realm / None (look for `@Model`, `.xcdatamodeld`, `NSManagedObject`)
- Identify architecture pattern: MVVM / MVC / TCA / VIPER / other (look for `ViewModel`, `Presenter`, `Interactor`, `Store`)

Do NOT read source files in depth yet — structure, config files, and imports only.

---

## Step 2: Configure project permissions

Create or update `.claude/settings.json` in the project root:

```json
{
  "allowedTools": [
    "Bash",
    "Edit",
    "Write",
    "Read",
    "Glob",
    "Grep",
    "WebFetch",
    "WebSearch",
    "Agent",
    "TaskCreate",
    "TaskUpdate",
    "TaskGet",
    "TaskList"
  ]
}
```

Tell the user that `.claude/settings.json` was created/updated and tools are pre-approved.

---

## Step 3: Create directories

Create:
- `.workflow/project/`
- `.workflow/tasks/`

---

## Step 4: Write `.workflow/project/overview.md`

```markdown
# Project Overview

## Purpose
[1-2 sentences: what this app does]

## Platform & Target
- Platform: [iOS / macOS / watchOS / tvOS / visionOS]
- Min deployment: [e.g., iOS 17.0]
- UI Framework: [SwiftUI / UIKit / Mixed]

## Tech Stack
- Language: Swift [version if detectable]
- Build system: [Xcode / SPM / CocoaPods / Carthage]
- Concurrency: [async/await / Combine / GCD]
- Persistence: [SwiftData / CoreData / UserDefaults / None]
- Networking: [URLSession / Alamofire / Moya / other]
- Key dependencies: [list from Package.swift or Podfile]

## Entry Points
- [e.g., `AppName/App.swift` — @main SwiftUI entry]
- [e.g., `AppName/AppDelegate.swift` — UIKit app lifecycle]
- [e.g., `AppName/ContentView.swift` — root SwiftUI view]

## Architecture Pattern
[MVVM / MVC / TCA / VIPER — with one-line description of how it's applied]

## Directory Structure
[Top-level dirs with one-line descriptions]
```

---

## Step 5: Write `.workflow/project/module-map.md`

For every significant directory or feature module:

```markdown
## path/to/module/
Purpose: [what this module is responsible for]
Key files: [FeatureView.swift, FeatureViewModel.swift, FeatureService.swift]
Exports: [key types this module exposes]
```

Cover: feature folders, Views/, ViewModels/, Models/, Services/, Networking/, Utilities/, Extensions/, Resources/.
Keep each block to 3-4 lines.

---

## Step 6: Write `.workflow/project/symbols-index.md`

List key symbols with their file paths. No line numbers — they go stale. Use the symbol name for grepping.

```markdown
## Views (SwiftUI)
- ViewName → path/to/Feature/ViewName.swift

## View Controllers (UIKit)
- ViewControllerName → path/to/ViewControllerName.swift

## ViewModels
- ViewModelName → path/to/Feature/ViewModelName.swift

## Models (struct / class / enum)
- ModelName → path/to/Models/ModelName.swift

## Protocols
- ProtocolName → path/to/Protocols/ProtocolName.swift

## Services
- ServiceName → path/to/Services/ServiceName.swift

## Extensions
- extension TypeName → path/to/Extensions/TypeName+Purpose.swift

## Actors
- ActorName → path/to/ActorName.swift
```

Only include symbols likely to be touched during work.

---

## Step 7: Write `.workflow/project/dependency-map.md`

```markdown
## Module Dependencies
- path/to/FeatureA/ → depends on → path/to/Services/AuthService  [reason: handles login]
- path/to/FeatureB/ → depends on → path/to/Models/UserModel  [reason: displays user data]

## Protocol Conformances
- ConcreteType → conforms to → ProtocolName  [where: path/to/file.swift]

## External Dependencies
- Alamofire → used in Services/NetworkClient.swift (HTTP requests)
- SwiftData → used in Models/ (@Model persistence)
- [dependency] → used in [path] ([reason])
```

---

## Step 8: Write `.workflow/project/data-flow.md`

Trace the 2–4 most important runtime flows:

```markdown
# Data Flow

## SwiftUI View Update
View → @Observable ViewModel (or @StateObject/@ObservedObject) → Service → Repository / API
Notes: ViewModel must publish on MainActor; use `await MainActor.run` or `@MainActor` for async UI updates

## UIKit View Update  
ViewController → ViewModel/Presenter → Service → Model
Notes: [delegate callbacks, completion handlers, or Combine bindings used]

## Network Request
URLSession.shared.data(for:) → JSONDecoder → Codable model → ViewModel update → View re-render
Notes: All async — wrap in do/catch; propagate errors as @Published var or enum state

## Persistence (SwiftData / CoreData)
ModelContext.insert / fetch(FetchDescriptor) → @Query auto-refresh → View update
Notes: ModelContainer configured at @main entry; use @ModelActor for background work
```

Skip flows not applicable to the project.

---

## Step 9: Write `.workflow/project/call-graph.md`

Map function-level relationships for exported functions, route handlers, service methods, view model actions, and key protocol implementations. Direct callers/callees only.

Format each entry as a `##` block — grep by function name returns the full entry:

```markdown
## functionName
File: path/to/file.swift
Called by: callerOne (path/to/CallerType.swift), callerTwo (path/to/OtherType.swift)
Calls: calleeOne (path/to/CalleeType.swift), calleeTwo (path/to/Other.swift)
```

Swift-specific notes:
- For delegate methods: `Called by: UIKit runtime (delegate callback)`
- For `@IBAction`: `Called by: Interface Builder action`
- For Combine sink/receive: `Called by: Publisher subscription`
- For lifecycle methods (`viewDidLoad`, `body`, `init`): `Called by: SwiftUI/UIKit runtime`
- If no external callers: `Called by: none (entry point)`
- If no external calls: `Calls: none`

---

## Step 10: Write `.workflow/project/search-hints.md`

```markdown
## Code Locations

| Task | Where to look |
|------|--------------|
| Add a SwiftUI view | `Features/<Name>/` or `Views/` |
| Add a UIKit view controller | `ViewControllers/` or `Features/<Name>/` |
| Add a view model | `Features/<Name>/` or `ViewModels/` |
| Add a service / API call | `Services/` or `Networking/` |
| Add a SwiftData model | `Models/` — create `@Model` class |
| Add a CoreData entity | `Models/` + update `.xcdatamodeld` |
| Add a protocol | `Protocols/` or alongside the primary conforming type |
| Add a utility / helper | `Utilities/` or `Extensions/` |
| Modify app entry point | `App.swift` or `AppDelegate.swift` |
| Add a SPM dependency | `Package.swift` → `.package(url:from:)` + add to target |
| Add a CocoaPods dependency | `Podfile` → `pod 'Name'` then `pod install` |
| Modify navigation | Root `ContentView.swift` or `AppCoordinator` or `NavigationStack` owner |
| Add app config / env | `Config/` or `AppConfig.swift` or `.xcconfig` files |

## Tests

| Task | Command / Path |
|------|---------------|
| Run all tests (Xcode) | `xcodebuild test -scheme <Scheme> -destination 'platform=iOS Simulator,name=iPhone 16'` |
| Run all tests (SPM) | `swift test` |
| Run a single test class | `xcodebuild test -only-testing:<Target>/<TestClass>` |
| Run a single test method | `xcodebuild test -only-testing:<Target>/<TestClass>/<testMethod>` |
| Unit tests location | `<AppName>Tests/` |
| UI tests location | `<AppName>UITests/` |
| Test for a specific feature | `<AppName>Tests/<FeatureName>Tests/` |
| Swift Testing (iOS 17+) | `@Test` and `@Suite` annotations — run same as above |
```

---

## Step 11: Write `.workflow/project/decisions.md`

Extract observable architectural decisions from the codebase:

```markdown
## Architecture Decisions

### UI Framework
**Decision**: SwiftUI / UIKit / Mixed
**Reason**: [inferred from project age, imports, or comments]
**Rejected alternatives**: [leave blank if not observable — fill in as tasks reveal tradeoffs]
**Impact on future work**: [new views should use X; bridging required for Y]

### Architecture Pattern
**Decision**: MVVM / MVC / TCA / VIPER
**Reason**: [inferred]
**Rejected alternatives**: [leave blank if not observable — fill in as tasks reveal tradeoffs]
**Impact on future work**: [ViewModels own business logic; Views are passive / etc.]

### Concurrency Model
**Decision**: async/await / Combine / GCD
**Reason**: [inferred from Swift version or existing patterns]
**Rejected alternatives**: [leave blank if not observable — fill in as tasks reveal tradeoffs]
**Impact on future work**: [new async work should use async/await; avoid mixing with GCD where possible]

### Persistence
**Decision**: SwiftData / CoreData / UserDefaults / None
**Reason**: [inferred]
**Rejected alternatives**: [e.g., Realm — not considered; CoreData — too much boilerplate for this model count]
**Impact on future work**: [schema changes require migration plan / use ModelContext for all writes / etc.]
```

Leave minimal if nothing is clearly observable — this file grows as tasks are closed.

---

## Step 12: Write `.workflow/project/concepts.md`

This file captures project-specific knowledge that cannot be inferred from code structure alone. It is grep-first — each concept uses a `##` header so agents can find it by keyword search.

Seed it from observable signals: model names, service names, feature folder names, README, inline comments that explain *why* something is done.

```markdown
# Project Concepts

## Domain Terms
<!-- One entry per key business entity. Infer from model names, service names, feature folders. -->
<!-- Format: ## TermName followed by 1-2 sentences defining it in this app's context. -->

[For each significant domain type found — e.g., User, Order, Trip, Asset, Session:
## [TypeName]
[What this entity represents in the app. What distinguishes it from similar concepts if applicable.]
]

## Business Rules
<!-- Rules the code enforces but does not explain. Leave blank at init — filled in as tasks reveal them. -->
<!-- Format: ## RuleName then: the rule, its source (UI / API / legal), and which code enforces it. -->

## Project Conventions
<!-- Patterns the team follows that are not obvious from code alone. -->
<!-- Infer from strongly consistent patterns: naming, access control, error handling style, test strategy. -->
<!-- Format: ## ConventionName then the rule and where it applies. -->

[For each strongly consistent pattern observed:
## [PatternName]
[The convention and where it applies.]
]

## Known Constraints
<!-- Non-obvious limitations: server timeouts, rate limits, platform restrictions, legal requirements. -->
<!-- Leave blank at init unless evident from config files, comments, or README. -->
<!-- Format: ## ConstraintName then: the constraint, its source, and impact on implementation. -->
```

Leave sections blank if nothing is observable at init. This file grows as tasks are closed.

---

## Rules
- Be concise. Every line should help a future agent find something faster.
- No padding — if the project is small, the files will be short.
- Use real file paths. Never use line numbers — they go stale.
- Use Swift type vocabulary: struct, class, protocol, actor, enum, extension — not generic "module".
- These files are the foundation of all future task work. Accuracy matters more than completeness.

## Done
Tell the user:
- That `.claude/settings.json` was created/updated
- What workflow files were created
- How many types/modules were mapped
- Architecture pattern detected
- How to start work: `/workflow:task <description>`
