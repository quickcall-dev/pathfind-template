var PF = require('..');
var Grid = PF.Grid;
var DiagonalMovement = PF.DiagonalMovement;

describe('Grid (coverage)', function() {

    describe('getNodeAt', function() {
        it('should return the node at the given coordinates', function() {
            var grid = new Grid(5, 5);
            var node = grid.getNodeAt(2, 3);
            node.x.should.equal(2);
            node.y.should.equal(3);
        });
    });

    describe('_buildNodes matrix size mismatch', function() {
        it('should throw when matrix height does not match', function() {
            (function() {
                new Grid(4, 3, [[0,0],[0,0]]);
            }).should.throw('Matrix size does not fit');
        });

        it('should throw when matrix width does not match', function() {
            (function() {
                new Grid(5, 2, [[0,0],[0,0]]);
            }).should.throw('Matrix size does not fit');
        });
    });

    describe('clone', function() {
        it('should produce grid with identical walkability', function() {
            var matrix = [
                [0, 1, 0],
                [1, 0, 1],
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var clone = grid.clone();

            for (var y = 0; y < 3; y++) {
                for (var x = 0; x < 3; x++) {
                    clone.isWalkableAt(x, y).should.equal(grid.isWalkableAt(x, y));
                }
            }
        });

        it('mutation of clone should not affect original', function() {
            var grid = new Grid(3, 3);
            var clone = grid.clone();
            clone.setWalkableAt(1, 1, false);
            grid.isWalkableAt(1, 1).should.be.true;
            clone.isWalkableAt(1, 1).should.be.false;
        });
    });

    describe('getNeighbors — DiagonalMovement.Always', function() {
        it('should include all walkable diagonals regardless of cardinal walls', function() {
            // center at (1,1) with walls at up and left (s0=false, s3=false)
            // Always => d0=d1=d2=d3=true
            var matrix = [
                [1, 1, 0],
                [1, 0, 0],
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var center = grid.getNodeAt(1, 1);
            var neighbors = grid.getNeighbors(center, DiagonalMovement.Always);
            // cardinal walkable: right (2,1), down (1,2)
            // diagonal walkable: ↘(2,2) only — ↖(0,0) wall, ↗(2,0) walkable, ↙(0,2) walkable
            var coords = neighbors.map(function(n) { return [n.x, n.y]; });
            // (2,0) walkable — d1=true, isWalkableAt(2,0)=true → included
            coords.should.containDeep([[2, 0]]);
            // (0,2) walkable — d3=true, isWalkableAt(0,2)=true → included
            coords.should.containDeep([[0, 2]]);
            // (2,2) walkable — d2=true → included
            coords.should.containDeep([[2, 2]]);
            // (0,0) wall → not included
            var has00 = coords.some(function(c) { return c[0]===0 && c[1]===0; });
            has00.should.be.false;
        });

        it('should include diagonal even when both adjacent cardinals are walls', function() {
            // 3x3 grid, block everything except center and bottom-right corner
            var matrix = [
                [1, 1, 1],
                [1, 0, 1],
                [1, 1, 0]
            ];
            var grid = new Grid(matrix);
            var center = grid.getNodeAt(1, 1);
            var neighbors = grid.getNeighbors(center, DiagonalMovement.Always);
            // s0=s1=s2=s3=false, but d2=true → isWalkableAt(2,2)=true → included
            var coords = neighbors.map(function(n) { return [n.x, n.y]; });
            coords.should.eql([[2, 2]]);
        });
    });

    describe('getNeighbors — DiagonalMovement.OnlyWhenNoObstacles', function() {
        it('d0 = s3 && s0: diagonal ↖ only when both left and up are walkable', function() {
            // center at (1,1), left (0,1) walkable, up (1,0) walkable → d0=true
            var grid = new Grid(3, 3);
            var center = grid.getNodeAt(1, 1);
            var neighbors = grid.getNeighbors(center, DiagonalMovement.OnlyWhenNoObstacles);
            var coords = neighbors.map(function(n) { return [n.x, n.y]; });
            // all walkable → all 4 cardinals + all 4 diagonals
            coords.length.should.equal(8);
        });

        it('should not include ↖ diagonal when left is blocked', function() {
            var matrix = [
                [0, 0, 0],
                [1, 0, 0],
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var center = grid.getNodeAt(1, 1);
            var neighbors = grid.getNeighbors(center, DiagonalMovement.OnlyWhenNoObstacles);
            var coords = neighbors.map(function(n) { return [n.x, n.y]; });
            // s3=false (left blocked) → d0 = s3&&s0 = false → no ↖
            // s3=false → d3 = s2&&s3 = false → no ↙
            var hasUL = coords.some(function(c) { return c[0]===0 && c[1]===0; });
            hasUL.should.be.false;
        });

        it('should not include ↖ diagonal when up is blocked', function() {
            var matrix = [
                [0, 1, 0],
                [0, 0, 0],
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var center = grid.getNodeAt(1, 1);
            var neighbors = grid.getNeighbors(center, DiagonalMovement.OnlyWhenNoObstacles);
            var coords = neighbors.map(function(n) { return [n.x, n.y]; });
            // s0=false (up blocked) → d0 = s3&&s0 = false → no ↖
            var hasUL = coords.some(function(c) { return c[0]===0 && c[1]===0; });
            hasUL.should.be.false;
        });
    });

    describe('getNeighbors — invalid diagonalMovement', function() {
        it('should throw Incorrect value of diagonalMovement', function() {
            var grid = new Grid(3, 3);
            var center = grid.getNodeAt(1, 1);
            (function() {
                grid.getNeighbors(center, 999);
            }).should.throw('Incorrect value of diagonalMovement');
        });
    });

    describe('corner node neighbor pruning', function() {
        it('top-left corner: no out-of-bounds diagonals with Always', function() {
            var grid = new Grid(3, 3);
            var corner = grid.getNodeAt(0, 0);
            var neighbors = grid.getNeighbors(corner, DiagonalMovement.Always);
            var coords = neighbors.map(function(n) { return [n.x, n.y]; });
            // only (1,0), (0,1), (1,1) — no negative coords
            coords.forEach(function(c) {
                c[0].should.be.aboveOrEqual(0);
                c[1].should.be.aboveOrEqual(0);
            });
        });

        it('bottom-right corner: no out-of-bounds diagonals with Always', function() {
            var grid = new Grid(3, 3);
            var corner = grid.getNodeAt(2, 2);
            var neighbors = grid.getNeighbors(corner, DiagonalMovement.Always);
            var coords = neighbors.map(function(n) { return [n.x, n.y]; });
            coords.forEach(function(c) {
                c[0].should.be.below(3);
                c[1].should.be.below(3);
            });
        });
    });
});
