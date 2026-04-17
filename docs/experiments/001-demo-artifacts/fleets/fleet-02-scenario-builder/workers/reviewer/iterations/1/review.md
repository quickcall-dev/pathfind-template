verdict: iterate

## Test Suite
534 tests passing — no regressions.

## Checklist

- [x] Draw walls on grid by clicking
- [x] Place start and end points (drag green/red nodes)
- [x] Select different algorithms from dropdown (accordion: A*, IDA*, BFS, BestFirst, Dijkstra, JPS, Orth JPS)
- [x] "Find Path" runs selected algorithm ("Start Search" → `onsearch` → `Panel.getFinder()`)
- [x] Path animates step-by-step (`loop()` → `step()` at 300 ops/sec)
- [ ] Scorer shows metrics — **partially broken** (see issue #1)
- [ ] Save a run — **broken** (see issue #1)
- [ ] Load saved runs — **broken** (see issue #1)
- [x] Clear all saved runs (works if drawer opens, `#clear_runs` button calls `Scorer.clear()`)
- [ ] Comparison drawer — **broken** (see issue #1)
- [ ] Save/load scenario as JSON — **missing entirely**
- [ ] Preset maps load correctly — **missing entirely**
- [x] "Clear" button resets grid (`reset` → `clearAll` + `buildNewGrid`)

## Issues

### 1. scorer-worker: `showScoreCard` destroys Save/Compare buttons (critical)

`Scorer.showScoreCard()` at line 123-126 of `scorer.js` calls `$panel.empty()` which removes the entire contents of `#score_panel`, including the header div with `#save_run` and `#compare_runs` buttons. Then `controller.js:192-198` tries to bind click handlers to those now-nonexistent elements. Result: score card renders but Save Run / Compare buttons are gone. No way to save runs or open comparison drawer.

**Fix**: `showScoreCard` should preserve the header and only replace the card content area. Either:
- Don't `.empty()` the whole panel — add a `.score-card-container` div and only replace that, or
- Re-append the header after `.empty()`, or
- Append the header + buttons inside `showScoreCard` itself.

### 2. controls-worker / canvas-worker: Save/load scenario as JSON — not implemented

No UI or code exists to export the current grid state (walls, start, end) as a JSON file or to import one. The checklist requires users to save a scenario and reload it later.

**Needed**: Add "Save Scenario" / "Load Scenario" buttons (likely in play_panel or a new panel). Save should export `{ width, height, walls: [[x,y],...], start: [x,y], end: [x,y] }` as a downloadable JSON. Load should accept a JSON file and rebuild the grid.

### 3. controls-worker: Preset maps — not implemented

No preset/demo maps exist. The checklist requires loadable preset scenarios (e.g., maze, bottleneck, open field).

**Needed**: Add a preset dropdown or buttons that load predefined wall configurations. Could be hardcoded JSON arrays or a small library of maps.
