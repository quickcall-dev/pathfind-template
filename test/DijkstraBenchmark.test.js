var should = require('should');
var race = require('../benchmark/dijkstra_race');

describe('Dijkstra benchmark race', function() {
    it('uses exact sparse map layout and produces a path to target', function() {
        var map = race.MAPS.sparse;
        var result = race.runSingle(map);

        result.path[0].should.eql([0, 0]);
        result.path[result.path.length - 1].should.eql([14, 14]);
        result.pathLength.should.equal(result.path.length - 1);
        result.nodesExplored.should.be.above(0);
    });

    it('uses exact spiral map layout and reaches the center target', function() {
        var map = race.MAPS.spiral;
        var result = race.runSingle(map);

        result.path[0].should.eql([0, 0]);
        result.path[result.path.length - 1].should.eql([7, 7]);
        result.pathLength.should.equal(result.path.length - 1);
        result.nodesExplored.should.be.above(0);
    });

    it('benchmarks both maps over N runs and returns avg time', function() {
        var summary = race.benchmarkAll(20);

        summary.should.have.property('sparse');
        summary.should.have.property('spiral');
        summary.sparse.should.have.property('avgTimeMs');
        summary.spiral.should.have.property('avgTimeMs');
        summary.sparse.avgTimeMs.should.be.a.Number();
        summary.spiral.avgTimeMs.should.be.a.Number();
    });
});
