# Racer: Dijkstra

Benchmark Dijkstra pathfinding on two maps and capture metrics.

## Maps

### Map 1: Sparse
- 15x15 grid, start (0,0), end (14,14)
- Walls: `[[2,1],[2,2],[2,3],[2,4],[4,3],[4,4],[4,5],[4,6],[6,1],[6,2],[6,3],[8,5],[8,6],[8,7],[8,8],[10,2],[10,3],[10,4],[12,6],[12,7],[12,8],[12,9]]`

### Map 2: Spiral
- 15x15 grid, start (0,0), end (7,7) center
- Walls: `[[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],[11,2],[12,2],[13,2],[13,3],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[13,4],[1,5],[11,5],[13,5],[1,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[11,6],[13,6],[1,7],[3,7],[9,7],[11,7],[13,7],[1,8],[3,8],[5,8],[9,8],[11,8],[13,8],[1,9],[3,9],[5,9],[6,9],[7,9],[8,9],[9,9],[11,9],[13,9],[1,10],[3,10],[11,10],[13,10],[1,11],[3,11],[4,11],[5,11],[6,11],[7,11],[8,11],[9,11],[10,11],[11,11],[13,11],[1,12],[13,12],[1,13],[2,13],[3,13],[4,13],[5,13],[6,13],[7,13],[8,13],[9,13],[10,13],[11,13],[12,13],[13,13]]`

## Task

1. Explore the pathfinding library in `src/` — find Dijkstra
2. Create a benchmark script that runs Dijkstra on BOTH maps
3. Capture per map: nodes explored, path length, execution time (avg over 1000 runs)
4. Write tests first (TDD)

## Output

Save results to `workers/racer-dijkstra/output/results.md` (relative to fleet root).

Include both maps' results clearly labeled.

## Rules
- Use the EXACT wall layouts above — both racers must use identical maps
- Run full suite after: `npx mocha --require should test/**/*.js`
- Do NOT modify existing library code
