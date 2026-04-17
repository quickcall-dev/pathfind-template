/**
 * RunStore: captures, saves, loads, and compares pathfinding run metrics.
 * Works in Node.js (in-memory) and browser (localStorage via custom storage).
 *
 * @param {Object} [storage] - optional storage backend.
 *   Must implement: save(run), load() -> Array, clear()
 */
function RunStore(storage) {
    if (storage) {
        this._storage = storage;
    } else {
        var _runs = [];
        this._storage = {
            save:  function(run) { _runs.push(run); },
            load:  function()    { return _runs.slice(); },
            clear: function()    { _runs = []; }
        };
    }
    this._idCounter = 0;
}

/**
 * Capture a run record from raw pathfinding output.
 *
 * @param {string} algorithm       - finder name, e.g. 'AStarFinder'
 * @param {Object} map             - { width, height, walls: [[x,y],...] }
 * @param {Array}  path            - array of [x,y] coordinate pairs
 * @param {number} timeMs          - elapsed milliseconds
 * @param {number} nodesExplored   - operation count from Controller
 * @returns {Object} run record
 */
RunStore.prototype.capture = function(algorithm, map, path, timeMs, nodesExplored) {
    this._idCounter += 1;
    return {
        id:        Date.now() + '_' + this._idCounter,
        algorithm: algorithm,
        timestamp: Date.now(),
        map:       map,
        metrics: {
            nodesExplored: nodesExplored,
            pathLength:    path.length > 1 ? path.length - 1 : 0,
            timeMs:        timeMs
        }
    };
};

/** Persist a run record. */
RunStore.prototype.save = function(run) {
    this._storage.save(run);
};

/** Return all saved runs (copy). */
RunStore.prototype.load = function() {
    return this._storage.load();
};

/** Remove all saved runs. */
RunStore.prototype.clear = function() {
    this._storage.clear();
};

/**
 * Return comparison-ready summary for all saved runs.
 * @returns {Array} array of { algorithm, timestamp, metrics }
 */
RunStore.prototype.compare = function() {
    return this._storage.load().map(function(run) {
        return {
            algorithm: run.algorithm,
            timestamp: run.timestamp,
            metrics:   run.metrics
        };
    });
};

/**
 * Build a display-ready score card for a single run.
 * @param {Object} run
 * @returns {Object} card with algorithm, metrics, timestamp, formattedTime
 */
RunStore.prototype.scoreCard = function(run) {
    return {
        algorithm:     run.algorithm,
        timestamp:     run.timestamp,
        metrics:       run.metrics,
        formattedTime: parseFloat(run.metrics.timeMs).toFixed(4) + ' ms'
    };
};

module.exports = RunStore;
