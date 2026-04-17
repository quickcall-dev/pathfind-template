# Test Writer 4 — JPS: NoObstacles + Never

## Area: `src/finders/JPFMoveDiagonallyIfNoObstacles.js`, `src/finders/JPFNeverMoveDiagonally.js`

---

### Priority 1 (high)

1. **`JPFMoveDiagonallyIfNoObstacles.js` → `_jump`** — forced-neighbor check for diagonal is **commented out** (lines 36–40). This is a deliberate algorithmic deviation. Test behavior when a "would-be forced" neighbor exists.

2. **`JPFMoveDiagonallyIfNoObstacles.js` → `_jump`** — diagonal gating: requires `isWalkableAt(x+dx,y)` AND `isWalkableAt(x,y+dy)` both true; returns null if either blocked.

3. **`JPFMoveDiagonallyIfNoObstacles.js` → `_jump`** — horizontal forced neighbor (both `y-1` and `y+1` sides).

4. **`JPFMoveDiagonallyIfNoObstacles.js` → `_jump`** — vertical forced neighbor (both `x-1` and `x+1` sides).

5. **`JPFNeverMoveDiagonally.js` → `_jump`** — horizontal forced neighbor upper: `isWalkableAt(x,y-1) && !isWalkableAt(x-dx,y-1)`.

6. **`JPFNeverMoveDiagonally.js` → `_jump`** — horizontal forced neighbor lower: `isWalkableAt(x,y+1) && !isWalkableAt(x-dx,y+1)`.

7. **`JPFNeverMoveDiagonally.js` → `_jump`** — vertical forced neighbor left: `isWalkableAt(x-1,y) && !isWalkableAt(x-1,y-dy)`.

8. **`JPFNeverMoveDiagonally.js` → `_jump`** — vertical forced neighbor right: `isWalkableAt(x+1,y) && !isWalkableAt(x+1,y-dy)`.

9. **`JPFNeverMoveDiagonally.js` → `_jump`** — vertical recursive horizontal jump: `this._jump(x+1,y,x,y) || this._jump(x-1,y,x,y)`.

### Priority 2 (medium)

10. **`JPFMoveDiagonallyIfNoObstacles.js` → `_jump`** — `trackJumpRecursion: true` marks node.

11. **`JPFMoveDiagonallyIfNoObstacles.js` → `_findNeighbors`** — no parent (uses `OnlyWhenNoObstacles` getNeighbors).

12. **`JPFMoveDiagonallyIfNoObstacles.js` → `_findNeighbors`** — diagonal parent: conditional straight-ahead diagonal (requires both cardinals walkable).

13. **`JPFMoveDiagonallyIfNoObstacles.js` → `_findNeighbors`** — horizontal parent: `isNextWalkable=false` branch (no forward neighbors).

14. **`JPFMoveDiagonallyIfNoObstacles.js` → `_findNeighbors`** — vertical parent: all sub-branches.

15. **`JPFMoveDiagonallyIfNoObstacles.js`** — `findPath` no-path unit test.

16. **`JPFMoveDiagonallyIfNoObstacles.js`** — `findPath` start==end.

17. **`JPFNeverMoveDiagonally.js` → `_jump`** — `throw new Error("Only horizontal and vertical movements are allowed")` when dx===0 && dy===0.

18. **`JPFNeverMoveDiagonally.js` → `_jump`** — `trackJumpRecursion: true` marks node.

19. **`JPFNeverMoveDiagonally.js` → `_findNeighbors`** — forced neighbors added when cell adjacent to travel direction is blocked.
