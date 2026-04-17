'use strict';

/**
 * GridCanvas — pure model for a 15x15 interactive pathfinding grid.
 *
 * Cell types: 'empty' | 'wall' | 'start' | 'end'
 *
 * API:
 *   getCellType(x, y)       → string
 *   toggleWall(x, y)        → void
 *   setStart(x, y)          → void
 *   setEnd(x, y)            → void
 *   getStart()              → {x,y} | null
 *   getEnd()                → {x,y} | null
 *   getState()              → snapshot {width, height, start, end, walls}
 *   setState(snapshot)      → void
 *   toMatrix()              → number[][] (0=walkable, 1=wall)
 *   reset()                 → void
 */
function GridCanvas(width, height) {
    this.width  = width  || 15;
    this.height = height || 15;
    this._walls = {};   // key: "x,y"
    this._start = null; // {x, y}
    this._end   = null; // {x, y}
    this._onChange = null; // optional callback(state)
}

GridCanvas.prototype._key = function(x, y) {
    return x + ',' + y;
};

GridCanvas.prototype._inBounds = function(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
};

GridCanvas.prototype.getCellType = function(x, y) {
    if (this._start && this._start.x === x && this._start.y === y) return 'start';
    if (this._end   && this._end.x   === x && this._end.y   === y) return 'end';
    if (this._walls[this._key(x, y)]) return 'wall';
    return 'empty';
};

GridCanvas.prototype.onChange = function(fn) {
    this._onChange = fn;
};

GridCanvas.prototype._notify = function() {
    if (typeof this._onChange === 'function') {
        this._onChange(this.getState());
    }
};

GridCanvas.prototype.setWall = function(x, y) {
    if (!this._inBounds(x, y)) return;
    var type = this.getCellType(x, y);
    if (type === 'start' || type === 'end') return;
    this._walls[this._key(x, y)] = true;
    this._notify();
};

GridCanvas.prototype.toggleWall = function(x, y) {
    if (!this._inBounds(x, y)) return;
    var type = this.getCellType(x, y);
    if (type === 'start' || type === 'end') return;
    var k = this._key(x, y);
    if (this._walls[k]) {
        delete this._walls[k];
    } else {
        this._walls[k] = true;
    }
    this._notify();
};

GridCanvas.prototype.setStart = function(x, y) {
    if (!this._inBounds(x, y)) return;
    // Clear previous start
    this._start = null;
    // If end is here, clear it
    if (this._end && this._end.x === x && this._end.y === y) {
        this._end = null;
    }
    // Clear wall if any
    delete this._walls[this._key(x, y)];
    this._start = { x: x, y: y };
    this._notify();
};

GridCanvas.prototype.setEnd = function(x, y) {
    if (!this._inBounds(x, y)) return;
    // Clear previous end
    this._end = null;
    // If start is here, clear it
    if (this._start && this._start.x === x && this._start.y === y) {
        this._start = null;
    }
    // Clear wall if any
    delete this._walls[this._key(x, y)];
    this._end = { x: x, y: y };
    this._notify();
};

GridCanvas.prototype.getStart = function() {
    return this._start ? { x: this._start.x, y: this._start.y } : null;
};

GridCanvas.prototype.getEnd = function() {
    return this._end ? { x: this._end.x, y: this._end.y } : null;
};

GridCanvas.prototype.getState = function() {
    var walls = [];
    var keys = Object.keys(this._walls);
    for (var i = 0; i < keys.length; i++) {
        var parts = keys[i].split(',');
        walls.push({ x: parseInt(parts[0], 10), y: parseInt(parts[1], 10) });
    }
    return {
        width:  this.width,
        height: this.height,
        start:  this._start ? { x: this._start.x, y: this._start.y } : null,
        end:    this._end   ? { x: this._end.x,   y: this._end.y   } : null,
        walls:  walls
    };
};

GridCanvas.prototype.setState = function(snapshot) {
    this.reset();
    if (snapshot.start) this.setStart(snapshot.start.x, snapshot.start.y);
    if (snapshot.end)   this.setEnd(snapshot.end.x, snapshot.end.y);
    var walls = snapshot.walls || [];
    for (var i = 0; i < walls.length; i++) {
        var w = walls[i];
        if (this._inBounds(w.x, w.y) && this.getCellType(w.x, w.y) === 'empty') {
            this._walls[this._key(w.x, w.y)] = true;
        }
    }
    this._notify();
};

GridCanvas.prototype.toMatrix = function() {
    var matrix = [];
    for (var y = 0; y < this.height; y++) {
        matrix[y] = [];
        for (var x = 0; x < this.width; x++) {
            matrix[y][x] = this._walls[this._key(x, y)] ? 1 : 0;
        }
    }
    return matrix;
};

GridCanvas.prototype.reset = function() {
    this._walls = {};
    this._start = null;
    this._end   = null;
    this._notify();
};

module.exports = GridCanvas;
