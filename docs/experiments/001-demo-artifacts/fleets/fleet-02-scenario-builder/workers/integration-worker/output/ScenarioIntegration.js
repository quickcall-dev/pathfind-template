/**
 * ScenarioIntegration — wires pathfinding components together.
 *
 * Components:
 *   - ScenarioRunner: run algorithm on grid, capture metrics
 *   - PresetManager: load preset maps into grids
 *   - PersistenceAdapter: save/load scenarios as JSON
 *   - Scorer: compute metrics from pathfinding results
 *   - AnimationController: step-by-step path animation timing
 *   - ScenarioManagerBridge: bridge to src/scenario/ScenarioManager presets + save/load
 *   - ScorerUI: render score card HTML without destroying buttons
 */

var PF = require('../../../../../../../../src/PathFinding');
var ScenarioManager = require('../../../../../../../../src/scenario/ScenarioManager');

// ---------------------------------------------------------------------------
// Scorer — metrics from a pathfinding result
// ---------------------------------------------------------------------------
var Scorer = {
    /**
     * Score a completed pathfinding run.
     * @param {Object} result - { path, timeMs, operationCount, grid }
     * @return {Object} metrics
     */
    score: function(result) {
        var path = result.path;
        var len = PF.Util.pathLength(path);
        return {
            pathLength: Math.round(len * 100) / 100,
            pathNodes: path.length,
            timeMs: result.timeMs,
            operationCount: result.operationCount,
            found: path.length > 0,
            efficiency: result.operationCount > 0
                ? Math.round((path.length / result.operationCount) * 10000) / 10000
                : 0,
        };
    },
};

// ---------------------------------------------------------------------------
// ScorerUI — render score card HTML (Issue #1 fix)
//
// showScoreCard was destroying Save/Compare buttons because it called
// $panel.empty(). Instead, render card HTML separately and let the
// caller insert it into a content area, keeping buttons intact.
// ---------------------------------------------------------------------------
var ScorerUI = {
    /**
     * Render score card HTML string for a run (no buttons included).
     * @param {Object} run - { algorithm, timestamp, metrics }
     * @return {string} HTML
     */
    renderCardHTML: function(run) {
        var m = run.metrics;
        var formattedTime = parseFloat(m.timeMs).toFixed(4) + ' ms';
        var ts = new Date(run.timestamp).toLocaleTimeString();
        return '<div class="score-card">' +
            '<div class="score-card-header">' + run.algorithm + '</div>' +
            '<table class="score-card-table">' +
              '<tr><td>Nodes explored</td><td class="score-val">' + m.nodesExplored + '</td></tr>' +
              '<tr><td>Path length</td><td class="score-val">' + m.pathLength + '</td></tr>' +
              '<tr><td>Time</td><td class="score-val">' + formattedTime + '</td></tr>' +
              '<tr><td>Saved at</td><td class="score-val">' + ts + '</td></tr>' +
            '</table>' +
        '</div>';
    },
};

// ---------------------------------------------------------------------------
// PresetManager — preset grid layouts
// ---------------------------------------------------------------------------
var PresetManager = {
    presets: {
        open: {
            name: 'Open Grid',
            width: 10,
            height: 10,
            matrix: null, // all walkable
            startX: 0, startY: 0,
            endX: 9, endY: 9,
        },
        maze: {
            name: 'Simple Maze',
            width: 10,
            height: 10,
            matrix: [
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,1,0,0,0,1,0,0],
                [0,0,0,1,0,0,0,1,0,0],
                [0,1,1,1,0,1,1,1,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,1,1,1,1,1,0,0,0],
                [0,0,0,0,0,0,1,0,0,0],
                [0,1,1,1,1,0,1,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
            ],
            startX: 0, startY: 0,
            endX: 9, endY: 9,
        },
        bottleneck: {
            name: 'Bottleneck',
            width: 10,
            height: 10,
            matrix: [
                [0,0,0,0,1,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0],
            ],
            startX: 0, startY: 0,
            endX: 9, endY: 9,
        },
        spiral: {
            name: 'Spiral',
            width: 10,
            height: 10,
            matrix: [
                [0,0,0,0,0,0,0,0,0,0],
                [1,1,1,1,1,1,1,1,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,1,1,1,1,1,1,1,1],
                [0,0,0,0,0,0,0,0,0,0],
                [1,1,1,1,1,1,1,1,0,0],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,1,1,1,1,1,1,1,1],
                [0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],
            ],
            startX: 0, startY: 0,
            endX: 9, endY: 9,
        },
        nopath: {
            name: 'No Path',
            width: 10,
            height: 10,
            matrix: [
                [0,0,0,0,1,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0],
                [0,0,0,0,1,0,0,0,0,0],
            ],
            startX: 0, startY: 0,
            endX: 9, endY: 9,
        },
    },

    list: function() {
        return Object.keys(this.presets);
    },

    get: function(name) {
        var p = this.presets[name];
        if (!p) throw new Error('Unknown preset: ' + name);
        return p;
    },

    /**
     * Build a PF.Grid from a preset.
     * @param {string} name
     * @return {{ grid: PF.Grid, startX, startY, endX, endY }}
     */
    load: function(name) {
        var p = this.get(name);
        var grid = p.matrix
            ? new PF.Grid(p.width, p.height, p.matrix)
            : new PF.Grid(p.width, p.height);
        return {
            grid: grid,
            startX: p.startX,
            startY: p.startY,
            endX: p.endX,
            endY: p.endY,
        };
    },
};

// ---------------------------------------------------------------------------
// PersistenceAdapter — serialize / deserialize scenarios
// ---------------------------------------------------------------------------
var PersistenceAdapter = {
    /**
     * Serialize a scenario to JSON string.
     * @param {Object} scenario - { width, height, matrix, startX, startY, endX, endY, algorithm, options }
     * @return {string}
     */
    save: function(scenario) {
        return JSON.stringify({
            version: 1,
            width: scenario.width,
            height: scenario.height,
            matrix: scenario.matrix,
            startX: scenario.startX,
            startY: scenario.startY,
            endX: scenario.endX,
            endY: scenario.endY,
            algorithm: scenario.algorithm || null,
            options: scenario.options || {},
        });
    },

    /**
     * Deserialize a scenario from JSON string.
     * @param {string} json
     * @return {Object}
     */
    load: function(json) {
        var data = JSON.parse(json);
        if (!data.version) throw new Error('Invalid scenario format');
        return data;
    },

    /**
     * Build a PF.Grid + finder from a loaded scenario.
     * @param {Object} data - output of load()
     * @return {{ grid, finder, startX, startY, endX, endY }}
     */
    hydrate: function(data) {
        var grid = data.matrix
            ? new PF.Grid(data.width, data.height, data.matrix)
            : new PF.Grid(data.width, data.height);
        var finder = null;
        if (data.algorithm) {
            var Ctor = PF[data.algorithm];
            if (!Ctor) throw new Error('Unknown algorithm: ' + data.algorithm);
            finder = new Ctor(data.options || {});
        }
        return {
            grid: grid,
            finder: finder,
            startX: data.startX,
            startY: data.startY,
            endX: data.endX,
            endY: data.endY,
        };
    },
};

// ---------------------------------------------------------------------------
// AnimationController — step timing for path animation
// ---------------------------------------------------------------------------
var AnimationController = {
    /**
     * Compute delay between animation steps.
     * @param {number} speed - 1 (slowest) to 100 (fastest)
     * @return {number} ms between steps
     */
    stepDelay: function(speed) {
        speed = Math.max(1, Math.min(100, speed || 50));
        // 1 => 500ms, 50 => ~10ms, 100 => 1ms
        return Math.round(500 / speed);
    },

    /**
     * Generate animation frames from path + operations.
     * Each frame is { type: 'explore'|'path', x, y, index }.
     * @param {Array} operations - [{x, y, attr, value}, ...]
     * @param {Array} path - [[x,y], ...]
     * @return {Array} frames
     */
    buildFrames: function(operations, path) {
        var frames = [];
        var i;
        for (i = 0; i < operations.length; i++) {
            var op = operations[i];
            if (op.attr === 'opened' || op.attr === 'closed' || op.attr === 'tested') {
                frames.push({ type: 'explore', x: op.x, y: op.y, attr: op.attr, index: i });
            }
        }
        for (i = 0; i < path.length; i++) {
            frames.push({ type: 'path', x: path[i][0], y: path[i][1], index: i });
        }
        return frames;
    },
};

// ---------------------------------------------------------------------------
// ScenarioRunner — orchestrates a full pathfinding run
// ---------------------------------------------------------------------------
var ScenarioRunner = {
    /**
     * Run pathfinding on a scenario config.
     * @param {Object} config
     *   - grid {PF.Grid}
     *   - finder {PF.Finder} (optional, defaults to AStarFinder)
     *   - startX, startY, endX, endY {number}
     * @return {Object} { path, timeMs, operationCount, metrics }
     */
    run: function(config) {
        var finder = config.finder || new PF.AStarFinder();
        var grid = config.grid.clone(); // don't mutate original

        // Hook node prototype to capture operations
        var operations = [];
        var origOpened = Object.getOwnPropertyDescriptor(PF.Node.prototype, 'opened');
        var origClosed = Object.getOwnPropertyDescriptor(PF.Node.prototype, 'closed');
        var origTested = Object.getOwnPropertyDescriptor(PF.Node.prototype, 'tested');

        Object.defineProperty(PF.Node.prototype, 'opened', {
            get: function() { return this._opened; },
            set: function(v) {
                this._opened = v;
                operations.push({ x: this.x, y: this.y, attr: 'opened', value: v });
            },
            configurable: true,
        });
        Object.defineProperty(PF.Node.prototype, 'closed', {
            get: function() { return this._closed; },
            set: function(v) {
                this._closed = v;
                operations.push({ x: this.x, y: this.y, attr: 'closed', value: v });
            },
            configurable: true,
        });
        Object.defineProperty(PF.Node.prototype, 'tested', {
            get: function() { return this._tested; },
            set: function(v) {
                this._tested = v;
                operations.push({ x: this.x, y: this.y, attr: 'tested', value: v });
            },
            configurable: true,
        });

        var start = Date.now();
        var path = finder.findPath(
            config.startX, config.startY,
            config.endX, config.endY,
            grid
        );
        var elapsed = Date.now() - start;

        // Restore originals
        if (origOpened) Object.defineProperty(PF.Node.prototype, 'opened', origOpened);
        else delete PF.Node.prototype.opened;
        if (origClosed) Object.defineProperty(PF.Node.prototype, 'closed', origClosed);
        else delete PF.Node.prototype.closed;
        if (origTested) Object.defineProperty(PF.Node.prototype, 'tested', origTested);
        else delete PF.Node.prototype.tested;

        var result = {
            path: path,
            timeMs: elapsed,
            operationCount: operations.length,
            operations: operations,
        };
        result.metrics = Scorer.score(result);
        return result;
    },

    /**
     * Run pathfinding from a preset name.
     * @param {string} presetName
     * @param {string} [algorithmName] - e.g. 'AStarFinder'
     * @param {Object} [options] - finder options
     * @return {Object} same as run()
     */
    runPreset: function(presetName, algorithmName, options) {
        var loaded = PresetManager.load(presetName);
        var finder = null;
        if (algorithmName) {
            var Ctor = PF[algorithmName];
            if (!Ctor) throw new Error('Unknown algorithm: ' + algorithmName);
            finder = new Ctor(options || {});
        }
        return this.run({
            grid: loaded.grid,
            finder: finder,
            startX: loaded.startX,
            startY: loaded.startY,
            endX: loaded.endX,
            endY: loaded.endY,
        });
    },

    /**
     * Run pathfinding from a saved scenario JSON string.
     * @param {string} json
     * @return {Object} same as run()
     */
    runSaved: function(json) {
        var data = PersistenceAdapter.load(json);
        var hydrated = PersistenceAdapter.hydrate(data);
        return this.run({
            grid: hydrated.grid,
            finder: hydrated.finder,
            startX: hydrated.startX,
            startY: hydrated.startY,
            endX: hydrated.endX,
            endY: hydrated.endY,
        });
    },
};

// ---------------------------------------------------------------------------
// ScenarioManagerBridge — bridge to src/scenario/ScenarioManager
// Addresses Issues #2 (save/load scenario as JSON) and #3 (preset maps)
// ---------------------------------------------------------------------------
var ScenarioManagerBridge = {
    /**
     * Extract matrix from PF.Grid.
     */
    _gridToMatrix: function(grid) {
        var matrix = [];
        for (var y = 0; y < grid.height; y++) {
            matrix[y] = [];
            for (var x = 0; x < grid.width; x++) {
                matrix[y][x] = grid.isWalkableAt(x, y) ? 0 : 1;
            }
        }
        return matrix;
    },

    /**
     * Save current grid state to JSON via ScenarioManager.
     * @param {PF.Grid} grid
     * @param {number} startX
     * @param {number} startY
     * @param {number} endX
     * @param {number} endY
     * @param {string} [algorithm]
     * @return {string} JSON string
     */
    saveGridToJSON: function(grid, startX, startY, endX, endY, algorithm) {
        var scenario = {
            width: grid.width,
            height: grid.height,
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY,
            matrix: this._gridToMatrix(grid),
        };
        var json = ScenarioManager.save(scenario);
        // If algorithm specified, inject it into the saved data
        if (algorithm) {
            var obj = JSON.parse(json);
            obj.algorithm = algorithm;
            return JSON.stringify(obj);
        }
        return json;
    },

    /**
     * Load a scenario from JSON string, returning grid + finder + positions.
     * @param {string} json
     * @return {{ grid, finder, startX, startY, endX, endY }}
     */
    loadGridFromJSON: function(json) {
        var data = JSON.parse(json);
        var grid = new PF.Grid(data.width, data.height, data.matrix);
        var finder = null;
        if (data.algorithm) {
            var Ctor = PF[data.algorithm];
            if (Ctor) {
                finder = new Ctor(data.options || {});
            }
        }
        return {
            grid: grid,
            finder: finder,
            startX: data.startX,
            startY: data.startY,
            endX: data.endX,
            endY: data.endY,
        };
    },

    /**
     * List available ScenarioManager presets.
     * @return {string[]}
     */
    listManagerPresets: function() {
        return ScenarioManager.presetNames();
    },

    /**
     * Load a ScenarioManager preset into a runnable grid config.
     * @param {string} name
     * @return {{ grid, startX, startY, endX, endY }}
     */
    loadManagerPreset: function(name) {
        var preset = ScenarioManager.loadPreset(name);
        var grid = new PF.Grid(preset.width, preset.height, preset.matrix);
        return {
            grid: grid,
            startX: preset.startX,
            startY: preset.startY,
            endX: preset.endX,
            endY: preset.endY,
        };
    },
};

// ---------------------------------------------------------------------------
// GridCanvasBridge — wire GridCanvas model to pathfinding
// ---------------------------------------------------------------------------
var GridCanvas = require('../../canvas-worker/output/GridCanvas');

var GridCanvasBridge = {
    /**
     * Convert a GridCanvas instance to a PF.Grid.
     * @param {GridCanvas} canvas
     * @return {PF.Grid}
     */
    toPFGrid: function(canvas) {
        return new PF.Grid(canvas.width, canvas.height, canvas.toMatrix());
    },

    /**
     * Run pathfinding on current GridCanvas state.
     * @param {GridCanvas} canvas
     * @param {string} [algorithmName] - e.g. 'AStarFinder'
     * @param {Object} [options] - finder options
     * @return {Object} ScenarioRunner result (path, metrics, operations, etc.)
     */
    runFromCanvas: function(canvas, algorithmName, options) {
        var start = canvas.getStart();
        var end = canvas.getEnd();
        if (!start || !end) throw new Error('Canvas must have start and end points');

        var grid = this.toPFGrid(canvas);
        var finder = null;
        if (algorithmName) {
            var Ctor = PF[algorithmName];
            if (!Ctor) throw new Error('Unknown algorithm: ' + algorithmName);
            finder = new Ctor(options || {});
        }
        return ScenarioRunner.run({
            grid: grid,
            finder: finder,
            startX: start.x,
            startY: start.y,
            endX: end.x,
            endY: end.y,
        });
    },

    /**
     * Apply a PersistenceAdapter scenario to a GridCanvas.
     * @param {GridCanvas} canvas
     * @param {Object} data - deserialized scenario (from PersistenceAdapter.load)
     */
    applyToCanvas: function(canvas, data) {
        canvas.reset();
        if (data.matrix) {
            for (var y = 0; y < data.height && y < canvas.height; y++) {
                for (var x = 0; x < data.width && x < canvas.width; x++) {
                    if (data.matrix[y][x] === 1) {
                        canvas.setWall(x, y);
                    }
                }
            }
        }
        canvas.setStart(data.startX, data.startY);
        canvas.setEnd(data.endX, data.endY);
    },

    /**
     * Save GridCanvas state via PersistenceAdapter.
     * @param {GridCanvas} canvas
     * @param {string} [algorithm]
     * @param {Object} [options]
     * @return {string} JSON
     */
    saveCanvas: function(canvas, algorithm, options) {
        return PersistenceAdapter.save({
            width: canvas.width,
            height: canvas.height,
            matrix: canvas.toMatrix(),
            startX: canvas.getStart() ? canvas.getStart().x : 0,
            startY: canvas.getStart() ? canvas.getStart().y : 0,
            endX: canvas.getEnd() ? canvas.getEnd().x : canvas.width - 1,
            endY: canvas.getEnd() ? canvas.getEnd().y : canvas.height - 1,
            algorithm: algorithm || null,
            options: options || {},
        });
    },
};

// ---------------------------------------------------------------------------
// ControlsBridge — wire ScenarioControls to pathfinding components
// ---------------------------------------------------------------------------
var ScenarioControls = require('../../controls-worker/output/ScenarioControls');

var ControlsBridge = {
    /**
     * Load a ScenarioControls preset into a GridCanvas.
     * @param {string} presetName
     * @param {GridCanvas} canvas
     */
    loadPresetToCanvas: function(presetName, canvas) {
        var preset = ScenarioControls.loadPreset(presetName);
        canvas.reset();
        // Resize canvas if needed (GridCanvas is fixed-size, so apply within bounds)
        preset.walls.forEach(function(w) {
            if (w[0] < canvas.width && w[1] < canvas.height) {
                canvas.setWall(w[0], w[1]);
            }
        });
        canvas.setStart(
            Math.min(preset.startX, canvas.width - 1),
            Math.min(preset.startY, canvas.height - 1)
        );
        canvas.setEnd(
            Math.min(preset.endX, canvas.width - 1),
            Math.min(preset.endY, canvas.height - 1)
        );
    },

    /**
     * Serialize GridCanvas state in ScenarioControls format.
     * @param {GridCanvas} canvas
     * @param {string} algorithm
     * @return {string} JSON
     */
    serializeFromCanvas: function(canvas, algorithm) {
        var state = canvas.getState();
        return ScenarioControls.serializeScenario({
            cols: state.width,
            rows: state.height,
            walls: state.walls.map(function(w) { return [w.x, w.y]; }),
            startX: state.start ? state.start.x : 0,
            startY: state.start ? state.start.y : 0,
            endX: state.end ? state.end.x : state.width - 1,
            endY: state.end ? state.end.y : state.height - 1,
            algorithm: algorithm || 'AStarFinder',
        });
    },

    /**
     * Deserialize ScenarioControls JSON and apply to GridCanvas.
     * @param {string} json
     * @param {GridCanvas} canvas
     */
    deserializeToCanvas: function(json, canvas) {
        var scenario = ScenarioControls.deserializeScenario(json);
        canvas.reset();
        scenario.walls.forEach(function(w) {
            if (w[0] < canvas.width && w[1] < canvas.height) {
                canvas.setWall(w[0], w[1]);
            }
        });
        canvas.setStart(
            Math.min(scenario.startX, canvas.width - 1),
            Math.min(scenario.startY, canvas.height - 1)
        );
        canvas.setEnd(
            Math.min(scenario.endX, canvas.width - 1),
            Math.min(scenario.endY, canvas.height - 1)
        );
    },

    /**
     * Map ScenarioControls speed slider value to AnimationController delay.
     * Controls uses [1..10], AnimationController uses [1..100].
     * @param {number} controlsSpeed - [1..10]
     * @return {number} ms delay
     */
    speedToDelay: function(controlsSpeed) {
        // Map [1..10] → [1..100] for AnimationController
        var mapped = Math.round(1 + (controlsSpeed - 1) * (99 / 9));
        return AnimationController.stepDelay(mapped);
    },

    /**
     * List available preset names from ScenarioControls.
     * @return {string[]}
     */
    listPresets: function() {
        return ScenarioControls.getPresetNames();
    },

    /**
     * Get animation interval from ScenarioControls for a speed value.
     * @param {number} speed - [1..10]
     * @return {number} ms
     */
    getInterval: function(speed) {
        return ScenarioControls.getAnimationInterval(speed);
    },
};

module.exports = {
    Scorer: Scorer,
    ScorerUI: ScorerUI,
    PresetManager: PresetManager,
    PersistenceAdapter: PersistenceAdapter,
    AnimationController: AnimationController,
    ScenarioRunner: ScenarioRunner,
    ScenarioManagerBridge: ScenarioManagerBridge,
    GridCanvasBridge: GridCanvasBridge,
    ControlsBridge: ControlsBridge,
};
