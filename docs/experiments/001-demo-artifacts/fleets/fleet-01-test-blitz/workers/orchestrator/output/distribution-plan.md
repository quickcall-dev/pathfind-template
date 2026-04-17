# Orchestrator Distribution Plan

**Date:** 2026-04-16  
**Inputs:** coverage-auditor/gap-report.md, visual-auditor/visual-gaps.md

---

## Distribution

| Worker | Scope | Est. Effort | Gap Count |
|--------|-------|-------------|-----------|
| test-writer-1 | Core (Util.js, Grid.js, Node.js) + simple finders (AStar, Dijkstra, BFS, BestFirst) | High | 20 gaps |
| test-writer-2 | All bi-directional finders (BiAStar, BiBFS, BiDijkstra, BiBestFirst) + IDAStarFinder | High | 16 gaps |
| test-writer-3 | JPS: JPFAlwaysMoveDiagonally + JPFMoveDiagonallyIfAtMostOneObstacle + JumpPointFinderBase + JumpPointFinder factory | High | 14 gaps |
| test-writer-4 | JPS: JPFMoveDiagonallyIfNoObstacles + JPFNeverMoveDiagonally | High | 19 gaps |
| scenario-builder | Visual/UI test scenarios from visual audit | Medium | 20 scenarios |

## Grouping rationale

- **Writer 1** gets core utilities + simple (non-bi, non-JPS) finders. `smoothenPath` implicit-global bug is highest priority. Grid neighbor logic (`IfAtMostOneObstacle` vs `OnlyWhenNoObstacles`) is second. Simple finders have mostly medium/low gaps.
- **Writer 2** gets all 4 bi-directional finders (share `biBacktrace` meeting-point logic, same start==end bug pattern) + IDA* (unique: timeLimit, trackRecursion, route construction). 9 high-priority gaps concentrated on start==end and meeting-from-end branches.
- **Writer 3** gets JPFAlways + JPFIfAtMostOneObstacle (both have `_jump` forced-neighbor gaps) + JumpPointFinderBase (`_identifySuccessors` branches) + factory (invalid input). These share horizontal/vertical forced-neighbor test patterns.
- **Writer 4** gets JPFNoObstacles (commented-out forced-neighbor check, diagonal gating, entirely untested `_findNeighbors`) + JPFNever (5 high-priority `_jump` gaps, recursive horizontal sub-jump). Both have the most untested surface area of all JPS variants.
- **Scenario builder** gets visual bugs (CSS typo, missing re-show, misleading Clear Walls, wrong spinner name, no parent arrows) + 12 visual test scenarios + missing UI feature documentation.

## Priority distribution

| Priority | Writer 1 | Writer 2 | Writer 3 | Writer 4 | Scenario |
|----------|----------|----------|----------|----------|----------|
| High     | 3        | 9        | 4        | 9        | 5 bugs   |
| Medium   | 8        | 7        | 10       | 10       | 5 core   |
| Low      | 9        | 0        | 0        | 0        | 10 other |
