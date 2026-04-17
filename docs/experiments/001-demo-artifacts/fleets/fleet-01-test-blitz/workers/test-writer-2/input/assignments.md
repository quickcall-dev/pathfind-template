# Test Writer 2 — Bi-directional Finders + IDA*

## Area: `src/finders/BiAStarFinder.js`, `src/finders/BiBreadthFirstFinder.js`, `src/finders/BiDijkstraFinder.js`, `src/finders/BiBestFirstFinder.js`, `src/finders/IDAStarFinder.js`

---

### Priority 1 (high)

1. **`BiAStarFinder.js` → `findPath`** — start==end. `startNode` and `endNode` are same object; `opened` overwritten to `BY_END=2`. Expansion from start side looks for `neighbor.opened === BY_END` but endNode already closed after first pop. Behavior undefined/untested.

2. **`BiAStarFinder.js` → `findPath`** — meeting from end side. `neighbor.opened === BY_START` branch in end-expansion loop never explicitly triggered. Design a grid where end-side expansion reaches a start-opened node first.

3. **`BiBreadthFirstFinder.js` → `findPath`** — start==end. `startNode.by=BY_START=0`, then `endNode.by=BY_END=1`; same node so second overwrites first. `endOpenList` pops same closed node — no guard.

4. **`BiBreadthFirstFinder.js` → `findPath`** — meeting from end side. `neighbor.by === BY_START` in end-expansion loop never explicitly exercised.

5. **`BiDijkstraFinder.js` → `findPath`** — start==end (same issue as BiAStar).

6. **`BiDijkstraFinder.js` → `findPath`** — meeting from end side branch.

7. **`BiBestFirstFinder.js` → constructor** — heuristic wrapping. Unlike `BestFirstFinder`, no test verifies ×1000000 scaling applied in constructor.

8. **`BiBestFirstFinder.js` → `findPath`** — start==end.

9. **`IDAStarFinder.js` → `findPath`** — start==end. `cutOff = h(start,end) = 0`. `search()` called with `cutOff=0`. Route has `route[0]=[x,y]`. Likely correct but untested.

### Priority 2 (medium)

10. **`BiAStarFinder.js`** — `endOpenList.updateItem` branch (better g found for node already in end open list).

11. **`BiAStarFinder.js`** — explicit no-path unit test (not just PathTest scenarios).

12. **`BiBreadthFirstFinder.js`** — explicit no-path unit test.

13. **`BiBestFirstFinder.js`** — explicit no-path unit test.

14. **`BiBestFirstFinder.js`** — all constructor diagonal option variants.

15. **`IDAStarFinder.js`** — `dontCrossCorners:true` combined with `allowDiagonal:true` → `OnlyWhenNoObstacles` (deprecated combined flag).

16. **`IDAStarFinder.js`** — `trackRecursion=true` post-search state: `retainCount` back to 0, `tested` reset to `false`.
