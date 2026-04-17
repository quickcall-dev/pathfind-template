/**
 * Scorer: browser-side scoring and comparison system.
 * Captures metrics, renders score cards, and manages a comparison drawer.
 * Uses localStorage for persistence across page loads.
 */
var Scorer = (function() {
    var STORAGE_KEY = 'pf_runs';
    var _idCounter  = 0;

    // --- Storage helpers ---

    function _loadFromStorage() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function _saveToStorage(runs) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
        } catch (e) {}
    }

    // --- Core API ---

    /**
     * Capture a run record from Controller state.
     * @param {string} algorithm     - finder name
     * @param {Object} grid          - PF.Grid instance (to extract walls)
     * @param {Array}  path          - [[x,y],...] result from finder
     * @param {number} timeMs        - elapsed time string or number
     * @param {number} nodesExplored - Controller.operationCount
     * @returns {Object} run record
     */
    function capture(algorithm, grid, path, timeMs, nodesExplored) {
        _idCounter += 1;
        var walls = [];
        if (grid && grid.nodes) {
            for (var y = 0; y < grid.height; y++) {
                for (var x = 0; x < grid.width; x++) {
                    if (!grid.nodes[y][x].walkable) {
                        walls.push([x, y]);
                    }
                }
            }
        }
        return {
            id:        Date.now() + '_' + _idCounter,
            algorithm: algorithm,
            timestamp: Date.now(),
            map: {
                width:  grid ? grid.width  : 0,
                height: grid ? grid.height : 0,
                walls:  walls
            },
            metrics: {
                nodesExplored: nodesExplored,
                pathLength:    path.length > 1 ? path.length - 1 : 0,
                timeMs:        parseFloat(timeMs)
            }
        };
    }

    function save(run) {
        var runs = _loadFromStorage();
        runs.push(run);
        _saveToStorage(runs);
    }

    function load() {
        return _loadFromStorage();
    }

    function clear() {
        _saveToStorage([]);
    }

    function compare() {
        return _loadFromStorage().map(function(run) {
            return {
                algorithm: run.algorithm,
                timestamp: run.timestamp,
                metrics:   run.metrics
            };
        });
    }

    function scoreCard(run) {
        return {
            algorithm:     run.algorithm,
            timestamp:     run.timestamp,
            metrics:       run.metrics,
            formattedTime: parseFloat(run.metrics.timeMs).toFixed(4) + ' ms'
        };
    }

    // --- UI rendering ---

    function _formatDate(ts) {
        var d = new Date(ts);
        return d.toLocaleTimeString();
    }

    function _renderCard(run) {
        var card = scoreCard(run);
        var $el = $('<div class="score-card">');
        $el.append(
            '<div class="score-card-header">' + card.algorithm + '</div>' +
            '<table class="score-card-table">' +
              '<tr><td>Nodes explored</td><td class="score-val">' + card.metrics.nodesExplored + '</td></tr>' +
              '<tr><td>Path length</td><td class="score-val">' + card.metrics.pathLength + '</td></tr>' +
              '<tr><td>Time</td><td class="score-val">' + card.formattedTime + '</td></tr>' +
              '<tr><td>Saved at</td><td class="score-val">' + _formatDate(card.timestamp) + '</td></tr>' +
            '</table>'
        );
        return $el;
    }

    /** Show the score card panel after a run completes. */
    function showScoreCard(run) {
        var $panel = $('#score_panel');
        // Remove only previous card content, keep header with buttons intact
        $panel.find('.score-card').remove();
        // If header got destroyed (first render), rebuild it
        if ($panel.find('.score-panel-header').length === 0) {
            $panel.prepend(
                '<div class="score-panel-header">' +
                    '<span class="header_title">Run Results</span>' +
                    '<button id="save_run" class="score-action-btn">Save Run</button>' +
                    '<button id="compare_runs" class="score-action-btn">Compare</button>' +
                '</div>'
            );
        }
        $panel.append(_renderCard(run)).show();
    }

    /** Open the comparison drawer with all saved runs. */
    function showComparisonDrawer() {
        var runs   = load();
        var $drawer = $('#comparison_drawer');
        $drawer.empty();

        var $header = $('<div class="drawer-header">' +
            '<span>Saved Runs (' + runs.length + ')</span>' +
            '<button id="close_comparison">&#x2715;</button>' +
            '<button id="clear_runs">Clear All</button>' +
        '</div>');
        $drawer.append($header);

        if (runs.length === 0) {
            $drawer.append('<p class="drawer-empty">No saved runs yet.</p>');
        } else {
            var $cards = $('<div class="drawer-cards">');
            runs.forEach(function(run) {
                $cards.append(_renderCard(run));
            });
            $drawer.append($cards);
        }

        $drawer.show();

        $('#close_comparison').off('click').on('click', hideComparisonDrawer);
        $('#clear_runs').off('click').on('click', function() {
            clear();
            showComparisonDrawer();
        });
    }

    /** Close the comparison drawer. */
    function hideComparisonDrawer() {
        $('#comparison_drawer').hide();
    }

    return {
        capture:              capture,
        save:                 save,
        load:                 load,
        clear:                clear,
        compare:              compare,
        scoreCard:            scoreCard,
        showScoreCard:        showScoreCard,
        showComparisonDrawer: showComparisonDrawer,
        hideComparisonDrawer: hideComparisonDrawer
    };
})();
