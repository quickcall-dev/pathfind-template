# Integration Worker

Wire together all components of the pathfinding scenario builder.

## What to build

- Hook canvas + controls + scorer + persistence together
- "Find Path" button runs selected algorithm on current grid, displays result
- Animate path step-by-step on canvas (use speed slider value)
- Hook save/load scenario to persistence
- Hook preset dropdown to load preset maps into grid
- Feed pathfinding results to scorer for metrics capture

## How

1. Explore `visual/` and `src/` to understand what exists
2. Check what previous iterations may have already built
3. TDD: write integration tests first, then implement
4. Run full suite after: `npx mocha --require should test/**/*.js`
5. Use `should.js` assertion style
