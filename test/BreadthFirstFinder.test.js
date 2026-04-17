var should = require('should');
var PF = require('..');
var DiagonalMovement = PF.DiagonalMovement;

describe('BreadthFirstFinder', function() {
    var grid;

    beforeEach(function() {
        grid = new PF.Grid(5, 5);
    });

    describe('constructor options', function() {
        it('defaults to no diagonal', function() {
            var finder = new PF.BreadthFirstFinder();
            finder.diagonalMovement.should.equal(DiagonalMovement.Never);
        });

        it('allowDiagonal=true sets IfAtMostOneObstacle', function() {
            var finder = new PF.BreadthFirstFinder({ allowDiagonal: true });
            finder.diagonalMovement.should.equal(DiagonalMovement.IfAtMostOneObstacle);
        });

        it('allowDiagonal=true + dontCrossCorners sets OnlyWhenNoObstacles', function() {
            var finder = new PF.BreadthFirstFinder({ allowDiagonal: true, dontCrossCorners: true });
            finder.diagonalMovement.should.equal(DiagonalMovement.OnlyWhenNoObstacles);
        });

        it('explicit diagonalMovement Always', function() {
            var finder = new PF.BreadthFirstFinder({ diagonalMovement: DiagonalMovement.Always });
            finder.diagonalMovement.should.equal(DiagonalMovement.Always);
        });

        it('explicit diagonalMovement OnlyWhenNoObstacles', function() {
            var finder = new PF.BreadthFirstFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
            finder.diagonalMovement.should.equal(DiagonalMovement.OnlyWhenNoObstacles);
        });
    });

    describe('findPath', function() {
        it('finds path on open grid', function() {
            var finder = new PF.BreadthFirstFinder();
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
            var finder = new PF.BreadthFirstFinder();
            finder.findPath(0, 0, 4, 4, g).should.eql([]);
        });

        it('start == end returns single-node path', function() {
            var finder = new PF.BreadthFirstFinder();
            var path = finder.findPath(2, 2, 2, 2, grid);
            path.length.should.equal(1);
            path[0].should.eql([2, 2]);
        });

        it('diagonal Always finds shorter path than no-diagonal', function() {
            var finderDiag = new PF.BreadthFirstFinder({ diagonalMovement: DiagonalMovement.Always });
            var finderNoDiag = new PF.BreadthFirstFinder();
            var pathDiag = finderDiag.findPath(0, 0, 4, 4, new PF.Grid(5, 5));
            var pathNoDiag = finderNoDiag.findPath(0, 0, 4, 4, new PF.Grid(5, 5));
            pathDiag.length.should.be.belowOrEqual(pathNoDiag.length);
        });

        it('diagonal IfAtMostOneObstacle finds path around obstacle', function() {
            var matrix = [
                [0, 0, 0, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 1, 0, 0],
                [0, 0, 0, 0, 0]
            ];
            var g = new PF.Grid(matrix);
            var finder = new PF.BreadthFirstFinder({ allowDiagonal: true });
            var path = finder.findPath(0, 2, 4, 2, g);
            path.length.should.be.above(0);
            path[0].should.eql([0, 2]);
            path[path.length - 1].should.eql([4, 2]);
        });

        it('OnlyWhenNoObstacles does not cross corners', function() {
            // Corner scenario: obstacle at [1,1], start [0,0] go to [2,2]
            var matrix = [
                [0, 0, 0],
                [0, 1, 0],
                [0, 0, 0]
            ];
            var g = new PF.Grid(matrix);
            var finder = new PF.BreadthFirstFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
            var path = finder.findPath(0, 0, 2, 2, g);
            // path must exist but cannot go through [1,1]
            path.length.should.be.above(0);
            var hasMidpoint = path.some(function(n) { return n[0] === 1 && n[1] === 1; });
            hasMidpoint.should.be.false();
        });
    });
});
