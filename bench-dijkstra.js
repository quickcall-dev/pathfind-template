#!/usr/bin/env node
/**
 * Benchmark: Dijkstra vs A* node exploration ratio.
 *
 * Metric: nodes explored by Dijkstra / nodes explored by A*
 * Lower = better (1.0 = Dijkstra matches A*).
 *
 * Tests on sparse map where A* has clear advantage.
 * Also checks correctness: Dijkstra must find optimal path.
 */
var PF = require('./src/PathFinding');

// Sparse map: 15x15, start (0,0), end (14,14)
var sparseWalls = [[2,1],[2,2],[2,3],[2,4],[4,3],[4,4],[4,5],[4,6],[6,1],[6,2],[6,3],[8,5],[8,6],[8,7],[8,8],[10,2],[10,3],[10,4],[12,6],[12,7],[12,8],[12,9]];

function makeGrid() {
    var grid = new PF.Grid(15, 15);
    sparseWalls.forEach(function(w) { grid.setWalkableAt(w[0], w[1], false); });
    return grid;
}

function countNodes(grid) {
    var count = 0;
    grid.nodes.forEach(function(row) {
        row.forEach(function(node) {
            if (node.opened || node.closed) count++;
        });
    });
    return count;
}

// A* baseline
var astarGrid = makeGrid();
var astar = new PF.AStarFinder();
var astarPath = astar.findPath(0, 0, 14, 14, astarGrid);
var astarNodes = countNodes(astarGrid);

// Dijkstra
var dijkstraGrid = makeGrid();
var dijkstra = new PF.DijkstraFinder();
var dijkstraPath = dijkstra.findPath(0, 0, 14, 14, dijkstraGrid);
var dijkstraNodes = countNodes(dijkstraGrid);

// Correctness check
if (dijkstraPath.length === 0) {
    console.error('CRASH: Dijkstra found no path');
    process.exit(1);
}
if (dijkstraPath.length > astarPath.length) {
    console.error('CRASH: Dijkstra path longer than A* (' + dijkstraPath.length + ' vs ' + astarPath.length + ')');
    process.exit(1);
}

// Metric: ratio of nodes explored
var ratio = dijkstraNodes / astarNodes;
console.log(ratio.toFixed(4));
