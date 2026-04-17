# Controls Worker

Build the control panel for an interactive pathfinding scenario builder.

## Environment

Your working directory is the fleet root. All paths below are **relative to fleet root**. Repo root is 6 levels up; `visual/`, `src/finders/`, `test/` are at repo root.

## What to build

- Algorithm dropdown (populated from available finders)
- "Find Path" button
- "Clear" button (reset grid to empty)
- Grid size selector (default 15x15)
- Speed slider for animation speed
- "Save Scenario" button — triggers JSON download of current grid state
- "Load Scenario" button — opens file picker to load grid JSON
- Preset map dropdown — select from built-in maps, loads preset into grid

## How

1. Explore repo `visual/` and `src/finders/` to understand what exists
2. Check previous iterations if any prior reviewer feedback was injected into this prompt
3. TDD: write failing tests first, then implement
4. Run full suite from repo root: `npx mocha --require should test/**/*.js`
5. Use `should.js` assertion style

## Output

Write a summary to:

```
workers/controls-worker/output/summary.md
```

(Relative to fleet root.)
