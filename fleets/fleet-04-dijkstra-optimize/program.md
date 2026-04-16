# autoresearch: Optimize Dijkstra to close the gap with A*

## Context

This is a pathfinding library (PathFinding.js). Dijkstra currently explores ~68% more nodes than A* on a sparse 15x15 grid. Your job: modify the Dijkstra implementation to reduce that gap.

The metric is the ratio: `Dijkstra nodes explored / A* nodes explored`. Baseline: ~1.68. Lower is better. 1.0 means Dijkstra matches A*.

## Constraints

- Only modify `src/finders/DijkstraFinder.js` (and files it imports, if you create new ones under `src/`)
- Do NOT modify A* (`src/finders/AStarFinder.js`)
- Do NOT modify the benchmark (`bench-dijkstra.js`)
- Do NOT modify tests
- Dijkstra must still find the optimal (shortest) path — the benchmark crashes if path is suboptimal
- Keep changes minimal and focused per iteration

## Setup
1. Explore `src/finders/DijkstraFinder.js` and `src/finders/AStarFinder.js` to understand the current implementation
2. Read `results.tsv` for prior experiment history
3. Run `node bench-dijkstra.js` to establish baseline

## The experiment loop

LOOP FOREVER:
1. Read results.tsv for context on what's been tried.
2. Make ONE change to `src/finders/DijkstraFinder.js` (or related files you create).
3. `git add -A && git commit -m "short description"`
4. Run: `node bench-dijkstra.js`
5. Also run: `npx mocha --require should test/**/*.js` — all existing tests must pass.
6. Record in results.tsv (tab-separated): `commit  metric  status  description`
   - status: keep, discard, or crash
7. If metric improved AND tests pass: keep the commit.
8. If worse or crash or test failure: `git reset --hard HEAD~1` and log as discard/crash.
9. Go to step 1.

**NEVER STOP.** Run until manually interrupted.
