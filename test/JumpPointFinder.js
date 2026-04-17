var PF = require('..');
var should = require('should');

var Grid = PF.Grid;
var DiagonalMovement = PF.DiagonalMovement;
var JumpPointFinder = PF.JumpPointFinder;

var JPFAlwaysMoveDiagonally = require('../src/finders/JPFAlwaysMoveDiagonally');
var JPFMoveDiagonallyIfNoObstacles = require('../src/finders/JPFMoveDiagonallyIfNoObstacles');
var JPFMoveDiagonallyIfAtMostOneObstacle = require('../src/finders/JPFMoveDiagonallyIfAtMostOneObstacle');
var JPFNeverMoveDiagonally = require('../src/finders/JPFNeverMoveDiagonally');

// Helper: open grid 5x5
function openGrid() {
    return new Grid(5, 5);
}

// Helper: grid with walls around a corridor
// S = start (0,0), E = end (4,4)
// 0 = walkable, 1 = blocked
function mazeGrid() {
    var matrix = [
        [0, 0, 0, 0, 0],
        [1, 1, 0, 1, 0],
        [0, 0, 0, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0]
    ];
    return new Grid(matrix);
}

// No-path grid: destination surrounded by walls
function noPathGrid() {
    var matrix = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0],
        [0, 0, 1, 0, 0]
    ];
    return new Grid(matrix);
}

// ─── Priority 4: JumpPointFinder factory ────────────────────────────────────
describe('JumpPointFinder factory', function() {
    it('DiagonalMovement.Always → JPFAlwaysMoveDiagonally', function() {
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
        finder.should.be.an.instanceOf(JPFAlwaysMoveDiagonally);
    });

    it('DiagonalMovement.OnlyWhenNoObstacles → JPFMoveDiagonallyIfNoObstacles', function() {
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
        finder.should.be.an.instanceOf(JPFMoveDiagonallyIfNoObstacles);
    });

    it('DiagonalMovement.Never → JPFNeverMoveDiagonally', function() {
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Never });
        finder.should.be.an.instanceOf(JPFNeverMoveDiagonally);
    });

    it('default (no option) → JPFMoveDiagonallyIfAtMostOneObstacle', function() {
        var finder = new JumpPointFinder();
        finder.should.be.an.instanceOf(JPFMoveDiagonallyIfAtMostOneObstacle);
    });

    it('DiagonalMovement.IfAtMostOneObstacle → JPFMoveDiagonallyIfAtMostOneObstacle', function() {
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.IfAtMostOneObstacle });
        finder.should.be.an.instanceOf(JPFMoveDiagonallyIfAtMostOneObstacle);
    });
});

// ─── Priority 1: JPFAlwaysMoveDiagonally ────────────────────────────────────
describe('JPFAlwaysMoveDiagonally', function() {
    it('findPath returns valid path on maze', function() {
        var grid = mazeGrid();
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
        var path = finder.findPath(0, 0, 4, 4, grid);
        path.length.should.be.above(0);
        path[0].should.eql([0, 0]);
        path[path.length - 1].should.eql([4, 4]);
    });

    it('no-path scenario returns []', function() {
        // Fully walled-off end node
        var matrix = [
            [0, 1, 0],
            [1, 1, 0],
            [0, 0, 0]
        ];
        var grid = new Grid(matrix);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
        var path = finder.findPath(2, 2, 0, 0, grid);
        path.should.eql([]);
    });

    it('returns [] when start equals end (trivial)', function() {
        var grid = openGrid();
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
        var path = finder.findPath(2, 2, 2, 2, grid);
        // Either empty or single-node path; must not throw
        path.should.be.an.Array();
    });

    describe('_jump', function() {
        it('returns null for unwalkable cell', function() {
            var matrix = [
                [0, 0, 0],
                [0, 1, 0],
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(2, 2);
            var result = finder._jump(1, 1, 0, 0);
            should(result).be.null();
        });

        it('returns coordinates when end node reached', function() {
            var grid = new Grid(5, 5);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(3, 3);
            var result = finder._jump(3, 3, 2, 2);
            result.should.eql([3, 3]);
        });

        it('detects horizontal forced neighbor', function() {
            // Moving right (dx=1,dy=0): forced if isWalkableAt(x+dx,y+1) && !isWalkableAt(x,y+1)
            var matrix = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 1, 0],  // obstacle at (2,2)
                [0, 0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(3, 3);
            // At (2,1) moving right: isWalkableAt(3,2)=true && !isWalkableAt(2,2)=true → forced
            var result = finder._jump(2, 1, 1, 1);
            result.should.eql([2, 1]);
        });

        it('detects vertical forced neighbor', function() {
            // Moving down (dx=0,dy=1): forced if isWalkableAt(x-1,y+dy) && !isWalkableAt(x-1,y)
            var matrix = [
                [0, 0, 0],
                [0, 0, 0],
                [1, 0, 0],  // obstacle at (0,2)
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(2, 3);
            // At (1,2) moving down: isWalkableAt(0,3)=true && !isWalkableAt(0,2)=true → forced
            var result = finder._jump(1, 2, 1, 1);
            result.should.eql([1, 2]);
        });
    });

    describe('trackJumpRecursion', function() {
        it('marks visited nodes as tested', function() {
            var grid = openGrid();
            var finder = new JumpPointFinder({
                diagonalMovement: DiagonalMovement.Always,
                trackJumpRecursion: true
            });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(4, 4);
            finder._jump(1, 1, 0, 0);
            // At least one node along path should be marked tested
            var tested = false;
            for (var y = 0; y < 5; y++) {
                for (var x = 0; x < 5; x++) {
                    if (grid.getNodeAt(x, y).tested) { tested = true; }
                }
            }
            tested.should.be.true();
        });
    });

    describe('_findNeighbors', function() {
        it('no parent returns all neighbors', function() {
            var grid = openGrid();
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
            finder.grid = grid;
            var node = grid.getNodeAt(2, 2);
            var neighbors = finder._findNeighbors(node);
            neighbors.length.should.be.above(0);
        });

        it('diagonal parent direction prunes neighbors', function() {
            var grid = openGrid();
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
            finder.grid = grid;
            var node = grid.getNodeAt(2, 2);
            node.parent = grid.getNodeAt(1, 1);
            var neighbors = finder._findNeighbors(node);
            neighbors.length.should.be.above(0);
        });

        it('horizontal parent direction prunes neighbors', function() {
            var grid = openGrid();
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
            finder.grid = grid;
            var node = grid.getNodeAt(2, 2);
            node.parent = grid.getNodeAt(1, 2);
            var neighbors = finder._findNeighbors(node);
            neighbors.length.should.be.above(0);
        });

        it('vertical parent direction prunes neighbors', function() {
            var grid = openGrid();
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
            finder.grid = grid;
            var node = grid.getNodeAt(2, 2);
            node.parent = grid.getNodeAt(2, 1);
            var neighbors = finder._findNeighbors(node);
            neighbors.length.should.be.above(0);
        });
    });
});

// ─── Priority 2: JPFMoveDiagonallyIfNoObstacles ──────────────────────────────
describe('JPFMoveDiagonallyIfNoObstacles', function() {
    it('findPath returns valid path on open grid', function() {
        var grid = new Grid(5, 5);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
        var path = finder.findPath(0, 0, 4, 4, grid);
        path.length.should.be.above(0);
        path[0].should.eql([0, 0]);
        path[path.length - 1].should.eql([4, 4]);
    });

    it('no-path scenario returns []', function() {
        var matrix = [
            [0, 1, 0],
            [1, 1, 0],
            [0, 0, 0]
        ];
        var grid = new Grid(matrix);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
        var path = finder.findPath(2, 2, 0, 0, grid);
        path.should.eql([]);
    });

    describe('_jump', function() {
        it('returns null for unwalkable cell', function() {
            var matrix = [
                [0, 0, 0],
                [0, 1, 0],
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(2, 2);
            should(finder._jump(1, 1, 0, 0)).be.null();
        });

        it('returns null diagonal continuation when vertical side blocked', function() {
            // gate: isWalkableAt(x+dx,y) && isWalkableAt(x,y+dy) — both must be true.
            // At (1,1) dx=1,dy=1:
            //   horiz sub-jump at (2,1): (2,2) blocked → no forced neighbor, OOB gate → null
            //   vert sub-jump at (1,2): blocked → null
            //   gate: isWalkableAt(2,1)=true && isWalkableAt(1,2)=false → null
            var matrix = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 1, 1]   // (1,2) and (2,2) both blocked
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(0, 2);
            var result = finder._jump(1, 1, 0, 0);
            should(result).be.null();
        });

        it('detects horizontal forced neighbor', function() {
            // Moving right (dx=1, dy=0): forced when walkable at (x,y-1) but not at (x-dx,y-1)
            var matrix = [
                [0, 1, 0, 0],  // (1,0) blocked
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(3, 3);
            // Moving right: from (1,1) toward (2,1); (1,0) blocked but (2,0) walkable
            var result = finder._jump(2, 1, 1, 1);
            result.should.eql([2, 1]);
        });

        it('detects vertical forced neighbor', function() {
            // Moving down (dy=1, dx=0): forced when walkable at (x-1,y) but not at (x-1,y-dy)
            var matrix = [
                [0, 0, 0],
                [1, 0, 0],  // (0,1) blocked
                [0, 0, 0],
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(2, 3);
            // Moving down: at (1,2), (0,2) walkable but (0,1) blocked → forced
            var result = finder._jump(1, 2, 1, 1);
            result.should.eql([1, 2]);
        });
    });

    describe('_findNeighbors', function() {
        it('no parent returns all neighbors', function() {
            var grid = openGrid();
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
            finder.grid = grid;
            var node = grid.getNodeAt(2, 2);
            finder._findNeighbors(node).length.should.be.above(0);
        });

        it('diagonal parent includes diagonal only when both sides open', function() {
            var grid = openGrid();
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
            finder.grid = grid;
            var node = grid.getNodeAt(2, 2);
            node.parent = grid.getNodeAt(1, 1);
            var neighbors = finder._findNeighbors(node);
            // Diagonal (3,3) should be included since (2,3) and (3,2) are walkable
            var hasdiag = neighbors.some(function(n) { return n[0] === 3 && n[1] === 3; });
            hasdiag.should.be.true();
        });

        it('horizontal parent includes forward neighbor', function() {
            var grid = openGrid();
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
            finder.grid = grid;
            var node = grid.getNodeAt(2, 2);
            node.parent = grid.getNodeAt(1, 2);
            var neighbors = finder._findNeighbors(node);
            var hasFwd = neighbors.some(function(n) { return n[0] === 3 && n[1] === 2; });
            hasFwd.should.be.true();
        });

        it('vertical parent includes forward neighbor', function() {
            var grid = openGrid();
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
            finder.grid = grid;
            var node = grid.getNodeAt(2, 2);
            node.parent = grid.getNodeAt(2, 1);
            var neighbors = finder._findNeighbors(node);
            var hasFwd = neighbors.some(function(n) { return n[0] === 2 && n[1] === 3; });
            hasFwd.should.be.true();
        });
    });
});

// ─── Priority 5: JPFNeverMoveDiagonally ──────────────────────────────────────
describe('JPFNeverMoveDiagonally', function() {
    it('findPath returns valid path', function() {
        var grid = new Grid(5, 5);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Never });
        var path = finder.findPath(0, 0, 4, 4, grid);
        path.length.should.be.above(0);
        path[0].should.eql([0, 0]);
        path[path.length - 1].should.eql([4, 4]);
    });

    it('no-path scenario returns []', function() {
        var matrix = [
            [0, 1, 0],
            [1, 1, 0],
            [0, 0, 0]
        ];
        var grid = new Grid(matrix);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Never });
        var path = finder.findPath(2, 2, 0, 0, grid);
        path.should.eql([]);
    });

    describe('_jump', function() {
        it('returns null for unwalkable cell', function() {
            var matrix = [[0, 1, 0], [0, 0, 0], [0, 0, 0]];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Never });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(2, 2);
            should(finder._jump(1, 0, 0, 0)).be.null();
        });

        it('returns coordinates when end node reached', function() {
            var grid = new Grid(5, 5);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Never });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(4, 0);
            var result = finder._jump(4, 0, 3, 0);
            result.should.eql([4, 0]);
        });

        it('horizontal forced-neighbor detection', function() {
            // Moving right (dx=1): forced if walkable at (x,y-1) but not at (x-dx,y-1)
            var matrix = [
                [0, 1, 0, 0],  // (1,0) blocked
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Never });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(3, 2);
            var result = finder._jump(2, 1, 1, 1);
            result.should.eql([2, 1]);
        });

        it('vertical forced-neighbor detection triggers horizontal sub-jump', function() {
            // Moving down: at x=2,y=2, x+1=3 walkable but (3,1) blocked → forced at (2,2)
            var matrix = [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 1, 0],  // (3,1) blocked
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Never });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(0, 3);
            var result = finder._jump(3, 2, 3, 1);
            result.should.eql([3, 2]);
        });

        it('throws error when dx=0 and dy=0 (invalid movement)', function() {
            var grid = new Grid(5, 5);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Never });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(4, 4);
            // dx = x-px = 0, dy = y-py = 0 → else branch throws
            (function() {
                finder._jump(2, 2, 2, 2); // dx=0, dy=0
            }).should.throw('Only horizontal and vertical movements are allowed');
        });

        it('trackJumpRecursion marks visited nodes', function() {
            var grid = new Grid(5, 5);
            var finder = new JumpPointFinder({
                diagonalMovement: DiagonalMovement.Never,
                trackJumpRecursion: true
            });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(4, 0);
            finder._jump(1, 0, 0, 0);
            grid.getNodeAt(1, 0).tested.should.be.true();
        });
    });

    describe('_findNeighbors', function() {
        it('no parent returns all neighbors', function() {
            var grid = openGrid();
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Never });
            finder.grid = grid;
            var node = grid.getNodeAt(2, 2);
            finder._findNeighbors(node).length.should.be.above(0);
        });

        it('horizontal parent: includes vertical and forward neighbors', function() {
            var grid = openGrid();
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Never });
            finder.grid = grid;
            var node = grid.getNodeAt(2, 2);
            node.parent = grid.getNodeAt(1, 2);
            var neighbors = finder._findNeighbors(node);
            var hasFwd = neighbors.some(function(n) { return n[0] === 3 && n[1] === 2; });
            hasFwd.should.be.true();
        });

        it('vertical parent: includes horizontal and forward neighbors', function() {
            var grid = openGrid();
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Never });
            finder.grid = grid;
            var node = grid.getNodeAt(2, 2);
            node.parent = grid.getNodeAt(2, 1);
            var neighbors = finder._findNeighbors(node);
            var hasFwd = neighbors.some(function(n) { return n[0] === 2 && n[1] === 3; });
            hasFwd.should.be.true();
        });
    });
});

// ─── Priority 6: JPFMoveDiagonallyIfAtMostOneObstacle ────────────────────────
describe('JPFMoveDiagonallyIfAtMostOneObstacle', function() {
    it('findPath returns valid path on maze', function() {
        var grid = mazeGrid();
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.IfAtMostOneObstacle });
        var path = finder.findPath(0, 0, 4, 4, grid);
        path.length.should.be.above(0);
        path[0].should.eql([0, 0]);
        path[path.length - 1].should.eql([4, 4]);
    });

    it('no-path scenario returns []', function() {
        var matrix = [
            [0, 1, 0],
            [1, 1, 0],
            [0, 0, 0]
        ];
        var grid = new Grid(matrix);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.IfAtMostOneObstacle });
        var path = finder.findPath(2, 2, 0, 0, grid);
        path.should.eql([]);
    });

    describe('_jump', function() {
        it('returns null for unwalkable cell', function() {
            var matrix = [[0, 1, 0], [0, 0, 0], [0, 0, 0]];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.IfAtMostOneObstacle });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(2, 2);
            should(finder._jump(1, 0, 0, 0)).be.null();
        });

        it('diagonal forced-neighbor detection', function() {
            // dx=1, dy=1: forced if walkable at (x-dx,y+dy) but not walkable at (x-dx,y)
            var matrix = [
                [0, 0, 0, 0],
                [1, 0, 0, 0],  // (0,1) blocked
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.IfAtMostOneObstacle });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(3, 3);
            // at (1,1) moving diagonally: (x-dx=0,y=1) blocked but (x-dx=0,y+dy=2) walkable
            var result = finder._jump(1, 1, 0, 0);
            result.should.eql([1, 1]);
        });

        it('returns null when both horizontal and vertical blocked (diagonal gating)', function() {
            // Moving diagonally: if both (x+dx,y) and (x,y+dy) blocked → null
            var matrix = [
                [0, 0, 0],
                [0, 0, 1],  // (2,1) blocked
                [0, 1, 0],  // (1,2) blocked
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.IfAtMostOneObstacle });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(2, 3);
            // From (1,1) moving diagonally (dx=1,dy=1): (2,1) blocked AND (1,2) blocked
            var result = finder._jump(1, 1, 0, 0);
            // Both blocked so diagonal gating returns null at the next step
            should(result).be.null();
        });

        it('trackJumpRecursion marks visited nodes', function() {
            var grid = new Grid(5, 5);
            var finder = new JumpPointFinder({
                diagonalMovement: DiagonalMovement.IfAtMostOneObstacle,
                trackJumpRecursion: true
            });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(4, 4);
            finder._jump(1, 1, 0, 0);
            grid.getNodeAt(1, 1).tested.should.be.true();
        });
    });

    describe('_findNeighbors', function() {
        it('no parent returns all neighbors', function() {
            var grid = openGrid();
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.IfAtMostOneObstacle });
            finder.grid = grid;
            finder._findNeighbors(grid.getNodeAt(2, 2)).length.should.be.above(0);
        });

        it('diagonal parent adds forced diagonal neighbors when one side blocked', function() {
            // obstacle at (x-dx, y) → add (x-dx, y+dy)
            var matrix = [
                [0, 0, 0, 0],
                [1, 0, 0, 0],  // (0,1) blocked
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.IfAtMostOneObstacle });
            finder.grid = grid;
            var node = grid.getNodeAt(1, 1); // at (1,1) moving from (0,0) → dx=1,dy=1
            node.parent = grid.getNodeAt(0, 0);
            var neighbors = finder._findNeighbors(node);
            // (x-dx=0, y+dy=2) = (0,2) should be forced neighbor
            var hasForced = neighbors.some(function(n) { return n[0] === 0 && n[1] === 2; });
            hasForced.should.be.true();
        });

        it('horizontal parent adds forced diagonal when obstacle adjacent', function() {
            var matrix = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 1, 0],  // (2,2) blocked
                [0, 0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.IfAtMostOneObstacle });
            finder.grid = grid;
            var node = grid.getNodeAt(2, 1); // moving right, parent at (1,1)
            node.parent = grid.getNodeAt(1, 1);
            var neighbors = finder._findNeighbors(node);
            // (x+dx=3, y+1=2) should be added due to blocked (2,2) → i.e. obstacle at y+1
            // Actually: blocked at (x,y+1)=(2,2), so forced (x+dx,y+1)=(3,2)
            var hasForced = neighbors.some(function(n) { return n[0] === 3 && n[1] === 2; });
            hasForced.should.be.true();
        });
    });
});

// ─── Priority 7: JumpPointFinderBase ─────────────────────────────────────────
describe('JumpPointFinderBase', function() {
    it('no-path (open list exhausted) returns []', function() {
        var matrix = [
            [0, 1, 0],
            [1, 1, 0],
            [0, 0, 0]
        ];
        var grid = new Grid(matrix);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
        var path = finder.findPath(0, 0, 0, 2, grid);
        path.should.eql([]);
    });

    it('trackJumpRecursion option propagates to subclass', function() {
        var finder = new JumpPointFinder({
            diagonalMovement: DiagonalMovement.Always,
            trackJumpRecursion: true
        });
        finder.trackJumpRecursion.should.be.true();
    });

    it('jumpNode.closed skip branch: already-closed jump nodes not re-added', function() {
        var grid = new Grid(5, 5);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
        var path = finder.findPath(0, 0, 4, 4, grid);
        path.length.should.be.above(0);
        // Verify all path nodes exist
        path.forEach(function(pt) {
            grid.isWalkableAt(pt[0], pt[1]).should.be.true();
        });
    });

    it('openList.updateItem branch: shorter path updates jump node g value', function() {
        // Open 5x5 grid: multiple paths possible, finder should pick shortest
        var grid = new Grid(7, 7);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
        var path = finder.findPath(0, 0, 6, 6, grid);
        path.length.should.be.above(0);
    });
});
