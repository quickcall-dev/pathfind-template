#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var PF = require('/home/sagar/template-repo');

var maps = {
    sparse: {
        width: 15,
        height: 15,
        start: [0, 0],
        end: [14, 14],
        walls: [[2,1],[2,2],[2,3],[2,4],[4,3],[4,4],[4,5],[4,6],[6,1],[6,2],[6,3],[8,5],[8,6],[8,7],[8,8],[10,2],[10,3],[10,4],[12,6],[12,7],[12,8],[12,9]]
    },
    spiral: {
        width: 15,
        height: 15,
        start: [0, 0],
        end: [7, 7],
        walls: [[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],[11,2],[12,2],[13,2],[13,3],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[13,4],[1,5],[11,5],[13,5],[1,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[11,6],[13,6],[1,7],[3,7],[9,7],[11,7],[13,7],[1,8],[3,8],[5,8],[9,8],[11,8],[13,8],[1,9],[3,9],[5,9],[6,9],[7,9],[8,9],[9,9],[11,9],[13,9],[1,10],[3,10],[11,10],[13,10],[1,11],[3,11],[4,11],[5,11],[6,11],[7,11],[8,11],[9,11],[10,11],[11,11],[13,11],[1,12],[13,12],[1,13],[2,13],[3,13],[4,13],[5,13],[6,13],[7,13],[8,13],[9,13],[10,13],[11,13],[12,13],[13,13]]
    }
};

function buildMatrix(mapDef) {
    var x;
    var y;
    var matrix = [];

    for (y = 0; y < mapDef.height; y += 1) {
        matrix[y] = [];
        for (x = 0; x < mapDef.width; x += 1) {
            matrix[y][x] = 0;
        }
    }

    mapDef.walls.forEach(function(wall) {
        matrix[wall[1]][wall[0]] = 1;
    });

    return matrix;
}

function countExploredNodes(grid) {
    var explored = 0;

    grid.nodes.forEach(function(row) {
        row.forEach(function(node) {
            if (node.closed) {
                explored += 1;
            }
        });
    });

    return explored;
}

function runSingle(mapKey) {
    var mapDef = maps[mapKey];
    var matrix = buildMatrix(mapDef);
    var grid = new PF.Grid(matrix);
    var finder = new PF.AStarFinder();
    var start = mapDef.start;
    var end = mapDef.end;
    var foundPath = finder.findPath(start[0], start[1], end[0], end[1], grid);

    return {
        map: mapKey,
        path: foundPath,
        nodesExplored: countExploredNodes(grid),
        pathLength: PF.Util.pathLength(foundPath)
    };
}

function benchmarkMap(mapKey, runs) {
    var i;
    var startTime;
    var elapsedNs;
    var totalNs = 0;
    var lastRun = null;

    for (i = 0; i < runs; i += 1) {
        startTime = process.hrtime.bigint();
        lastRun = runSingle(mapKey);
        elapsedNs = process.hrtime.bigint() - startTime;
        totalNs += Number(elapsedNs);
    }

    return {
        map: mapKey,
        nodesExplored: lastRun.nodesExplored,
        pathLength: lastRun.pathLength,
        avgTimeMs: totalNs / runs / 1000000,
        runs: runs
    };
}

function runAllBenchmarks(runs) {
    return {
        sparse: benchmarkMap('sparse', runs),
        spiral: benchmarkMap('spiral', runs)
    };
}

function renderResultsMarkdown(results) {
    function fmt(num) {
        return Number(num).toFixed(6);
    }

    return [
        '# A* Benchmark Results',
        '',
        'Runs per map: ' + results.sparse.runs,
        '',
        '## Map 1: Sparse',
        '- Nodes explored: ' + results.sparse.nodesExplored,
        '- Path length: ' + results.sparse.pathLength,
        '- Avg time (ms): ' + fmt(results.sparse.avgTimeMs),
        '',
        '## Map 2: Spiral',
        '- Nodes explored: ' + results.spiral.nodesExplored,
        '- Path length: ' + results.spiral.pathLength,
        '- Avg time (ms): ' + fmt(results.spiral.avgTimeMs),
        ''
    ].join('\n');
}

function writeResultsFile(outFile, runs) {
    var results = runAllBenchmarks(runs);
    var markdown = renderResultsMarkdown(results);
    fs.writeFileSync(outFile, markdown);
    return {
        outFile: outFile,
        results: results
    };
}

if (require.main === module) {
    writeResultsFile(
        path.join(__dirname, 'results.md'),
        1000
    );
}

module.exports = {
    maps: maps,
    buildMatrix: buildMatrix,
    runSingle: runSingle,
    benchmarkMap: benchmarkMap,
    runAllBenchmarks: runAllBenchmarks,
    renderResultsMarkdown: renderResultsMarkdown,
    writeResultsFile: writeResultsFile
};
