# Scorer Worker — Output Report

## Status: DONE (iteration 4)

All 27 RunStore unit tests pass. Full suite: 576 passing.

---

## Summary

No regressions. No new issues. All requirements satisfied.

---

## Requirements Coverage

| Requirement | Status |
|-------------|--------|
| Metrics capture: nodes explored, path length, time (ms) | ✓ `RunStore.capture()` |
| Score card display after each run | ✓ `Scorer.showScoreCard()` → `#score_panel` |
| Comparison drawer: side-by-side runs | ✓ `Scorer.showComparisonDrawer()` → `#comparison_drawer` |
| Save run (algorithm + map + metrics + timestamp) | ✓ `Scorer.save()` → localStorage |
| Load saved runs for comparison | ✓ `Scorer.load()` / `Scorer.compare()` |
| Clear all saved runs | ✓ `Scorer.clear()` |

---

## Files

### Created
| File | Purpose |
|------|---------|
| `src/core/RunStore.js` | Node.js + browser-injectable RunStore module |
| `test/RunStore.js` | 27 unit tests (TDD — written before implementation) |
| `visual/js/scorer.js` | Browser-side Scorer IIFE: capture, save, load, compare, UI |

### Modified
| File | Change |
|------|--------|
| `src/PathFinding.js` | Export `RunStore` as `PF.RunStore` |
| `visual/js/controller.js` | `onfinish` captures run + shows score card; `onstarting` resets Save button |
| `visual/js/panel.js` | `getFinderName()` — human-readable algo name |
| `visual/index.html` | `#score_panel` + `#comparison_drawer` divs; include `scorer.js` |
| `visual/css/style.css` | Styles for score card panel and comparison drawer |

---

## Architecture

### RunStore (`src/core/RunStore.js`)
- **capture(algorithm, map, path, timeMs, nodesExplored)** → run record
  - `pathLength = path.length > 1 ? path.length - 1 : 0`
  - Unique ID: `Date.now() + '_' + counter`
- **save(run)** → push to storage backend
- **load()** → copy of all saved runs
- **clear()** → empties storage
- **compare()** → summary array `[{ algorithm, timestamp, metrics }]`
- **scoreCard(run)** → adds `formattedTime` string (`"X.XXXX ms"`)
- Storage backend injectable (default: in-memory array); browser override: localStorage

### Scorer (`visual/js/scorer.js`)
- Wraps same logic with localStorage persistence
- `showScoreCard(run)` — renders into `#score_panel`
- `showComparisonDrawer()` — all saved runs side-by-side in `#comparison_drawer`
- `hideComparisonDrawer()` — hides drawer

### UI flow
1. User clicks **Start Search** → `onstarting` hides score panel, resets Save button
2. Search completes → `onfinish` calls `Scorer.capture(...)`, shows `#score_panel`
3. User clicks **Save Run** → `Scorer.save(run)`, button disables to prevent duplicate saves
4. User clicks **Compare** → `Scorer.showComparisonDrawer()` shows all saved runs
5. In drawer: **Close** hides it; **Clear All** wipes localStorage and re-renders empty state

---

## Test Results

```
RunStore
  capture
    ✓ should return a run record with correct algorithm
    ✓ should record nodesExplored in metrics
    ✓ should record timeMs in metrics
    ✓ path length is number of steps (nodes minus 1)
    ✓ empty path has length 0
    ✓ single-node path has length 0
    ✓ should include timestamp
    ✓ should store map walls
    ✓ should store map dimensions
    ✓ should assign a unique id
  save and load
    ✓ should load empty array when no runs saved
    ✓ should save a run and retrieve it
    ✓ should accumulate multiple runs in order
    ✓ load should return a copy, not the internal array
  clear
    ✓ should remove all saved runs
    ✓ clear on empty store should be a no-op
  compare
    ✓ should return empty array when no runs saved
    ✓ should return one entry per saved run
    ✓ each entry has algorithm and metrics
    ✓ each entry has timestamp
    ✓ metrics include nodesExplored, pathLength, timeMs
  scoreCard
    ✓ should return formatted score card data for a run
    ✓ should include formatted time string
    ✓ should handle string timeMs without throwing
    ✓ formattedTime has 4 decimal places
  custom storage backend
    ✓ should use injected storage for save and load
    ✓ should use injected storage for clear

27 passing

Full suite: 576 passing
```
