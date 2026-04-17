var should = require('should');
var PF = require('..');
var DiagonalMovement = PF.DiagonalMovement;

describe('BiBreadthFirstFinder', function() {
    var grid;

    beforeEach(function() {
        grid = new PF.Grid(5, 5);
    });

    describe('constructor options', function() {
        it('defaults to no diagonal', function() {
            var finder = new PF.BiBreadthFirstFinder();
            finder.diagonalMovement.should.equal(DiagonalMovement.Never);
        });

        it('allowDiagonal=true sets IfAtMostOneObstacle', function() {
            var finder = new PF.BiBreadthFirstFinder({ allowDiagonal: true });
            finder.diagonalMovement.should.equal(DiagonalMovement.IfAtMostOneObstacle);
        });

        it('allowDiagonal=true + dontCrossCorners sets OnlyWhenNoObstacles', function() {
            var finder = new PF.BiBreadthFirstFinder({ allowDiagonal: true, dontCrossCorners: true });
            finder.diagonalMovement.should.equal(DiagonalMovement.OnlyWhenNoObstacles);
        });

        it('explicit diagonalMovement Always', function() {
            var finder = new PF.BiBreadthFirstFinder({ diagonalMovement: DiagonalMovement.Always });
            finder.diagonalMovement.should.equal(DiagonalMovement.Always);
        });
    });

    describe('findPath', function() {
        it('finds path on open grid', function() {
            var finder = new PF.BiBreadthFirstFinder();
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
            var finder = new PF.BiBreadthFirstFinder();
            finder.findPath(0, 0, 4, 4, g).should.eql([]);
        });

        it('start == end returns non-empty path', function() {
            var finder = new PF.BiBreadthFirstFinder();
            var path = finder.findPath(2, 2, 2, 2, grid);
            path.length.should.be.above(0);
            path[0].should.eql([2, 2]);
            path[path.length - 1].should.eql([2, 2]);
        });

        it('diagonal Always finds path', function() {
            var finder = new PF.BiBreadthFirstFinder({ diagonalMovement: DiagonalMovement.Always });
            var path = finder.findPath(0, 0, 4, 4, grid);
            path.length.should.be.above(0);
            path[0].should.eql([0, 0]);
            path[path.length - 1].should.eql([4, 4]);
        });

        it('diagonal IfAtMostOneObstacle navigates around obstacle', function() {
            var matrix = [
                [0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 0, 0, 0]
            ];
            var g = new PF.Grid(matrix);
            var finder = new PF.BiBreadthFirstFinder({ allowDiagonal: true });
            var path = finder.findPath(0, 2, 4, 2, g);
            path.length.should.be.above(0);
            path[0].should.eql([0, 2]);
            path[path.length - 1].should.eql([4, 2]);
        });

        it('biBacktrace from end-side — path is contiguous', function() {
            // Long corridor forces end-side expansion to meet start side
            var g = new PF.Grid(11, 1);
            var finder = new PF.BiBreadthFirstFinder();
            var path = finder.findPath(0, 0, 10, 0, g);
            path.length.should.equal(11);
            for (var i = 1; i < path.length; i++) {
                var dx = Math.abs(path[i][0] - path[i-1][0]);
                var dy = Math.abs(path[i][1] - path[i-1][1]);
                (dx + dy).should.equal(1);
            }
        });
    });
});
