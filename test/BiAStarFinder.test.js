var should = require('should');
var PF = require('..');
var DiagonalMovement = PF.DiagonalMovement;
var Heuristic = PF.Heuristic;

describe('BiAStarFinder', function() {
    var grid;

    beforeEach(function() {
        grid = new PF.Grid(5, 5);
    });

    describe('constructor options', function() {
        it('defaults to manhattan heuristic and no diagonal', function() {
            var finder = new PF.BiAStarFinder();
            finder.diagonalMovement.should.equal(DiagonalMovement.Never);
        });

        it('allowDiagonal=true sets IfAtMostOneObstacle', function() {
            var finder = new PF.BiAStarFinder({ allowDiagonal: true });
            finder.diagonalMovement.should.equal(DiagonalMovement.IfAtMostOneObstacle);
        });

        it('allowDiagonal=true + dontCrossCorners sets OnlyWhenNoObstacles', function() {
            var finder = new PF.BiAStarFinder({ allowDiagonal: true, dontCrossCorners: true });
            finder.diagonalMovement.should.equal(DiagonalMovement.OnlyWhenNoObstacles);
        });

        it('explicit diagonalMovement Always overrides allowDiagonal', function() {
            var finder = new PF.BiAStarFinder({ diagonalMovement: DiagonalMovement.Always });
            finder.diagonalMovement.should.equal(DiagonalMovement.Always);
        });

        it('uses octile heuristic when diagonal movement enabled', function() {
            var finder = new PF.BiAStarFinder({ diagonalMovement: DiagonalMovement.Always });
            finder.heuristic.should.equal(Heuristic.octile);
        });

        it('accepts custom weight', function() {
            var finder = new PF.BiAStarFinder({ weight: 2 });
            finder.weight.should.equal(2);
        });

        it('accepts custom heuristic', function() {
            var custom = function(dx, dy) { return dx + dy + 1; };
            var finder = new PF.BiAStarFinder({
                heuristic: custom,
                diagonalMovement: DiagonalMovement.Never
            });
            finder.heuristic.should.equal(custom);
        });
    });

    describe('findPath', function() {
        it('finds path on open grid', function() {
            var finder = new PF.BiAStarFinder();
            var path = finder.findPath(0, 0, 4, 4, grid);
            path.length.should.be.above(0);
            path[0].should.eql([0, 0]);
            path[path.length - 1].should.eql([4, 4]);
        });

        it('returns [] when no path exists', function() {
            // wall across entire row
            var matrix = [
                [0, 0, 0, 0, 0],
                [1, 1, 1, 1, 1],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ];
            var g = new PF.Grid(matrix);
            var finder = new PF.BiAStarFinder();
            finder.findPath(0, 0, 4, 4, g).should.eql([]);
        });

        it('start == end returns path that begins and ends at the same node', function() {
            var finder = new PF.BiAStarFinder();
            var path = finder.findPath(2, 2, 2, 2, grid);
            path.length.should.be.above(0);
            path[0].should.eql([2, 2]);
            path[path.length - 1].should.eql([2, 2]);
        });

        it('finds path with diagonal movement Always', function() {
            var finder = new PF.BiAStarFinder({ diagonalMovement: DiagonalMovement.Always });
            var path = finder.findPath(0, 0, 4, 4, grid);
            path.length.should.be.above(0);
            path[0].should.eql([0, 0]);
            path[path.length - 1].should.eql([4, 4]);
        });

        it('biBacktrace — start-side expansion finds end-side node', function() {
            // Use a wider grid so start and end expansions meet in the middle
            var g = new PF.Grid(9, 1);
            var finder = new PF.BiAStarFinder();
            var path = finder.findPath(0, 0, 8, 0, g);
            path.length.should.be.above(0);
            path[0].should.eql([0, 0]);
            path[path.length - 1].should.eql([8, 0]);
        });

        it('biBacktrace — end-side expansion finds start-side node', function() {
            // Same corridor; the end side also expands and can meet start side
            var g = new PF.Grid(9, 1);
            var finder = new PF.BiAStarFinder();
            var path = finder.findPath(8, 0, 0, 0, g);
            path.length.should.be.above(0);
            path[0].should.eql([8, 0]);
            path[path.length - 1].should.eql([0, 0]);
        });

        it('both expansion directions meet — path is contiguous', function() {
            var g = new PF.Grid(11, 1);
            var finder = new PF.BiAStarFinder();
            var path = finder.findPath(0, 0, 10, 0, g);
            // every step is adjacent
            for (var i = 1; i < path.length; i++) {
                var dx = Math.abs(path[i][0] - path[i-1][0]);
                var dy = Math.abs(path[i][1] - path[i-1][1]);
                (dx + dy).should.equal(1);
            }
        });

        it('endOpenList.updateItem — finds valid path on 2D grid with diagonal movement', function() {
            // On a 2D grid with diagonal movement, the end-side expansion can
            // discover a node already in endOpenList via multiple paths; the
            // updateItem branch fires when the new cost is lower.
            var g = new PF.Grid(5, 5);
            var finder = new PF.BiAStarFinder({ diagonalMovement: DiagonalMovement.Always });
            var path = finder.findPath(0, 4, 4, 0, g);
            path.length.should.be.above(0);
            path[0].should.eql([0, 4]);
            path[path.length - 1].should.eql([4, 0]);
            // path must be contiguous (each step ≤ diagonal distance)
            for (var i = 1; i < path.length; i++) {
                var dx = Math.abs(path[i][0] - path[i-1][0]);
                var dy = Math.abs(path[i][1] - path[i-1][1]);
                Math.max(dx, dy).should.equal(1);
            }
        });
    });
});
