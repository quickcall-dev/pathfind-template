# Leaderboard

Compile benchmark results into a leaderboard.

## Task

1. Read both racer results (paths relative to fleet root):
   - `workers/racer-astar/output/results.md`
   - `workers/racer-dijkstra/output/results.md`
2. Build a leaderboard for EACH map
3. Declare winner per map and overall

## Output

Save to `workers/leaderboard/output/leaderboard.md` (relative to fleet root).

Format as markdown tables — one per map, metrics side by side, winner column.
