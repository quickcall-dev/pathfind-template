# Scorer Worker

Build the scoring and comparison system for a pathfinding scenario builder.

## Environment

Your working directory is the fleet root. All paths below are **relative to fleet root**. Repo root is 6 levels up; `visual/`, `src/`, `test/` are at repo root.

## What to build

- Metrics capture: nodes explored, path length, time (ms) per pathfinding run
- Score card display showing metrics after each run
- Comparison drawer: side-by-side view of multiple runs
- Save run: store algorithm + map + metrics + timestamp
- Load saved runs for comparison
- Clear all saved runs

## How

1. Explore repo `visual/` and `src/` to understand what exists
2. Check previous iterations if any prior reviewer feedback was injected into this prompt
3. TDD: write failing tests first, then implement
4. Run full suite from repo root: `npx mocha --require should test/**/*.js`
5. Use `should.js` assertion style

## Output

Write a summary to:

```
workers/scorer-worker/output/summary.md
```

(Relative to fleet root.)
