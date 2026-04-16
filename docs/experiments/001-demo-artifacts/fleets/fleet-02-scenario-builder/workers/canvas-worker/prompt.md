# Canvas Worker

Build the grid canvas for an interactive pathfinding scenario builder.

## What to build

- Render a 15x15 grid
- Click-to-toggle walls (dark cells)
- Place start point (green) and end point (red)
- Visual distinction: walls = dark, start = green, end = red, empty = light
- Expose a clean API for other components to read/set grid state

## How

1. Explore `visual/` and `src/` to understand what exists
2. Check what previous iterations may have already built
3. TDD: write failing tests first, then implement
4. Run full suite after: `npx mocha --require should test/**/*.js`
5. Use `should.js` assertion style
