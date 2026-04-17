'use strict';

var REQUIRED_FIELDS = ['cols', 'rows', 'walls', 'startX', 'startY', 'endX', 'endY', 'algorithm'];

var ScenarioControls = {

    ALGORITHMS: [
        { id: 'AStarFinder',                          label: 'A*' },
        { id: 'BiAStarFinder',                        label: 'A* (Bi-directional)' },
        { id: 'IDAStarFinder',                        label: 'IDA*' },
        { id: 'BreadthFirstFinder',                   label: 'Breadth-First Search' },
        { id: 'BiBreadthFirstFinder',                 label: 'Breadth-First Search (Bi-directional)' },
        { id: 'BestFirstFinder',                      label: 'Best-First Search' },
        { id: 'BiBestFirstFinder',                    label: 'Best-First Search (Bi-directional)' },
        { id: 'DijkstraFinder',                       label: 'Dijkstra' },
        { id: 'BiDijkstraFinder',                     label: 'Dijkstra (Bi-directional)' },
        { id: 'JumpPointFinder',                      label: 'Jump Point Search' },
        { id: 'JPFAlwaysMoveDiagonally',              label: 'JPS (Always Diagonal)' },
        { id: 'JPFMoveDiagonallyIfAtMostOneObstacle', label: 'JPS (Diagonal ≤1 Obstacle)' },
        { id: 'JPFMoveDiagonallyIfNoObstacles',       label: 'JPS (No Diagonal Obstacles)' },
        { id: 'JPFNeverMoveDiagonally',               label: 'JPS (Never Diagonal)' }
    ],

    PRESETS: {
        'Empty 15x15': {
            cols: 15, rows: 15,
            walls: [],
            startX: 1, startY: 7,
            endX: 13, endY: 7
        },
        'Maze 15x15': {
            cols: 15, rows: 15,
            walls: [
                [3,1],[3,2],[3,3],[3,4],[3,5],[3,6],[3,7],[3,8],[3,9],
                [7,5],[7,6],[7,7],[7,8],[7,9],[7,10],[7,11],[7,12],[7,13],
                [11,1],[11,2],[11,3],[11,4],[11,5],[11,6],[11,7],[11,8],[11,9]
            ],
            startX: 1, startY: 7,
            endX: 13, endY: 7
        },
        'Corridors 20x20': {
            cols: 20, rows: 20,
            walls: (function() {
                var w = [];
                // horizontal walls with gaps
                for (var x = 0; x < 20; x++) { if (x !== 5)  w.push([x, 5]); }
                for (var x = 0; x < 20; x++) { if (x !== 14) w.push([x, 10]); }
                for (var x = 0; x < 20; x++) { if (x !== 5)  w.push([x, 15]); }
                return w;
            }()),
            startX: 1, startY: 1,
            endX: 18, endY: 18
        },
        'Diagonal Barrier': {
            cols: 15, rows: 15,
            walls: (function() {
                var w = [];
                for (var i = 2; i <= 12; i++) { w.push([i, i]); }
                return w;
            }()),
            startX: 1, startY: 7,
            endX: 13, endY: 7
        }
    },

    DEFAULT_GRID_SIZE: { cols: 15, rows: 15 },

    /**
     * Validate grid dimensions.
     * cols and rows must be integers in [5, 100].
     */
    validateGridSize: function(cols, rows) {
        if (typeof cols !== 'number' || typeof rows !== 'number') return false;
        if (!isFinite(cols) || !isFinite(rows)) return false;
        if (cols !== Math.floor(cols) || rows !== Math.floor(rows)) return false;
        return cols >= 5 && cols <= 100 && rows >= 5 && rows <= 100;
    },

    /**
     * Map speed slider value [1..10] to animation interval in ms.
     * Speed 1 → 500ms/op, speed 10 → 10ms/op.
     */
    getAnimationInterval: function(speed) {
        var s = Math.min(10, Math.max(1, speed));
        // exponential scale: speed 1 = 500ms, speed 10 = 10ms
        return Math.round(500 * Math.pow(10 / 500, (s - 1) / 9));
    },

    /**
     * Map speed slider value [1..10] to operations per second.
     * Inverse of getAnimationInterval: ops/sec = 1000 / interval.
     */
    getOperationsPerSecond: function(speed) {
        return Math.round(1000 / this.getAnimationInterval(speed));
    },

    /**
     * Serialize current scenario to JSON string.
     * opts: { cols, rows, walls, startX, startY, endX, endY, algorithm }
     */
    serializeScenario: function(opts) {
        return JSON.stringify({
            cols:      opts.cols,
            rows:      opts.rows,
            walls:     opts.walls,
            startX:    opts.startX,
            startY:    opts.startY,
            endX:      opts.endX,
            endY:      opts.endY,
            algorithm: opts.algorithm
        }, null, 2);
    },

    /**
     * Deserialize scenario from JSON string or plain object.
     * Throws on parse error or missing required fields.
     */
    deserializeScenario: function(input) {
        var obj;
        if (typeof input === 'string') {
            obj = JSON.parse(input); // throws on bad JSON
        } else {
            obj = input;
        }
        for (var i = 0; i < REQUIRED_FIELDS.length; i++) {
            if (!Object.prototype.hasOwnProperty.call(obj, REQUIRED_FIELDS[i])) {
                throw new Error('Missing required field: ' + REQUIRED_FIELDS[i]);
            }
        }
        return obj;
    },

    /**
     * Return sorted list of preset names.
     */
    getPresetNames: function() {
        return Object.keys(this.PRESETS).sort();
    },

    /**
     * Return preset data by name, or throw if not found.
     */
    loadPreset: function(name) {
        if (!Object.prototype.hasOwnProperty.call(this.PRESETS, name)) {
            throw new Error('Unknown preset: ' + name);
        }
        return this.PRESETS[name];
    }
};

module.exports = ScenarioControls;
