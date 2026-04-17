var should = require('should');
var PF = require('..');
var DiagonalMovement = PF.DiagonalMovement;

describe('BiBestFirstFinder', function() {
    var grid;

    beforeEach(function() {
        grid = new PF.Grid(5, 5);
    });

    describe('constructor options', function() {
        it('defaults to no diagonal', function() {
            var finder = new PF.BiBestFirstFinder();
            finder.diagonalMovement.should.equal(DiagonalMovement.Never);
        });

        it('allowDiagonal=true sets IfAtMostOneObstacle', function() {
            var finder = new PF.BiBestFirstFinder({ allowDiagonal: true });
            finder.diagonalMovement.should.equal(DiagonalMovement.IfAtMostOneObstacle);
        });

        it('allowDiagonal=true + dontCrossCorners sets OnlyWhenNoObstacles', function() {
            var finder = new PF.BiBestFirstFinder({ allowDiagonal: true, dontCrossCorners: true });
            finder.diagonalMovement.should.equal(DiagonalMovement.OnlyWhenNoObstacles);
        });

        it('explicit diagonalMovement Always', function() {
            var finder = new PF.BiBestFirstFinder({ diagonalMovement: DiagonalMovement.Always });
            finder.diagonalMovement.should.equal(DiagonalMovement.Always);
        });

        it('wraps heuristic with *1000000 scaling', function() {
            var calls = [];
            var custom = function(dx, dy) { calls.push([dx, dy]); return dx + dy; };
            var finder = new PF.BiBestFirstFinder({ heuristic: custom });
            var result = finder.heuristic(2, 3);
            result.should.equal(5000000);
            calls.length.should.equal(1);
        });
    });

    describe('findPath', function() {
        it('finds path on open grid', function() {
            var finder = new PF.BiBestFirstFinder();
            var path = finder.findPath(0, 0, 4, 4, grid);
            path.length.should.be.above(0);
            path[0].should.eql([0, 0]);
            path[path.length - 1].should.eql([4, 4]);
        });

        it('returns [] when no path exists', function() {
            var matrix = [
                [0, 0, 0, 0, 0],
                [1, 1, 1, 1, 1],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ];
            var g = new PF.Grid(matrix);
            var finder = new PF.BiBestFirstFinder();
            finder.findPath(0, 0, 4, 4, g).should.eql([]);
        });

        it('finds path with diagonal movement Always', function() {
            var finder = new PF.BiBestFirstFinder({ diagonalMovement: DiagonalMovement.Always });
            var path = finder.findPath(0, 0, 4, 4, grid);
            path.length.should.be.above(0);
            path[0].should.eql([0, 0]);
            path[path.length - 1].should.eql([4, 4]);
        });

        it('bi-directional meeting — path is contiguous', function() {
            var g = new PF.Grid(11, 1);
            var finder = new PF.BiBestFirstFinder();
            var path = finder.findPath(0, 0, 10, 0, g);
            path.length.should.be.above(0);
            for (var i = 1; i < path.length; i++) {
                var dx = Math.abs(path[i][0] - path[i-1][0]);
                var dy = Math.abs(path[i][1] - path[i-1][1]);
                (dx + dy).should.equal(1);
            }
        });

        it('custom heuristic injection runs without error', function() {
            var finder = new PF.BiBestFirstFinder({
                heuristic: function(dx, dy) { return dx * 2 + dy; }
            });
            var path = finder.findPath(0, 0, 4, 4, grid);
            path.length.should.be.above(0);
            path[0].should.eql([0, 0]);
            path[path.length - 1].should.eql([4, 4]);
        });

        it('start == end returns non-empty path at same node', function() {
            var finder = new PF.BiBestFirstFinder();
            var path = finder.findPath(2, 2, 2, 2, grid);
            path.length.should.be.above(0);
            path[0].should.eql([2, 2]);
            path[path.length - 1].should.eql([2, 2]);
        });

        it('diagonal IfAtMostOneObstacle finds path with obstacle', function() {
            var matrix = [
                [0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 0, 0, 0]
            ];
            var g = new PF.Grid(matrix);
            var finder = new PF.BiBestFirstFinder({ diagonalMovement: DiagonalMovement.IfAtMostOneObstacle });
            var path = finder.findPath(0, 2, 4, 2, g);
            path.length.should.be.above(0);
            path[0].should.eql([0, 2]);
            path[path.length - 1].should.eql([4, 2]);
        });

        it('diagonal OnlyWhenNoObstacles finds path on open grid', function() {
            var finder = new PF.BiBestFirstFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
            var path = finder.findPath(0, 0, 4, 4, grid);
            path.length.should.be.above(0);
            path[0].should.eql([0, 0]);
            path[path.length - 1].should.eql([4, 4]);
        });
    });
});
