'use strict';
var should = require('should');
var ScenarioControls = require('../src/scenario/ScenarioControls');

describe('ScenarioControls', function() {

    describe('ALGORITHMS', function() {
        it('should be a non-empty array', function() {
            ScenarioControls.ALGORITHMS.should.be.an.Array();
            ScenarioControls.ALGORITHMS.length.should.be.above(0);
        });

        it('should include AStarFinder', function() {
            ScenarioControls.ALGORITHMS.map(function(a) { return a.id; })
                .should.containEql('AStarFinder');
        });

        it('each entry should have id and label', function() {
            ScenarioControls.ALGORITHMS.forEach(function(algo) {
                algo.should.have.property('id');
                algo.should.have.property('label');
                algo.id.should.be.a.String();
                algo.label.should.be.a.String();
            });
        });
    });

    describe('PRESETS', function() {
        it('should be an object with at least one preset', function() {
            ScenarioControls.PRESETS.should.be.an.Object();
            Object.keys(ScenarioControls.PRESETS).length.should.be.above(0);
        });

        it('each preset should have cols, rows, walls, startX, startY, endX, endY', function() {
            Object.keys(ScenarioControls.PRESETS).forEach(function(name) {
                var p = ScenarioControls.PRESETS[name];
                p.should.have.property('cols');
                p.should.have.property('rows');
                p.should.have.property('walls');
                p.should.have.property('startX');
                p.should.have.property('startY');
                p.should.have.property('endX');
                p.should.have.property('endY');
                p.walls.should.be.an.Array();
            });
        });
    });

    describe('DEFAULT_GRID_SIZE', function() {
        it('should default to 15x15', function() {
            ScenarioControls.DEFAULT_GRID_SIZE.cols.should.equal(15);
            ScenarioControls.DEFAULT_GRID_SIZE.rows.should.equal(15);
        });
    });

    describe('validateGridSize', function() {
        it('should accept valid sizes', function() {
            ScenarioControls.validateGridSize(10, 10).should.be.true();
            ScenarioControls.validateGridSize(15, 15).should.be.true();
            ScenarioControls.validateGridSize(50, 50).should.be.true();
        });

        it('should reject cols or rows below 5', function() {
            ScenarioControls.validateGridSize(4, 10).should.be.false();
            ScenarioControls.validateGridSize(10, 4).should.be.false();
            ScenarioControls.validateGridSize(0, 0).should.be.false();
        });

        it('should reject cols or rows above 100', function() {
            ScenarioControls.validateGridSize(101, 15).should.be.false();
            ScenarioControls.validateGridSize(15, 101).should.be.false();
        });

        it('should reject non-integer values', function() {
            ScenarioControls.validateGridSize(10.5, 10).should.be.false();
            ScenarioControls.validateGridSize(10, 'abc').should.be.false();
        });
    });

    describe('getAnimationInterval', function() {
        it('should return a positive number in ms', function() {
            ScenarioControls.getAnimationInterval(1).should.be.above(0);
            ScenarioControls.getAnimationInterval(10).should.be.above(0);
        });

        it('higher speed value should produce smaller interval', function() {
            var slow = ScenarioControls.getAnimationInterval(1);
            var fast = ScenarioControls.getAnimationInterval(10);
            fast.should.be.below(slow);
        });

        it('should clamp out-of-range values', function() {
            var atOne  = ScenarioControls.getAnimationInterval(1);
            var atTen  = ScenarioControls.getAnimationInterval(10);
            ScenarioControls.getAnimationInterval(0).should.equal(atOne);
            ScenarioControls.getAnimationInterval(11).should.equal(atTen);
        });
    });

    describe('getOperationsPerSecond', function() {
        it('should return a positive integer', function() {
            var ops = ScenarioControls.getOperationsPerSecond(5);
            ops.should.be.above(0);
            ops.should.equal(Math.round(ops));
        });

        it('higher speed should produce more operations per second', function() {
            var slow = ScenarioControls.getOperationsPerSecond(1);
            var fast = ScenarioControls.getOperationsPerSecond(10);
            fast.should.be.above(slow);
        });

        it('should be inverse of getAnimationInterval', function() {
            [1, 5, 10].forEach(function(speed) {
                var interval = ScenarioControls.getAnimationInterval(speed);
                var ops      = ScenarioControls.getOperationsPerSecond(speed);
                ops.should.equal(Math.round(1000 / interval));
            });
        });

        it('should clamp out-of-range values', function() {
            ScenarioControls.getOperationsPerSecond(0).should.equal(
                ScenarioControls.getOperationsPerSecond(1));
            ScenarioControls.getOperationsPerSecond(11).should.equal(
                ScenarioControls.getOperationsPerSecond(10));
        });
    });

    describe('serializeScenario', function() {
        it('should return a JSON string', function() {
            var json = ScenarioControls.serializeScenario({
                cols: 15,
                rows: 15,
                walls: [[2, 3], [4, 5]],
                startX: 0,
                startY: 0,
                endX: 14,
                endY: 14,
                algorithm: 'AStarFinder'
            });
            json.should.be.a.String();
            (function() { JSON.parse(json); }).should.not.throw();
        });

        it('should include all required fields', function() {
            var json = ScenarioControls.serializeScenario({
                cols: 10,
                rows: 10,
                walls: [],
                startX: 1,
                startY: 1,
                endX: 8,
                endY: 8,
                algorithm: 'DijkstraFinder'
            });
            var obj = JSON.parse(json);
            obj.should.have.property('cols', 10);
            obj.should.have.property('rows', 10);
            obj.should.have.property('walls');
            obj.should.have.property('startX', 1);
            obj.should.have.property('startY', 1);
            obj.should.have.property('endX', 8);
            obj.should.have.property('endY', 8);
            obj.should.have.property('algorithm', 'DijkstraFinder');
        });

        it('should serialize walls as array of [x,y] pairs', function() {
            var walls = [[1, 2], [3, 4]];
            var json = ScenarioControls.serializeScenario({
                cols: 10, rows: 10, walls: walls,
                startX: 0, startY: 0, endX: 9, endY: 9,
                algorithm: 'AStarFinder'
            });
            JSON.parse(json).walls.should.eql(walls);
        });
    });

    describe('deserializeScenario', function() {
        it('should parse valid JSON string', function() {
            var input = JSON.stringify({
                cols: 10,
                rows: 10,
                walls: [[2, 2]],
                startX: 0,
                startY: 0,
                endX: 9,
                endY: 9,
                algorithm: 'BreadthFirstFinder'
            });
            var result = ScenarioControls.deserializeScenario(input);
            result.cols.should.equal(10);
            result.rows.should.equal(10);
            result.walls.should.eql([[2, 2]]);
            result.algorithm.should.equal('BreadthFirstFinder');
        });

        it('should parse JSON object directly', function() {
            var input = { cols: 5, rows: 5, walls: [], startX: 0, startY: 0, endX: 4, endY: 4, algorithm: 'DijkstraFinder' };
            var result = ScenarioControls.deserializeScenario(input);
            result.cols.should.equal(5);
        });

        it('should throw on invalid JSON string', function() {
            (function() {
                ScenarioControls.deserializeScenario('{bad json}');
            }).should.throw();
        });

        it('should throw when required fields missing', function() {
            (function() {
                ScenarioControls.deserializeScenario(JSON.stringify({ cols: 10 }));
            }).should.throw();
        });
    });

    describe('getPresetNames', function() {
        it('should return array of preset name strings', function() {
            var names = ScenarioControls.getPresetNames();
            names.should.be.an.Array();
            names.length.should.be.above(0);
            names.forEach(function(n) { n.should.be.a.String(); });
        });
    });

    describe('loadPreset', function() {
        it('should return preset data for valid name', function() {
            var name = ScenarioControls.getPresetNames()[0];
            var preset = ScenarioControls.loadPreset(name);
            preset.should.have.property('cols');
            preset.should.have.property('rows');
            preset.should.have.property('walls');
        });

        it('should throw for unknown preset name', function() {
            (function() {
                ScenarioControls.loadPreset('__nonexistent__');
            }).should.throw();
        });
    });
});
