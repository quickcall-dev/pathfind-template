# Test Writer 4 — Summary

## File Written

`test/JPFNoObstaclesAndNever.test.js` — 21 new tests

## Coverage by Assignment Item

| # | Description | Test name |
|---|-------------|-----------|
| 1 | JPFNoObstacles `_jump` diagonal: commented-out forced-neighbor check — does not early-return | `diagonal: commented-out forced-neighbor check — jump does not early-return at would-be forced position` |
| 2 | JPFNoObstacles `_jump` diagonal gating: x+dx blocked → null | `diagonal: returns null when x+dx is blocked (gate fails on horizontal side)` |
| 3 | JPFNoObstacles `_jump` horizontal forced: y+1 side | `horizontal: detects forced neighbor on y+1 side` |
| 4 | JPFNoObstacles `_jump` vertical forced: x+1 side | `vertical: detects forced neighbor on x+1 side` |
| 5 | JPFNeverMoveDiagonally `_jump` horizontal forced upper (y-1) | `horizontal: detects forced neighbor on y-1 side (isolated)` |
| 6 | JPFNeverMoveDiagonally `_jump` horizontal forced lower (y+1) | `horizontal: detects forced neighbor on y+1 side` |
| 7 | JPFNeverMoveDiagonally `_jump` vertical forced left (x-1) | `vertical: detects forced neighbor on x-1 side` |
| 8 | JPFNeverMoveDiagonally `_jump` vertical forced right (x+1) | `vertical: detects forced neighbor on x+1 side` |
| 9 | JPFNeverMoveDiagonally `_jump` vertical recursive horizontal sub-jump | `vertical: recursive horizontal sub-jump detection` |
| 10 | JPFNoObstacles `_jump` trackJumpRecursion marks nodes | `trackJumpRecursion: marks visited nodes as tested` |
| 12 | JPFNoObstacles `_findNeighbors` diagonal parent: diagonal excluded when x+dx blocked | `diagonal parent: diagonal excluded when x+dx side blocked` |
| 13 | JPFNoObstacles `_findNeighbors` horizontal parent: isNextWalkable=false | `horizontal parent: isNextWalkable=false — forward neighbors excluded, perpendicular kept` |
| 14 | JPFNoObstacles `_findNeighbors` vertical parent: isNextWalkable=false | `vertical parent: isNextWalkable=false — forward neighbors excluded, side cells kept` |
| 14 | JPFNoObstacles `_findNeighbors` vertical parent: right side blocked | `vertical parent: right side blocked — right neighbor and right-forward excluded` |
| 14 | JPFNoObstacles `_findNeighbors` vertical parent: left side blocked | `vertical parent: left side blocked — left neighbor and left-forward excluded` |
| 16 | JPFNoObstacles `findPath` start==end | `findPath start==end returns array without throwing` |
| 19 | JPFNeverMoveDiagonally `_findNeighbors` forced neighbors | 5 tests: y-1/y+1 blocked, x-1/x+1 blocked, forward blocked |

## Notes

- Items already covered by `JumpPointFinder.js` (11, 15, 17, 18) were not duplicated.
- Items 1–2 required careful grid construction: any obstacle triggering the commented diagonal forced check also creates sub-jump forced points, requiring both cardinal gate cells to be blocked simultaneously to isolate the test.
- Full suite: **394 passing, 0 failing** after adding 21 new tests.
