# PathFinding.js — Fleet Demo Template

Pre-configured repo for running [skills fleet demos](https://github.com/quickcall-dev/skills) against a real JavaScript codebase.

## Provenance

- **Upstream**: [qiao/PathFinding.js](https://github.com/qiao/PathFinding.js) — comprehensive pathfinding library for grid-based games
- **Fork point**: commit `2904a9a` (latest upstream as of 2026-04-15)
- **Patch applied**: `should.js` upgraded from `4.3.x` to `^13.2.3` for Node 25 compatibility

The codebase is untouched upstream code — no fleet-generated modifications included.

## Dev Setup

```bash
npm install
npx mocha --require should test/**/*.js   # run tests
npx http-server visual -p 8080 -c-1        # start visual demo
```

## Fleet Definitions

Four ready-to-launch fleets in `fleets/`:

| Fleet | Type | Workers | What it does |
|-------|------|---------|-------------|
| `fleet-01-test-blitz` | dag | 9 | Coverage audit → distribute → parallel test writing → validation |
| `fleet-02-scenario-builder` | iterative | 6 | Build interactive scenario builder with reviewer loop |
| `fleet-03-algorithm-race` | dag | 3 | Benchmark A* vs Dijkstra on identical maps, compile leaderboard |
| `fleet-04-dijkstra-optimize` | autoresearch | 1 | Autonomous loop: optimize Dijkstra to close gap with A* |

### Install skills (required)

```bash
npx skills add quickcall-dev/skills
```

### Launch a fleet

```bash
# DAG fleet (one-shot parallel workers)
/dag-fleet launch fleets/fleet-01-test-blitz

# Iterative fleet (reviewer-gated cycles)
/iterative-fleet launch fleets/fleet-02-scenario-builder

# DAG fleet
/dag-fleet launch fleets/fleet-03-algorithm-race

# Autoresearch fleet (autonomous research loop)
/autoresearch-fleet launch fleets/fleet-04-dijkstra-optimize
```

### Monitor

```bash
/<fleet-type> status    # check worker progress
/<fleet-type> view      # tmux pane view
/<fleet-type> report    # summary report
```

## Repo Structure

```
├── src/                  # pathfinding library source
│   ├── core/             # Grid, Node, Heap, Util
│   └── finders/          # A*, Dijkstra, BFS, JumpPoint, etc.
├── test/                 # mocha test suite
├── visual/               # browser demo app
├── bench-dijkstra.js     # benchmark for fleet-04
└── fleets/               # fleet definitions (ready to launch)
    ├── fleet-01-test-blitz/
    ├── fleet-02-scenario-builder/
    ├── fleet-03-algorithm-race/
    └── fleet-04-dijkstra-optimize/
```

## Original Library

PathFinding.js provides 10 pathfinding algorithms for 2D grids: A*, Dijkstra, BFS, BestFirst, JumpPoint, IDA*, and their bi-directional variants. See the [online demo](http://qiao.github.io/PathFinding.js/visual).

MIT License — Xueqiao Xu
