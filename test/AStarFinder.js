var PF = require('..');
var Grid = PF.Grid;
var AStarFinder = PF.AStarFinder;
var DijkstraFinder = PF.DijkstraFinder;
var DiagonalMovement = PF.DiagonalMovement;
var Heuristic = PF.Heuristic;

// ---------------------------------------------------------------------------
// AStarFinder
// ---------------------------------------------------------------------------
describe('AStarFinder', function() {

    describe('constructor defaults', function() {
        it('no options → Never diagonal, manhattan heuristic', function() {
            var f = new AStarFinder();
            f.diagonalMovement.should.equal(DiagonalMovement.Never);
            f.heuristic.should.equal(Heuristic.manhattan);
            f.weight.should.equal(1);
        });
    });

    describe('constructor — allowDiagonal flag', function() {
        it('allowDiagonal:true → IfAtMostOneObstacle + octile', function() {
            var f = new AStarFinder({ allowDiagonal: true });
            f.diagonalMovement.should.equal(DiagonalMovement.IfAtMostOneObstacle);
            f.heuristic.should.equal(Heuristic.octile);
        });

        it('allowDiagonal:true, dontCrossCorners:true → OnlyWhenNoObstacles', function() {
            var f = new AStarFinder({ allowDiagonal: true, dontCrossCorners: true });
            f.diagonalMovement.should.equal(DiagonalMovement.OnlyWhenNoObstacles);
            f.heuristic.should.equal(Heuristic.octile);
        });
    });

    describe('constructor — explicit diagonalMovement', function() {
        [
            DiagonalMovement.Never,
            DiagonalMovement.Always,
            DiagonalMovement.IfAtMostOneObstacle,
            DiagonalMovement.OnlyWhenNoObstacles
        ].forEach(function(dm) {
            it('diagonalMovement=' + dm + ' stored correctly', function() {
                var f = new AStarFinder({ diagonalMovement: dm });
                f.diagonalMovement.should.equal(dm);
            });
        });

        it('explicit Never → manhattan heuristic', function() {
            var f = new AStarFinder({ diagonalMovement: DiagonalMovement.Never });
            f.heuristic.should.equal(Heuristic.manhattan);
        });

        it('explicit Always → octile heuristic', function() {
            var f = new AStarFinder({ diagonalMovement: DiagonalMovement.Always });
            f.heuristic.should.equal(Heuristic.octile);
        });
    });

    describe('constructor — custom heuristic', function() {
        it('custom heuristic stored and used', function() {
            var custom = function(dx, dy) { return 0; };
            var f = new AStarFinder({ heuristic: custom });
            f.heuristic.should.equal(custom);
        });

        it('custom heuristic overrides default even with diagonal', function() {
            var custom = function(dx, dy) { return dx * 2 + dy * 2; };
            var f = new AStarFinder({ allowDiagonal: true, heuristic: custom });
            f.heuristic.should.equal(custom);
        });
    });

    describe('constructor — weight', function() {
        it('weight:2 stored correctly', function() {
            var f = new AStarFinder({ weight: 2 });
            f.weight.should.equal(2);
        });

        it('weight:0.5 stored correctly', function() {
            var f = new AStarFinder({ weight: 0.5 });
            f.weight.should.equal(0.5);
        });
    });

    describe('findPath — start equals end', function() {
        it('should return path of length 1 containing the start/end node', function() {
            var grid = new Grid(5, 5);
            var finder = new AStarFinder();
            var path = finder.findPath(2, 2, 2, 2, grid);
            path.length.should.equal(1);
            path[0].should.eql([2, 2]);
        });
    });

    describe('findPath — no path (isolated by walls)', function() {
        it('should return [] when end is surrounded by walls', function() {
            // 5x5, start at (0,0), end at (4,4) walled off
            var matrix = [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 1, 0],
                [0, 0, 0, 0, 1]
            ];
            // end (4,4) blocked
            var grid = new Grid(matrix);
            var finder = new AStarFinder();
            var path = finder.findPath(0, 0, 4, 4, grid);
            path.should.eql([]);
        });

        it('should return [] when start is completely walled', function() {
            var matrix = [
                [0, 1, 0, 0, 0],
                [1, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ];
            var grid = new Grid(matrix);
            // (0,0) walkable but all neighbors blocked → can't reach (4,4)
            grid.setWalkableAt(0, 1, false);
            grid.setWalkableAt(1, 0, false);
            var finder = new AStarFinder();
            var path = finder.findPath(0, 0, 4, 4, grid);
            path.should.eql([]);
        });
    });

    describe('findPath — basic path', function() {
        it('should find a path on a clear grid', function() {
            var grid = new Grid(5, 5);
            var finder = new AStarFinder();
            var path = finder.findPath(0, 0, 4, 4, grid);
            path[0].should.eql([0, 0]);
            path[path.length - 1].should.eql([4, 4]);
        });
    });

    describe('findPath — openList.updateItem branch', function() {
        it('should update node when better g-score found via different route', function() {
            // Build a grid where a node can be reached via two paths,
            // forcing the updateItem branch (neighbor already opened, ng < neighbor.g)
            //
            // Layout (0=walkable, 1=wall):
            //   0 0 0 0 0
            //   0 1 1 1 0
            //   0 0 0 0 0
            //
            // Start (0,0), End (4,0). Straight path blocked → must go around bottom.
            // Both routes compete, ensuring a node gets re-queued with better g.
            var matrix = [
                [0, 0, 0, 0, 0],
                [0, 1, 1, 1, 0],
                [0, 0, 0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new AStarFinder({ allowDiagonal: true });
            var path = finder.findPath(0, 0, 4, 0, grid);
            path[0].should.eql([0, 0]);
            path[path.length - 1].should.eql([4, 0]);
        });
    });

    describe('findPath — weighted A*', function() {
        it('weight:2 still finds a valid path', function() {
            var grid = new Grid(5, 5);
            var finder = new AStarFinder({ weight: 2 });
            var path = finder.findPath(0, 0, 4, 4, grid);
            path[0].should.eql([0, 0]);
            path[path.length - 1].should.eql([4, 4]);
        });
    });
});

// ---------------------------------------------------------------------------
// DijkstraFinder
// ---------------------------------------------------------------------------
describe('DijkstraFinder', function() {

    describe('constructor', function() {
        it('heuristic overridden to return 0', function() {
            var f = new DijkstraFinder();
            f.heuristic(10, 20).should.equal(0);
        });

        it('option passthrough: allowDiagonal stored', function() {
            var f = new DijkstraFinder({ allowDiagonal: true });
            f.diagonalMovement.should.equal(DiagonalMovement.IfAtMostOneObstacle);
        });

        it('option passthrough: explicit diagonalMovement stored', function() {
            var f = new DijkstraFinder({ diagonalMovement: DiagonalMovement.Never });
            f.diagonalMovement.should.equal(DiagonalMovement.Never);
            // heuristic still overridden to 0
            f.heuristic(5, 5).should.equal(0);
        });
    });

    describe('findPath', function() {
        it('should find optimal path on clear grid', function() {
            var grid = new Grid(5, 5);
            var finder = new DijkstraFinder();
            var path = finder.findPath(0, 0, 4, 4, grid);
            path[0].should.eql([0, 0]);
            path[path.length - 1].should.eql([4, 4]);
            // optimal length: 9 (4 right + 4 down + 1 start)
            path.length.should.equal(9);
        });

        it('no-path scenario returns []', function() {
            var matrix = [
                [0, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new DijkstraFinder();
            var path = finder.findPath(0, 0, 2, 2, grid);
            path.should.eql([]);
        });

        it('heuristic=0 explores uniformly (finds path through longer route)', function() {
            // Two paths: direct blocked, only long way around works
            var matrix = [
                [0, 1, 0],
                [0, 1, 0],
                [0, 0, 0]
            ];
            var grid = new Grid(matrix);
            var finder = new DijkstraFinder();
            var path = finder.findPath(0, 0, 2, 0, grid);
            // Must go around: (0,0)→(0,1)→(0,2)→(1,2)→(2,2)→(2,1)→(2,0)
            path[0].should.eql([0, 0]);
            path[path.length - 1].should.eql([2, 0]);
        });
    });
});
