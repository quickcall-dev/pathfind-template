/**
 * ScenarioManager — save/load and preset library for pathfinding scenarios.
 *
 * Scenario schema:
 *   { width, height, startX, startY, endX, endY, matrix }
 *   matrix[y][x] === 1 → wall, 0 → walkable
 */

var REQUIRED_FIELDS = ['width', 'height', 'startX', 'startY', 'endX', 'endY', 'matrix'];
var PRESET_SIZE = 15;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyMatrix(width, height) {
    var m = [];
    for (var y = 0; y < height; y++) {
        m[y] = [];
        for (var x = 0; x < width; x++) {
            m[y][x] = 0;
        }
    }
    return m;
}

function validateObject(obj) {
    REQUIRED_FIELDS.forEach(function(f) {
        if (obj[f] === undefined || obj[f] === null) {
            throw new Error('Missing required field: ' + f);
        }
    });
    if (!Array.isArray(obj.matrix) || obj.matrix.length !== obj.height ||
        !Array.isArray(obj.matrix[0]) || obj.matrix[0].length !== obj.width) {
        throw new Error('matrix dimensions do not match width/height');
    }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function save(scenario) {
    return JSON.stringify(scenario);
}

function load(jsonString) {
    var obj;
    try {
        obj = JSON.parse(jsonString);
    } catch (e) {
        throw new Error('Invalid JSON: ' + e.message);
    }
    validateObject(obj);
    return obj;
}

function saveObject(scenario) {
    return JSON.parse(JSON.stringify(scenario)); // deep clone
}

function loadObject(obj) {
    validateObject(obj);
    return JSON.parse(JSON.stringify(obj)); // defensive clone
}

// ---------------------------------------------------------------------------
// Preset generators (all 15x15, deterministic except 'random')
// ---------------------------------------------------------------------------

function makeEmpty() {
    return {
        width: PRESET_SIZE,
        height: PRESET_SIZE,
        startX: 0,
        startY: 0,
        endX: PRESET_SIZE - 1,
        endY: PRESET_SIZE - 1,
        matrix: emptyMatrix(PRESET_SIZE, PRESET_SIZE)
    };
}

function makeMaze() {
    var S = PRESET_SIZE;
    var m = emptyMatrix(S, S);

    // Horizontal walls every 2 rows with staggered gaps (corridor maze)
    for (var y = 2; y < S - 1; y += 4) {
        for (var x = 0; x < S; x++) {
            m[y][x] = 1;
        }
        // gap on right side
        m[y][S - 2] = 0;
    }
    for (var y2 = 4; y2 < S - 1; y2 += 4) {
        for (var x2 = 0; x2 < S; x2++) {
            m[y2][x2] = 1;
        }
        // gap on left side
        m[y2][1] = 0;
    }

    // Keep start/end clear
    m[0][0] = 0;
    m[S - 1][S - 1] = 0;

    return {
        width: S, height: S,
        startX: 0, startY: 0,
        endX: S - 1, endY: S - 1,
        matrix: m
    };
}

function makeSpiral() {
    var S = PRESET_SIZE;
    var m = emptyMatrix(S, S);

    // Draw concentric rectangular rings (partial, leaving a gap to enter inner ring)
    var rings = Math.floor(S / 4);
    for (var r = 0; r < rings; r++) {
        var top    = r * 2;
        var left   = r * 2;
        var bottom = S - 1 - r * 2;
        var right  = S - 1 - r * 2;

        if (top >= bottom || left >= right) break;

        // top row
        for (var x = left; x <= right; x++) m[top][x] = 1;
        // right col
        for (var y = top; y <= bottom; y++) m[y][right] = 1;
        // bottom row
        for (var x2 = left; x2 <= right; x2++) m[bottom][x2] = 1;
        // left col
        for (var y2 = top; y2 <= bottom; y2++) m[y2][left] = 1;

        // opening: alternate top-right gap and bottom-left gap per ring
        if (r % 2 === 0) {
            // gap at bottom-left
            m[bottom][left + 1] = 0;
        } else {
            // gap at top-right
            m[top][right - 1] = 0;
        }
    }

    // Always clear start and end
    m[0][0] = 0;
    m[S - 1][S - 1] = 0;

    return {
        width: S, height: S,
        startX: 0, startY: 0,
        endX: S - 1, endY: S - 1,
        matrix: m
    };
}

function makeBottleneck() {
    var S = PRESET_SIZE;
    var m = emptyMatrix(S, S);
    var midY = Math.floor(S / 2);
    var gapX = Math.floor(S / 2); // single cell gap in the middle

    // Wall across the full middle row except one gap
    for (var x = 0; x < S; x++) {
        if (x !== gapX) {
            m[midY][x] = 1;
        }
    }

    m[0][0] = 0;
    m[S - 1][S - 1] = 0;

    return {
        width: S, height: S,
        startX: 0, startY: 0,
        endX: S - 1, endY: S - 1,
        matrix: m
    };
}

function makeRandom() {
    var S = PRESET_SIZE;
    var m = emptyMatrix(S, S);
    var startX = 0, startY = 0, endX = S - 1, endY = S - 1;

    // Seeded-ish deterministic "random" using a simple LCG for reproducibility
    var seed = 42;
    function rand() {
        seed = (seed * 1664525 + 1013904223) & 0xffffffff;
        return (seed >>> 0) / 0xffffffff;
    }

    var density = 0.25;
    for (var y = 0; y < S; y++) {
        for (var x = 0; x < S; x++) {
            // Never wall start or end
            if ((x === startX && y === startY) || (x === endX && y === endY)) continue;
            if (rand() < density) m[y][x] = 1;
        }
    }

    return {
        width: S, height: S,
        startX: startX, startY: startY,
        endX: endX, endY: endY,
        matrix: m
    };
}

// ---------------------------------------------------------------------------
// Preset registry
// ---------------------------------------------------------------------------

var PRESETS = {
    empty:       makeEmpty,
    maze:        makeMaze,
    spiral:      makeSpiral,
    bottleneck:  makeBottleneck,
    random:      makeRandom
};

function presetNames() {
    return Object.keys(PRESETS);
}

function loadPreset(name) {
    if (!PRESETS[name]) {
        throw new Error('Unknown preset: "' + name + '"');
    }
    return PRESETS[name]();
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
    emptyMatrix:  emptyMatrix,
    save:         save,
    load:         load,
    saveObject:   saveObject,
    loadObject:   loadObject,
    presetNames:  presetNames,
    loadPreset:   loadPreset
};
