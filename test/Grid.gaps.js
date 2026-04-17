/**
 * Grid.gaps.js — covers Grid edge-cases not in test/Grid.js or test/Grid.coverage.js
 * Gaps: 3, 6, 7, 8, 14, 15 from test-writer-1 assignments
 */
var PF = require('..');
var Grid = PF.Grid;
var DiagonalMovement = PF.DiagonalMovement;

describe('Grid (gap coverage)', function() {

    // ------------------------------------------------------------------
    // Gap 3 — getNeighbors: IfAtMostOneObstacle — each diagonal individually
    // d0 = s3||s0  (↖)   d1 = s0||s1  (↗)   d2 = s1||s2  (↘)   d3 = s2||s3  (↙)
    // Diagonal included when AT LEAST ONE (but not necessarily both) adjacent
    // cardinals is walkable.  This distinguishes it from OnlyWhenNoObstacles.
    // All tests use center node (1,1) in a 3×3 grid.
    // ------------------------------------------------------------------
    describe('getNeighbors — IfAtMostOneObstacle diagonals', function() {

        // Helper: get coords of neighbors
        function neighborCoords(grid, cx, cy) {
            var node = grid.getNodeAt(cx, cy);
            return grid.getNeighbors(node, DiagonalMovement.IfAtMostOneObstacle)
                .map(function(n) { return [n.x, n.y]; });
        }

        // d0 = s3||s0 → ↖ (0,0)
        it('d0 (↖): included when only up (s0) is walkable and left (s3) is blocked', function() {
            // Block left (1,1)→(0,1) but keep up (1,1)→(1,0) walkable
            var matrix = [
                [0, 0, 0],
                [1, 0, 0],  // (0,1) blocked
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var coords = neighborCoords(grid, 1, 1);
            // s3=false (left blocked), s0=true (up walkable) → d0=false||true=true
            var hasUL = coords.some(function(c) { return c[0] === 0 && c[1] === 0; });
            hasUL.should.be.true('expected ↖ diagonal when only s0 is walkable');
        });

        it('d0 (↖): included when only left (s3) is walkable and up (s0) is blocked', function() {
            var matrix = [
                [0, 1, 0],  // (1,0) blocked
                [0, 0, 0],
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var coords = neighborCoords(grid, 1, 1);
            // s0=false (up blocked), s3=true (left walkable) → d0=true||false=true
            var hasUL = coords.some(function(c) { return c[0] === 0 && c[1] === 0; });
            hasUL.should.be.true('expected ↖ diagonal when only s3 is walkable');
        });

        it('d0 (↖): excluded when BOTH up AND left are blocked', function() {
            var matrix = [
                [0, 1, 0],  // (1,0) blocked
                [1, 0, 0],  // (0,1) blocked
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var coords = neighborCoords(grid, 1, 1);
            // s0=false, s3=false → d0=false||false=false
            var hasUL = coords.some(function(c) { return c[0] === 0 && c[1] === 0; });
            hasUL.should.be.false('expected ↖ excluded when both s0 and s3 are blocked');
        });

        // d1 = s0||s1 → ↗ (2,0)
        it('d1 (↗): included when only right (s1) is walkable and up (s0) is blocked', function() {
            var matrix = [
                [0, 1, 0],  // (1,0) blocked
                [0, 0, 0],
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var coords = neighborCoords(grid, 1, 1);
            // s0=false, s1=true → d1=false||true=true
            var hasUR = coords.some(function(c) { return c[0] === 2 && c[1] === 0; });
            hasUR.should.be.true('expected ↗ diagonal when only s1 is walkable');
        });

        it('d1 (↗): excluded when BOTH up AND right are blocked', function() {
            var matrix = [
                [0, 1, 0],  // (1,0) blocked → s0=false
                [0, 0, 1],  // (2,1) blocked → s1=false
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var coords = neighborCoords(grid, 1, 1);
            var hasUR = coords.some(function(c) { return c[0] === 2 && c[1] === 0; });
            hasUR.should.be.false('expected ↗ excluded when both s0 and s1 are blocked');
        });

        // d2 = s1||s2 → ↘ (2,2)
        it('d2 (↘): included when only down (s2) is walkable and right (s1) is blocked', function() {
            var matrix = [
                [0, 0, 0],
                [0, 0, 1],  // (2,1) blocked → s1=false
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var coords = neighborCoords(grid, 1, 1);
            // s1=false, s2=true → d2=false||true=true
            var hasDR = coords.some(function(c) { return c[0] === 2 && c[1] === 2; });
            hasDR.should.be.true('expected ↘ diagonal when only s2 is walkable');
        });

        it('d2 (↘): excluded when BOTH right AND down are blocked', function() {
            var matrix = [
                [0, 0, 0],
                [0, 0, 1],  // (2,1) blocked → s1=false
                [0, 1, 0]   // (1,2) blocked → s2=false
            ];
            var grid = new Grid(matrix);
            var coords = neighborCoords(grid, 1, 1);
            var hasDR = coords.some(function(c) { return c[0] === 2 && c[1] === 2; });
            hasDR.should.be.false('expected ↘ excluded when both s1 and s2 are blocked');
        });

        // d3 = s2||s3 → ↙ (0,2)
        it('d3 (↙): included when only left (s3) is walkable and down (s2) is blocked', function() {
            var matrix = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 1, 0]   // (1,2) blocked → s2=false
            ];
            var grid = new Grid(matrix);
            var coords = neighborCoords(grid, 1, 1);
            // s2=false, s3=true → d3=false||true=true
            var hasDL = coords.some(function(c) { return c[0] === 0 && c[1] === 2; });
            hasDL.should.be.true('expected ↙ diagonal when only s3 is walkable');
        });

        it('d3 (↙): excluded when BOTH down AND left are blocked', function() {
            var matrix = [
                [0, 0, 0],
                [1, 0, 0],  // (0,1) blocked → s3=false
                [0, 1, 0]   // (1,2) blocked → s2=false
            ];
            var grid = new Grid(matrix);
            var coords = neighborCoords(grid, 1, 1);
            var hasDL = coords.some(function(c) { return c[0] === 0 && c[1] === 2; });
            hasDL.should.be.false('expected ↙ excluded when both s2 and s3 are blocked');
        });

        it('IfAtMostOneObstacle includes diagonal blocked by OnlyWhenNoObstacles', function() {
            // With one blocked cardinal, IfAtMostOneObstacle allows but OnlyWhenNoObstacles forbids
            var matrix = [
                [0, 1, 0],  // (1,0) blocked
                [0, 0, 0],
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var center = grid.getNodeAt(1, 1);

            var atMostOne = grid.getNeighbors(center, DiagonalMovement.IfAtMostOneObstacle)
                .map(function(n) { return [n.x, n.y]; });
            var noObstacles = grid.getNeighbors(center, DiagonalMovement.OnlyWhenNoObstacles)
                .map(function(n) { return [n.x, n.y]; });

            // ↗ (2,0): d1=s0||s1=false||true=true for IfAtMostOneObstacle
            var atMostHasUR = atMostOne.some(function(c) { return c[0] === 2 && c[1] === 0; });
            atMostHasUR.should.be.true('IfAtMostOneObstacle should include ↗ when only up blocked');

            // ↗ (2,0): d1=s0&&s1=false&&true=false for OnlyWhenNoObstacles
            var noObsHasUR = noObstacles.some(function(c) { return c[0] === 2 && c[1] === 0; });
            noObsHasUR.should.be.false('OnlyWhenNoObstacles should exclude ↗ when up is blocked');
        });
    });

    // ------------------------------------------------------------------
    // Gap 6 — getNeighbors: OnlyWhenNoObstacles — d1/d2/d3 diagonals
    // ------------------------------------------------------------------
    describe('getNeighbors — OnlyWhenNoObstacles d1/d2/d3', function() {

        function neighborCoords(grid, cx, cy) {
            var node = grid.getNodeAt(cx, cy);
            return grid.getNeighbors(node, DiagonalMovement.OnlyWhenNoObstacles)
                .map(function(n) { return [n.x, n.y]; });
        }

        // d1 = s0&&s1 → ↗ (2,0)
        it('d1 (↗): excluded when right (s1) is blocked', function() {
            var matrix = [
                [0, 0, 0],
                [0, 0, 1],  // (2,1) blocked
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var coords = neighborCoords(grid, 1, 1);
            var hasUR = coords.some(function(c) { return c[0] === 2 && c[1] === 0; });
            hasUR.should.be.false('↗ excluded when s1 (right) blocked');
        });

        it('d1 (↗): excluded when up (s0) is blocked', function() {
            var matrix = [
                [0, 1, 0],  // (1,0) blocked
                [0, 0, 0],
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var coords = neighborCoords(grid, 1, 1);
            var hasUR = coords.some(function(c) { return c[0] === 2 && c[1] === 0; });
            hasUR.should.be.false('↗ excluded when s0 (up) blocked');
        });

        it('d1 (↗): included when both up and right are walkable', function() {
            var grid = new Grid(3, 3);
            var coords = neighborCoords(grid, 1, 1);
            var hasUR = coords.some(function(c) { return c[0] === 2 && c[1] === 0; });
            hasUR.should.be.true('↗ included when both s0 and s1 walkable');
        });

        // d2 = s1&&s2 → ↘ (2,2)
        it('d2 (↘): excluded when down (s2) is blocked', function() {
            var matrix = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 1, 0]   // (1,2) blocked
            ];
            var grid = new Grid(matrix);
            var coords = neighborCoords(grid, 1, 1);
            var hasDR = coords.some(function(c) { return c[0] === 2 && c[1] === 2; });
            hasDR.should.be.false('↘ excluded when s2 (down) blocked');
        });

        it('d2 (↘): included when both right and down are walkable', function() {
            var grid = new Grid(3, 3);
            var coords = neighborCoords(grid, 1, 1);
            var hasDR = coords.some(function(c) { return c[0] === 2 && c[1] === 2; });
            hasDR.should.be.true('↘ included when both s1 and s2 walkable');
        });

        // d3 = s2&&s3 → ↙ (0,2)
        it('d3 (↙): excluded when left (s3) is blocked', function() {
            var matrix = [
                [0, 0, 0],
                [1, 0, 0],  // (0,1) blocked
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var coords = neighborCoords(grid, 1, 1);
            var hasDL = coords.some(function(c) { return c[0] === 0 && c[1] === 2; });
            hasDL.should.be.false('↙ excluded when s3 (left) blocked');
        });

        it('d3 (↙): included when both down and left are walkable', function() {
            var grid = new Grid(3, 3);
            var coords = neighborCoords(grid, 1, 1);
            var hasDL = coords.some(function(c) { return c[0] === 0 && c[1] === 2; });
            hasDL.should.be.true('↙ included when both s2 and s3 walkable');
        });
    });

    // ------------------------------------------------------------------
    // Gap 7 — setWalkableAt: out-of-bounds throws TypeError
    // ------------------------------------------------------------------
    describe('setWalkableAt — out-of-bounds', function() {
        it('throws when y is out of bounds (nodes[y] is undefined)', function() {
            var grid = new Grid(3, 3);
            (function() {
                grid.setWalkableAt(0, 99, true);
            }).should.throw();
        });

        it('throws when x is out of bounds (nodes[y][x] is undefined)', function() {
            var grid = new Grid(3, 3);
            (function() {
                grid.setWalkableAt(99, 0, true);
            }).should.throw();
        });

        it('throws for negative y', function() {
            var grid = new Grid(3, 3);
            (function() {
                grid.setWalkableAt(0, -1, false);
            }).should.throw();
        });
    });

    // ------------------------------------------------------------------
    // Gap 8 — getNodeAt: out-of-bounds throws TypeError
    // ------------------------------------------------------------------
    describe('getNodeAt — out-of-bounds', function() {
        it('throws when y is out of bounds', function() {
            var grid = new Grid(3, 3);
            (function() {
                grid.getNodeAt(0, 99);
            }).should.throw();
        });

        it('returns undefined (no throw) when x is out of bounds — row exists but slot is empty', function() {
            var grid = new Grid(3, 3);
            // nodes[0][99] = undefined; no TypeError because nodes[0] is a valid array
            var result = grid.getNodeAt(99, 0);
            (result === undefined).should.be.true();
        });

        it('throws for negative y', function() {
            var grid = new Grid(3, 3);
            (function() {
                grid.getNodeAt(0, -1);
            }).should.throw();
        });
    });

    // ------------------------------------------------------------------
    // Gap 14 — clone: node x/y coordinates preserved
    // ------------------------------------------------------------------
    describe('clone — node x/y coordinates preserved', function() {
        it('cloned nodes have correct x/y coordinates', function() {
            var grid = new Grid(4, 3);
            var clone = grid.clone();
            for (var y = 0; y < 3; y++) {
                for (var x = 0; x < 4; x++) {
                    clone.nodes[y][x].x.should.equal(x, 'x coord mismatch at (' + x + ',' + y + ')');
                    clone.nodes[y][x].y.should.equal(y, 'y coord mismatch at (' + x + ',' + y + ')');
                }
            }
        });
    });

    // ------------------------------------------------------------------
    // Gap 15 — _buildNodes: truthy non-1 values mark node as non-walkable
    // ------------------------------------------------------------------
    describe('_buildNodes — truthy non-1 matrix values', function() {
        it('value 2 marks node as non-walkable', function() {
            var matrix = [[2, 0], [0, 0]];
            var grid = new Grid(matrix);
            grid.isWalkableAt(0, 0).should.be.false('2 is truthy → non-walkable');
        });

        it('value true marks node as non-walkable', function() {
            var matrix = [[0, 0], [0, true]];
            var grid = new Grid(matrix);
            grid.isWalkableAt(1, 1).should.be.false('true is truthy → non-walkable');
        });

        it('value false keeps node walkable', function() {
            var matrix = [[false, 0], [0, 0]];
            var grid = new Grid(matrix);
            grid.isWalkableAt(0, 0).should.be.true('false is falsy → walkable');
        });

        it('value 0 keeps node walkable', function() {
            var matrix = [[0, 0], [0, 0]];
            var grid = new Grid(matrix);
            for (var y = 0; y < 2; y++) {
                for (var x = 0; x < 2; x++) {
                    grid.isWalkableAt(x, y).should.be.true('0 is falsy → walkable');
                }
            }
        });
    });
});
