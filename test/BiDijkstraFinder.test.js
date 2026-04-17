var should = require('should');
var PF = require('..');
var DiagonalMovement = PF.DiagonalMovement;

describe('BiDijkstraFinder', function() {
    var grid;

    beforeEach(function() {
        grid = new PF.Grid(5, 5);
    });

    describe('constructor options', function() {
        it('defaults to no diagonal', function() {
            var finder = new PF.BiDijkstraFinder();
            finder.diagonalMovement.should.equal(DiagonalMovement.Never);
        });

        it('allowDiagonal=true sets IfAtMostOneObstacle', function() {
            var finder = new PF.BiDijkstraFinder({ allowDiagonal: true });
            finder.diagonalMovement.should.equal(DiagonalMovement.IfAtMostOneObstacle);
        });

        it('allowDiagonal=true + dontCrossCorners sets OnlyWhenNoObstacles', function() {
            var finder = new PF.BiDijkstraFinder({ allowDiagonal: true, dontCrossCorners: true });
            finder.diagonalMovement.should.equal(DiagonalMovement.OnlyWhenNoObstacles);
        });

        it('explicit diagonalMovement Always', function() {
            var finder = new PF.BiDijkstraFinder({ diagonalMovement: DiagonalMovement.Always });
            finder.diagonalMovement.should.equal(DiagonalMovement.Always);
        });

        it('overrides heuristic to zero (uniform cost)', function() {
            var finder = new PF.BiDijkstraFinder();
            finder.heuristic(5, 3).should.equal(0);
        });
    });

    describe('findPath', function() {
        it('finds path on open grid', function() {
            var finder = new PF.BiDijkstraFinder();
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
            var finder = new PF.BiDijkstraFinder();
            finder.findPath(0, 0, 4, 4, g).should.eql([]);
        });

        it('uniform cost — finds same length path as BreadthFirst on open grid', function() {
            var dijkstra = new PF.BiDijkstraFinder();
            var bfs = new PF.BreadthFirstFinder();
            var pathD = dijkstra.findPath(0, 0, 4, 4, new PF.Grid(5, 5));
            var pathB = bfs.findPath(0, 0, 4, 4, new PF.Grid(5, 5));
            pathD.length.should.equal(pathB.length);
        });

        it('finds path with diagonal movement', function() {
            var finder = new PF.BiDijkstraFinder({ diagonalMovement: DiagonalMovement.Always });
            var path = finder.findPath(0, 0, 4, 4, grid);
            path.length.should.be.above(0);
            path[0].should.eql([0, 0]);
            path[path.length - 1].should.eql([4, 4]);
        });

        it('path is contiguous (no teleport steps)', function() {
            var g = new PF.Grid(9, 1);
            var finder = new PF.BiDijkstraFinder();
            var path = finder.findPath(0, 0, 8, 0, g);
            for (var i = 1; i < path.length; i++) {
                var dx = Math.abs(path[i][0] - path[i-1][0]);
                var dy = Math.abs(path[i][1] - path[i-1][1]);
                (dx + dy).should.equal(1);
            }
        });

        it('start == end returns non-empty path at start', function() {
            var finder = new PF.BiDijkstraFinder();
            var path = finder.findPath(2, 2, 2, 2, grid);
            path.length.should.be.above(0);
            path[0].should.eql([2, 2]);
            path[path.length - 1].should.eql([2, 2]);
        });

        it('end-side expansion meets start-side node — path endpoints correct', function() {
            // Long corridor: end-side expands left and meets start-side expansion
            var g = new PF.Grid(9, 1);
            var finder = new PF.BiDijkstraFinder();
            var path = finder.findPath(8, 0, 0, 0, g);
            path.length.should.be.above(0);
            path[0].should.eql([8, 0]);
            path[path.length - 1].should.eql([0, 0]);
        });
    });
});
