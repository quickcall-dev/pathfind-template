/**
 * Tests for JPFMoveDiagonallyIfNoObstacles and JPFNeverMoveDiagonally.
 * Covers gaps not addressed in JumpPointFinder.js.
 */
var PF = require('..');
var should = require('should');

var Grid = PF.Grid;
var DiagonalMovement = PF.DiagonalMovement;
var JumpPointFinder = PF.JumpPointFinder;

// ─── JPFMoveDiagonallyIfNoObstacles ──────────────────────────────────────────
describe('JPFMoveDiagonallyIfNoObstacles', function() {

    // ── findPath edge cases ────────────────────────────────────────────────────

    it('findPath start==end returns array without throwing', function() {
        var grid = new Grid(5, 5);
        var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
        var path = finder.findPath(2, 2, 2, 2, grid);
        path.should.be.an.Array();
    });

    // ── _jump ──────────────────────────────────────────────────────────────────

    describe('_jump', function() {

        // Item 1: commented-out diagonal forced-neighbor check
        // The code has forced-diagonal detection commented out. When an obstacle
        // would trigger that check, the result is null (gate fails) rather than
        // an early-return at the diagonal position.
        it('diagonal: commented-out forced-neighbor check — jump does not early-return at would-be forced position', function() {
            // At (2,2) dx=1,dy=1: commented condition
            //   isWalkableAt(1,3) && !isWalkableAt(1,2) would be TRUE → would return [2,2]
            // Both (3,2) and (2,3) blocked: sub-jumps return null, gate fails → null.
            var matrix = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 1, 0, 1],  // (1,2) blocked, (3,2) blocked
                [0, 0, 1, 0],  // (2,3) blocked
                [0, 0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(3, 4);
            // Sub-jump (3,2) blocked → null; sub-jump (2,3) blocked → null;
            // gate: isWalkableAt(3,2)=false → returns null
            var result = finder._jump(2, 2, 1, 1);
            should(result).be.null();
        });

        // Item 2 (complement): diagonal gating — horizontal side blocked returns null
        it('diagonal: returns null when x+dx is blocked (gate fails on horizontal side)', function() {
            // Block (2,1) AND (2,2) to prevent forced-neighbor detection in vertical sub-jump.
            // Sub-jump _jump(1,2,1,1): at (1,2), (2,2) blocked → forced check false; continues OOB → null.
            // Sub-jump _jump(2,1,1,1): (2,1) blocked → null.
            // Gate: isWalkableAt(2,1)=false → null.
            var matrix = [
                [0, 0, 0],
                [0, 0, 1],  // (2,1) blocked
                [0, 0, 1]   // (2,2) blocked
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(0, 2);
            // At (1,1) dx=1,dy=1: isWalkableAt(2,1)=false → gate fails → null
            var result = finder._jump(1, 1, 0, 0);
            should(result).be.null();
        });

        // Item 3: horizontal forced neighbor — lower side (y+1)
        it('horizontal: detects forced neighbor on y+1 side', function() {
            // Moving right from (1,1) toward (2,1): dx=1, dy=0
            // (1,2) blocked, (2,2) walkable → isWalkableAt(2,2) && !isWalkableAt(1,2) = forced
            var matrix = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 1, 0, 0],  // (1,2) blocked
                [0, 0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(3, 3);
            var result = finder._jump(2, 1, 1, 1);
            result.should.eql([2, 1]);
        });

        // Item 4: vertical forced neighbor — right side (x+1)
        it('vertical: detects forced neighbor on x+1 side', function() {
            // Moving down from (1,1) toward (1,2): dx=0, dy=1
            // (2,1) blocked, (2,2) walkable → isWalkableAt(2,2) && !isWalkableAt(2,1) = forced
            var matrix = [
                [0, 0, 0],
                [0, 0, 1],  // (2,1) blocked
                [0, 0, 0],
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(2, 3);
            var result = finder._jump(1, 2, 1, 1);
            result.should.eql([1, 2]);
        });

        // Item 10: trackJumpRecursion marks nodes as tested
        it('trackJumpRecursion: marks visited nodes as tested', function() {
            var grid = new Grid(5, 5);
            var finder = new JumpPointFinder({
                diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles,
                trackJumpRecursion: true
            });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(4, 4);
            finder._jump(1, 1, 0, 0);
            grid.getNodeAt(1, 1).tested.should.be.true();
        });

    });

    // ── _findNeighbors ─────────────────────────────────────────────────────────

    describe('_findNeighbors', function() {

        // Item 13: horizontal parent — isNextWalkable=false branch
        it('horizontal parent: isNextWalkable=false — forward neighbors excluded, perpendicular kept', function() {
            var matrix = [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 1, 0],  // (3,2) blocked
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
            finder.grid = grid;
            var node = grid.getNodeAt(2, 2);
            node.parent = grid.getNodeAt(1, 2);
            var neighbors = finder._findNeighbors(node);
            // Forward (3,2) blocked → must NOT be in neighbors
            var hasFwd = neighbors.some(function(n) { return n[0] === 3 && n[1] === 2; });
            hasFwd.should.be.false();
            // Forward diagonals (3,1),(3,3) also excluded
            var hasFwdDiag1 = neighbors.some(function(n) { return n[0] === 3 && n[1] === 1; });
            hasFwdDiag1.should.be.false();
            var hasFwdDiag2 = neighbors.some(function(n) { return n[0] === 3 && n[1] === 3; });
            hasFwdDiag2.should.be.false();
            // Perpendicular cells (2,1),(2,3) still included (walkable)
            var hasTop = neighbors.some(function(n) { return n[0] === 2 && n[1] === 1; });
            hasTop.should.be.true();
            var hasBot = neighbors.some(function(n) { return n[0] === 2 && n[1] === 3; });
            hasBot.should.be.true();
        });

        // Item 14: vertical parent — isNextWalkable=false branch
        it('vertical parent: isNextWalkable=false — forward neighbors excluded, side cells kept', function() {
            var matrix = [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0],  // (2,3) blocked
                [0, 0, 0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
            finder.grid = grid;
            var node = grid.getNodeAt(2, 2);
            node.parent = grid.getNodeAt(2, 1);
            var neighbors = finder._findNeighbors(node);
            // Forward (2,3) blocked → not in neighbors
            var hasFwd = neighbors.some(function(n) { return n[0] === 2 && n[1] === 3; });
            hasFwd.should.be.false();
            // Forward diagonals (1,3),(3,3) also excluded
            var hasFwdL = neighbors.some(function(n) { return n[0] === 1 && n[1] === 3; });
            hasFwdL.should.be.false();
            var hasFwdR = neighbors.some(function(n) { return n[0] === 3 && n[1] === 3; });
            hasFwdR.should.be.false();
            // Side cells (1,2),(3,2) still included
            var hasLeft = neighbors.some(function(n) { return n[0] === 1 && n[1] === 2; });
            hasLeft.should.be.true();
            var hasRight = neighbors.some(function(n) { return n[0] === 3 && n[1] === 2; });
            hasRight.should.be.true();
        });

        // Item 14: vertical parent — right side blocked → right cell and right-forward excluded
        it('vertical parent: right side blocked — right neighbor and right-forward excluded', function() {
            var matrix = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 1],  // (3,2) blocked
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
            finder.grid = grid;
            var node = grid.getNodeAt(2, 2);
            node.parent = grid.getNodeAt(2, 1);
            var neighbors = finder._findNeighbors(node);
            // (3,2) blocked → not in neighbors
            var hasRight = neighbors.some(function(n) { return n[0] === 3 && n[1] === 2; });
            hasRight.should.be.false();
            // (3,3) forward-right also excluded
            var hasFwdRight = neighbors.some(function(n) { return n[0] === 3 && n[1] === 3; });
            hasFwdRight.should.be.false();
        });

        // Item 14: vertical parent — left side blocked → left cell and left-forward excluded
        it('vertical parent: left side blocked — left neighbor and left-forward excluded', function() {
            var matrix = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [1, 0, 0, 0],  // (0,2) blocked
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
            finder.grid = grid;
            var node = grid.getNodeAt(1, 2);
            node.parent = grid.getNodeAt(1, 1);
            var neighbors = finder._findNeighbors(node);
            // (0,2) blocked → not in neighbors
            var hasLeft = neighbors.some(function(n) { return n[0] === 0 && n[1] === 2; });
            hasLeft.should.be.false();
            // (0,3) forward-left also excluded
            var hasFwdLeft = neighbors.some(function(n) { return n[0] === 0 && n[1] === 3; });
            hasFwdLeft.should.be.false();
        });

        // Item 12: diagonal parent — diagonal excluded when horizontal cardinal is blocked
        it('diagonal parent: diagonal excluded when x+dx side blocked', function() {
            var matrix = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 1],  // (3,2) blocked (x+dx side)
                [0, 0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
            finder.grid = grid;
            var node = grid.getNodeAt(2, 2);
            node.parent = grid.getNodeAt(1, 1);  // dx=1, dy=1
            var neighbors = finder._findNeighbors(node);
            // (3,3) should NOT be included: isWalkableAt(3,2)=false → gate fails
            var hasDiag = neighbors.some(function(n) { return n[0] === 3 && n[1] === 3; });
            hasDiag.should.be.false();
        });

    });

});


// ─── JPFNeverMoveDiagonally ───────────────────────────────────────────────────
describe('JPFNeverMoveDiagonally', function() {

    describe('_jump', function() {

        // Item 6: horizontal forced neighbor — lower side (y+1)
        it('horizontal: detects forced neighbor on y+1 side', function() {
            // Moving right from (1,1): dx=1, dy=0
            // (1,2) blocked, (2,2) walkable → isWalkableAt(2,2) && !isWalkableAt(1,2) = forced
            var matrix = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 1, 0, 0],  // (1,2) blocked
                [0, 0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Never });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(3, 3);
            var result = finder._jump(2, 1, 1, 1);
            result.should.eql([2, 1]);
        });

        // Item 7: vertical forced neighbor — left side (x-1)
        it('vertical: detects forced neighbor on x-1 side', function() {
            // Moving down: dx=0, dy=1
            // (0,1) blocked, (0,2) walkable → isWalkableAt(0,2) && !isWalkableAt(0,1) = forced
            var matrix = [
                [0, 0, 0],
                [1, 0, 0],  // (0,1) blocked
                [0, 0, 0],
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Never });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(2, 3);
            var result = finder._jump(1, 2, 1, 1);
            result.should.eql([1, 2]);
        });

        // Item 8: vertical forced neighbor — right side (x+1)
        it('vertical: detects forced neighbor on x+1 side', function() {
            // Moving down: dx=0, dy=1
            // (2,1) blocked, (2,2) walkable → isWalkableAt(2,2) && !isWalkableAt(2,1) = forced
            var matrix = [
                [0, 0, 0],
                [0, 0, 1],  // (2,1) blocked
                [0, 0, 0],
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Never });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(0, 3);
            var result = finder._jump(1, 2, 1, 1);
            result.should.eql([1, 2]);
        });

        // Item 9: vertical — recursive horizontal sub-jump returns jump point
        it('vertical: recursive horizontal sub-jump detection', function() {
            // Moving down at (2,2): no direct forced neighbors.
            // But _jump(3,2,2,2) moving right hits (3,2) which has forced neighbor:
            //   (3,1) walkable && !(2,1) walkable → forced at (3,2)? No.
            //   Actually we arrange: (2,2) blocked so (3,2): (3,1) walkable && !(2,1) blocked...
            // Easier: (2,2) blocked causes horizontal sub-jump at (3,2) to see forced lower (y-1):
            //   at (3,2): isWalkableAt(3,1) && !isWalkableAt(2,1). Need (2,1) blocked.
            // Better: at (2,3) moving down (from (2,2)). Horiz sub-jump _jump(3,3,2,3) moving right.
            //   At (3,3): (3,2) walkable && !(2,2) walkable → need (2,2) blocked.
            var matrix = [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0],  // (2,2) blocked
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Never });
            finder.grid = grid;
            finder.endNode = grid.getNodeAt(4, 4);
            // At (2,3): direct forced? (1,3)&&!(1,2)=false; (3,3)&&!(3,2)=false. No.
            // Horizontal sub-jump _jump(3,3,2,3): at (3,3) dx=1 → (3,2)&&!(2,2) = true&&true → FORCED.
            // Returns [3,3] → parent _jump(2,3,...) returns [2,3].
            var result = finder._jump(2, 3, 2, 2);
            result.should.eql([2, 3]);
        });

        // Item 5: horizontal forced neighbor — upper side (y-1), isolated verification
        it('horizontal: detects forced neighbor on y-1 side (isolated)', function() {
            // Moving right from (1,1): dx=1
            // (1,0) blocked, (2,0) walkable → isWalkableAt(2,0) && !isWalkableAt(1,0) = forced
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

    });

    // ── _findNeighbors ─────────────────────────────────────────────────────────

    describe('_findNeighbors', function() {

        // Item 19: forced neighbors (perpendicular walkable cells) included/excluded correctly
        it('horizontal parent: y-1 blocked — upper perpendicular excluded', function() {
            var matrix = [
                [0, 0, 1, 0, 0],  // (2,0) blocked
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Never });
            finder.grid = grid;
            var node = grid.getNodeAt(2, 1);
            node.parent = grid.getNodeAt(1, 1);  // dx=1
            var neighbors = finder._findNeighbors(node);
            // (2,0) blocked → not in neighbors
            var hasTop = neighbors.some(function(n) { return n[0] === 2 && n[1] === 0; });
            hasTop.should.be.false();
            // (2,2) walkable → in neighbors
            var hasBot = neighbors.some(function(n) { return n[0] === 2 && n[1] === 2; });
            hasBot.should.be.true();
            // Forward (3,1) walkable → in neighbors
            var hasFwd = neighbors.some(function(n) { return n[0] === 3 && n[1] === 1; });
            hasFwd.should.be.true();
        });

        it('horizontal parent: y+1 blocked — lower perpendicular excluded', function() {
            var matrix = [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0]   // (2,2) blocked
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Never });
            finder.grid = grid;
            var node = grid.getNodeAt(2, 1);
            node.parent = grid.getNodeAt(1, 1);  // dx=1
            var neighbors = finder._findNeighbors(node);
            // (2,2) blocked → not in neighbors
            var hasBot = neighbors.some(function(n) { return n[0] === 2 && n[1] === 2; });
            hasBot.should.be.false();
            // (2,0) walkable → in neighbors
            var hasTop = neighbors.some(function(n) { return n[0] === 2 && n[1] === 0; });
            hasTop.should.be.true();
        });

        it('vertical parent: x-1 blocked — left perpendicular excluded', function() {
            var matrix = [
                [0, 0, 0],
                [0, 0, 0],
                [1, 0, 0],  // (0,2) blocked
                [0, 0, 0],
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Never });
            finder.grid = grid;
            var node = grid.getNodeAt(1, 2);
            node.parent = grid.getNodeAt(1, 1);  // dy=1
            var neighbors = finder._findNeighbors(node);
            // (0,2) blocked → not in neighbors
            var hasLeft = neighbors.some(function(n) { return n[0] === 0 && n[1] === 2; });
            hasLeft.should.be.false();
            // (2,2) walkable → in neighbors
            var hasRight = neighbors.some(function(n) { return n[0] === 2 && n[1] === 2; });
            hasRight.should.be.true();
            // Forward (1,3) walkable → in neighbors
            var hasFwd = neighbors.some(function(n) { return n[0] === 1 && n[1] === 3; });
            hasFwd.should.be.true();
        });

        it('vertical parent: x+1 blocked — right perpendicular excluded', function() {
            var matrix = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 1],  // (2,2) blocked
                [0, 0, 0],
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Never });
            finder.grid = grid;
            var node = grid.getNodeAt(1, 2);
            node.parent = grid.getNodeAt(1, 1);  // dy=1
            var neighbors = finder._findNeighbors(node);
            // (2,2) blocked → not in neighbors
            var hasRight = neighbors.some(function(n) { return n[0] === 2 && n[1] === 2; });
            hasRight.should.be.false();
            // (0,2) walkable → in neighbors
            var hasLeft = neighbors.some(function(n) { return n[0] === 0 && n[1] === 2; });
            hasLeft.should.be.true();
        });

        it('horizontal parent: forward blocked — forward excluded', function() {
            var matrix = [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 1, 0],  // (3,1) blocked
                [0, 0, 0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new JumpPointFinder({ diagonalMovement: DiagonalMovement.Never });
            finder.grid = grid;
            var node = grid.getNodeAt(2, 1);
            node.parent = grid.getNodeAt(1, 1);  // dx=1
            var neighbors = finder._findNeighbors(node);
            // (3,1) blocked → not in neighbors
            var hasFwd = neighbors.some(function(n) { return n[0] === 3 && n[1] === 1; });
            hasFwd.should.be.false();
        });

    });

});
