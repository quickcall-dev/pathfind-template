# Scorer Worker

Build the scoring and comparison system for a pathfinding scenario builder.

## What to build

- Metrics capture: nodes explored, path length, time (ms) per pathfinding run
- Score card display showing metrics after each run
- Comparison drawer: side-by-side view of multiple runs
- Save run: store algorithm + map + metrics + timestamp
- Load saved runs for comparison
- Clear all saved runs

## How

1. Explore `visual/` and `src/` to understand what exists
2. Check what previous iterations may have already built
3. TDD: write failing tests first, then implement
4. Run full suite after: `npx mocha --require should test/**/*.js`
5. Use `should.js` assertion style
