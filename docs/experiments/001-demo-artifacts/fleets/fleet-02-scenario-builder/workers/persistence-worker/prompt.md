# Persistence Worker

Build save/load and preset functionality for a pathfinding scenario builder.

## Environment

Your working directory is the fleet root. All paths below are **relative to fleet root**. Repo root is 6 levels up; `visual/`, `src/`, `test/` are at repo root.

## What to build

- Save scenario as JSON (grid state + start + end + walls)
- Load scenario from JSON
- Preset map library with 3-5 built-in maps:
  - Empty (no walls)
  - Maze (dense corridors)
  - Spiral (spiral wall pattern)
  - Bottleneck (narrow passage)
  - Random (random wall placement)
- All preset maps use fixed 15x15 grid
- Expose a clean API other components can call

## How

1. Explore repo `visual/` and `src/` to understand what exists
2. Check previous iterations if any prior reviewer feedback was injected into this prompt
3. TDD: write failing tests first, then implement
4. Run full suite from repo root: `npx mocha --require should test/**/*.js`
5. Use `should.js` assertion style

## Output

Write a summary to:

```
workers/persistence-worker/output/summary.md
```

(Relative to fleet root.)
