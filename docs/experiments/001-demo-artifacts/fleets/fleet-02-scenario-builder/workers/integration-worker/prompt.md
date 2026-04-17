# Integration Worker

Wire together all components of the pathfinding scenario builder.

## Environment

Your working directory is the fleet root. All paths below are **relative to fleet root**. Repo root is 6 levels up; `visual/`, `src/`, `test/` are at repo root.

## What to build

- Hook canvas + controls + scorer + persistence together
- "Find Path" button runs selected algorithm on current grid, displays result
- Animate path step-by-step on canvas (use speed slider value)
- Hook save/load scenario to persistence
- Hook preset dropdown to load preset maps into grid
- Feed pathfinding results to scorer for metrics capture

## How

1. Explore repo `visual/` and `src/` to understand what exists
2. Check previous iterations if any prior reviewer feedback was injected into this prompt
3. TDD: write integration tests first, then implement
4. Run full suite from repo root: `npx mocha --require should test/**/*.js`
5. Use `should.js` assertion style

## Output

Write a summary to:

```
workers/integration-worker/output/summary.md
```

(Relative to fleet root.)
