# Canvas Worker

Build the grid canvas for an interactive pathfinding scenario builder.

## Environment

Your working directory is the fleet root. All paths below are **relative to fleet root**. Repo root is 6 levels up; `visual/`, `src/`, `test/` are at repo root.

## What to build

- Render a 15x15 grid
- Click-to-toggle walls (dark cells)
- Place start point (green) and end point (red)
- Visual distinction: walls = dark, start = green, end = red, empty = light
- Expose a clean API for other components to read/set grid state

## How

1. Explore repo `visual/` and `src/` to understand what exists
2. Check previous iterations (see `iterations/` folder) if any prior reviewer feedback was injected into this prompt
3. TDD: write failing tests first, then implement
4. Run full suite from repo root: `npx mocha --require should test/**/*.js`
5. Use `should.js` assertion style

## Output

Write a summary of what you built/changed to:

```
workers/canvas-worker/output/summary.md
```

(Relative to fleet root.)
