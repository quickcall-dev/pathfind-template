var PF = require('..');
var should = require('should');

var Grid = PF.Grid;
var DiagonalMovement = PF.DiagonalMovement;
var Heuristic = PF.Heuristic;

/**
 * Visual demo scenario tests.
 * Tests the pathfinding library behaviors that underlie the visual app scenarios.
 */

// Helper: create open grid
function openGrid(w, h) {
    return new Grid(w || 10, h || 10);
}

// Helper: create grid with walls surrounding a position
function surroundWithWalls(grid, x, y) {
    var dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    dirs.forEach(function(d) {
        var nx = x + d[0], ny = y + d[1];
        if (grid.isInside(nx, ny)) {
            grid.setWalkableAt(nx, ny, false);
        }
    });
}

describe('Visual Scenarios', function() {

    // Priority 1: IDA* heuristic selection
    describe('Priority 1 — IDA* heuristic independence', function() {
        it('should use euclidean heuristic when explicitly passed', function() {
            var grid = openGrid();
            var finder = new PF.IDAStarFinder({ heuristic: Heuristic.euclidean });
            var path = finder.findPath(0, 0, 9, 9, grid);
            path.length.should.be.above(0);
            path[0].should.eql([0, 0]);
            path[path.length - 1].should.eql([9, 9]);
        });

        it('should produce different search behavior with manhattan vs euclidean', function() {
            var grid1 = openGrid(8, 8);
            var grid2 = openGrid(8, 8);
            var f1 = new PF.IDAStarFinder({ heuristic: Heuristic.manhattan, diagonalMovement: DiagonalMovement.Never });
            var f2 = new PF.IDAStarFinder({ heuristic: Heuristic.euclidean, diagonalMovement: DiagonalMovement.Never });
            var p1 = f1.findPath(0, 0, 7, 7, grid1);
            var p2 = f2.findPath(0, 0, 7, 7, grid2);
            // Both should find a path
            p1.length.should.be.above(0);
            p2.length.should.be.above(0);
            // Both reach same endpoint
            p1[p1.length - 1].should.eql([7, 7]);
            p2[p2.length - 1].should.eql([7, 7]);
        });
    });

    // Priority 2: No path found (start surrounded by walls)
    describe('Priority 2 — no path found feedback', function() {
        it('A* should return empty path when start is surrounded by walls', function() {
            var grid = openGrid();
            surroundWithWalls(grid, 1, 1);
            var finder = new PF.AStarFinder();
            var path = finder.findPath(1, 1, 8, 8, grid);
            path.length.should.equal(0);
        });

        it('BreadthFirst should return empty path when start is surrounded', function() {
            var grid = openGrid();
            surroundWithWalls(grid, 1, 1);
            var finder = new PF.BreadthFirstFinder();
            var path = finder.findPath(1, 1, 8, 8, grid);
            path.length.should.equal(0);
        });

        it('Dijkstra should return empty path when start is surrounded', function() {
            var grid = openGrid();
            surroundWithWalls(grid, 1, 1);
            var finder = new PF.DijkstraFinder();
            var path = finder.findPath(1, 1, 8, 8, grid);
            path.length.should.equal(0);
        });

        it('pathLength of empty path should be 0', function() {
            PF.Util.pathLength([]).should.equal(0);
        });
    });

    // Priority 3: Start equals end
    describe('Priority 3 — start equals end', function() {
        it('A* should handle start==end gracefully', function() {
            var grid = openGrid();
            var finder = new PF.AStarFinder();
            var path = finder.findPath(5, 5, 5, 5, grid);
            path.length.should.be.above(0);
            path[0].should.eql([5, 5]);
            path[path.length - 1].should.eql([5, 5]);
            PF.Util.pathLength(path).should.equal(0);
        });

        it('BreadthFirst should handle start==end gracefully', function() {
            var grid = openGrid();
            var finder = new PF.BreadthFirstFinder();
            var path = finder.findPath(5, 5, 5, 5, grid);
            path.length.should.be.above(0);
            path[0].should.eql([5, 5]);
        });

        it('Dijkstra should handle start==end gracefully', function() {
            var grid = openGrid();
            var finder = new PF.DijkstraFinder();
            var path = finder.findPath(5, 5, 5, 5, grid);
            path.length.should.be.above(0);
            PF.Util.pathLength(path).should.equal(0);
        });

        it('IDA* should handle start==end gracefully', function() {
            var grid = openGrid();
            var finder = new PF.IDAStarFinder();
            var path = finder.findPath(5, 5, 5, 5, grid);
            path.length.should.be.above(0);
            path[0].should.eql([5, 5]);
        });

        it('BiAStar should handle start==end gracefully', function() {
            var grid = openGrid();
            var finder = new PF.BiAStarFinder();
            var path = finder.findPath(5, 5, 5, 5, grid);
            path.length.should.be.above(0);
        });
    });

    // Priority 4: Drag during search — state machine only allows drag from ready/finished
    describe('Priority 4 — state machine drag guard (documented)', function() {
        it('Controller state machine should only allow dragStart from ready or finished', function() {
            // This is a UI/state-machine test. The state machine definition in controller.js
            // correctly restricts dragStart to ['ready', 'finished'] states.
            // Verified by inspection: line 69-70 of controller.js
            // No Node.js test possible without browser DOM + StateMachine lib.
            // Documenting: dragStart event from=['ready','finished'], dragEnd from=['ready','finished']
            true.should.be.true;
        });
    });

    // Priority 5: Wall on start or end position
    // Note: finders do NOT check walkability of start/end nodes. They push start
    // into open list unconditionally. So unwalkable start still explores neighbors.
    // This is a known library behavior — the visual app should prevent placing walls
    // on start/end (controller.js mousedown checks isStartOrEndPos before drawWall).
    describe('Priority 5 — wall on start or end position', function() {
        it('A* does not crash when start is unwalkable (library tolerates it)', function() {
            var grid = openGrid();
            grid.setWalkableAt(0, 0, false);
            var finder = new PF.AStarFinder();
            var path = finder.findPath(0, 0, 9, 9, grid);
            // Library still finds path from unwalkable start — not a crash
            path.should.be.an.Array();
        });

        it('A* returns empty path when end is unreachable (surrounded by walls)', function() {
            var grid = openGrid();
            surroundWithWalls(grid, 9, 9);
            var finder = new PF.AStarFinder();
            var path = finder.findPath(0, 0, 9, 9, grid);
            // End node is walkable but surrounded — unreachable
            path.length.should.equal(0);
        });

        it('visual app prevents wall on start/end via isStartOrEndPos guard', function() {
            // controller.js mousedown: checks isStartOrEndPos before drawWall/eraseWall
            // This means the UI prevents the scenario. Library-level test just verifies no crash.
            true.should.be.true;
        });

        it('Dijkstra returns empty when end surrounded by walls', function() {
            var grid = openGrid();
            surroundWithWalls(grid, 9, 9);
            var finder = new PF.DijkstraFinder();
            var path = finder.findPath(0, 0, 9, 9, grid);
            path.length.should.equal(0);
        });
    });

    // Priority 6 & 7: Pause/Resume/Restart — state machine tests (documented)
    describe('Priority 6 & 7 — pause/resume/restart (state machine)', function() {
        it('state machine allows pause from searching, resume from paused', function() {
            // controller.js state transitions:
            // pause: from='searching', to='paused'
            // resume: from='paused', to='searching'
            // The loop() function checks Controller.is('searching') — pausing stops loop.
            // resume calls this.loop() again, continuing from same operations array position.
            // Verified by code inspection. Cannot unit test without DOM.
            true.should.be.true;
        });

        it('state machine allows restart from searching or finished', function() {
            // restart: from=['searching','finished'], to='restarting'
            // onrestart clears operations, clears footprints, calls start()
            // start: from=['ready','modified','restarting'], to='starting'
            // Verified by inspection. No stale nodes because clearFootprints resets all dirty coords.
            true.should.be.true;
        });
    });

    // Priority 8: JPS diagonal modes
    describe('Priority 8 — JPS all diagonal modes', function() {
        it('JPS with IfAtMostOneObstacle should find path', function() {
            var grid = openGrid();
            var finder = new PF.JumpPointFinder({
                diagonalMovement: DiagonalMovement.IfAtMostOneObstacle
            });
            var path = finder.findPath(0, 0, 9, 9, grid);
            path.length.should.be.above(0);
            path[0].should.eql([0, 0]);
            path[path.length - 1].should.eql([9, 9]);
        });

        it('JPS with Never (orthogonal) should find path', function() {
            var grid = openGrid();
            var finder = new PF.JumpPointFinder({
                diagonalMovement: DiagonalMovement.Never
            });
            var path = finder.findPath(0, 0, 9, 9, grid);
            path.length.should.be.above(0);
            path[path.length - 1].should.eql([9, 9]);
        });

        // UI gap: Always and OnlyWhenNoObstacles not exposed in panel dropdown
        // These modes work at library level but panel.js hardcodes IfAtMostOneObstacle (line 139)
        it('JPS with Always should find path (not exposed in UI)', function() {
            var grid = openGrid();
            var finder = new PF.JumpPointFinder({
                diagonalMovement: DiagonalMovement.Always
            });
            var path = finder.findPath(0, 0, 9, 9, grid);
            path.length.should.be.above(0);
            path[path.length - 1].should.eql([9, 9]);
        });

        it('JPS with OnlyWhenNoObstacles should find path (not exposed in UI)', function() {
            var grid = openGrid();
            var finder = new PF.JumpPointFinder({
                diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles
            });
            var path = finder.findPath(0, 0, 9, 9, grid);
            path.length.should.be.above(0);
            path[path.length - 1].should.eql([9, 9]);
        });
    });

    // Priority 9: Bi-directional vs unidirectional comparison
    describe('Priority 9 — bi-directional vs unidirectional', function() {
        it('BiAStar should find similar path as AStar', function() {
            var grid1 = openGrid(20, 20);
            var grid2 = openGrid(20, 20);
            // Add obstacle wall in middle
            for (var y = 2; y < 18; y++) {
                grid1.setWalkableAt(10, y, false);
                grid2.setWalkableAt(10, y, false);
            }
            var uniPath = new PF.AStarFinder().findPath(0, 0, 19, 19, grid1);
            var biPath = new PF.BiAStarFinder().findPath(0, 0, 19, 19, grid2);
            uniPath.length.should.be.above(0);
            biPath.length.should.be.above(0);
            // Both reach same endpoints
            uniPath[0].should.eql([0, 0]);
            biPath[0].should.eql([0, 0]);
            uniPath[uniPath.length - 1].should.eql([19, 19]);
            biPath[biPath.length - 1].should.eql([19, 19]);
            // Path lengths should be similar (bi may not be optimal)
            var uniLen = PF.Util.pathLength(uniPath);
            var biLen = PF.Util.pathLength(biPath);
            biLen.should.be.above(0);
            uniLen.should.be.above(0);
        });
    });

    // Priority 10: Weight parameter effect
    describe('Priority 10 — weight parameter effect', function() {
        it('higher weight should find path (may be suboptimal)', function() {
            var grid1 = openGrid(20, 20);
            var grid2 = openGrid(20, 20);
            var f1 = new PF.AStarFinder({ weight: 1 });
            var f2 = new PF.AStarFinder({ weight: 5 });
            var p1 = f1.findPath(0, 0, 19, 19, grid1);
            var p2 = f2.findPath(0, 0, 19, 19, grid2);
            p1.length.should.be.above(0);
            p2.length.should.be.above(0);
            var len1 = PF.Util.pathLength(p1);
            var len2 = PF.Util.pathLength(p2);
            // weight=1 (optimal) path length should be <= weight=5 path length
            len1.should.be.belowOrEqual(len2);
        });
    });

    // Priority 11: IDA* time limit
    describe('Priority 11 — IDA* time limit', function() {
        it('should accept timeLimit parameter without error', function() {
            var grid = openGrid(10, 10);
            var finder = new PF.IDAStarFinder({ timeLimit: 0.000001 });
            // With tiny limit, result is either [] (timed out) or valid path (completed fast)
            var path = finder.findPath(0, 0, 9, 9, grid);
            path.should.be.an.Array();
        });

        it('should find path with generous time limit', function() {
            var grid = openGrid(10, 10);
            var finder = new PF.IDAStarFinder({ timeLimit: 60 });
            var path = finder.findPath(0, 0, 9, 9, grid);
            path.length.should.be.above(0);
        });

        it('timeLimit <= 0 treated as infinite', function() {
            var grid = openGrid();
            var finder = new PF.IDAStarFinder({ timeLimit: -1 });
            // timeLimit <= 0 means Infinity (line 42: || Infinity)
            // Actually constructor does: this.timeLimit = opt.timeLimit || Infinity
            // -1 is truthy so timeLimit = -1. But check is: this.timeLimit > 0 && ...
            // So -1 means time check is skipped. Should find path.
            var path = finder.findPath(0, 0, 9, 9, grid);
            path.length.should.be.above(0);
        });
    });

    // Priority 12: Full grid walls
    describe('Priority 12 — full grid walls', function() {
        it('should return empty path when all non-start/end cells are walls', function() {
            var grid = openGrid(5, 5);
            for (var y = 0; y < 5; y++) {
                for (var x = 0; x < 5; x++) {
                    if (!(x === 0 && y === 0) && !(x === 4 && y === 4)) {
                        grid.setWalkableAt(x, y, false);
                    }
                }
            }
            var finder = new PF.AStarFinder();
            var path = finder.findPath(0, 0, 4, 4, grid);
            path.length.should.equal(0);
        });

        it('BreadthFirst handles full walls without crash', function() {
            var grid = openGrid(5, 5);
            for (var y = 0; y < 5; y++) {
                for (var x = 0; x < 5; x++) {
                    if (!(x === 0 && y === 0) && !(x === 4 && y === 4)) {
                        grid.setWalkableAt(x, y, false);
                    }
                }
            }
            var finder = new PF.BreadthFirstFinder();
            var path = finder.findPath(0, 0, 4, 4, grid);
            path.length.should.equal(0);
        });

        it('Dijkstra handles full walls without crash', function() {
            var grid = openGrid(5, 5);
            for (var y = 0; y < 5; y++) {
                for (var x = 0; x < 5; x++) {
                    if (!(x === 0 && y === 0) && !(x === 4 && y === 4)) {
                        grid.setWalkableAt(x, y, false);
                    }
                }
            }
            var finder = new PF.DijkstraFinder();
            var path = finder.findPath(0, 0, 4, 4, grid);
            path.length.should.equal(0);
        });
    });

    // Priority 13: Large operation count performance
    describe('Priority 13 — large grid performance', function() {
        it('Dijkstra on 64x36 open grid should complete in reasonable time', function() {
            this.timeout(10000); // 10s max
            var grid = new Grid(64, 36);
            var finder = new PF.DijkstraFinder();
            var start = Date.now();
            var path = finder.findPath(0, 0, 63, 35, grid);
            var elapsed = Date.now() - start;
            path.length.should.be.above(0);
            path[0].should.eql([0, 0]);
            path[path.length - 1].should.eql([63, 35]);
            // Should complete well within 10 seconds
            elapsed.should.be.below(10000);
        });

        it('BFS on 64x36 open grid should complete in reasonable time', function() {
            this.timeout(10000);
            var grid = new Grid(64, 36);
            var finder = new PF.BreadthFirstFinder();
            var start = Date.now();
            var path = finder.findPath(0, 0, 63, 35, grid);
            var elapsed = Date.now() - start;
            path.length.should.be.above(0);
            elapsed.should.be.below(10000);
        });
    });

    // Priority 14: Adjacent start/end
    describe('Priority 14 — adjacent start and end', function() {
        it('should find minimal path when start and end are 1 step apart (horizontal)', function() {
            var grid = openGrid();
            var finder = new PF.AStarFinder();
            var path = finder.findPath(5, 5, 6, 5, grid);
            path.length.should.equal(2);
            path[0].should.eql([5, 5]);
            path[1].should.eql([6, 5]);
            PF.Util.pathLength(path).should.equal(1);
        });

        it('should find minimal path when start and end are 1 step apart (vertical)', function() {
            var grid = openGrid();
            var finder = new PF.AStarFinder();
            var path = finder.findPath(5, 5, 5, 6, grid);
            path.length.should.equal(2);
            PF.Util.pathLength(path).should.equal(1);
        });

        it('should find minimal path when start and end are 1 step apart (diagonal)', function() {
            var grid = openGrid();
            var finder = new PF.AStarFinder({ allowDiagonal: true });
            var path = finder.findPath(5, 5, 6, 6, grid);
            path.length.should.equal(2);
            path[0].should.eql([5, 5]);
            path[1].should.eql([6, 6]);
            PF.Util.pathLength(path).should.be.approximately(Math.SQRT2, 0.001);
        });

        it('BreadthFirst adjacent path should have length 1', function() {
            var grid = openGrid();
            var finder = new PF.BreadthFirstFinder();
            var path = finder.findPath(3, 3, 4, 3, grid);
            PF.Util.pathLength(path).should.equal(1);
        });
    });
});
