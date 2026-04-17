# Test Writer 1 — Core Modules + Simple Finders

## Area: `src/core/Util.js`, `src/core/Grid.js`, `src/core/Node.js`, `src/finders/AStarFinder.js`, `src/finders/DijkstraFinder.js`, `src/finders/BreadthFirstFinder.js`, `src/finders/BestFirstFinder.js`

---

### Priority 1 (high)

1. **`Util.js` → `smoothenPath`** — path length < 2 (1-node path). `len < 2` skips loop, returns `[[x0,y0],[x1,y1]]` where both come from `path[0]` and `path[len-1]`; for 1-node these are identical → silent wrong output.

2. **`Util.js` → `smoothenPath`** — multiple obstacles in sequence. `lastValidCoord` at line 167 is never declared with `var` — implicit global. Test two sequential `smoothenPath` calls where first encounters obstacle, verify second call not corrupted by stale global.

3. **`Grid.js` → `getNeighbors` with `IfAtMostOneObstacle`** — each diagonal flag individually: d0=s3||s0, d1=s0||s1, d2=s1||s2, d3=s2||s3. Diagonal included when **exactly one** of two adjacent cardinals is blocked. Needs dedicated test distinguishing from `OnlyWhenNoObstacles`.

### Priority 2 (medium)

4. **`Util.js` → `smoothenPath`** — two-node path (len==2). Loop body never runs; result should be `[start, end]`.

5. **`Util.js` → `expandPath`** — single-element path. `len < 2` returns `[]` not `[path[0]]`. Test and document this behavior.

6. **`Grid.js` → `getNeighbors` with `OnlyWhenNoObstacles`** — d1/d2/d3 diagonals (right-up, right-down, left-down). Only d0 tested explicitly.

7. **`Grid.js` → `setWalkableAt`** — out-of-bounds coordinates. `this.nodes[y][x]` throws `TypeError`. Verify error.

8. **`Grid.js` → `getNodeAt`** — out-of-bounds coordinates. Same crash, untested.

9. **`AStarFinder.js` → `findPath`** — `diagonalMovement: Always` finds diagonal shortcut (path shorter than Manhattan distance).

10. **`DijkstraFinder.js` → `findPath`** — start==end returns `[[x,y]]`.

11. **`BestFirstFinder.js` → `findPath`** — start==end.

### Priority 3 (low)

12. **`Util.js` → `interpolate`** — both axes negative direction (`x1 < x0 && y1 < y0`), `sx=-1, sy=-1` branch.

13. **`Util.js` → `compressPath`** — 3-element collinear straight path → should compress to 2 elements.

14. **`Grid.js` → `clone`** — verify node x/y coordinates preserved in cloned grid.

15. **`Grid.js` → `_buildNodes`** — matrix with truthy non-1 values (e.g. `2`, `true`).

16. **`Node.js`** — `walkable=0` (falsy, not undefined) stored as `0` not coerced. `walkable=undefined` explicit arg behaves same as omitting.

17. **`DijkstraFinder.js`** — diagonal movement with Dijkstra (uniform-cost + diagonal cost √2).

18. **`BreadthFirstFinder.js`** — `Always` diagonal when both adjacent cardinals are walls.

19. **`AStarFinder.js`** — custom heuristic + non-default weight simultaneously. `neighbor.h` caching verification.

20. **`BestFirstFinder.js`** — suboptimality: BestFirst path longer than A* on same maze.
