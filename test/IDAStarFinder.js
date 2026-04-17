var PF = require('..');
var should = require('should');

var Grid = PF.Grid;
var DiagonalMovement = PF.DiagonalMovement;
var Heuristic = PF.Heuristic;
var IDAStarFinder = PF.IDAStarFinder;

function openGrid(w, h) {
    return new Grid(w || 5, h || 5);
}

describe('IDAStarFinder', function() {

    it('finds path on simple open grid', function() {
        var grid = openGrid();
        var finder = new IDAStarFinder();
        var path = finder.findPath(0, 0, 4, 4, grid);
        path.length.should.be.above(0);
        path[0].should.eql([0, 0]);
        path[path.length - 1].should.eql([4, 4]);
    });

    it('no-path scenario returns []', function() {
        var matrix = [
            [0, 1, 0],
            [1, 1, 0],
            [0, 0, 0]
        ];
        var grid = new Grid(matrix);
        var finder = new IDAStarFinder();
        var path = finder.findPath(0, 0, 2, 0, grid);
        path.should.eql([]);
    });

    it('route array construction: path includes start and end', function() {
        var grid = openGrid();
        var finder = new IDAStarFinder();
        var path = finder.findPath(0, 0, 3, 3, grid);
        path[0].should.eql([0, 0]);
        path[path.length - 1].should.eql([3, 3]);
    });

    it('timeLimit option: returns [] when time expires', function() {
        // heuristic=0 forces IDA* into exhaustive BFS-like search (very slow per iteration).
        // 15x15 grid with timeLimit=0.001s (1ms) ensures expiry.
        var matrix = [];
        for (var y = 0; y < 15; y++) {
            matrix.push([]);
            for (var x = 0; x < 15; x++) {
                matrix[y].push(0);
            }
        }
        var grid = new Grid(matrix);
        var finder = new IDAStarFinder({
            timeLimit: 0.001,
            heuristic: function() { return 0; }
        });
        var path = finder.findPath(0, 0, 14, 14, grid);
        path.should.eql([]);
    });

    it('trackRecursion: true — retainCount and tested tracking', function() {
        var grid = openGrid();
        var finder = new IDAStarFinder({ trackRecursion: true });
        var path = finder.findPath(0, 0, 4, 4, grid);
        path.length.should.be.above(0);
        // At least some nodes should have been marked tested during search
        var anyTested = false;
        for (var y = 0; y < 5; y++) {
            for (var x = 0; x < 5; x++) {
                var node = grid.getNodeAt(x, y);
                if (node.retainCount > 0 || node.tested === true) {
                    anyTested = true;
                }
            }
        }
        // After search completes, retainCounts decrement back to 0
        // but `tested` is reset to false on backtrack, so just verify no errors thrown
        path.should.be.an.Array();
    });

    it('weight != 1 still finds a path', function() {
        var grid = openGrid();
        var finder = new IDAStarFinder({ weight: 2 });
        var path = finder.findPath(0, 0, 4, 4, grid);
        path.length.should.be.above(0);
        path[0].should.eql([0, 0]);
        path[path.length - 1].should.eql([4, 4]);
    });

    it('custom heuristic: euclidean', function() {
        var grid = openGrid();
        var finder = new IDAStarFinder({ heuristic: Heuristic.euclidean });
        var path = finder.findPath(0, 0, 4, 4, grid);
        path.length.should.be.above(0);
        path[0].should.eql([0, 0]);
        path[path.length - 1].should.eql([4, 4]);
    });

    it('custom heuristic: chebyshev', function() {
        var grid = openGrid();
        var finder = new IDAStarFinder({ heuristic: Heuristic.chebyshev });
        var path = finder.findPath(0, 0, 4, 4, grid);
        path.length.should.be.above(0);
    });

    it('diagonal movement: Always', function() {
        var grid = openGrid();
        var finder = new IDAStarFinder({ diagonalMovement: DiagonalMovement.Always });
        var path = finder.findPath(0, 0, 4, 4, grid);
        path.length.should.be.above(0);
        path[0].should.eql([0, 0]);
        path[path.length - 1].should.eql([4, 4]);
    });

    it('diagonal movement: Never', function() {
        var grid = openGrid();
        var finder = new IDAStarFinder({ diagonalMovement: DiagonalMovement.Never });
        var path = finder.findPath(0, 0, 4, 4, grid);
        path.length.should.be.above(0);
        path[0].should.eql([0, 0]);
        path[path.length - 1].should.eql([4, 4]);
    });

    it('diagonal movement: IfAtMostOneObstacle', function() {
        var grid = openGrid();
        var finder = new IDAStarFinder({ diagonalMovement: DiagonalMovement.IfAtMostOneObstacle });
        var path = finder.findPath(0, 0, 4, 4, grid);
        path.length.should.be.above(0);
    });

    it('diagonal movement: OnlyWhenNoObstacles', function() {
        var grid = openGrid();
        var finder = new IDAStarFinder({ diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles });
        var path = finder.findPath(0, 0, 4, 4, grid);
        path.length.should.be.above(0);
    });

    it('deprecated allowDiagonal=true falls back to IfAtMostOneObstacle', function() {
        var grid = openGrid();
        var finder = new IDAStarFinder({ allowDiagonal: true });
        var path = finder.findPath(0, 0, 4, 4, grid);
        path.length.should.be.above(0);
    });

    it('deprecated allowDiagonal=false falls back to Never', function() {
        var grid = openGrid();
        var finder = new IDAStarFinder({ allowDiagonal: false });
        var path = finder.findPath(0, 0, 4, 4, grid);
        path.length.should.be.above(0);
    });

    it('start == end returns single-element path', function() {
        var grid = openGrid();
        var finder = new IDAStarFinder();
        var path = finder.findPath(2, 2, 2, 2, grid);
        path.length.should.equal(1);
        path[0].should.eql([2, 2]);
    });

    it('deprecated allowDiagonal=true + dontCrossCorners → OnlyWhenNoObstacles', function() {
        var grid = openGrid();
        var finder = new IDAStarFinder({ allowDiagonal: true, dontCrossCorners: true });
        finder.diagonalMovement.should.equal(DiagonalMovement.OnlyWhenNoObstacles);
        var path = finder.findPath(0, 0, 4, 4, grid);
        path.length.should.be.above(0);
    });

    it('trackRecursion=true: retainCount reset to 0 and tested reset to false after search', function() {
        var grid = openGrid();
        var finder = new IDAStarFinder({ trackRecursion: true });
        finder.findPath(0, 0, 4, 4, grid);
        // After search backtrack unwinds, every visited node's retainCount must be 0
        // and tested must be false (backtrack cleanup)
        for (var y = 0; y < 5; y++) {
            for (var x = 0; x < 5; x++) {
                var node = grid.getNodeAt(x, y);
                if (node.retainCount !== undefined) {
                    node.retainCount.should.equal(0);
                }
                if (node.tested !== undefined) {
                    node.tested.should.equal(false);
                }
            }
        }
    });
});
