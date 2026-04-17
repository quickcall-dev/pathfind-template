var fs = require('fs');
var path = require('path');
var PF = require('..');

var OUTPUT_DIR = '/home/sagar/template-repo/docs/experiments/001-demo-artifacts/fleets/fleet-03-algorithm-race/workers/racer-dijkstra/output';
var RESULTS_MD = path.join(OUTPUT_DIR, 'results.md');
var RESULTS_JSON = path.join(OUTPUT_DIR, 'results.json');

var MAPS = {
    sparse: {
        name: 'Map 1: Sparse',
        width: 15,
        height: 15,
        start: [0, 0],
        end: [14, 14],
        walls: [[2,1],[2,2],[2,3],[2,4],[4,3],[4,4],[4,5],[4,6],[6,1],[6,2],[6,3],[8,5],[8,6],[8,7],[8,8],[10,2],[10,3],[10,4],[12,6],[12,7],[12,8],[12,9]]
    },
    spiral: {
        name: 'Map 2: Spiral',
        width: 15,
        height: 15,
        start: [0, 0],
        end: [7, 7],
        walls: [[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],[11,2],[12,2],[13,2],[13,3],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[13,4],[1,5],[11,5],[13,5],[1,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[11,6],[13,6],[1,7],[3,7],[9,7],[11,7],[13,7],[1,8],[3,8],[5,8],[9,8],[11,8],[13,8],[1,9],[3,9],[5,9],[6,9],[7,9],[8,9],[9,9],[11,9],[13,9],[1,10],[3,10],[11,10],[13,10],[1,11],[3,11],[4,11],[5,11],[6,11],[7,11],[8,11],[9,11],[10,11],[11,11],[13,11],[1,12],[13,12],[1,13],[2,13],[3,13],[4,13],[5,13],[6,13],[7,13],[8,13],[9,13],[10,13],[11,13],[12,13],[13,13]]
    }
};

function buildGrid(mapDef) {
    var grid = new PF.Grid(mapDef.width, mapDef.height);
    mapDef.walls.forEach(function(wall) {
        grid.setWalkableAt(wall[0], wall[1], false);
    });
    return grid;
}

function countExplored(grid) {
    var explored = 0;
    var y;
    var x;
    for (y = 0; y < grid.height; y++) {
        for (x = 0; x < grid.width; x++) {
            if (grid.nodes[y][x].closed) {
                explored += 1;
            }
        }
    }
    return explored;
}

function runSingle(mapDef) {
    var grid = buildGrid(mapDef);
    var finder = new PF.DijkstraFinder();
    var start = mapDef.start;
    var end = mapDef.end;
    var pathResult = finder.findPath(start[0], start[1], end[0], end[1], grid);

    return {
        path: pathResult,
        pathLength: pathResult.length > 0 ? pathResult.length - 1 : 0,
        nodesExplored: countExplored(grid)
    };
}

function measureAvgTime(mapDef, runs) {
    var i;
    var start;
    var diff;
    var elapsedNs = 0;

    for (i = 0; i < runs; i++) {
        start = process.hrtime();
        runSingle(mapDef);
        diff = process.hrtime(start);
        elapsedNs += diff[0] * 1e9 + diff[1];
    }

    return (elapsedNs / runs) / 1e6;
}

function benchmarkMap(mapDef, runs) {
    var sample = runSingle(mapDef);
    var avgTimeMs = measureAvgTime(mapDef, runs);

    return {
        name: mapDef.name,
        start: mapDef.start,
        end: mapDef.end,
        walls: mapDef.walls,
        nodesExplored: sample.nodesExplored,
        pathLength: sample.pathLength,
        avgTimeMs: avgTimeMs
    };
}

function benchmarkAll(runs) {
    var n = runs || 1000;
    return {
        sparse: benchmarkMap(MAPS.sparse, n),
        spiral: benchmarkMap(MAPS.spiral, n),
        runs: n
    };
}

function toMarkdown(results) {
    function lineFor(mapResult) {
        return [
            '| ' + mapResult.name + ' | ' + mapResult.nodesExplored + ' | ' + mapResult.pathLength + ' | ' + mapResult.avgTimeMs.toFixed(6) + ' |'
        ].join('\n');
    }

    return [
        '# Dijkstra Benchmark Results',
        '',
        '- Algorithm: `DijkstraFinder`',
        '- Runs per map: `' + results.runs + '`',
        '',
        '| Map | Nodes Explored | Path Length | Avg Time (ms, 1000 runs) |',
        '| --- | ---: | ---: | ---: |',
        lineFor(results.sparse),
        lineFor(results.spiral),
        ''
    ].join('\n');
}

function writeResults(results, outDir) {
    var dir = outDir || OUTPUT_DIR;
    var mdPath = path.join(dir, 'results.md');
    var jsonPath = path.join(dir, 'results.json');

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(mdPath, toMarkdown(results));
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));

    return {
        mdPath: mdPath,
        jsonPath: jsonPath
    };
}

if (require.main === module) {
    var results = benchmarkAll(1000);
    writeResults(results, OUTPUT_DIR);
    process.stdout.write('Wrote: ' + RESULTS_MD + '\n');
    process.stdout.write('Wrote: ' + RESULTS_JSON + '\n');
}

module.exports = {
    MAPS: MAPS,
    OUTPUT_DIR: OUTPUT_DIR,
    RESULTS_MD: RESULTS_MD,
    RESULTS_JSON: RESULTS_JSON,
    runSingle: runSingle,
    benchmarkAll: benchmarkAll,
    toMarkdown: toMarkdown,
    writeResults: writeResults
};
