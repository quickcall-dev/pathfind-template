var should = require('should');
var ScenarioManager = require('../src/scenario/ScenarioManager');

var SIZE = 15;

function makeEmptyScenario() {
    return {
        width: SIZE,
        height: SIZE,
        startX: 0,
        startY: 0,
        endX: SIZE - 1,
        endY: SIZE - 1,
        matrix: ScenarioManager.emptyMatrix(SIZE, SIZE)
    };
}

describe('ScenarioManager', function() {

    describe('emptyMatrix', function() {
        it('should return SIZE x SIZE matrix of zeros', function() {
            var m = ScenarioManager.emptyMatrix(SIZE, SIZE);
            m.should.have.length(SIZE);
            m[0].should.have.length(SIZE);
            m[0][0].should.equal(0);
            m[SIZE - 1][SIZE - 1].should.equal(0);
        });
    });

    describe('save', function() {
        it('should serialize scenario to JSON string', function() {
            var scenario = makeEmptyScenario();
            var json = ScenarioManager.save(scenario);
            json.should.be.a.String();
            var parsed = JSON.parse(json);
            parsed.width.should.equal(SIZE);
            parsed.height.should.equal(SIZE);
            parsed.startX.should.equal(0);
            parsed.startY.should.equal(0);
            parsed.endX.should.equal(SIZE - 1);
            parsed.endY.should.equal(SIZE - 1);
            parsed.matrix.should.have.length(SIZE);
        });

        it('should preserve wall positions', function() {
            var scenario = makeEmptyScenario();
            scenario.matrix[3][7] = 1;
            scenario.matrix[0][1] = 1;
            var parsed = JSON.parse(ScenarioManager.save(scenario));
            parsed.matrix[3][7].should.equal(1);
            parsed.matrix[0][1].should.equal(1);
            parsed.matrix[0][0].should.equal(0);
        });
    });

    describe('load', function() {
        it('should deserialize JSON string back to scenario', function() {
            var original = makeEmptyScenario();
            original.matrix[5][5] = 1;
            var json = ScenarioManager.save(original);
            var loaded = ScenarioManager.load(json);
            loaded.width.should.equal(SIZE);
            loaded.height.should.equal(SIZE);
            loaded.startX.should.equal(0);
            loaded.endY.should.equal(SIZE - 1);
            loaded.matrix[5][5].should.equal(1);
            loaded.matrix[0][0].should.equal(0);
        });

        it('should throw on invalid JSON', function() {
            (function() {
                ScenarioManager.load('not-valid-json');
            }).should.throw();
        });

        it('should throw if required fields missing', function() {
            (function() {
                ScenarioManager.load('{"width":15}');
            }).should.throw(/missing required field/i);
        });

        it('should throw if matrix dimensions mismatch', function() {
            var scenario = makeEmptyScenario();
            var obj = JSON.parse(ScenarioManager.save(scenario));
            obj.matrix = [[0, 0], [0, 0]]; // wrong size
            (function() {
                ScenarioManager.load(JSON.stringify(obj));
            }).should.throw(/matrix/i);
        });
    });

    describe('saveObject / loadObject', function() {
        it('saveObject should return plain object (not string)', function() {
            var scenario = makeEmptyScenario();
            var obj = ScenarioManager.saveObject(scenario);
            obj.should.be.an.Object().and.not.be.a.String();
            obj.width.should.equal(SIZE);
        });

        it('loadObject should accept plain object', function() {
            var scenario = makeEmptyScenario();
            scenario.matrix[2][9] = 1;
            var obj = ScenarioManager.saveObject(scenario);
            var loaded = ScenarioManager.loadObject(obj);
            loaded.matrix[2][9].should.equal(1);
        });
    });

    describe('presets', function() {
        it('should list at least 5 preset names', function() {
            var names = ScenarioManager.presetNames();
            names.should.be.an.Array();
            names.length.should.be.aboveOrEqual(5);
        });

        describe('empty preset', function() {
            var scenario;
            before(function() { scenario = ScenarioManager.loadPreset('empty'); });

            it('should be 15x15', function() {
                scenario.width.should.equal(SIZE);
                scenario.height.should.equal(SIZE);
            });

            it('should have no walls', function() {
                for (var y = 0; y < SIZE; y++) {
                    for (var x = 0; x < SIZE; x++) {
                        scenario.matrix[y][x].should.equal(0);
                    }
                }
            });

            it('should have valid start and end', function() {
                scenario.startX.should.be.within(0, SIZE - 1);
                scenario.startY.should.be.within(0, SIZE - 1);
                scenario.endX.should.be.within(0, SIZE - 1);
                scenario.endY.should.be.within(0, SIZE - 1);
            });
        });

        describe('maze preset', function() {
            var scenario;
            before(function() { scenario = ScenarioManager.loadPreset('maze'); });

            it('should be 15x15', function() {
                scenario.width.should.equal(SIZE);
                scenario.height.should.equal(SIZE);
            });

            it('should have walls (non-zero cells)', function() {
                var wallCount = 0;
                for (var y = 0; y < SIZE; y++) {
                    for (var x = 0; x < SIZE; x++) {
                        if (scenario.matrix[y][x] === 1) wallCount++;
                    }
                }
                wallCount.should.be.above(10);
            });
        });

        describe('spiral preset', function() {
            var scenario;
            before(function() { scenario = ScenarioManager.loadPreset('spiral'); });

            it('should be 15x15 with walls', function() {
                scenario.width.should.equal(SIZE);
                scenario.height.should.equal(SIZE);
                var wallCount = 0;
                for (var y = 0; y < SIZE; y++) {
                    for (var x = 0; x < SIZE; x++) {
                        if (scenario.matrix[y][x] === 1) wallCount++;
                    }
                }
                wallCount.should.be.above(5);
            });
        });

        describe('bottleneck preset', function() {
            var scenario;
            before(function() { scenario = ScenarioManager.loadPreset('bottleneck'); });

            it('should be 15x15', function() {
                scenario.width.should.equal(SIZE);
                scenario.height.should.equal(SIZE);
            });

            it('should have a narrow passage (many walls across middle)', function() {
                var wallCountMiddleRow = 0;
                var midY = Math.floor(SIZE / 2);
                for (var x = 0; x < SIZE; x++) {
                    if (scenario.matrix[midY][x] === 1) wallCountMiddleRow++;
                }
                // bottleneck: most of the middle row is walls with a gap
                wallCountMiddleRow.should.be.above(SIZE / 2);
            });
        });

        describe('random preset', function() {
            var scenario;
            before(function() { scenario = ScenarioManager.loadPreset('random'); });

            it('should be 15x15', function() {
                scenario.width.should.equal(SIZE);
                scenario.height.should.equal(SIZE);
            });

            it('should have some walls', function() {
                var wallCount = 0;
                for (var y = 0; y < SIZE; y++) {
                    for (var x = 0; x < SIZE; x++) {
                        if (scenario.matrix[y][x] === 1) wallCount++;
                    }
                }
                wallCount.should.be.above(0);
            });

            it('start and end cells should always be walkable', function() {
                scenario.matrix[scenario.startY][scenario.startX].should.equal(0);
                scenario.matrix[scenario.endY][scenario.endX].should.equal(0);
            });
        });

        it('should throw on unknown preset name', function() {
            (function() {
                ScenarioManager.loadPreset('does-not-exist');
            }).should.throw(/unknown preset/i);
        });
    });

    describe('round-trip', function() {
        it('each preset should survive save/load round-trip', function() {
            ScenarioManager.presetNames().forEach(function(name) {
                var original = ScenarioManager.loadPreset(name);
                var json = ScenarioManager.save(original);
                var loaded = ScenarioManager.load(json);
                loaded.width.should.equal(original.width);
                loaded.height.should.equal(original.height);
                loaded.matrix[0][0].should.equal(original.matrix[0][0]);
                loaded.matrix[SIZE - 1][SIZE - 1].should.equal(original.matrix[SIZE - 1][SIZE - 1]);
            });
        });
    });

});
