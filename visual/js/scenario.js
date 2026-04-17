/**
 * Scenario controls: save/load scenario JSON, preset maps.
 * Integrates with Controller, View, and Panel globals.
 */
var Scenario = (function($) {
    'use strict';

    var PRESETS = {
        'Empty 15x15': {
            cols: 15, rows: 15,
            walls: [],
            startX: 1, startY: 7, endX: 13, endY: 7
        },
        'Maze 15x15': {
            cols: 15, rows: 15,
            walls: [
                [3,1],[3,2],[3,3],[3,4],[3,5],[3,6],[3,7],[3,8],[3,9],
                [7,5],[7,6],[7,7],[7,8],[7,9],[7,10],[7,11],[7,12],[7,13],
                [11,1],[11,2],[11,3],[11,4],[11,5],[11,6],[11,7],[11,8],[11,9]
            ],
            startX: 1, startY: 7, endX: 13, endY: 7
        },
        'Corridors 20x20': {
            cols: 20, rows: 20,
            walls: (function() {
                var w = [], x;
                for (x = 0; x < 20; x++) { if (x !== 5)  w.push([x, 5]); }
                for (x = 0; x < 20; x++) { if (x !== 14) w.push([x, 10]); }
                for (x = 0; x < 20; x++) { if (x !== 5)  w.push([x, 15]); }
                return w;
            }()),
            startX: 1, startY: 1, endX: 18, endY: 18
        },
        'Diagonal Barrier': {
            cols: 15, rows: 15,
            walls: (function() {
                var w = [], i;
                for (i = 2; i <= 12; i++) { w.push([i, i]); }
                return w;
            }()),
            startX: 1, startY: 7, endX: 13, endY: 7
        }
    };

    /**
     * Collect walls from the current Controller.grid.
     * Returns array of [x, y] pairs.
     */
    function getWalls() {
        var walls = [], grid = Controller.grid, x, y;
        for (y = 0; y < grid.height; y++) {
            for (x = 0; x < grid.width; x++) {
                if (!grid.isWalkableAt(x, y)) {
                    walls.push([x, y]);
                }
            }
        }
        return walls;
    }

    /**
     * Apply a preset or loaded scenario to the current grid.
     * Clears walls, sets start/end, applies new walls.
     * Walls that fall outside the current grid dimensions are skipped.
     */
    function applyScenario(scenario) {
        var cols = Controller.gridSize[0],
            rows = Controller.gridSize[1],
            startX = Math.min(scenario.startX, cols - 1),
            startY = Math.min(scenario.startY, rows - 1),
            endX   = Math.min(scenario.endX,   cols - 1),
            endY   = Math.min(scenario.endY,   rows - 1);

        // Clear visual path + footprints, reset grid data
        Controller.clearOperations();
        Controller.clearFootprints();
        View.clearBlockedNodes();
        Controller.buildNewGrid();

        // Apply walls within bounds
        scenario.walls.forEach(function(w) {
            if (w[0] < cols && w[1] < rows) {
                Controller.setWalkableAt(w[0], w[1], false);
            }
        });

        // Set start/end positions
        Controller.setStartPos(startX, startY);
        Controller.setEndPos(endX, endY);
    }

    /**
     * Serialize current state to JSON string.
     */
    function serializeScenario() {
        return JSON.stringify({
            cols:      Controller.gridSize[0],
            rows:      Controller.gridSize[1],
            walls:     getWalls(),
            startX:    Controller.startX,
            startY:    Controller.startY,
            endX:      Controller.endX,
            endY:      Controller.endY,
            algorithm: Panel.getFinderName()
        }, null, 2);
    }

    /**
     * Trigger a JSON file download.
     */
    function downloadJson(text, filename) {
        var blob = new Blob([text], { type: 'application/json' }),
            url  = URL.createObjectURL(blob),
            a    = document.createElement('a');
        a.href     = url;
        a.download = filename || 'scenario.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Populate the preset dropdown.
     */
    function populatePresets() {
        var $sel = $('#scenario_preset_select'),
            names = Object.keys(PRESETS).sort();
        names.forEach(function(name) {
            $sel.append($('<option>').val(name).text(name));
        });
    }

    /**
     * Map speed slider value [1..10] to animation interval in ms.
     * Speed 1 → 500ms/op (2 ops/sec), speed 10 → 10ms/op (100 ops/sec).
     */
    function speedToOpsPerSecond(speed) {
        var s = Math.min(10, Math.max(1, speed));
        var interval = Math.round(500 * Math.pow(10 / 500, (s - 1) / 9));
        return Math.round(1000 / interval);
    }

    /**
     * Initialise — wire up all scenario-panel UI events.
     * Called from main.js after Panel.init() and Controller.init().
     */
    function init() {
        populatePresets();

        // Speed slider — update Controller.operationsPerSecond live
        $('#speed_slider').on('input', function() {
            var speed = parseInt(this.value, 10);
            $('#speed_val').text(speed);
            Controller.operationsPerSecond = speedToOpsPerSecond(speed);
        });

        // Apply grid size — rebuild grid with new dimensions
        $('#btn_apply_grid_size').on('click', function() {
            var cols = parseInt($('#grid_cols').val(), 10);
            var rows = parseInt($('#grid_rows').val(), 10);
            if (isNaN(cols) || isNaN(rows) ||
                cols < 5 || cols > 100 || rows < 5 || rows > 100 ||
                cols !== Math.floor(cols) || rows !== Math.floor(rows)) {
                alert('Grid size must be integers in [5, 100].');
                return;
            }
            Controller.gridSize = [cols, rows];
            Controller.reset();
        });

        // Load preset
        $('#btn_scenario_load_preset').on('click', function() {
            var name = $('#scenario_preset_select').val();
            if (!name) { return; }
            var preset = PRESETS[name];
            if (!preset) { return; }
            try {
                applyScenario(preset);
            } catch (e) {
                console.error('Scenario.loadPreset failed:', e);
            }
        });

        // Save scenario
        $('#btn_scenario_save').on('click', function() {
            try {
                downloadJson(serializeScenario(), 'scenario.json');
            } catch (e) {
                console.error('Scenario.save failed:', e);
            }
        });

        // Load scenario — proxy click to hidden file input
        $('#btn_scenario_load').on('click', function() {
            $('#scenario_file_input').click();
        });

        $('#scenario_file_input').on('change', function() {
            var file = this.files[0];
            if (!file) { return; }
            var reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    var scenario = JSON.parse(evt.target.result);
                    var required = ['cols','rows','walls','startX','startY','endX','endY'];
                    required.forEach(function(f) {
                        if (!Object.prototype.hasOwnProperty.call(scenario, f)) {
                            throw new Error('Missing field: ' + f);
                        }
                    });
                    applyScenario(scenario);
                } catch (e) {
                    console.error('Scenario.load failed:', e.message);
                    alert('Failed to load scenario: ' + e.message);
                }
            };
            reader.readAsText(file);
            this.value = ''; // allow re-loading same file
        });
    }

    return {
        init:    init,
        PRESETS: PRESETS,
        /* exposed for testing / integration */
        _getWalls:          getWalls,
        _serializeScenario: serializeScenario,
        _applyScenario:     applyScenario
    };

}($));
