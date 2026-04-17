# Scenario Builder — Visual Test Scenarios

## Source: Visual audit report (`visual-auditor/output/visual-gaps.md`)

Build test scenario definitions for the visual demo app. Each scenario should specify grid layout, start/end positions, algorithm config, and expected observable behavior.

---

### Priority 1 — Bug Validation Scenarios

1. **CSS hover selector typo** (`style.css:59`) — `#hide_instruction:hover` missing 's'. Verify hover underline never applies on `#hide_instructions` link.

2. **Instructions panel cannot be re-shown** — `#hide_instructions` click calls `slideUp()` with no toggle. Verify panel gone for session after dismiss.

3. **"Clear Walls" clears everything** (`controller.js:219`) — button says "Clear Walls" but calls `clearAll()` + `buildNewGrid()`. Verify walls AND path AND footprints all cleared.

4. **IDA* weight spinner wrong name** (`index.html:103`) — `name="astar_weight"` inside `#ida_section`. Verify weight value still reaches IDA* finder correctly despite wrong attribute name.

5. **Parent attribute not visualized** (`view.js:170`) — `case 'parent'` is a no-op. Verify no parent arrows drawn during search.

### Priority 2 — Core Visual Scenarios

6. **Open Grid** — no obstacles, all algorithms. Verify path drawn, node coloring correct, stats display.

7. **Blocked Grid (no path)** — solid wall. All algorithms. Verify no path drawn, no crash, finished state clean.

8. **Start==End (degenerate)** — drag end to start position. Verify path length 0/1, no crash, no NaN in stats.

9. **Pause and Resume** — A* large grid, pause mid-animation, resume. Verify animation stops/resumes cleanly.

10. **Drag Start/End in Finished State** — run algorithm, drag node. Verify state transition to `modified`, buttons update.

### Priority 3 — Algorithm Comparison Scenarios

11. **Diagonal Toggle** — A* Manhattan diagonal on vs off. Verify path length difference.

12. **Don't Cross Corners** — diagonal passage, `dontCrossCorners` on vs off. Verify corner-cutting behavior.

13. **Bi-directional Toggle** — A* uni vs bi. Verify ~half node expansion.

14. **IDA* Time Limit** — complex maze, 1s limit. Verify search terminates, UI handles gracefully.

15. **JPS vs A* Node Expansion** — large open grid. Verify JPS expands far fewer nodes.

16. **Weighted A*** — weight=1 vs weight=5. Verify fewer operations with higher weight.

17. **Orthogonal JPS vs BFS** — obstacles, no diagonal. Verify same path length, fewer JPS nodes.

### Priority 4 — Missing UI Features (Document Only)

18. **Missing JPS diagonal modes** — `Always` and `OnlyWhenNoObstacles` not in UI. Document that `JumpPointFinder` factory supports them but panel has no entry point.

19. **Animation speed not configurable** — hardcoded 300 ops/sec at `controller.js:95`.

20. **Grid size not configurable** — hardcoded 64×36 at `controller.js:94`.
