var PF = require('..');
var should = require('should');

var Grid = PF.Grid;
var DiagonalMovement = PF.DiagonalMovement;
var Heuristic = PF.Heuristic;
var Util = PF.Util;
var fs = require('fs');
var path = require('path');

/**
 * Visual Demo Bug Validation & Scenario Tests
 * Tests from scenario-builder assignments (fleet-01-test-blitz)
 */

// Helper: create open grid
function openGrid(w, h) {
    return new Grid(w || 10, h || 10);
}

// Helper: build wall column
function wallColumn(grid, x, yStart, yEnd) {
    for (var y = yStart; y <= yEnd; y++) {
        grid.setWalkableAt(x, y, false);
    }
}

// Helper: surround position with walls
function surroundWithWalls(grid, x, y) {
    var dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    dirs.forEach(function(d) {
        var nx = x + d[0], ny = y + d[1];
        if (grid.isInside(nx, ny)) {
            grid.setWalkableAt(nx, ny, false);
        }
    });
}

// Helper: count operations recorded by hookPathFinding-style setter
function countOperations(grid, finder, sx, sy, ex, ey) {
    var ops = [];
    var origProto = Object.getPrototypeOf(grid.getNodeAt(0, 0));

    // Clone grid to avoid mutation
    var g = grid.clone();

    // Hook opened/closed setters on all nodes
    for (var r = 0; r < g.height; r++) {
        for (var c = 0; c < g.width; c++) {
            var node = g.getNodeAt(c, r);
            (function(n) {
                var _opened = false;
                var _closed = false;
                Object.defineProperty(n, 'opened', {
                    get: function() { return _opened; },
                    set: function(v) {
                        _opened = v;
                        if (v) ops.push({ x: n.x, y: n.y, attr: 'opened' });
                    },
                    configurable: true
                });
                Object.defineProperty(n, 'closed', {
                    get: function() { return _closed; },
                    set: function(v) {
                        _closed = v;
                        if (v) ops.push({ x: n.x, y: n.y, attr: 'closed' });
                    },
                    configurable: true
                });
            })(node);
        }
    }

    var p = finder.findPath(sx, sy, ex, ey, g);
    return { path: p, operations: ops, openedCount: ops.filter(function(o) { return o.attr === 'opened'; }).length };
}


describe('Bug Validation Scenarios (Priority 1)', function() {

    // #1: CSS hover selector typo
    describe('#1 — CSS hover selector typo', function() {
        it('style.css line 59 uses #hide_instruction:hover (missing s)', function() {
            var css = fs.readFileSync(
                path.join(__dirname, '..', 'visual', 'css', 'style.css'), 'utf8'
            );
            // Bug: selector is #hide_instruction:hover but element id is hide_instructions
            var hasBuggySelector = css.indexOf('#hide_instruction:hover') !== -1;
            var hasCorrectSelector = css.indexOf('#hide_instructions:hover') !== -1;

            hasBuggySelector.should.be.true('Expected buggy selector #hide_instruction:hover to exist');
            hasCorrectSelector.should.be.false('Correct selector should NOT exist (bug not yet fixed)');
        });
    });

    // #2: Instructions panel cannot be re-shown
    describe('#2 — Instructions panel dismiss is one-way', function() {
        it('panel.js uses slideUp() with no corresponding slideDown/toggle', function() {
            var panelSrc = fs.readFileSync(
                path.join(__dirname, '..', 'visual', 'js', 'panel.js'), 'utf8'
            );
            var hasSlideUp = panelSrc.indexOf('slideUp') !== -1;
            var hasSlideDown = panelSrc.indexOf('slideDown') !== -1;
            var hasSlideToggle = panelSrc.indexOf('slideToggle') !== -1;

            hasSlideUp.should.be.true('slideUp should exist');
            hasSlideDown.should.be.false('slideDown should NOT exist (no way to re-show)');
            hasSlideToggle.should.be.false('slideToggle should NOT exist (no toggle)');
        });
    });

    // #3: "Clear Walls" clears everything
    describe('#3 — Clear Walls button clears all (walls + path + footprints)', function() {
        it('onreset calls clearAll + buildNewGrid (not just wall removal)', function() {
            var controllerSrc = fs.readFileSync(
                path.join(__dirname, '..', 'visual', 'js', 'controller.js'), 'utf8'
            );
            // onreset calls clearOperations, clearAll, buildNewGrid
            var hasOnreset = controllerSrc.indexOf('onreset') !== -1;
            var hasClearAll = controllerSrc.indexOf('Controller.clearAll()') !== -1;
            var hasBuildNewGrid = controllerSrc.indexOf('Controller.buildNewGrid()') !== -1;

            hasOnreset.should.be.true();
            hasClearAll.should.be.true('onreset calls clearAll — clears footprints AND blocked nodes');
            hasBuildNewGrid.should.be.true('onreset calls buildNewGrid — replaces entire grid');
        });

        it('button3 labeled "Clear Walls" but callback is this.reset', function() {
            var controllerSrc = fs.readFileSync(
                path.join(__dirname, '..', 'visual', 'js', 'controller.js'), 'utf8'
            );
            // In onready, button3 text="Clear Walls" but callback=this.reset
            var clearWallsMatch = controllerSrc.indexOf("text: 'Clear Walls'") !== -1;
            var resetCallback = controllerSrc.indexOf('callback: $.proxy(this.reset, this)') !== -1;

            clearWallsMatch.should.be.true();
            // The reset callback is near the Clear Walls button config
            // This confirms the mismatch: label says "Clear Walls" but action is full reset
            resetCallback.should.be.true();
        });
    });

    // #4: IDA* weight spinner has wrong name attribute
    describe('#4 — IDA* weight spinner wrong name="astar_weight"', function() {
        it('index.html ida_section has input name="astar_weight" (should be ida_weight)', function() {
            var html = fs.readFileSync(
                path.join(__dirname, '..', 'visual', 'index.html'), 'utf8'
            );
            // Find the ida_section and check for astar_weight within it
            var idaStart = html.indexOf('id="ida_section"');
            var idaEnd = html.indexOf('</div>', html.indexOf('</div>', idaStart) + 1);
            var idaSection = html.substring(idaStart, idaEnd);

            var hasAstarWeightInIda = idaSection.indexOf('name="astar_weight"') !== -1;
            hasAstarWeightInIda.should.be.true('IDA* section uses name="astar_weight" (wrong name)');
        });

        it('panel.js reads IDA* weight via input[name=astar_weight] — works despite wrong name', function() {
            var panelSrc = fs.readFileSync(
                path.join(__dirname, '..', 'visual', 'js', 'panel.js'), 'utf8'
            );
            // panel.js line 162: `$('#ida_section input[name=astar_weight]').val()`
            var readsWeight = panelSrc.indexOf("$('#ida_section input[name=astar_weight]')") !== -1;
            readsWeight.should.be.true('panel.js compensates by scoping selector to #ida_section');
        });

        it('IDA* finder accepts weight parameter correctly at library level', function() {
            var grid = openGrid();
            var finder = new PF.IDAStarFinder({ weight: 3 });
            finder.weight.should.equal(3);
            var p = finder.findPath(0, 0, 9, 9, grid);
            p.length.should.be.above(0);
        });
    });

    // #5: Parent attribute not visualized
    describe('#5 — Parent attribute is a no-op in view.js', function() {
        it('view.js setAttributeAt has empty case for parent', function() {
            var viewSrc = fs.readFileSync(
                path.join(__dirname, '..', 'visual', 'js', 'view.js'), 'utf8'
            );
            // case 'parent': is followed by a comment and break, no drawing code
            var hasParentCase = viewSrc.indexOf("case 'parent':") !== -1;
            hasParentCase.should.be.true();

            // Extract context around the parent case
            var idx = viewSrc.indexOf("case 'parent':");
            var snippet = viewSrc.substring(idx, idx + 150);
            // Should contain XXX comment indicating it's intentionally empty
            var hasXXXComment = snippet.indexOf('XXX') !== -1;
            hasXXXComment.should.be.true('Parent case has XXX comment — intentional no-op');
        });

        it('supportedOperations does NOT include parent', function() {
            var viewSrc = fs.readFileSync(
                path.join(__dirname, '..', 'visual', 'js', 'view.js'), 'utf8'
            );
            var match = viewSrc.match(/supportedOperations:\s*\[([^\]]+)\]/);
            should.exist(match);
            var ops = match[1];
            ops.should.not.containEql('parent');
        });
    });
});


describe('Core Visual Scenarios (Priority 2)', function() {

    // #6: Open Grid — all algorithms find path
    describe('#6 — Open grid, all algorithms find path', function() {
        var algorithms = [
            { name: 'A*', create: function() { return new PF.AStarFinder(); } },
            { name: 'BreadthFirst', create: function() { return new PF.BreadthFirstFinder(); } },
            { name: 'BestFirst', create: function() { return new PF.BestFirstFinder(); } },
            { name: 'Dijkstra', create: function() { return new PF.DijkstraFinder(); } },
            { name: 'BiAStar', create: function() { return new PF.BiAStarFinder(); } },
            { name: 'BiBreadthFirst', create: function() { return new PF.BiBreadthFirstFinder(); } },
            { name: 'BiBestFirst', create: function() { return new PF.BiBestFirstFinder(); } },
            { name: 'BiDijkstra', create: function() { return new PF.BiDijkstraFinder(); } },
            { name: 'IDA*', create: function() { return new PF.IDAStarFinder(); } },
            { name: 'JPS', create: function() { return new PF.JumpPointFinder({ diagonalMovement: DiagonalMovement.IfAtMostOneObstacle }); } },
            { name: 'Orth JPS', create: function() { return new PF.JumpPointFinder({ diagonalMovement: DiagonalMovement.Never }); } },
        ];

        algorithms.forEach(function(algo) {
            it(algo.name + ' should find path on open 20x20 grid', function() {
                var grid = openGrid(20, 20);
                var finder = algo.create();
                var p = finder.findPath(0, 0, 19, 19, grid);
                p.length.should.be.above(0);
                p[0].should.eql([0, 0]);
                p[p.length - 1].should.eql([19, 19]);
            });

            it(algo.name + ' path length should be finite positive number', function() {
                var grid = openGrid(20, 20);
                var p = algo.create().findPath(0, 0, 19, 19, grid);
                var len = Util.pathLength(p);
                len.should.be.above(0);
                isNaN(len).should.be.false();
                isFinite(len).should.be.true();
            });
        });
    });

    // #7: Blocked grid — solid wall, no path
    describe('#7 — Blocked grid (solid wall), no path', function() {
        var algorithms = [
            { name: 'A*', create: function() { return new PF.AStarFinder(); } },
            { name: 'BreadthFirst', create: function() { return new PF.BreadthFirstFinder(); } },
            { name: 'Dijkstra', create: function() { return new PF.DijkstraFinder(); } },
            { name: 'BiAStar', create: function() { return new PF.BiAStarFinder(); } },
            { name: 'BiBreadthFirst', create: function() { return new PF.BiBreadthFirstFinder(); } },
            { name: 'BiDijkstra', create: function() { return new PF.BiDijkstraFinder(); } },
        ];

        algorithms.forEach(function(algo) {
            it(algo.name + ' returns empty path when solid wall blocks', function() {
                var grid = openGrid(20, 20);
                // Solid wall at x=10
                wallColumn(grid, 10, 0, 19);
                var p = algo.create().findPath(0, 0, 19, 19, grid);
                p.length.should.equal(0);
            });

            it(algo.name + ' does not crash on blocked grid', function() {
                var grid = openGrid(20, 20);
                wallColumn(grid, 10, 0, 19);
                (function() {
                    algo.create().findPath(0, 0, 19, 19, grid);
                }).should.not.throw();
            });
        });

        it('pathLength of empty path should be 0, not NaN', function() {
            var len = Util.pathLength([]);
            len.should.equal(0);
            isNaN(len).should.be.false();
        });
    });

    // #8: Start == End (degenerate)
    describe('#8 — Start equals end position', function() {
        it('A* returns path with start==end, pathLength 0', function() {
            var grid = openGrid();
            var p = new PF.AStarFinder().findPath(5, 5, 5, 5, grid);
            p.length.should.be.above(0);
            p[0].should.eql([5, 5]);
            p[p.length - 1].should.eql([5, 5]);
            Util.pathLength(p).should.equal(0);
        });

        it('IDA* returns path with start==end', function() {
            var grid = openGrid();
            var p = new PF.IDAStarFinder().findPath(5, 5, 5, 5, grid);
            p.length.should.be.above(0);
            p[0].should.eql([5, 5]);
        });

        it('pathLength of start==end path is 0, not NaN', function() {
            var grid = openGrid();
            var p = new PF.AStarFinder().findPath(5, 5, 5, 5, grid);
            var len = Util.pathLength(p);
            len.should.equal(0);
            isNaN(len).should.be.false();
        });

        it('BiAStar handles start==end', function() {
            var grid = openGrid();
            var p = new PF.BiAStarFinder().findPath(5, 5, 5, 5, grid);
            p.length.should.be.above(0);
        });

        it('BreadthFirst handles start==end', function() {
            var grid = openGrid();
            var p = new PF.BreadthFirstFinder().findPath(5, 5, 5, 5, grid);
            p.length.should.be.above(0);
        });

        it('Dijkstra handles start==end', function() {
            var grid = openGrid();
            var p = new PF.DijkstraFinder().findPath(5, 5, 5, 5, grid);
            p.length.should.be.above(0);
            Util.pathLength(p).should.equal(0);
        });
    });

    // #9: Pause and Resume — state machine documented test
    describe('#9 — Pause and Resume (state machine)', function() {
        it('controller loop() checks is(searching) — pausing stops animation', function() {
            var src = fs.readFileSync(
                path.join(__dirname, '..', 'visual', 'js', 'controller.js'), 'utf8'
            );
            // loop function checks Controller.is('searching')
            src.indexOf("Controller.is('searching')").should.not.equal(-1);
        });

        it('resume calls this.loop() to restart animation', function() {
            var src = fs.readFileSync(
                path.join(__dirname, '..', 'visual', 'js', 'controller.js'), 'utf8'
            );
            // onresume calls this.loop()
            var resumeIdx = src.indexOf('onresume');
            var resumeSnippet = src.substring(resumeIdx, resumeIdx + 200);
            resumeSnippet.indexOf('this.loop()').should.not.equal(-1);
        });
    });

    // #10: Drag Start/End in Finished State
    describe('#10 — Drag in finished state triggers modify', function() {
        it('dragStart allowed from finished state (state machine def)', function() {
            var src = fs.readFileSync(
                path.join(__dirname, '..', 'visual', 'js', 'controller.js'), 'utf8'
            );
            // dragStart from: ['ready', 'finished']
            var dragIdx = src.indexOf("name: 'dragStart'");
            var dragSnippet = src.substring(dragIdx, dragIdx + 150);
            dragSnippet.indexOf('finished').should.not.equal(-1);
        });

        it('dragEnd allowed from finished state', function() {
            var src = fs.readFileSync(
                path.join(__dirname, '..', 'visual', 'js', 'controller.js'), 'utf8'
            );
            var dragIdx = src.indexOf("name: 'dragEnd'");
            var dragSnippet = src.substring(dragIdx, dragIdx + 150);
            dragSnippet.indexOf('finished').should.not.equal(-1);
        });
    });
});


describe('Algorithm Comparison Scenarios (Priority 3)', function() {

    // #11: Diagonal Toggle
    describe('#11 — Diagonal toggle affects path length', function() {
        it('A* diagonal path shorter than non-diagonal path', function() {
            var grid1 = openGrid(20, 20);
            var grid2 = openGrid(20, 20);
            var diagPath = new PF.AStarFinder({ allowDiagonal: true }).findPath(0, 0, 19, 19, grid1);
            var orthPath = new PF.AStarFinder({ diagonalMovement: DiagonalMovement.Never }).findPath(0, 0, 19, 19, grid2);

            var diagLen = Util.pathLength(diagPath);
            var orthLen = Util.pathLength(orthPath);

            diagLen.should.be.below(orthLen);
        });
    });

    // #12: Don't Cross Corners
    describe('#12 — dontCrossCorners behavior', function() {
        it('with dontCrossCorners, path avoids corner-cutting through obstacles', function() {
            // Create narrow diagonal passage
            var grid1 = openGrid(10, 10);
            var grid2 = openGrid(10, 10);

            // Place obstacles that create a corner
            grid1.setWalkableAt(4, 4, false);
            grid1.setWalkableAt(5, 5, false);
            grid2.setWalkableAt(4, 4, false);
            grid2.setWalkableAt(5, 5, false);

            var withCorners = new PF.AStarFinder({
                allowDiagonal: true,
                dontCrossCorners: false
            }).findPath(3, 3, 6, 6, grid1);

            var noCorners = new PF.AStarFinder({
                allowDiagonal: true,
                dontCrossCorners: true
            }).findPath(3, 3, 6, 6, grid2);

            withCorners.length.should.be.above(0);
            noCorners.length.should.be.above(0);

            // Path without corner-cutting may be longer or same
            Util.pathLength(noCorners).should.be.aboveOrEqual(Util.pathLength(withCorners));
        });
    });

    // #13: Bi-directional toggle
    describe('#13 — Bi-directional vs unidirectional', function() {
        it('BiAStar and AStar both find valid path', function() {
            var grid1 = openGrid(30, 30);
            var grid2 = openGrid(30, 30);
            wallColumn(grid1, 15, 2, 27);
            wallColumn(grid2, 15, 2, 27);

            var uniPath = new PF.AStarFinder().findPath(0, 0, 29, 29, grid1);
            var biPath = new PF.BiAStarFinder().findPath(0, 0, 29, 29, grid2);

            uniPath.length.should.be.above(0);
            biPath.length.should.be.above(0);
            uniPath[uniPath.length - 1].should.eql([29, 29]);
            biPath[biPath.length - 1].should.eql([29, 29]);
        });
    });

    // #14: IDA* Time Limit
    describe('#14 — IDA* time limit', function() {
        it('very small time limit may return empty path (timeout)', function() {
            // Create maze that takes time
            var grid = openGrid(15, 15);
            // Add walls to make it harder
            for (var y = 1; y < 14; y++) {
                grid.setWalkableAt(7, y, false);
            }
            var finder = new PF.IDAStarFinder({
                timeLimit: 0.000001, // microseconds basically
                diagonalMovement: DiagonalMovement.Never
            });
            var p = finder.findPath(0, 0, 14, 14, grid);
            p.should.be.an.Array();
            // May be empty (timed out) or found (fast enough)
        });

        it('generous time limit finds path', function() {
            var grid = openGrid(10, 10);
            var finder = new PF.IDAStarFinder({ timeLimit: 60 });
            var p = finder.findPath(0, 0, 9, 9, grid);
            p.length.should.be.above(0);
        });

        it('timeLimit=-1 treated as no limit (negative is truthy, skips check)', function() {
            var grid = openGrid();
            var finder = new PF.IDAStarFinder({ timeLimit: -1 });
            // -1 is truthy so constructor sets timeLimit=-1
            // In search: this.timeLimit > 0 check fails, so time check skipped
            finder.timeLimit.should.equal(-1);
            var p = finder.findPath(0, 0, 9, 9, grid);
            p.length.should.be.above(0);
        });
    });

    // #15: JPS vs A* node expansion
    describe('#15 — JPS expands fewer nodes than A*', function() {
        it('JPS should expand fewer nodes than A* on open grid', function() {
            this.timeout(10000);
            var grid1 = openGrid(30, 30);
            var grid2 = openGrid(30, 30);

            var astarResult = countOperations(grid1, new PF.AStarFinder(), 0, 0, 29, 29);
            var jpsResult = countOperations(grid2,
                new PF.JumpPointFinder({ diagonalMovement: DiagonalMovement.IfAtMostOneObstacle }),
                0, 0, 29, 29);

            astarResult.path.length.should.be.above(0);
            jpsResult.path.length.should.be.above(0);

            // JPS should open fewer nodes
            jpsResult.openedCount.should.be.below(astarResult.openedCount);
        });
    });

    // #16: Weighted A*
    describe('#16 — Weighted A* (weight=1 vs weight=5)', function() {
        it('weight=1 produces optimal path, weight=5 may be suboptimal', function() {
            var grid1 = openGrid(20, 20);
            var grid2 = openGrid(20, 20);
            var p1 = new PF.AStarFinder({ weight: 1 }).findPath(0, 0, 19, 19, grid1);
            var p2 = new PF.AStarFinder({ weight: 5 }).findPath(0, 0, 19, 19, grid2);

            p1.length.should.be.above(0);
            p2.length.should.be.above(0);

            Util.pathLength(p1).should.be.belowOrEqual(Util.pathLength(p2));
        });
    });

    // #17: Orthogonal JPS vs BFS
    describe('#17 — Orthogonal JPS vs BFS', function() {
        it('both find same-length path on grid with obstacles', function() {
            var grid1 = openGrid(20, 20);
            var grid2 = openGrid(20, 20);
            // Add some obstacles
            wallColumn(grid1, 10, 2, 17);
            wallColumn(grid2, 10, 2, 17);

            var jpsPath = new PF.JumpPointFinder({
                diagonalMovement: DiagonalMovement.Never
            }).findPath(0, 0, 19, 19, grid1);

            var bfsPath = new PF.BreadthFirstFinder({
                diagonalMovement: DiagonalMovement.Never
            }).findPath(0, 0, 19, 19, grid2);

            jpsPath.length.should.be.above(0);
            bfsPath.length.should.be.above(0);

            // Both optimal for unweighted graph — same path length
            var jpsLen = Util.pathLength(jpsPath);
            var bfsLen = Util.pathLength(bfsPath);
            jpsLen.should.equal(bfsLen);
        });
    });
});


describe('Missing UI Features — Document Only (Priority 4)', function() {

    // #18: Missing JPS diagonal modes in UI
    describe('#18 — JPS diagonal modes not exposed in UI', function() {
        it('panel.js hardcodes IfAtMostOneObstacle for JPS', function() {
            var src = fs.readFileSync(
                path.join(__dirname, '..', 'visual', 'js', 'panel.js'), 'utf8'
            );
            src.indexOf('DiagonalMovement.IfAtMostOneObstacle').should.not.equal(-1);
        });

        it('JPS Always mode works at library level', function() {
            var grid = openGrid();
            var p = new PF.JumpPointFinder({
                diagonalMovement: DiagonalMovement.Always
            }).findPath(0, 0, 9, 9, grid);
            p.length.should.be.above(0);
        });

        it('JPS OnlyWhenNoObstacles mode works at library level', function() {
            var grid = openGrid();
            var p = new PF.JumpPointFinder({
                diagonalMovement: DiagonalMovement.OnlyWhenNoObstacles
            }).findPath(0, 0, 9, 9, grid);
            p.length.should.be.above(0);
        });

        it('UI has no selector for Always or OnlyWhenNoObstacles', function() {
            var html = fs.readFileSync(
                path.join(__dirname, '..', 'visual', 'index.html'), 'utf8'
            );
            html.indexOf('Always').should.equal(-1);
            html.indexOf('OnlyWhenNoObstacles').should.equal(-1);
        });
    });

    // #19: Animation speed not configurable
    describe('#19 — Animation speed hardcoded', function() {
        it('operationsPerSecond is hardcoded to 300', function() {
            var src = fs.readFileSync(
                path.join(__dirname, '..', 'visual', 'js', 'controller.js'), 'utf8'
            );
            src.indexOf('operationsPerSecond: 300').should.not.equal(-1);
        });

        it('no UI control for animation speed in index.html', function() {
            var html = fs.readFileSync(
                path.join(__dirname, '..', 'visual', 'index.html'), 'utf8'
            );
            // No input for ops/sec or speed control — only instructional text mentions "animation"
            html.indexOf('operations_per_second').should.equal(-1);
            html.indexOf('name="speed"').should.equal(-1);
        });
    });

    // #20: Grid size not configurable
    describe('#20 — Grid size hardcoded', function() {
        it('gridSize is hardcoded to [64, 36]', function() {
            var src = fs.readFileSync(
                path.join(__dirname, '..', 'visual', 'js', 'controller.js'), 'utf8'
            );
            src.indexOf('gridSize: [64, 36]').should.not.equal(-1);
        });

        it('UI control for grid size exists in index.html', function() {
            var html = fs.readFileSync(
                path.join(__dirname, '..', 'visual', 'index.html'), 'utf8'
            );
            // Grid size selector was added — verify inputs are present
            html.toLowerCase().indexOf('grid_cols').should.not.equal(-1);
            html.toLowerCase().indexOf('grid_rows').should.not.equal(-1);
            html.toLowerCase().indexOf('btn_apply_grid_size').should.not.equal(-1);
        });
    });
});
