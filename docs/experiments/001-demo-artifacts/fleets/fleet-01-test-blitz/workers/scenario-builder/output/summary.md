# Scenario Builder — Summary

## Test Files

- `test/VisualScenarios.BugValidation.js` — 71 new tests covering all 20 assignments
- `test/VisualScenarios.js` — 39 pre-existing scenario tests (unchanged)

## Results

- **New tests: 71 passing, 0 failing**
- **Full suite: 465 passing, 0 failing** (no regressions)

---

## Priority 1 — Bug Validation Scenarios (9 tests)

| # | Bug | Verified | Detail |
|---|-----|----------|--------|
| 1 | CSS hover selector typo | YES | `#hide_instruction:hover` at style.css:59 missing 's'. Hover underline never applies to `#hide_instructions` link. |
| 2 | Instructions panel one-way dismiss | YES | `slideUp()` only, no `slideDown`/`slideToggle`. Panel gone for session after click. |
| 3 | "Clear Walls" clears everything | YES | Button label says "Clear Walls" but callback is `this.reset` which calls `clearAll()` + `buildNewGrid()`. Clears walls AND path AND footprints AND rebuilds grid. |
| 4 | IDA* weight spinner wrong name | YES | `name="astar_weight"` in `#ida_section` (index.html:103). Works because `panel.js` scopes query to `#ida_section input[name=astar_weight]`. |
| 5 | Parent attribute not visualized | YES | `case 'parent':` in view.js:170 is a no-op with XXX comment. `supportedOperations` excludes 'parent'. No parent arrows drawn during search. |

## Priority 2 — Core Visual Scenarios (34 tests)

| # | Scenario | Tests | Status |
|---|----------|-------|--------|
| 6 | Open Grid — all algorithms | 22 | All 11 algorithms find path, path length finite & positive |
| 7 | Blocked Grid — solid wall | 13 | 6 algorithms return empty path, no crashes, pathLength([])==0 |
| 8 | Start==End | 6 | All tested finders handle gracefully, pathLength==0, no NaN |
| 9 | Pause/Resume | 2 | Verified loop() checks `is('searching')`, resume calls `loop()` |
| 10 | Drag in Finished State | 2 | State machine allows dragStart/dragEnd from 'finished' |

## Priority 3 — Algorithm Comparison Scenarios (8 tests)

| # | Scenario | Tests | Finding |
|---|----------|-------|---------|
| 11 | Diagonal Toggle | 1 | Diagonal path shorter than orthogonal (confirmed) |
| 12 | Don't Cross Corners | 1 | dontCrossCorners path >= non-restricted path |
| 13 | Bi-directional | 1 | Both uni/bi find valid paths through obstacles |
| 14 | IDA* Time Limit | 3 | Tiny limit may timeout, generous limit works, -1 skips check |
| 15 | JPS vs A* Expansion | 1 | JPS opens fewer nodes than A* on open grid |
| 16 | Weighted A* | 1 | weight=1 path <= weight=5 path length |
| 17 | Orth JPS vs BFS | 1 | Same path length on same obstacle grid |

## Priority 4 — Missing UI Features (8 tests, document only)

| # | Gap | Detail |
|---|-----|--------|
| 18 | JPS diagonal modes | `Always` and `OnlyWhenNoObstacles` work at library level. panel.js hardcodes `IfAtMostOneObstacle`. No UI entry point. |
| 19 | Animation speed | `operationsPerSecond: 300` hardcoded in controller.js:95. No UI control. |
| 20 | Grid size | `gridSize: [64, 36]` hardcoded in controller.js:94. No UI control. |

## Bugs Confirmed (not fixed — documenting only per assignment scope)

1. **CSS typo**: `#hide_instruction:hover` → should be `#hide_instructions:hover`
2. **One-way instructions dismiss**: No way to re-show after `slideUp()`
3. **Misleading button label**: "Clear Walls" does full reset
4. **Wrong input name**: IDA* weight uses `name="astar_weight"` (works by accident — scoped selector)
5. **Parent visualization missing**: No-op in view.js, no visual indicator for parent relationships
