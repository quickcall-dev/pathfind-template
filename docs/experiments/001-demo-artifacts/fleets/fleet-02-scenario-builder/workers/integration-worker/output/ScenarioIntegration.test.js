var should = require('should');
var PF = require('../../../../../../../../src/PathFinding');
var Integration = require('./ScenarioIntegration');
var GridCanvas = require('../../canvas-worker/output/GridCanvas');
var ScenarioControls = require('../../controls-worker/output/ScenarioControls');

var Scorer = Integration.Scorer;
var PresetManager = Integration.PresetManager;
var PersistenceAdapter = Integration.PersistenceAdapter;
var AnimationController = Integration.AnimationController;
var ScenarioRunner = Integration.ScenarioRunner;
var ScenarioManagerBridge = Integration.ScenarioManagerBridge;
var ScorerUI = Integration.ScorerUI;
var GridCanvasBridge = Integration.GridCanvasBridge;
var ControlsBridge = Integration.ControlsBridge;

// ============================================================================
// Integration Tests — wiring canvas + controls + scorer + persistence
// ============================================================================

describe('ScenarioIntegration', function() {

    // -----------------------------------------------------------------------
    // Scorer
    // -----------------------------------------------------------------------
    describe('Scorer', function() {
        it('should score a successful pathfinding result', function() {
            var metrics = Scorer.score({
                path: [[0,0],[1,0],[2,0],[3,0]],
                timeMs: 5,
                operationCount: 20,
            });
            metrics.found.should.be.true();
            metrics.pathLength.should.equal(3);
            metrics.pathNodes.should.equal(4);
            metrics.timeMs.should.equal(5);
            metrics.operationCount.should.equal(20);
            metrics.efficiency.should.be.above(0);
        });

        it('should score empty path (no path found)', function() {
            var metrics = Scorer.score({
                path: [],
                timeMs: 2,
                operationCount: 50,
            });
            metrics.found.should.be.false();
            metrics.pathLength.should.equal(0);
            metrics.pathNodes.should.equal(0);
        });

        it('should handle zero operations', function() {
            var metrics = Scorer.score({
                path: [[5,5]],
                timeMs: 0,
                operationCount: 0,
            });
            metrics.efficiency.should.equal(0);
        });
    });

    // -----------------------------------------------------------------------
    // PresetManager
    // -----------------------------------------------------------------------
    describe('PresetManager', function() {
        it('should list available presets', function() {
            var names = PresetManager.list();
            names.should.be.an.Array();
            names.length.should.be.above(0);
            names.should.containEql('open');
            names.should.containEql('maze');
            names.should.containEql('bottleneck');
            names.should.containEql('spiral');
            names.should.containEql('nopath');
        });

        it('should load open preset as walkable grid', function() {
            var loaded = PresetManager.load('open');
            loaded.grid.should.be.an.Object();
            loaded.grid.width.should.equal(10);
            loaded.grid.height.should.equal(10);
            loaded.startX.should.equal(0);
            loaded.endX.should.equal(9);
            loaded.grid.isWalkableAt(5, 5).should.be.true();
        });

        it('should load maze preset with walls', function() {
            var loaded = PresetManager.load('maze');
            loaded.grid.isWalkableAt(3, 1).should.be.false();
            loaded.grid.isWalkableAt(0, 0).should.be.true();
        });

        it('should load bottleneck preset with single passage', function() {
            var loaded = PresetManager.load('bottleneck');
            // Column 4 is blocked except row 4
            loaded.grid.isWalkableAt(4, 0).should.be.false();
            loaded.grid.isWalkableAt(4, 4).should.be.true();
            loaded.grid.isWalkableAt(4, 5).should.be.false();
        });

        it('should throw for unknown preset', function() {
            (function() { PresetManager.load('nonexistent'); }).should.throw(/Unknown preset/);
        });
    });

    // -----------------------------------------------------------------------
    // PersistenceAdapter
    // -----------------------------------------------------------------------
    describe('PersistenceAdapter', function() {
        it('should round-trip save/load a scenario', function() {
            var scenario = {
                width: 5, height: 5,
                matrix: [
                    [0,0,0,0,0],
                    [0,1,1,0,0],
                    [0,0,0,0,0],
                    [0,0,1,1,0],
                    [0,0,0,0,0],
                ],
                startX: 0, startY: 0,
                endX: 4, endY: 4,
                algorithm: 'AStarFinder',
                options: { weight: 2 },
            };
            var json = PersistenceAdapter.save(scenario);
            var loaded = PersistenceAdapter.load(json);
            loaded.version.should.equal(1);
            loaded.width.should.equal(5);
            loaded.height.should.equal(5);
            loaded.matrix.should.eql(scenario.matrix);
            loaded.startX.should.equal(0);
            loaded.endX.should.equal(4);
            loaded.algorithm.should.equal('AStarFinder');
            loaded.options.weight.should.equal(2);
        });

        it('should throw on invalid format', function() {
            (function() { PersistenceAdapter.load('{}'); }).should.throw(/Invalid scenario format/);
        });

        it('should hydrate scenario into grid + finder', function() {
            var json = PersistenceAdapter.save({
                width: 5, height: 5,
                matrix: null,
                startX: 0, startY: 0,
                endX: 4, endY: 4,
                algorithm: 'DijkstraFinder',
            });
            var data = PersistenceAdapter.load(json);
            var hydrated = PersistenceAdapter.hydrate(data);
            hydrated.grid.width.should.equal(5);
            hydrated.grid.height.should.equal(5);
            hydrated.finder.should.be.an.Object();
            hydrated.startX.should.equal(0);
        });

        it('should hydrate without algorithm (finder=null)', function() {
            var json = PersistenceAdapter.save({
                width: 3, height: 3,
                matrix: null,
                startX: 0, startY: 0,
                endX: 2, endY: 2,
            });
            var data = PersistenceAdapter.load(json);
            var hydrated = PersistenceAdapter.hydrate(data);
            should(hydrated.finder).be.null();
        });

        it('should throw on unknown algorithm during hydrate', function() {
            var json = PersistenceAdapter.save({
                width: 3, height: 3, matrix: null,
                startX: 0, startY: 0, endX: 2, endY: 2,
                algorithm: 'FakeFinderXYZ',
            });
            var data = PersistenceAdapter.load(json);
            (function() { PersistenceAdapter.hydrate(data); }).should.throw(/Unknown algorithm/);
        });
    });

    // -----------------------------------------------------------------------
    // AnimationController
    // -----------------------------------------------------------------------
    describe('AnimationController', function() {
        it('should compute step delay — slow', function() {
            var delay = AnimationController.stepDelay(1);
            delay.should.equal(500);
        });

        it('should compute step delay — fast', function() {
            var delay = AnimationController.stepDelay(100);
            delay.should.equal(5);
        });

        it('should compute step delay — mid', function() {
            var delay = AnimationController.stepDelay(50);
            delay.should.equal(10);
        });

        it('should clamp speed below 1', function() {
            // 0 is falsy, defaults to 50 via || 50, then clamped
            AnimationController.stepDelay(0).should.equal(10);
            // -5 is truthy, max(1,-5)=1, so 500/1=500
            AnimationController.stepDelay(-5).should.equal(500);
        });

        it('should clamp speed above 100', function() {
            AnimationController.stepDelay(200).should.equal(5);
        });

        it('should build animation frames from operations + path', function() {
            var ops = [
                { x: 1, y: 1, attr: 'opened', value: true },
                { x: 2, y: 2, attr: 'closed', value: true },
                { x: 3, y: 3, attr: 'parent', value: {} }, // not rendered
                { x: 4, y: 4, attr: 'tested', value: true },
            ];
            var path = [[0,0],[1,1],[2,2]];
            var frames = AnimationController.buildFrames(ops, path);
            // 3 explore frames (opened, closed, tested — parent excluded) + 3 path frames
            frames.length.should.equal(6);
            frames[0].type.should.equal('explore');
            frames[0].attr.should.equal('opened');
            frames[3].type.should.equal('path');
            frames[3].x.should.equal(0);
        });

        it('should return empty frames for empty inputs', function() {
            AnimationController.buildFrames([], []).length.should.equal(0);
        });
    });

    // -----------------------------------------------------------------------
    // ScenarioRunner — full integration
    // -----------------------------------------------------------------------
    describe('ScenarioRunner', function() {
        it('should run A* on open grid and return path + metrics', function() {
            var grid = new PF.Grid(10, 10);
            var result = ScenarioRunner.run({
                grid: grid,
                startX: 0, startY: 0,
                endX: 9, endY: 9,
            });
            result.path.length.should.be.above(0);
            result.path[0].should.eql([0, 0]);
            result.path[result.path.length - 1].should.eql([9, 9]);
            result.timeMs.should.be.a.Number();
            result.operationCount.should.be.above(0);
            result.metrics.found.should.be.true();
            result.metrics.pathLength.should.be.above(0);
        });

        it('should not mutate original grid', function() {
            var grid = new PF.Grid(5, 5);
            var origNode = grid.getNodeAt(2, 2);
            ScenarioRunner.run({
                grid: grid,
                startX: 0, startY: 0,
                endX: 4, endY: 4,
            });
            // Node should still be clean (no parent set on original)
            should(grid.getNodeAt(2, 2).parent).be.undefined();
        });

        it('should run with explicit Dijkstra finder', function() {
            var grid = new PF.Grid(10, 10);
            var result = ScenarioRunner.run({
                grid: grid,
                finder: new PF.DijkstraFinder(),
                startX: 0, startY: 0,
                endX: 9, endY: 9,
            });
            result.metrics.found.should.be.true();
        });

        it('should capture operations for animation', function() {
            var grid = new PF.Grid(5, 5);
            var result = ScenarioRunner.run({
                grid: grid,
                startX: 0, startY: 0,
                endX: 4, endY: 4,
            });
            result.operations.should.be.an.Array();
            result.operations.length.should.be.above(0);
            result.operations[0].should.have.properties('x', 'y', 'attr', 'value');
        });

        it('should handle no-path scenario', function() {
            var grid = new PF.Grid(5, 5);
            // Wall off column 2 completely
            for (var y = 0; y < 5; y++) grid.setWalkableAt(2, y, false);
            var result = ScenarioRunner.run({
                grid: grid,
                startX: 0, startY: 0,
                endX: 4, endY: 4,
            });
            result.path.length.should.equal(0);
            result.metrics.found.should.be.false();
        });

        it('should run from preset name', function() {
            var result = ScenarioRunner.runPreset('maze', 'AStarFinder');
            result.metrics.found.should.be.true();
            result.path[0].should.eql([0, 0]);
            result.path[result.path.length - 1].should.eql([9, 9]);
        });

        it('should run from preset with default finder', function() {
            var result = ScenarioRunner.runPreset('open');
            result.metrics.found.should.be.true();
        });

        it('should run nopath preset and detect failure', function() {
            var result = ScenarioRunner.runPreset('nopath');
            result.metrics.found.should.be.false();
        });

        it('should throw for unknown algorithm in runPreset', function() {
            (function() {
                ScenarioRunner.runPreset('open', 'FakeFinder123');
            }).should.throw(/Unknown algorithm/);
        });

        it('should run bottleneck preset through narrow passage', function() {
            var result = ScenarioRunner.runPreset('bottleneck', 'BreadthFirstFinder');
            result.metrics.found.should.be.true();
            // Path must pass through (4,4) — the only gap
            var passesThrough = result.path.some(function(p) { return p[0] === 4 && p[1] === 4; });
            passesThrough.should.be.true();
        });

        it('should run spiral preset', function() {
            var result = ScenarioRunner.runPreset('spiral', 'DijkstraFinder');
            result.metrics.found.should.be.true();
        });
    });

    // -----------------------------------------------------------------------
    // Full pipeline: save → load → run → score → animate
    // -----------------------------------------------------------------------
    describe('Full Pipeline', function() {
        it('should save scenario, reload, run, score, and build frames', function() {
            // 1. Define scenario
            var scenario = {
                width: 10, height: 10,
                matrix: PresetManager.get('maze').matrix,
                startX: 0, startY: 0,
                endX: 9, endY: 9,
                algorithm: 'AStarFinder',
                options: {},
            };

            // 2. Save to JSON (persistence)
            var json = PersistenceAdapter.save(scenario);
            json.should.be.a.String();

            // 3. Load from JSON
            var loaded = PersistenceAdapter.load(json);
            loaded.algorithm.should.equal('AStarFinder');

            // 4. Run pathfinding
            var result = ScenarioRunner.runSaved(json);
            result.metrics.found.should.be.true();
            result.path.length.should.be.above(0);

            // 5. Score
            result.metrics.pathLength.should.be.above(0);
            result.metrics.operationCount.should.be.above(0);
            result.metrics.efficiency.should.be.above(0);

            // 6. Build animation frames
            var frames = AnimationController.buildFrames(result.operations, result.path);
            frames.length.should.be.above(0);
            var exploreFrames = frames.filter(function(f) { return f.type === 'explore'; });
            var pathFrames = frames.filter(function(f) { return f.type === 'path'; });
            exploreFrames.length.should.be.above(0);
            pathFrames.length.should.equal(result.path.length);

            // 7. Animation timing
            var delay = AnimationController.stepDelay(50);
            delay.should.be.above(0);
        });

        it('should run all algorithms on all presets', function() {
            var algos = [
                'AStarFinder', 'BreadthFirstFinder', 'DijkstraFinder',
                'BestFirstFinder', 'BiAStarFinder', 'BiBreadthFirstFinder',
                'BiDijkstraFinder', 'BiBestFirstFinder',
            ];
            var presets = PresetManager.list();
            var results = [];

            presets.forEach(function(preset) {
                algos.forEach(function(algo) {
                    var result = ScenarioRunner.runPreset(preset, algo);
                    result.metrics.should.have.properties(
                        'pathLength', 'pathNodes', 'timeMs', 'operationCount', 'found', 'efficiency'
                    );
                    results.push({
                        preset: preset,
                        algorithm: algo,
                        found: result.metrics.found,
                        pathLength: result.metrics.pathLength,
                        ops: result.metrics.operationCount,
                    });
                });
            });

            // nopath preset should produce no path for all algorithms
            var nopathResults = results.filter(function(r) { return r.preset === 'nopath'; });
            nopathResults.forEach(function(r) {
                r.found.should.be.false();
            });

            // open preset should produce path for all algorithms
            var openResults = results.filter(function(r) { return r.preset === 'open'; });
            openResults.forEach(function(r) {
                r.found.should.be.true();
            });
        });
    });

    // -----------------------------------------------------------------------
    // IDA* + JPS integration
    // -----------------------------------------------------------------------
    describe('IDA* and JPS integration', function() {
        it('should run IDA* on maze preset', function() {
            var result = ScenarioRunner.runPreset('maze', 'IDAStarFinder', { timeLimit: 10 });
            result.metrics.found.should.be.true();
        });

        it('should run JPS on open preset', function() {
            var result = ScenarioRunner.runPreset('open', 'JumpPointFinder', {
                diagonalMovement: PF.DiagonalMovement.IfAtMostOneObstacle,
            });
            result.metrics.found.should.be.true();
        });
    });

    // -----------------------------------------------------------------------
    // Issue #1: ScorerUI — showScoreCard must not destroy buttons
    // -----------------------------------------------------------------------
    describe('ScorerUI', function() {
        it('should render score card HTML with metrics', function() {
            var run = {
                algorithm: 'A*',
                timestamp: Date.now(),
                metrics: { nodesExplored: 50, pathLength: 10, timeMs: 3.5 },
            };
            var html = ScorerUI.renderCardHTML(run);
            html.should.be.a.String();
            html.should.containEql('A*');
            html.should.containEql('50');
            html.should.containEql('10');
            html.should.containEql('3.5');
        });

        it('should not include button markup in card HTML', function() {
            var run = {
                algorithm: 'Dijkstra',
                timestamp: Date.now(),
                metrics: { nodesExplored: 100, pathLength: 20, timeMs: 1.0 },
            };
            var html = ScorerUI.renderCardHTML(run);
            html.should.not.containEql('Save Run');
            html.should.not.containEql('Compare');
        });
    });

    // -----------------------------------------------------------------------
    // Issue #2: ScenarioManagerBridge — save/load scenario as JSON
    // -----------------------------------------------------------------------
    describe('ScenarioManagerBridge', function() {
        it('should save grid state to JSON and reload it', function() {
            var grid = new PF.Grid(10, 10);
            grid.setWalkableAt(3, 3, false);
            grid.setWalkableAt(4, 4, false);

            var json = ScenarioManagerBridge.saveGridToJSON(grid, 0, 0, 9, 9, 'AStarFinder');
            json.should.be.a.String();

            var loaded = ScenarioManagerBridge.loadGridFromJSON(json);
            loaded.grid.width.should.equal(10);
            loaded.grid.height.should.equal(10);
            loaded.grid.isWalkableAt(3, 3).should.be.false();
            loaded.grid.isWalkableAt(4, 4).should.be.false();
            loaded.grid.isWalkableAt(5, 5).should.be.true();
            loaded.startX.should.equal(0);
            loaded.endX.should.equal(9);
        });

        it('should round-trip save/load and produce runnable scenario', function() {
            var grid = new PF.Grid(5, 5);
            for (var y = 0; y < 5; y++) grid.setWalkableAt(2, y, false);
            // Wall blocks path

            var json = ScenarioManagerBridge.saveGridToJSON(grid, 0, 0, 4, 4, 'DijkstraFinder');
            var loaded = ScenarioManagerBridge.loadGridFromJSON(json);
            var result = ScenarioRunner.run({
                grid: loaded.grid,
                finder: loaded.finder,
                startX: loaded.startX,
                startY: loaded.startY,
                endX: loaded.endX,
                endY: loaded.endY,
            });
            result.metrics.found.should.be.false();
        });

        it('should save without algorithm', function() {
            var grid = new PF.Grid(5, 5);
            var json = ScenarioManagerBridge.saveGridToJSON(grid, 0, 0, 4, 4);
            var loaded = ScenarioManagerBridge.loadGridFromJSON(json);
            should(loaded.finder).be.null();
        });
    });

    // -----------------------------------------------------------------------
    // Issue #3: PresetManager bridge — load ScenarioManager presets
    // -----------------------------------------------------------------------
    describe('ScenarioManagerBridge presets', function() {
        it('should list ScenarioManager presets', function() {
            var names = ScenarioManagerBridge.listManagerPresets();
            names.should.be.an.Array();
            names.should.containEql('empty');
            names.should.containEql('maze');
            names.should.containEql('spiral');
            names.should.containEql('bottleneck');
            names.should.containEql('random');
        });

        it('should load ScenarioManager preset into runnable grid', function() {
            var loaded = ScenarioManagerBridge.loadManagerPreset('maze');
            loaded.grid.should.be.an.Object();
            loaded.grid.width.should.equal(15);
            loaded.grid.height.should.equal(15);
            loaded.startX.should.be.a.Number();
            loaded.endX.should.be.a.Number();
        });

        it('should run pathfinding on ScenarioManager preset', function() {
            var loaded = ScenarioManagerBridge.loadManagerPreset('bottleneck');
            var result = ScenarioRunner.run({
                grid: loaded.grid,
                startX: loaded.startX,
                startY: loaded.startY,
                endX: loaded.endX,
                endY: loaded.endY,
            });
            result.metrics.found.should.be.true();
        });

        it('should throw for unknown ScenarioManager preset', function() {
            (function() {
                ScenarioManagerBridge.loadManagerPreset('nonexistent');
            }).should.throw();
        });

        it('should load all ScenarioManager presets successfully', function() {
            var names = ScenarioManagerBridge.listManagerPresets();
            names.forEach(function(name) {
                var loaded = ScenarioManagerBridge.loadManagerPreset(name);
                loaded.grid.width.should.be.above(0);
                loaded.grid.height.should.be.above(0);
            });
        });
    });

    // -----------------------------------------------------------------------
    // GridCanvasBridge — wire GridCanvas model to pathfinding
    // -----------------------------------------------------------------------
    describe('GridCanvasBridge', function() {
        it('should convert GridCanvas to PF.Grid', function() {
            var canvas = new GridCanvas(10, 10);
            canvas.setWall(3, 3);
            canvas.setWall(4, 4);
            var grid = GridCanvasBridge.toPFGrid(canvas);
            grid.width.should.equal(10);
            grid.height.should.equal(10);
            grid.isWalkableAt(3, 3).should.be.false();
            grid.isWalkableAt(4, 4).should.be.false();
            grid.isWalkableAt(5, 5).should.be.true();
        });

        it('should run pathfinding from canvas state', function() {
            var canvas = new GridCanvas(10, 10);
            canvas.setStart(0, 0);
            canvas.setEnd(9, 9);
            var result = GridCanvasBridge.runFromCanvas(canvas, 'AStarFinder');
            result.metrics.found.should.be.true();
            result.path[0].should.eql([0, 0]);
            result.path[result.path.length - 1].should.eql([9, 9]);
        });

        it('should run with default finder when no algorithm specified', function() {
            var canvas = new GridCanvas(5, 5);
            canvas.setStart(0, 0);
            canvas.setEnd(4, 4);
            var result = GridCanvasBridge.runFromCanvas(canvas);
            result.metrics.found.should.be.true();
        });

        it('should detect no-path on canvas with wall barrier', function() {
            var canvas = new GridCanvas(5, 5);
            canvas.setStart(0, 0);
            canvas.setEnd(4, 4);
            for (var y = 0; y < 5; y++) canvas.setWall(2, y);
            var result = GridCanvasBridge.runFromCanvas(canvas, 'BreadthFirstFinder');
            result.metrics.found.should.be.false();
        });

        it('should throw when canvas has no start/end', function() {
            var canvas = new GridCanvas(5, 5);
            (function() { GridCanvasBridge.runFromCanvas(canvas); }).should.throw(/start and end/);
        });

        it('should throw for unknown algorithm', function() {
            var canvas = new GridCanvas(5, 5);
            canvas.setStart(0, 0);
            canvas.setEnd(4, 4);
            (function() { GridCanvasBridge.runFromCanvas(canvas, 'FakeFinder'); }).should.throw(/Unknown algorithm/);
        });

        it('should apply scenario data to canvas', function() {
            var canvas = new GridCanvas(10, 10);
            var data = {
                width: 10, height: 10,
                matrix: [
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,1,0,0,0,0,0,0,0],
                    [0,0,1,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0],
                ],
                startX: 0, startY: 0,
                endX: 9, endY: 9,
            };
            GridCanvasBridge.applyToCanvas(canvas, data);
            canvas.getCellType(2, 1).should.equal('wall');
            canvas.getCellType(2, 2).should.equal('wall');
            canvas.getStart().should.deepEqual({ x: 0, y: 0 });
            canvas.getEnd().should.deepEqual({ x: 9, y: 9 });
        });

        it('should save canvas state via PersistenceAdapter', function() {
            var canvas = new GridCanvas(5, 5);
            canvas.setStart(0, 0);
            canvas.setEnd(4, 4);
            canvas.setWall(2, 2);
            var json = GridCanvasBridge.saveCanvas(canvas, 'DijkstraFinder');
            var loaded = PersistenceAdapter.load(json);
            loaded.version.should.equal(1);
            loaded.width.should.equal(5);
            loaded.algorithm.should.equal('DijkstraFinder');
            loaded.matrix[2][2].should.equal(1);
        });

        it('should round-trip canvas → save → load → apply → run', function() {
            var canvas = new GridCanvas(10, 10);
            canvas.setStart(0, 0);
            canvas.setEnd(9, 9);
            canvas.setWall(5, 0);
            canvas.setWall(5, 1);
            canvas.setWall(5, 2);

            var json = GridCanvasBridge.saveCanvas(canvas, 'AStarFinder');
            var data = PersistenceAdapter.load(json);

            var canvas2 = new GridCanvas(10, 10);
            GridCanvasBridge.applyToCanvas(canvas2, data);
            canvas2.getCellType(5, 0).should.equal('wall');

            var result = GridCanvasBridge.runFromCanvas(canvas2, data.algorithm);
            result.metrics.found.should.be.true();
        });
    });

    // -----------------------------------------------------------------------
    // ControlsBridge — wire ScenarioControls to canvas + runner
    // -----------------------------------------------------------------------
    describe('ControlsBridge', function() {
        it('should load ScenarioControls preset into GridCanvas', function() {
            var canvas = new GridCanvas(15, 15);
            ControlsBridge.loadPresetToCanvas('Maze 15x15', canvas);
            canvas.getStart().should.be.an.Object();
            canvas.getEnd().should.be.an.Object();
            // Maze has walls at (3,1)
            canvas.getCellType(3, 1).should.equal('wall');
        });

        it('should list ScenarioControls presets', function() {
            var names = ControlsBridge.listPresets();
            names.should.be.an.Array();
            names.length.should.be.above(0);
        });

        it('should serialize canvas state in Controls format', function() {
            var canvas = new GridCanvas(15, 15);
            canvas.setStart(1, 7);
            canvas.setEnd(13, 7);
            canvas.setWall(5, 5);
            var json = ControlsBridge.serializeFromCanvas(canvas, 'AStarFinder');
            var parsed = JSON.parse(json);
            parsed.cols.should.equal(15);
            parsed.rows.should.equal(15);
            parsed.startX.should.equal(1);
            parsed.startY.should.equal(7);
            parsed.algorithm.should.equal('AStarFinder');
            parsed.walls.should.containDeep([[5, 5]]);
        });

        it('should round-trip serialize → deserialize → canvas', function() {
            var canvas = new GridCanvas(15, 15);
            canvas.setStart(1, 1);
            canvas.setEnd(13, 13);
            canvas.setWall(7, 7);
            canvas.setWall(8, 8);

            var json = ControlsBridge.serializeFromCanvas(canvas, 'DijkstraFinder');
            var canvas2 = new GridCanvas(15, 15);
            ControlsBridge.deserializeToCanvas(json, canvas2);

            canvas2.getCellType(7, 7).should.equal('wall');
            canvas2.getCellType(8, 8).should.equal('wall');
            canvas2.getStart().should.deepEqual({ x: 1, y: 1 });
            canvas2.getEnd().should.deepEqual({ x: 13, y: 13 });
        });

        it('should map controls speed to animation delay', function() {
            var slow = ControlsBridge.speedToDelay(1);
            var fast = ControlsBridge.speedToDelay(10);
            slow.should.be.above(fast);
            slow.should.be.above(0);
            fast.should.be.above(0);
        });

        it('should get ScenarioControls animation interval', function() {
            var interval = ControlsBridge.getInterval(5);
            interval.should.be.a.Number();
            interval.should.be.above(0);
        });

        it('should load preset, run pathfinding, and score', function() {
            var canvas = new GridCanvas(15, 15);
            ControlsBridge.loadPresetToCanvas('Empty 15x15', canvas);
            var result = GridCanvasBridge.runFromCanvas(canvas, 'AStarFinder');
            result.metrics.found.should.be.true();
            result.metrics.pathLength.should.be.above(0);
        });
    });

    // -----------------------------------------------------------------------
    // Full E2E: canvas → controls → run → score → persist → animate
    // -----------------------------------------------------------------------
    describe('Full E2E Pipeline', function() {
        it('should wire all components: canvas → preset → run → score → save → reload → animate', function() {
            // 1. Create canvas
            var canvas = new GridCanvas(15, 15);

            // 2. Load preset from controls
            ControlsBridge.loadPresetToCanvas('Maze 15x15', canvas);
            canvas.getStart().should.be.an.Object();
            canvas.getEnd().should.be.an.Object();

            // 3. Run pathfinding from canvas ("Find Path" button)
            var result = GridCanvasBridge.runFromCanvas(canvas, 'AStarFinder');
            result.metrics.found.should.be.true();
            result.path.length.should.be.above(0);

            // 4. Score results (scorer)
            var metrics = Scorer.score(result);
            metrics.found.should.be.true();
            metrics.pathLength.should.be.above(0);
            metrics.efficiency.should.be.above(0);

            // 5. Build score card HTML (ScorerUI)
            var html = ScorerUI.renderCardHTML({
                algorithm: 'A*',
                timestamp: Date.now(),
                metrics: { nodesExplored: metrics.operationCount, pathLength: metrics.pathLength, timeMs: metrics.timeMs },
            });
            html.should.containEql('A*');

            // 6. Save scenario (persistence)
            var json = GridCanvasBridge.saveCanvas(canvas, 'AStarFinder');
            json.should.be.a.String();

            // 7. Reload into new canvas
            var data = PersistenceAdapter.load(json);
            var canvas2 = new GridCanvas(15, 15);
            GridCanvasBridge.applyToCanvas(canvas2, data);
            canvas2.getCellType(3, 1).should.equal('wall');

            // 8. Re-run and verify same result
            var result2 = GridCanvasBridge.runFromCanvas(canvas2, 'AStarFinder');
            result2.metrics.found.should.be.true();
            result2.path.length.should.equal(result.path.length);

            // 9. Build animation frames
            var frames = AnimationController.buildFrames(result2.operations, result2.path);
            frames.length.should.be.above(0);

            // 10. Compute animation timing from speed slider
            var delay = ControlsBridge.speedToDelay(5);
            delay.should.be.above(0);
        });

        it('should serialize canvas via controls format, reload, and run', function() {
            var canvas = new GridCanvas(15, 15);
            canvas.setStart(0, 0);
            canvas.setEnd(14, 14);
            canvas.setWall(7, 0);
            canvas.setWall(7, 1);
            canvas.setWall(7, 2);
            canvas.setWall(7, 3);

            // Serialize in controls format
            var json = ControlsBridge.serializeFromCanvas(canvas, 'BreadthFirstFinder');

            // Reload into fresh canvas
            var canvas2 = new GridCanvas(15, 15);
            ControlsBridge.deserializeToCanvas(json, canvas2);

            // Run pathfinding
            var result = GridCanvasBridge.runFromCanvas(canvas2, 'BreadthFirstFinder');
            result.metrics.found.should.be.true();
        });

        it('should run all algorithms on all Controls presets via canvas', function() {
            var presetNames = ControlsBridge.listPresets();
            var algos = ['AStarFinder', 'BreadthFirstFinder', 'DijkstraFinder'];

            presetNames.forEach(function(name) {
                algos.forEach(function(algo) {
                    var canvas = new GridCanvas(20, 20); // 20x20 fits Corridors preset
                    ControlsBridge.loadPresetToCanvas(name, canvas);
                    var result = GridCanvasBridge.runFromCanvas(canvas, algo);
                    result.metrics.should.have.properties('pathLength', 'found', 'efficiency');
                });
            });
        });

        it('should bridge ScenarioManager presets through canvas', function() {
            var names = ScenarioManagerBridge.listManagerPresets();
            names.forEach(function(name) {
                var loaded = ScenarioManagerBridge.loadManagerPreset(name);
                // Apply to canvas
                var canvas = new GridCanvas(loaded.grid.width, loaded.grid.height);
                GridCanvasBridge.applyToCanvas(canvas, {
                    width: loaded.grid.width,
                    height: loaded.grid.height,
                    matrix: loaded.grid.nodes.map(function(row) {
                        return row.map(function(n) { return n.walkable ? 0 : 1; });
                    }),
                    startX: loaded.startX,
                    startY: loaded.startY,
                    endX: loaded.endX,
                    endY: loaded.endY,
                });
                var result = GridCanvasBridge.runFromCanvas(canvas);
                result.metrics.should.have.property('found');
            });
        });
    });
});
