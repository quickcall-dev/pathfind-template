var path = require('path');

var benchmarkModulePath = '/home/sagar/template-repo/docs/experiments/001-demo-artifacts/fleets/fleet-03-algorithm-race/workers/racer-astar/output/astar-benchmark.js';
var bench = require(benchmarkModulePath);

describe('Racer A* benchmark artifacts', function() {
    it('uses the exact Sparse map walls and endpoints', function() {
        var sparse = bench.maps.sparse;

        sparse.width.should.equal(15);
        sparse.height.should.equal(15);
        sparse.start.should.eql([0, 0]);
        sparse.end.should.eql([14, 14]);
        sparse.walls.should.eql([[2,1],[2,2],[2,3],[2,4],[4,3],[4,4],[4,5],[4,6],[6,1],[6,2],[6,3],[8,5],[8,6],[8,7],[8,8],[10,2],[10,3],[10,4],[12,6],[12,7],[12,8],[12,9]]);
    });

    it('uses the exact Spiral map walls and endpoints', function() {
        var spiral = bench.maps.spiral;

        spiral.width.should.equal(15);
        spiral.height.should.equal(15);
        spiral.start.should.eql([0, 0]);
        spiral.end.should.eql([7, 7]);
        spiral.walls.should.eql([[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],[11,2],[12,2],[13,2],[13,3],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[13,4],[1,5],[11,5],[13,5],[1,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[11,6],[13,6],[1,7],[3,7],[9,7],[11,7],[13,7],[1,8],[3,8],[5,8],[9,8],[11,8],[13,8],[1,9],[3,9],[5,9],[6,9],[7,9],[8,9],[9,9],[11,9],[13,9],[1,10],[3,10],[11,10],[13,10],[1,11],[3,11],[4,11],[5,11],[6,11],[7,11],[8,11],[9,11],[10,11],[11,11],[13,11],[1,12],[13,12],[1,13],[2,13],[3,13],[4,13],[5,13],[6,13],[7,13],[8,13],[9,13],[10,13],[11,13],[12,13],[13,13]]);
    });

    it('collects required metrics for both maps over 1000 runs', function() {
        var summary = bench.runAllBenchmarks(1000);

        summary.should.have.properties('sparse', 'spiral');

        ['sparse', 'spiral'].forEach(function(key) {
            var result = summary[key];
            result.should.have.properties('map', 'nodesExplored', 'pathLength', 'avgTimeMs', 'runs');
            result.map.should.equal(key);
            result.runs.should.equal(1000);
            result.nodesExplored.should.be.a.Number();
            result.nodesExplored.should.be.above(0);
            result.pathLength.should.be.a.Number();
            result.pathLength.should.be.above(0);
            result.avgTimeMs.should.be.a.Number();
            result.avgTimeMs.should.be.aboveOrEqual(0);
        });
    });

    it('can render markdown output with both map labels', function() {
        var summary = bench.runAllBenchmarks(5);
        var markdown = bench.renderResultsMarkdown(summary);

        markdown.should.match(/Map 1: Sparse/);
        markdown.should.match(/Map 2: Spiral/);
        markdown.should.match(/nodes explored/i);
        markdown.should.match(/path length/i);
        markdown.should.match(/avg time/i);
    });
});
