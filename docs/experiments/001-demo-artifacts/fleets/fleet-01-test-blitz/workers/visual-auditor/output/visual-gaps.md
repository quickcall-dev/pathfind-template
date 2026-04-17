# Visual Demo Audit Report

## Current Visual App Capabilities

| Feature | Details |
|---------|---------|
| Grid | 64×36 fixed, SVG via Raphael.js |
| Draw obstacles | Click-drag on white cells |
| Erase obstacles | Click-drag on grey (blocked) cells |
| Drag start node | Green node, draggable in ready/finished states |
| Drag end node | Orange-red node, draggable in ready/finished states |
| Algorithm selection | Accordion panel (right), 7 sections |
| Controls | 3-button panel: Start/Pause/Clear — labels change with state |
| State machine | 12-state FSM (none→ready→starting→searching→paused/finished/…) |
| Search visualization | Opened nodes (pale green), closed nodes (teal), tested nodes (light grey), path (yellow polyline) |
| Stats | Path length, time (ms), operation count — displayed after search completes |
| Instructions panel | Dismissible overlay, top-left |

---

## Algorithms: Available vs Exposed in UI

### All 10 exported finders present — with caveats

| Algorithm | UI Section | Bi-dir | Heuristics | Notes |
|-----------|-----------|--------|------------|-------|
| AStarFinder | `astar_header` | ✓ checkbox | 4 options | Weight spinner |
| IDAStarFinder | `ida_header` | ✗ | 4 options | Time limit, track recursion |
| BreadthFirstFinder | `breadthfirst_header` | ✓ checkbox | — | |
| BestFirstFinder | `bestfirst_header` | ✓ checkbox | 4 options | |
| DijkstraFinder | `dijkstra_header` | ✓ checkbox | — | |
| JumpPointFinder (IfAtMostOneObstacle) | `jump_point_header` | — | 4 options | Track recursion |
| JumpPointFinder (Never) | `orth_jump_point_header` | — | 4 options | Track recursion |

### Missing JPS diagonal modes

`JumpPointFinder` is a factory over 4 `DiagonalMovement` values. UI exposes 2 of 4:

| `diagonalMovement` value | UI exposed? |
|--------------------------|------------|
| `IfAtMostOneObstacle` | ✓ "Jump Point Search" |
| `Never` | ✓ "Orthogonal Jump Point Search" |
| `Always` (JPFAlwaysMoveDiagonally) | ✗ **missing** |
| `OnlyWhenNoObstacles` (JPFMoveDiagonallyIfNoObstacles) | ✗ **missing** |

Both missing implementations are compiled into `pathfinding-browser.min.js` and reachable via `PF.JumpPointFinder` — they just have no UI entry point.

---

## Bugs and Broken Features

### Bug 1 — CSS hover selector typo (`style.css:59`)
```css
/* BROKEN — missing 's' */
#hide_instruction:hover { color: #fff; text-decoration: underline; }
/* correct */
#hide_instructions:hover { ... }
```
Hover underline on the "hide" link never applies.

### Bug 2 — Instructions panel cannot be re-shown
`#hide_instructions` click calls `slideUp()`. No toggle or re-show mechanism. Once dismissed, instructions are gone for the session.

### Bug 3 — "Clear Walls" label is misleading (`controller.js:219`)
Button text says "Clear Walls" but calls `this.reset` → `onreset` → `clearAll()` + `buildNewGrid()`. This clears **everything** (walls, path, footprints, rebuilds grid). Walls-only clear is not implemented.

### Bug 4 — IDA* weight spinner name copy-pasted from A* (`index.html:103`)
```html
<!-- inside #ida_section — wrong name attribute -->
<input class="spinner" name="astar_weight" value="1">
```
`panel.js:162` selects `$('#ida_section input[name=astar_weight]')` — scoped, so it works. But the wrong name is a latent bug if the selector is ever made global.

### Bug 5 — `parent` attribute not visualized (`view.js:170`)
```js
case 'parent':
    // XXX: Maybe draw a line from this node to its parent?
    break;
```
Parent-pointer operations are captured in the ops queue but silently dropped. No parent arrows shown during search.

---

## UX / Feature Gaps

| Gap | Location | Impact |
|-----|----------|--------|
| Animation speed hardcoded at 300 ops/sec | `controller.js:95` | Can't slow down to study steps or speed up for large grids |
| Grid size hardcoded at 64×36 | `controller.js:94` | Can't resize; IDA* is painfully slow on full grid |
| No random maze generator | — | Users must hand-draw all obstacles |
| No touch/mobile support | `controller.js:339–343` | Only mouse events; unusable on touch screens |
| Stats shown only post-search | `controller.js:174` | No live operation counter during animation |
| JPS diagonal mode not selectable | `panel.js:138,146` | `Always` and `OnlyWhenNoObstacles` modes unreachable |
| No algorithm comparison mode | — | Can't view two algorithms side-by-side |
| Weight spinner has no max/validation in UI | `index.html:75,104` | Extreme values silently accepted |

---

## Suggested Visual Test Scenarios

### 1 — Open Grid (No Obstacles)
- Default grid, start left-center, end right-center
- Run all algorithms
- **Expected:** All find valid paths; JPS expands far fewer nodes than BFS/Dijkstra; stats differ; path drawn correctly
- **Validates:** Basic flow, node coloring, path drawing, stats display

### 2 — Blocked Grid (No Path Exists)
- Solid wall column between start and end
- Run all algorithms
- **Expected:** No path drawn, `pathLength` shows 0 or absent, UI reaches `finished` cleanly with no crash
- **Validates:** No-path edge case, empty-path handling in `View.drawPath`

### 3 — Diagonal Toggle
- Open grid, run A* Manhattan with `allowDiagonal` checked vs unchecked
- **Expected:** Diagonal path shorter (√2 factor); orthogonal path strictly axis-aligned
- **Validates:** `allowDiagonal` checkbox wires to finder correctly

### 4 — Don't Cross Corners
- Diagonal passage requiring corner-cutting
- A* diagonal with `dontCrossCorners` on vs off
- **Expected:** With flag, path routes around; without, path cuts corner
- **Validates:** Corner-crossing option propagates correctly

### 5 — Bi-directional Toggle
- Long open corridor, A* unidirectional vs bidirectional (same heuristic)
- **Expected:** Bi-directional expands ~half the nodes; both find same path length
- **Validates:** Bi-dir checkbox switches AStarFinder ↔ BiAStarFinder

### 6 — IDA* Time Limit
- Complex maze, set time limit to 1 second
- **Expected:** Search terminates at limit; `track_recursion` shows partial expansion; `finished` state reached
- **Validates:** `timeLimit` option wires through; UI handles early-termination cleanly

### 7 — JPS vs A* Node Expansion (Diagonal)
- Large open grid, run JPS then A* with same octile heuristic
- **Expected:** JPS jumps with far fewer colored cells; A* floods most of the grid
- **Validates:** JPS recursion visualization when toggle enabled

### 8 — Drag Start/End in Finished State
- Run any algorithm to completion, then drag start or end node
- **Expected:** State → `modified`; buttons update to "Start Search" / "Clear Path"; path clears; no JS error
- **Validates:** `modify` transition, `ondragStart`/`ondragEnd` in finished state

### 9 — Pause and Resume
- A* on large open grid; pause mid-animation; wait 2s; resume
- **Expected:** Animation stops exactly at pause; resumes from same point; no duplicate operations; counter matches
- **Validates:** `loop()` cancellation, `pause`/`resume` state transitions

### 10 — Weighted A* (Weight > 1)
- Open grid, A* weight=1 vs weight=5 (same heuristic)
- **Expected:** Weight=5 expands fewer nodes; path may be suboptimal; stats show fewer operations
- **Validates:** Weight spinner parsed correctly; passed to finder

### 11 — Orthogonal JPS vs BFS (No Diagonal)
- Grid with obstacles, Orthogonal JPS vs BFS
- **Expected:** Same path length (both optimal); JPS expands fewer nodes; path is cardinal-only
- **Validates:** `JPFNeverMoveDiagonally` correctness vs reference BFS

### 12 — Start Equals End (Degenerate)
- Drag end node to exact start position (if UI permits) or place them adjacent
- **Expected:** Path length 0 or length 1; no crash; `finish` state reached; stats display without NaN
- **Validates:** Zero-length path edge case

---

## Summary

| Category | Count |
|----------|-------|
| Algorithms fully exposed (all exported finders) | 10 |
| JPS diagonal modes missing from UI | 2 of 4 |
| Confirmed bugs | 5 |
| UX / feature gaps | 8 |
| Suggested test scenarios | 12 |
