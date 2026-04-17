# Visual Auditor

You are auditing the visual demo application for a JavaScript pathfinding library.

## Environment

Your working directory is the fleet root. All paths below are **relative to the fleet root** unless stated otherwise. Env vars: `$FLEET_ROOT`, `$WORKER_ID`, `$WORKER_OUTPUT_DIR`.

The repo root is 6 levels up from fleet root. `visual/` and `src/` are at the repo root.

## Task

1. Explore `visual/` (at repo root) — HTML, JS, CSS of the demo app
2. Identify all interactive features: grid drawing, algorithm selection, pathfinding visualization, controls
3. Identify gaps: features in `src/` but missing from the visual demo
4. Check for broken references, missing integrations, incomplete UI
5. Assess valuable visual/interactive test scenarios

## Output

Write ONE file — the visual gaps report — to:

```
workers/visual-auditor/output/visual-gaps.md
```

(Relative to fleet root.)

Format: markdown. Include:
- Current visual app capabilities
- Algorithms available vs missing from UI
- UI/UX gaps and broken features
- Suggested visual test scenarios (what to test, expected behavior)
