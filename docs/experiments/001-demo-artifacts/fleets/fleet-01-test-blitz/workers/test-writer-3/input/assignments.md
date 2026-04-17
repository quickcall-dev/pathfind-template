# Test Writer 3 — JPS: Always + IfAtMostOneObstacle + Base + Factory

## Area: `src/finders/JPFAlwaysMoveDiagonally.js`, `src/finders/JPFMoveDiagonallyIfAtMostOneObstacle.js`, `src/finders/JumpPointFinderBase.js`, `src/finders/JumpPointFinder.js`

---

### Priority 1 (high)

1. **`JPFAlwaysMoveDiagonally.js` → `_jump`** — horizontal forced neighbor upper: `isWalkableAt(x+dx,y+1) && !isWalkableAt(x,y+1)` branch. Build grid with wall at (x,y+1) and open at (x+dx,y+1) during horizontal jump.

2. **`JPFAlwaysMoveDiagonally.js` → `_jump`** — horizontal forced neighbor lower: `isWalkableAt(x+dx,y-1) && !isWalkableAt(x,y-1)`.

3. **`JPFAlwaysMoveDiagonally.js` → `_jump`** — vertical forced neighbor both sides. Same pattern but during vertical jump.

4. **`JPFMoveDiagonallyIfAtMostOneObstacle.js` → `_jump`** — vertical movement forced neighbor: `isWalkableAt(x+1,y+dy) && !isWalkableAt(x+1,y)` and left-side analogue.

### Priority 2 (medium)

5. **`JPFAlwaysMoveDiagonally.js` → `_jump`** — `trackJumpRecursion: true` marks node (only tested for IfAtMostOneObstacle currently).

6. **`JPFAlwaysMoveDiagonally.js` → `_findNeighbors`** — horizontal parent forced diagonals when adjacent cells blocked.

7. **`JPFAlwaysMoveDiagonally.js` → `_findNeighbors`** — vertical parent forced diagonals.

8. **`JPFMoveDiagonallyIfAtMostOneObstacle.js` → `_jump`** — horizontal lower forced neighbor: `isWalkableAt(x+dx,y-1) && !isWalkableAt(x,y-1)`.

9. **`JPFMoveDiagonallyIfAtMostOneObstacle.js` → `_findNeighbors`** — vertical parent: `dy!=0` branch (forced left/right diagonal neighbors).

10. **`JPFMoveDiagonallyIfAtMostOneObstacle.js` → `_findNeighbors`** — diagonal parent forced when `!isWalkableAt(x,y-dy)` (upper obstacle).

11. **`JumpPointFinderBase.js` → `_identifySuccessors`** — `jumpNode.closed` skip: no test creates scenario where `_jump` returns already-closed node.

12. **`JumpPointFinderBase.js` → `_identifySuccessors`** — `openList.updateItem`: no test verifies jump node re-queued with lower g.

13. **`JumpPointFinderBase.js`** — start==end in JPS: `node === endNode` immediately true; path is `expandPath(backtrace(endNode))` = `[[x,y]]`.

14. **`JumpPointFinder.js` (factory)** — invalid `diagonalMovement` value (e.g. `999`). No else/throw; returns `undefined`. Verify behavior.
