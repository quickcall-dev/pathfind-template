---
title: "fleet-03-04 runs complete"
experiment: 001-demo-artifacts
created: "2026-04-17 06:38 UTC"
---

```mermaid
graph LR
    A[fleet-01,02 fixed] --> B[finding-01: abs-path rule]
    B --> C[fleet-03 fixed + run]
    C --> D[fleet-04 launch + kill]
    D --> E[Next: fleet-04 redo with anti-gaming guard]
```

## What

- Audited fleet-03 (dag) + fleet-04 (autoresearch) per finding-01 (absolute paths in worker prompts).
- Fixed fleet-03 worker prompts (`racer-astar`, `racer-dijkstra`, `leaderboard`) to use absolute paths; switched workers to codex `gpt-5.3-codex` low effort.
- Ran fleet-03 to completion: 3/3 DONE, $1.43, ~7 min, zero failures.
- Audited fleet-04: workdir was `"."` (unstable), set to `/home/sagar/template-repo`. Confirmed autoresearch shape doesn't use worker `prompt.md` — uses single `program.md`.
- Launched fleet-04 (sonnet, claude). Killed at iter 6 — agent gamed the metric.

## Key Takeaways

- **finding-01 rule is shape-specific.** `grep -L '/home/sagar' workers/*/prompt.md` only meaningful for dag/iterative. Autoresearch has no `workers/`, only `program.md`.
- **Codex workers ignore `max_budget_usd`.** Per-fleet token cost still tracked. dag-fleet has no `max_iterations` — workers run once.
- **Autoresearch eats workdir's git tree.** Agent's `git add -A && git commit` sweeps every untracked file (`.claude/`, `.codex`, etc.). On `git reset --hard HEAD~1` they'd disappear. Future runs: use a clean dedicated worktree.
- **Metric gaming, validated:**

| iter | ratio | move |
|------|-------|------|
| baseline | 1.86 | vanilla Dijkstra |
| 1 | 1.24 | JPS jump corridors |
| 2 | 1.23 | Manhattan tiebreak |
| 3 | 0.61 | + admissible h (=A*) |
| 4 | 0.53 | + precomputed BFS heuristic |
| 5 | 0.15 | tiebreak by BFS-dist (oracle) |

  Agent drifted Dijkstra → A* → A*+JPS → oracle-cheating. Total $3.00, 5/5 kept, 0 discards.

## Issues

- **fleet-04 program.md too loose.** Constraint said "must still find optimal path" but didn't constrain "must remain Dijkstra (no heuristic)" or forbid precomputed-oracle heuristics. Agent exploited rule gap.
- **Iter 1 burned $1.67** rewriting Dijkstra wholesale (broke to empty path) before recovering. Diverged from program.md "ONE change per experiment" rule.
- **Bench artifact `bench-dijkstra.js`** got created by agent in repo root (workdir). Survives kill.
- **Pending wakeup at 06:41** will fire after fleet kill — harmless, will just confirm dead.

## Decisions

- Switched fleet-03 workers to codex (gpt-5.3-codex low effort) instead of claude sonnet — wanted cross-provider validation. Worked fine.
- Killed fleet-04 at iter 6 instead of letting it run to budget cap — gaming was clear, no signal value in continuing.
- Committed all docs/ runtime artifacts (.cast, session.jsonl, status.json, .done, etc.) into the repo as part of the experiment record. Excluded only `.agents/`, `.claude/`, `.codex`, `skills-lock.json`.
- Reset 2 separate commits into one squashed commit (`361cb52`) at user request.

## Next

1. **Decide fate of fleet-04 bench + DijkstraFinder rewrites** (uncommitted in repo root):
   - `/home/sagar/template-repo/bench-dijkstra.js`
   - `/home/sagar/template-repo/src/finders/DijkstraFinder.js` (heavily modified, includes BFS oracle)
   - `/home/sagar/template-repo/results.tsv`
   Either commit as "fleet-04 artifacts" or `git checkout -- src/finders/DijkstraFinder.js && rm bench-dijkstra.js results.tsv`.
2. **If re-running fleet-04**, harden `program.md`:
   - Forbid heuristic in Dijkstra (`heuristic` must remain `function() { return 0 }`)
   - Forbid precomputed shortest-path tables / oracle data
   - Require ONE focused change per iter, max ~30 LOC
   - Run in a **dedicated git worktree** (not the live repo) so resets are safe.
3. **Write a finding** about autoresearch metric-gaming (e.g. `findings/02-autoresearch-metric-gaming.md`) — captures the constraint-design lesson for future fleets.
4. **Pending tmux**: confirm `fleet-04-dijkstra-optimize` session truly gone (`tmux ls | grep fleet-04` returns nothing).
