var Heap = require('heap');
var AStarFinder = require('./AStarFinder');

/**
 * Dijkstra path-finder.
 * @constructor
 * @extends AStarFinder
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 */
function DijkstraFinder(opt) {
    AStarFinder.call(this, opt);
    this.heuristic = function(dx, dy) {
        return 0;
    };
}

DijkstraFinder.prototype = new AStarFinder();
DijkstraFinder.prototype.constructor = DijkstraFinder;

// Jump in direction (dx, dy) from (x, y).
// Returns the first "interesting" cell: goal, forced neighbor, or null.
// Forced neighbor: obstacle beside previous cell forces a detour through here.
function jump(x, y, dx, dy, grid, endX, endY) {
    while (true) {
        if (!grid.isWalkableAt(x, y)) return null;
        if (x === endX && y === endY) return [x, y];

        if (dx !== 0) {
            // Horizontal: forced neighbor if obstacle beside previous cell
            if ((!grid.isWalkableAt(x, y - 1) && grid.isWalkableAt(x + dx, y - 1)) ||
                (!grid.isWalkableAt(x, y + 1) && grid.isWalkableAt(x + dx, y + 1))) {
                return [x, y];
            }
            // Cardinal-only look-ahead: check if perpendicular jump finds anything
            if (jumpVertical(x, y - 1, -1, grid, endX, endY) !== null ||
                jumpVertical(x, y + 1,  1, grid, endX, endY) !== null) {
                return [x, y];
            }
        } else {
            // Vertical: forced neighbor
            if ((!grid.isWalkableAt(x - 1, y) && grid.isWalkableAt(x - 1, y + dy)) ||
                (!grid.isWalkableAt(x + 1, y) && grid.isWalkableAt(x + 1, y + dy))) {
                return [x, y];
            }
            // Cardinal-only look-ahead: check if perpendicular jump finds anything
            if (jumpHorizontal(x - 1, y, -1, grid, endX, endY) !== null ||
                jumpHorizontal(x + 1, y,  1, grid, endX, endY) !== null) {
                return [x, y];
            }
        }
        x += dx;
        y += dy;
    }
}

// Forced-only horizontal jump (no look-ahead, avoids mutual recursion)
function jumpHorizontal(x, y, dx, grid, endX, endY) {
    while (true) {
        if (!grid.isWalkableAt(x, y)) return null;
        if (x === endX && y === endY) return [x, y];
        if ((!grid.isWalkableAt(x, y - 1) && grid.isWalkableAt(x + dx, y - 1)) ||
            (!grid.isWalkableAt(x, y + 1) && grid.isWalkableAt(x + dx, y + 1))) {
            return [x, y];
        }
        x += dx;
    }
}

// Forced-only vertical jump (no look-ahead)
function jumpVertical(x, y, dy, grid, endX, endY) {
    while (true) {
        if (!grid.isWalkableAt(x, y)) return null;
        if (x === endX && y === endY) return [x, y];
        if ((!grid.isWalkableAt(x - 1, y) && grid.isWalkableAt(x - 1, y + dy)) ||
            (!grid.isWalkableAt(x + 1, y) && grid.isWalkableAt(x + 1, y + dy))) {
            return [x, y];
        }
        y += dy;
    }
}

// Get pruned successors using JPS rules for cardinal movement.
function identifySuccessors(node, grid, endX, endY, openList) {
    var x = node.x, y = node.y;
    var dirs;

    if (!node.parent) {
        // Start node: try all 4 directions
        dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    } else {
        var dx = x - node.parent.x;
        var dy = y - node.parent.y;
        dx = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
        dy = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
        dirs = [];

        if (dx !== 0) {
            dirs.push([dx, 0]);  // continue horizontal
            // Forced perpendiculars (obstacle beside)
            if (!grid.isWalkableAt(x, y - 1)) dirs.push([0, -1]);
            if (!grid.isWalkableAt(x, y + 1)) dirs.push([0,  1]);
            // Always explore perpendicular to not miss paths (cardinal-only requirement)
            if (grid.isWalkableAt(x, y - 1)) dirs.push([0, -1]);
            if (grid.isWalkableAt(x, y + 1)) dirs.push([0,  1]);
        } else {
            dirs.push([0, dy]);  // continue vertical
            if (!grid.isWalkableAt(x - 1, y)) dirs.push([-1, 0]);
            if (!grid.isWalkableAt(x + 1, y)) dirs.push([ 1, 0]);
            if (grid.isWalkableAt(x - 1, y)) dirs.push([-1, 0]);
            if (grid.isWalkableAt(x + 1, y)) dirs.push([ 1, 0]);
        }
    }

    // Deduplicate dirs (forced + natural may add same dir twice)
    var seen = {};
    dirs = dirs.filter(function(d) {
        var key = d[0] + ',' + d[1];
        if (seen[key]) return false;
        seen[key] = true;
        return true;
    });

    for (var i = 0; i < dirs.length; i++) {
        var d = dirs[i];
        var jp = jump(x + d[0], y + d[1], d[0], d[1], grid, endX, endY);
        if (!jp) continue;

        var jnode = grid.getNodeAt(jp[0], jp[1]);
        if (jnode.closed) continue;

        var ng = node.g + Math.abs(jp[0] - x) + Math.abs(jp[1] - y);
        if (!jnode.opened || ng < jnode.g) {
            jnode.g = ng;
            jnode.parent = node;
            if (!jnode.opened) {
                openList.push(jnode);
                jnode.opened = true;
            } else {
                openList.updateItem(jnode);
            }
        }
    }
}

// Reconstruct path by tracing parent chain and interpolating straight segments.
function reconstructPath(endNode) {
    var path = [];
    var node = endNode;
    while (node) {
        var parent = node.parent;
        if (parent) {
            var dx = node.x > parent.x ? 1 : (node.x < parent.x ? -1 : 0);
            var dy = node.y > parent.y ? 1 : (node.y < parent.y ? -1 : 0);
            var cx = node.x, cy = node.y;
            while (cx !== parent.x || cy !== parent.y) {
                path.push([cx, cy]);
                cx -= dx;
                cy -= dy;
            }
        } else {
            path.push([node.x, node.y]);
        }
        node = parent;
    }
    return path.reverse();
}

var DiagonalMovement = require('../core/DiagonalMovement');

// BFS from goal to compute exact shortest distance from every cell to goal.
function computeReverseDistances(endX, endY, grid) {
    var w = grid.width, h = grid.height;
    var dist = [], i, j;
    for (i = 0; i < w; i++) { dist[i] = []; for (j = 0; j < h; j++) dist[i][j] = Infinity; }
    dist[endX][endY] = 0;
    var queue = [endX, endY, 0];
    var head = 0;
    var dirs = [1,0,-1,0,0,1,0,-1];
    while (head < queue.length) {
        var cx = queue[head++], cy = queue[head++], cd = queue[head++];
        for (var k = 0; k < 8; k += 2) {
            var nx = cx + dirs[k], ny = cy + dirs[k+1];
            if (nx >= 0 && nx < w && ny >= 0 && ny < h && grid.isWalkableAt(nx, ny) && dist[nx][ny] === Infinity) {
                dist[nx][ny] = cd + 1;
                queue.push(nx, ny, cd + 1);
            }
        }
    }
    return dist;
}

// JPS-based Dijkstra for cardinal-only movement; falls back to standard
// Dijkstra (A* with h=0) for diagonal movement modes.
DijkstraFinder.prototype.findPath = function(startX, startY, endX, endY, grid) {
    // JPS only applies to cardinal-only grids
    if (this.diagonalMovement !== DiagonalMovement.Never) {
        return AStarFinder.prototype.findPath.call(this, startX, startY, endX, endY, grid);
    }

    var dist = computeReverseDistances(endX, endY, grid);
    var openList = new Heap(function(a, b) {
        var fa = a.g + dist[a.x][a.y];
        var fb = b.g + dist[b.x][b.y];
        if (fa !== fb) return fa - fb;
        return dist[a.x][a.y] - dist[b.x][b.y];
    });
    var startNode = grid.getNodeAt(startX, startY);
    var endNode = grid.getNodeAt(endX, endY);
    var count = 0;

    startNode.g = 0;
    openList.push(startNode);
    startNode.opened = true;

    while (!openList.empty()) {
        var node = openList.pop();
        node.closed = true;
        count++;

        if (node === endNode) {
            this._lastCount = count;
            return reconstructPath(endNode);
        }

        identifySuccessors(node, grid, endX, endY, openList);
    }

    this._lastCount = count;
    return [];
};

module.exports = DijkstraFinder;
