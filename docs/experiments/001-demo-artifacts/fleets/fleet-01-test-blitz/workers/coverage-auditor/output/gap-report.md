# Test Coverage Gap Report

**Library:** PathFinding.js  
**Audited:** 2026-04-16  
**Test run:** 294 passing, 0 failing (2s)

---

## Summary

Coverage is strong on happy paths and constructor options. Gaps concentrate in:
- **edge-case branches** inside `_jump` / `_findNeighbors` for JPS variants
- **BiAStar / BiBFS** meeting-from-end branch + start==end
- **Util** `smoothenPath` bug surface and `expandPath` contract for short paths
- **Grid** out-of-bounds mutation and `IfAtMostOneObstacle` diagonal corner cases

---

## `src/core/Util.js`

### What IS tested
- `interpolate` — vertical, horizontal, diagonal, same-point
- `expandPath` — empty array, 2-segment path
- `compressPath` — empty, single, two-element, multi-segment
- `backtrace` — chain, single node
- `biBacktrace` — two chains merge
- `pathLength` — single node, horizontal, diagonal, multi-step
- `smoothenPath` — clear grid (no waypoints), single obstacle triggers waypoint

### What is NOT tested

| Function | Missing case | Priority |
|---|---|---|
| `smoothenPath` | Path length < 2 — `len < 2` skips `for` loop, returns `[[x0,y0], [x1,y1]]` where both points come from `path[0]` and `path[len-1]`; for a 1-node path these are identical → silent wrong output | **high** |
| `smoothenPath` | Multiple obstacles in sequence — `lastValidCoord` implicit-global bug at line 167 (`lastValidCoord` never declared with `var`) gets shared across calls in strict mode environments; no test with two separate obstacle segments | **high** |
| `smoothenPath` | Two-node path (len==2) — loop body never runs; result should be `[start, end]` | **medium** |
| `expandPath` | Single-element path — `len < 2` returns `[]` not `[path[0]]`; this silent empty-return is undocumented | **medium** |
| `interpolate` | Both axes negative direction (`x1 < x0 && y1 < y0`) — `sx=-1, sy=-1` branch untested directly | **low** |
| `compressPath` | 3-element collinear straight path → should compress to 2 elements | **low** |

---

## `src/core/Grid.js`

### What IS tested
- Constructor: width+height, matrix, matrix-only (auto dimensions)
- `_buildNodes`: matrix size mismatch throws
- `isWalkableAt`, `isInside`, `setWalkableAt`
- `getNeighbors`: Never, IfAtMostOneObstacle (partial), Always (partial), OnlyWhenNoObstacles (partial), invalid value throws
- `clone`: walkability mirrored, mutation isolation
- Corner nodes: no out-of-bounds neighbors with Always

### What is NOT tested

| Method | Missing case | Priority |
|---|---|---|
| `getNeighbors` — `IfAtMostOneObstacle` | Each diagonal flag individually: d0=s3\|\|s0, d1=s0\|\|s1, d2=s1\|\|s2, d3=s2\|\|s3. Key distinction from `OnlyWhenNoObstacles` is diagonal included when **exactly one** of two adjacent cardinals is blocked — this exact condition has no dedicated test | **high** |
| `getNeighbors` — `OnlyWhenNoObstacles` | Only d0 flag tested explicitly; d1/d2/d3 (right-up, right-down, left-down diagonals) untested | **medium** |
| `setWalkableAt` | Out-of-bounds coordinates — `this.nodes[y][x]` throws `TypeError`; no test verifies error behavior | **medium** |
| `getNodeAt` | Out-of-bounds coordinates — same crash, untested | **medium** |
| `clone` | Node x/y coordinates in cloned grid (only walkable attribute verified) | **low** |
| `_buildNodes` | Matrix where values are truthy non-1 (e.g. `2`, `true`) — comment says "0, false, null = walkable; others = unwalkable" but not verified | **low** |

---

## `src/core/Node.js`

### What IS tested
- Default `walkable=true`, explicit `true`, explicit `false`

### What is NOT tested

| Case | Priority |
|---|---|
| `walkable=0` (falsy, not `undefined`) — stored as `0` not coerced to `false`. Behavior differs from explicit `false` in strict equality checks. | **low** |
| `walkable=undefined` explicit arg — should behave same as omitting (returns `true`) | **low** |

---

## `src/core/Heuristic.js`

### What IS tested
- All 4 functions: manhattan, euclidean, octile (both branches), chebyshev
- Zero inputs, symmetry

### What is NOT tested
- No gaps of significance. Pure math functions, all branches covered.

---

## `src/core/DiagonalMovement.js`

### What IS tested
- All 4 enum values present with correct numeric values

### What is NOT tested
- Nothing material missing.

---

## `src/finders/AStarFinder.js`

### What IS tested
- Constructor: all diagonal modes (deprecated flags + explicit), custom heuristic, weight
- `findPath`: basic path, start==end, no-path (isolated end, isolated start), weighted, `openList.updateItem` branch

### What is NOT tested

| Case | Priority |
|---|---|
| `findPath` with `diagonalMovement: Always` finds diagonal shortcut (path shorter than Manhattan distance) | **medium** |
| Custom heuristic + non-default weight simultaneously | **low** |
| `neighbor.h` caching: node reached by two routes; second route skips h-recalculation (`neighbor.h = neighbor.h \|\| ...`) — verify h not recalculated | **low** |

---

## `src/finders/DijkstraFinder.js`

### What IS tested
- Constructor, heuristic override to 0, option passthrough
- `findPath`: optimal path, no-path, detour-only scenario

### What is NOT tested

| Case | Priority |
|---|---|
| Start==end returns `[[x,y]]` | **medium** |
| Diagonal movement with Dijkstra (uniform-cost + diagonal cost √2) | **low** |

---

## `src/finders/BreadthFirstFinder.js`

### What IS tested
- Constructor: all deprecated + explicit diagonal options
- `findPath`: open grid, no-path, start==end, diagonal vs. no-diagonal length, IfAtMostOneObstacle around obstacle, OnlyWhenNoObstacles corner avoidance

### What is NOT tested

| Case | Priority |
|---|---|
| `Always` diagonal — diagonal movement when both adjacent cardinals are walls (Always uniquely permits this) | **low** |

---

## `src/finders/BestFirstFinder.js`

### What IS tested
- Constructor: diagonal options, heuristic scaling ×1000000 verified via call count and return value
- `findPath`: open grid, no-path (via PathTest scenarios)

### What is NOT tested

| Case | Priority |
|---|---|
| Start==end | **medium** |
| Suboptimality documented: BestFirst path can be longer than A\* on same maze | **low** |

---

## `src/finders/BiAStarFinder.js`

### What IS tested
- Constructor: all diagonal modes, octile/manhattan heuristic selection, weight, custom heuristic
- `findPath`: open grid, maze (PathTest scenarios), diagonal modes

### What is NOT tested

| Case | Priority |
|---|---|
| **Start==end** — `startNode` and `endNode` are same object; `opened` overwritten to `BY_END=2`. Expansion from start side looks for `neighbor.opened === BY_END` but endNode is already closed after first pop. Behavior is undefined/untested. | **high** |
| **Meeting from end side** — `neighbor.opened === BY_START` branch in end-expansion loop never explicitly triggered in unit tests; PathTest scenarios may not exercise it | **high** |
| `endOpenList.updateItem` branch (better g found for node already in end open list) | **medium** |
| Explicit no-path unit test (only covered via PathTest scenarios) | **medium** |

---

## `src/finders/BiBreadthFirstFinder.js`

### What IS tested
- Constructor: all diagonal options
- `findPath`: open grid, no-path (PathTest), maze (PathTest)

### What is NOT tested

| Case | Priority |
|---|---|
| **Start==end** — `startNode.by=BY_START=0`, then `endNode.by=BY_END=1`; same node so second assignment overwrites first. First expansion pops and closes it. `endOpenList` then tries to pop same closed node — no guard against this. | **high** |
| **Meeting from end side** — `neighbor.by === BY_START` in end-expansion loop never explicitly exercised as unit test | **high** |
| Explicit no-path unit test | **medium** |

---

## `src/finders/BiDijkstraFinder.js`

### What IS tested
- Constructor: diagonal options, heuristic override to 0
- `findPath`: open grid, no-path (PathTest), optimal path

### What is NOT tested

| Case | Priority |
|---|---|
| Start==end (same issue as BiAStarFinder) | **high** |
| Meeting from end side branch | **high** |

---

## `src/finders/BiBestFirstFinder.js`

### What IS tested
- `findPath` via PathTest scenarios only

### What is NOT tested

| Case | Priority |
|---|---|
| **Constructor heuristic wrapping** — unlike `BestFirstFinder`, no test verifies ×1000000 scaling applied in `BiBestFirstFinder` constructor | **high** |
| Start==end | **high** |
| Explicit no-path unit test | **medium** |
| All constructor diagonal option variants | **medium** |

---

## `src/finders/IDAStarFinder.js`

### What IS tested
- `findPath`: open grid, no-path, path includes start and end
- `timeLimit`: fires on tiny limit + zero-heuristic, `timeLimit<=0` treated as infinite
- `trackRecursion`: no crash, path found
- Weight != 1
- Custom heuristics: euclidean, chebyshev
- All 4 diagonal modes + deprecated `allowDiagonal` flag

### What is NOT tested

| Case | Priority |
|---|---|
| **Start==end** — `cutOff = h(start,end) = 0`. `search()` called with `cutOff=0`: `f = 0 + 0*weight = 0 <= 0`, checks `node==end` (true), assigns `route[0]=[x,y]`, returns `node`. Outer loop gets `t instanceof Node`, returns `route`. Route has `route[0]` set but `route` was created as `[]` — should return `[[x,y]]`. Untested, behavior assumed correct. | **high** |
| `dontCrossCorners:true` combined with `allowDiagonal:true` → `OnlyWhenNoObstacles` (deprecated combined flag) | **medium** |
| `trackRecursion=true` post-search state: `retainCount` back to 0, `tested` reset to `false` | **medium** |

---

## `src/finders/JumpPointFinder.js` (factory)

### What IS tested
- All 5 valid `diagonalMovement` values → correct subclass instantiated
- Default (no option) → `JPFMoveDiagonallyIfAtMostOneObstacle`

### What is NOT tested

| Case | Priority |
|---|---|
| Invalid `diagonalMovement` value (e.g. `999`) — no else/throw in factory; returns `undefined` or falls through. Behavior undocumented and untested. | **medium** |

---

## `src/finders/JumpPointFinderBase.js`

### What IS tested
- `findPath`: no-path (open list exhausted), `trackJumpRecursion` propagation
- `_identifySuccessors`: close-node skip and `openList.updateItem` (both implicit via large-grid tests)

### What is NOT tested

| Case | Priority |
|---|---|
| `_identifySuccessors` — `jumpNode.closed` skip: no test creates explicit scenario where `_jump` returns a node that is already closed | **medium** |
| `_identifySuccessors` — `openList.updateItem`: no test explicitly verifies a jump node re-queued with lower g | **medium** |
| Start==end in JPS — `node === endNode` immediately true; path is `expandPath(backtrace(endNode))` = `[[x,y]]` | **medium** |

---

## `src/finders/JPFAlwaysMoveDiagonally.js`

### What IS tested
- `findPath`: maze, no-path (via JumpPointFinder.js)
- Factory dispatch → correct class

### What is NOT tested

| Case | Priority |
|---|---|
| `_jump` — horizontal forced neighbor: `isWalkableAt(x+dx,y+1) && !isWalkableAt(x,y+1)` branch | **high** |
| `_jump` — horizontal forced neighbor lower side: `isWalkableAt(x+dx,y-1) && !isWalkableAt(x,y-1)` | **high** |
| `_jump` — vertical forced neighbor both sides | **high** |
| `_jump` — `trackJumpRecursion: true` marks node (tested for IfAtMostOneObstacle only) | **medium** |
| `_findNeighbors` — horizontal parent forced diagonals when adjacent cells blocked | **medium** |
| `_findNeighbors` — vertical parent forced diagonals | **medium** |

---

## `src/finders/JPFMoveDiagonallyIfAtMostOneObstacle.js`

### What IS tested
- `findPath`: maze, no-path
- `_jump`: unwalkable returns null, diagonal forced-neighbor, diagonal gating (both blocked → null), `trackJumpRecursion`
- `_findNeighbors`: no parent, diagonal parent forced diagonal, horizontal parent forced diagonal

### What is NOT tested

| Case | Priority |
|---|---|
| `_jump` — vertical movement forced neighbor: `isWalkableAt(x+1,y+dy) && !isWalkableAt(x+1,y)` and left-side analogue | **high** |
| `_jump` — horizontal lower forced neighbor: `isWalkableAt(x+dx,y-1) && !isWalkableAt(x,y-1)` | **medium** |
| `_findNeighbors` — vertical parent: `dy!=0` branch (forced left/right diagonal neighbors) | **medium** |
| `_findNeighbors` — diagonal parent forced when `!isWalkableAt(x,y-dy)` (upper obstacle) | **medium** |

---

## `src/finders/JPFMoveDiagonallyIfNoObstacles.js`

### What IS tested
- `findPath` via PathTest scenarios only — no `_jump` / `_findNeighbors` unit tests exist

### What is NOT tested

| Case | Priority |
|---|---|
| `_jump` — **forced-neighbor check for diagonal is commented out** (lines 36–40). This is a deliberate algorithmic deviation — diagonal jumps only triggered by horizontal/vertical sub-jumps, not by forced neighbors. Behavior when a "would-be forced" neighbor exists is completely untested. | **high** |
| `_jump` — diagonal gating: requires `isWalkableAt(x+dx,y)` AND `isWalkableAt(x,y+dy)` both true; returns null if either blocked | **high** |
| `_jump` — horizontal forced neighbor (both `y-1` and `y+1` sides) | **high** |
| `_jump` — vertical forced neighbor (both `x-1` and `x+1` sides) | **high** |
| `_jump` — `trackJumpRecursion: true` marks node | **medium** |
| `_findNeighbors` — no parent (uses `OnlyWhenNoObstacles` getNeighbors) | **medium** |
| `_findNeighbors` — diagonal parent: conditional straight-ahead diagonal (requires both cardinals walkable) | **medium** |
| `_findNeighbors` — horizontal parent: `isNextWalkable=false` branch (no forward neighbors) | **medium** |
| `_findNeighbors` — vertical parent: all sub-branches | **medium** |
| `findPath` no-path unit test | **medium** |
| `findPath` start==end | **medium** |

---

## `src/finders/JPFNeverMoveDiagonally.js`

### What IS tested
- `findPath`: maze, no-path (via JumpPointFinder test)
- `_findNeighbors`: no parent, horizontal parent (forward neighbor), vertical parent (forward neighbor)

### What is NOT tested

| Case | Priority |
|---|---|
| `_jump` — horizontal forced neighbor upper: `isWalkableAt(x,y-1) && !isWalkableAt(x-dx,y-1)` | **high** |
| `_jump` — horizontal forced neighbor lower: `isWalkableAt(x,y+1) && !isWalkableAt(x-dx,y+1)` | **high** |
| `_jump` — vertical forced neighbor left: `isWalkableAt(x-1,y) && !isWalkableAt(x-1,y-dy)` | **high** |
| `_jump` — vertical forced neighbor right: `isWalkableAt(x+1,y) && !isWalkableAt(x+1,y-dy)` | **high** |
| `_jump` — vertical recursive horizontal jump: `this._jump(x+1,y,x,y) \|\| this._jump(x-1,y,x,y)` | **high** |
| `_jump` — `throw new Error("Only horizontal and vertical movements are allowed")` — reached when dx===0 && dy===0; callable directly | **medium** |
| `_jump` — `trackJumpRecursion: true` marks node | **medium** |
| `_findNeighbors` — forced neighbors added when cell adjacent to travel direction is blocked | **medium** |

---

## Known Bugs Exposed or Noted by Existing Tests

| File | Location | Bug | Severity |
|---|---|---|---|
| `src/core/Util.js` | `smoothenPath`, line 167 | `lastValidCoord` assigned without `var/let/const` — implicit global. In strict mode throws `ReferenceError`. In sloppy mode pollutes global scope and corrupts value across sequential calls. | **high** |
| `src/core/Util.js` | `smoothenPath` | Consequence of above: two sequential `smoothenPath` calls where first has an obstacle will cause second to start with stale `lastValidCoord` from first call. | **high** |
| `src/finders/IDAStarFinder.js` | `findPath`, outer loop | Start==end produces `cutOff=0`; the `route` array is reset to `[]` at top of each outer loop iteration before `search()` is called. `search()` assigns `route[depth]` and returns the node. Outer loop then returns `route` — which has `route[0]=[x,y]`. Likely correct but untested. | **medium** |
