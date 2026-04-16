---
title: "fleet-definitions-ready"
experiment: 001-demo-artifacts
created: "2026-04-16 13:27 UTC"
---

## What

- Forked from [qiao/PathFinding.js](https://github.com/qiao/PathFinding.js) at `2904a9a`, patched `should.js` for Node 25
- `./dev.sh` starts tmux with visual demo server (port 8080) + test runner
- `/doc` scaffold initialized with this experiment
- 4 fleet definitions in `docs/experiments/001-demo-artifacts/fleets/`:
  - **fleet-01-test-blitz** (dag, 9 workers) — coverage audit → test writing → validation
  - **fleet-02-scenario-builder** (iterative, 6 workers) — build scenario builder with reviewer loop
  - **fleet-03-algorithm-race** (dag, 3 workers) — A* vs Dijkstra benchmark + leaderboard
  - **fleet-04-dijkstra-optimize** (autoresearch) — autonomous Dijkstra optimization loop
- fleet-04 creates its own `bench-dijkstra.js` during setup phase

## Next

Run fleets one by one, simplest first:

1. `/dag-fleet launch` fleet-03-algorithm-race
2. `/dag-fleet launch` fleet-01-test-blitz
3. `/iterative-fleet launch` fleet-02-scenario-builder
4. `/autoresearch-fleet launch` fleet-04-dijkstra-optimize

Start `./dev.sh` before launching. Checkpoint after each fleet completes.
