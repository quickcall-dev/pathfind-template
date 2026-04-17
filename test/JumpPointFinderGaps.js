var PF = require('..');
var should = require('should');

var Grid = PF.Grid;
var DiagonalMovement = PF.DiagonalMovement;
var JumpPointFinder = PF.JumpPointFinder;
var JPFMoveDiagonallyIfAtMostOneObstacle = require('../src/finders/JPFMoveDiagonallyIfAtMostOneObstacle');

// ─── Gap 2 & 3: JPFAlwaysMoveDiagonally._jump forced-neighbor branches ─────────
describe('JPFAlwaysMoveDiagonally._jump (gap branches)', function() {

    it('horizontal: lower forced neighbor (y-1 branch) — wall above current cell', function() {
        // dx=1,dy=0 at (2,2); isWalkableAt(3,1)=true && !isWalkableAt(2,1)=true → forced
        var matrix = [
            [0, 0, 0, 0],
            [0, 0, 1, 0],  // wall at (2,1)
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        var grid = new Grid(matrix);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
        finder.grid = grid;
        finder.endNode = grid.getNodeAt(3, 3);
        // Jump right from (1,2) → (2,2); (2,3) walkable so upper branch silent
        var result = finder._jump(2, 2, 1, 2);
        result.should.eql([2, 2]);
    });

    it('vertical: right forced neighbor (x+1 branch) — wall right of current cell', function() {
        // dx=0,dy=1 at (2,2); isWalkableAt(3,3)=true && !isWalkableAt(3,2)=true → forced
        var matrix = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0],  // wall at (3,2)
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];
        var grid = new Grid(matrix);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
        finder.grid = grid;
        finder.endNode = grid.getNodeAt(4, 4);
        // Jump down from (2,1) → (2,2); (1,2) walkable so left branch silent
        var result = finder._jump(2, 2, 2, 1);
        result.should.eql([2, 2]);
    });
});

// ─── Gap 6 & 7: JPFAlwaysMoveDiagonally._findNeighbors forced diagonals ────────
describe('JPFAlwaysMoveDiagonally._findNeighbors (forced diagonal gaps)', function() {

    it('horizontal parent: blocked above (x,y+1) adds forced diagonal (x+dx,y+1)', function() {
        // Node (2,2) moving right (parent 1,2), wall at (2,3) → push (3,3)
        var matrix = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 1, 0]   // wall at (2,3)
        ];
        var grid = new Grid(matrix);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
        finder.grid = grid;
        var node = grid.getNodeAt(2, 2);
        node.parent = grid.getNodeAt(1, 2);
        var neighbors = finder._findNeighbors(node);
        neighbors.some(function(n) { return n[0] === 3 && n[1] === 3; }).should.be.true();
    });

    it('horizontal parent: blocked below (x,y-1) adds forced diagonal (x+dx,y-1)', function() {
        // Node (2,2) moving right (parent 1,2), wall at (2,1) → push (3,1)
        var matrix = [
            [0, 0, 0, 0],
            [0, 0, 1, 0],  // wall at (2,1)
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        var grid = new Grid(matrix);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
        finder.grid = grid;
        var node = grid.getNodeAt(2, 2);
        node.parent = grid.getNodeAt(1, 2);
        var neighbors = finder._findNeighbors(node);
        neighbors.some(function(n) { return n[0] === 3 && n[1] === 1; }).should.be.true();
    });

    it('vertical parent: blocked right (x+1,y) adds forced diagonal (x+1,y+dy)', function() {
        // Node (2,2) moving down (parent 2,1), wall at (3,2) → push (3,3)
        var matrix = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0],  // wall at (3,2)
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];
        var grid = new Grid(matrix);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
        finder.grid = grid;
        var node = grid.getNodeAt(2, 2);
        node.parent = grid.getNodeAt(2, 1);
        var neighbors = finder._findNeighbors(node);
        neighbors.some(function(n) { return n[0] === 3 && n[1] === 3; }).should.be.true();
    });

    it('vertical parent: blocked left (x-1,y) adds forced diagonal (x-1,y+dy)', function() {
        // Node (2,2) moving down (parent 2,1), wall at (1,2) → push (1,3)
        var matrix = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0],  // wall at (1,2)
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];
        var grid = new Grid(matrix);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
        finder.grid = grid;
        var node = grid.getNodeAt(2, 2);
        node.parent = grid.getNodeAt(2, 1);
        var neighbors = finder._findNeighbors(node);
        neighbors.some(function(n) { return n[0] === 1 && n[1] === 3; }).should.be.true();
    });
});

// ─── Gap 4 & 8: JPFMoveDiagonallyIfAtMostOneObstacle._jump forced neighbors ─────
describe('JPFMoveDiagonallyIfAtMostOneObstacle._jump (gap branches)', function() {

    it('vertical: right forced neighbor (x+1 branch) — wall right of current cell', function() {
        // dx=0,dy=1 at (2,2); isWalkableAt(3,3)=true && !isWalkableAt(3,2)=true → forced
        var matrix = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0],  // wall at (3,2)
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];
        var grid = new Grid(matrix);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.IfAtMostOneObstacle });
        finder.grid = grid;
        finder.endNode = grid.getNodeAt(4, 4);
        var result = finder._jump(2, 2, 2, 1);
        result.should.eql([2, 2]);
    });

    it('vertical: left forced neighbor (x-1 branch) — wall left of current cell', function() {
        // dx=0,dy=1 at (2,2); isWalkableAt(1,3)=true && !isWalkableAt(1,2)=true → forced
        var matrix = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0],  // wall at (1,2)
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];
        var grid = new Grid(matrix);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.IfAtMostOneObstacle });
        finder.grid = grid;
        finder.endNode = grid.getNodeAt(4, 4);
        var result = finder._jump(2, 2, 2, 1);
        result.should.eql([2, 2]);
    });

    it('horizontal: lower forced neighbor (y-1 branch) — wall above current cell', function() {
        // dx=1,dy=0 at (2,2); isWalkableAt(3,1)=true && !isWalkableAt(2,1)=true → forced
        var matrix = [
            [0, 0, 0, 0],
            [0, 0, 1, 0],  // wall at (2,1)
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        var grid = new Grid(matrix);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.IfAtMostOneObstacle });
        finder.grid = grid;
        finder.endNode = grid.getNodeAt(3, 3);
        var result = finder._jump(2, 2, 1, 2);
        result.should.eql([2, 2]);
    });
});

// ─── Gap 9 & 10: JPFMoveDiagonallyIfAtMostOneObstacle._findNeighbors ───────────
describe('JPFMoveDiagonallyIfAtMostOneObstacle._findNeighbors (gap branches)', function() {

    it('vertical parent: blocked right (x+1,y) adds forced diagonal (x+1,y+dy)', function() {
        // Node (2,2) moving down (parent 2,1), wall at (3,2) → push (3,3)
        var matrix = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0],  // wall at (3,2)
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];
        var grid = new Grid(matrix);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.IfAtMostOneObstacle });
        finder.grid = grid;
        var node = grid.getNodeAt(2, 2);
        node.parent = grid.getNodeAt(2, 1);
        var neighbors = finder._findNeighbors(node);
        neighbors.some(function(n) { return n[0] === 3 && n[1] === 3; }).should.be.true();
    });

    it('vertical parent: blocked left (x-1,y) adds forced diagonal (x-1,y+dy)', function() {
        // Node (2,2) moving down (parent 2,1), wall at (1,2) → push (1,3)
        var matrix = [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0],  // wall at (1,2)
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];
        var grid = new Grid(matrix);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.IfAtMostOneObstacle });
        finder.grid = grid;
        var node = grid.getNodeAt(2, 2);
        node.parent = grid.getNodeAt(2, 1);
        var neighbors = finder._findNeighbors(node);
        neighbors.some(function(n) { return n[0] === 1 && n[1] === 3; }).should.be.true();
    });

    it('diagonal parent: upper obstacle (!isWalkableAt(x,y-dy)) adds (x+dx,y-dy)', function() {
        // Node (1,1) from parent (0,0) → dx=1,dy=1; wall at (1,0) → push (2,0)
        var matrix = [
            [0, 1, 0, 0],  // wall at (1,0)
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        var grid = new Grid(matrix);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.IfAtMostOneObstacle });
        finder.grid = grid;
        var node = grid.getNodeAt(1, 1);
        node.parent = grid.getNodeAt(0, 0);
        var neighbors = finder._findNeighbors(node);
        neighbors.some(function(n) { return n[0] === 2 && n[1] === 0; }).should.be.true();
    });
});

// ─── Gap 13: JumpPointFinderBase start==end ──────────────────────────────────────
describe('JumpPointFinderBase start==end behavior', function() {

    it('findPath returns [] when start equals end (expandPath of single node = [])', function() {
        // findPath sets startNode=endNode; pops it; node===endNode fires;
        // backtrace returns [[x,y]]; expandPath of length<2 returns []
        var grid = new Grid(5, 5);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Always });
        var path = finder.findPath(2, 2, 2, 2, grid);
        path.should.eql([]);
    });

    it('IfAtMostOneObstacle variant: start==end also returns []', function() {
        var grid = new Grid(5, 5);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.IfAtMostOneObstacle });
        var path = finder.findPath(0, 0, 0, 0, grid);
        path.should.eql([]);
    });
});

// ─── Gap 14: JumpPointFinder factory invalid diagonalMovement ────────────────────
describe('JumpPointFinder factory invalid diagonalMovement', function() {

    it('unknown value (999) falls to else branch → returns JPFMoveDiagonallyIfAtMostOneObstacle', function() {
        var finder = new JumpPointFinder({ diagonalMovement: 999 });
        finder.should.be.an.instanceOf(JPFMoveDiagonallyIfAtMostOneObstacle);
    });

    it('null diagonalMovement → falls to else branch → IfAtMostOneObstacle', function() {
        var finder = new JumpPointFinder({ diagonalMovement: null });
        finder.should.be.an.instanceOf(JPFMoveDiagonallyIfAtMostOneObstacle);
    });
});
