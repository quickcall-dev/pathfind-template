# Controls Worker

Build the control panel for an interactive pathfinding scenario builder.

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

1. Explore `visual/` and `src/finders/` to understand what exists
2. Check what previous iterations may have already built
3. TDD: write failing tests first, then implement
4. Run full suite after: `npx mocha --require should test/**/*.js`
5. Use `should.js` assertion style
