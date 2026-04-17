var should = require('should');
var PF = require('..');
var DiagonalMovement = PF.DiagonalMovement;

describe('BestFirstFinder', function() {
    var grid;

    beforeEach(function() {
        grid = new PF.Grid(5, 5);
    });

    describe('constructor options', function() {
        it('defaults to no diagonal', function() {
            var finder = new PF.BestFirstFinder();
            finder.diagonalMovement.should.equal(DiagonalMovement.Never);
        });

        it('allowDiagonal=true sets IfAtMostOneObstacle', function() {
            var finder = new PF.BestFirstFinder({ allowDiagonal: true });
            finder.diagonalMovement.should.equal(DiagonalMovement.IfAtMostOneObstacle);
        });

        it('allowDiagonal=true + dontCrossCorners sets OnlyWhenNoObstacles', function() {
            var finder = new PF.BestFirstFinder({ allowDiagonal: true, dontCrossCorners: true });
            finder.diagonalMovement.should.equal(DiagonalMovement.OnlyWhenNoObstacles);
        });

        it('explicit diagonalMovement Never', function() {
            var finder = new PF.BestFirstFinder({ diagonalMovement: DiagonalMovement.Never });
            finder.diagonalMovement.should.equal(DiagonalMovement.Never);
        });

        it('wraps heuristic with *1000000 scaling', function() {
            var calls = [];
            var custom = function(dx, dy) { calls.push([dx, dy]); return dx + dy; };
            var finder = new PF.BestFirstFinder({ heuristic: custom });
            // Calling finder.heuristic should invoke custom and scale
            var result = finder.heuristic(3, 4);
            result.should.equal(7000000);
            calls.length.should.equal(1);
        });
    });

    describe('findPath', function() {
        it('finds path on open grid', function() {
            var finder = new PF.BestFirstFinder();
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
            var finder = new PF.BestFirstFinder();
            finder.findPath(0, 0, 4, 4, g).should.eql([]);
        });

        it('greedy behavior — on open grid, moves straight toward goal', function() {
            // On open 7x1 grid, BestFirst should go straight along the row
            var g = new PF.Grid(7, 1);
            var finder = new PF.BestFirstFinder();
            var path = finder.findPath(0, 0, 6, 0, g);
            path.length.should.equal(7);
            for (var i = 0; i < 7; i++) {
                path[i].should.eql([i, 0]);
            }
        });

        it('finds path with diagonal movement Always', function() {
            var finder = new PF.BestFirstFinder({ diagonalMovement: DiagonalMovement.Always });
            var path = finder.findPath(0, 0, 4, 4, grid);
            path.length.should.be.above(0);
            path[0].should.eql([0, 0]);
            path[path.length - 1].should.eql([4, 4]);
        });

        it('custom heuristic injection changes behavior', function() {
            // Manhattan heuristic but reversed: prefer higher x+y first
            // Just verify it runs without error and produces a valid path
            var finder = new PF.BestFirstFinder({
                heuristic: function(dx, dy) { return -(dx + dy); }
            });
            var path = finder.findPath(0, 0, 4, 4, grid);
            path.length.should.be.above(0);
            path[0].should.eql([0, 0]);
            path[path.length - 1].should.eql([4, 4]);
        });
    });
});
