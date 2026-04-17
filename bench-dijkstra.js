var PF = require('./src/PathFinding');

var width = 15, height = 15;

function makeGrid() {
    var grid = new PF.Grid(width, height);
    // sparse obstacles ~15%
    var obstacles = [
        [2,1],[2,2],[2,3],[3,5],[4,5],[5,5],[6,5],[7,3],[7,4],[8,7],
        [9,7],[10,7],[11,4],[11,5],[12,2],[12,3],[1,8],[2,8],[3,8],[4,10]
    ];
    obstacles.forEach(function(o) { grid.setWalkableAt(o[0], o[1], false); });
    return grid;
}

var startX = 0, startY = 0, endX = 14, endY = 14;

var astarFinder = new PF.AStarFinder();
var dijkstraFinder = new PF.DijkstraFinder();

// Patch to count nodes explored (popped from open list)
var origFindPath = PF.AStarFinder.prototype.findPath;

function countingFindPath(sx, sy, ex, ey, grid) {
    var Heap = require('heap');
    var Util = require('./src/core/Util');
    var DiagonalMovement = require('./src/core/DiagonalMovement');

    var openList = new Heap(function(a, b) { return a.f - b.f; });
    var startNode = grid.getNodeAt(sx, sy);
    var endNode = grid.getNodeAt(ex, ey);
    var heuristic = this.heuristic;
    var diagonalMovement = this.diagonalMovement;
    var weight = this.weight;
    var abs = Math.abs, SQRT2 = Math.SQRT2;
    var node, neighbors, neighbor, i, l, x, y, ng;
    var count = 0;

    startNode.g = 0;
    startNode.f = 0;
    openList.push(startNode);
    startNode.opened = true;

    while (!openList.empty()) {
        node = openList.pop();
        node.closed = true;
        count++;

        if (node === endNode) {
            this._lastCount = count;
            return Util.backtrace(endNode);
        }

        neighbors = grid.getNeighbors(node, diagonalMovement);
        for (i = 0, l = neighbors.length; i < l; ++i) {
            neighbor = neighbors[i];
            if (neighbor.closed) continue;
            x = neighbor.x;
            y = neighbor.y;
            ng = node.g + ((x - node.x === 0 || y - node.y === 0) ? 1 : SQRT2);
            if (!neighbor.opened || ng < neighbor.g) {
                neighbor.g = ng;
                neighbor.h = neighbor.h || weight * heuristic(abs(x - ex), abs(y - ey));
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = node;
                if (!neighbor.opened) {
                    openList.push(neighbor);
                    neighbor.opened = true;
                } else {
                    openList.updateItem(neighbor);
                }
            }
        }
    }
    this._lastCount = count;
    return [];
}

PF.AStarFinder.prototype.findPath = countingFindPath;

var aGrid = makeGrid();
var aPath = astarFinder.findPath(startX, startY, endX, endY, aGrid);
var aCount = astarFinder._lastCount;

var dGrid = makeGrid();
var dPath = dijkstraFinder.findPath(startX, startY, endX, endY, dGrid);
var dCount = dijkstraFinder._lastCount;

if (aPath.length !== dPath.length) {
    process.stderr.write('PATH LENGTH MISMATCH: A*=' + aPath.length + ' Dijkstra=' + dPath.length + '\n');
    process.exit(1);
}

// Verify path optimality: same cost
function pathCost(path) {
    var cost = 0, SQRT2 = Math.SQRT2;
    for (var i = 1; i < path.length; i++) {
        var dx = Math.abs(path[i][0] - path[i-1][0]);
        var dy = Math.abs(path[i][1] - path[i-1][1]);
        cost += (dx === 0 || dy === 0) ? 1 : SQRT2;
    }
    return cost;
}

var aCost = pathCost(aPath);
var dCost = pathCost(dPath);
if (Math.abs(aCost - dCost) > 0.001) {
    process.stderr.write('COST MISMATCH: A*=' + aCost + ' Dijkstra=' + dCost + '\n');
    process.exit(1);
}

var ratio = dCount / aCount;
console.log(ratio.toFixed(4));
