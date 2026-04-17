var RunStore = require('../src/core/RunStore');

describe('RunStore', function() {
    var store;

    beforeEach(function() {
        store = new RunStore();
    });

    describe('capture', function() {
        it('should return a run record with correct algorithm', function() {
            var run = store.capture('AStarFinder', {width:5,height:5,walls:[]}, [[0,0],[1,0],[2,0]], 12.5, 10);
            run.algorithm.should.equal('AStarFinder');
        });

        it('should record nodesExplored in metrics', function() {
            var run = store.capture('AStarFinder', {width:5,height:5,walls:[]}, [[0,0],[1,0]], 12.5, 10);
            run.metrics.nodesExplored.should.equal(10);
        });

        it('should record timeMs in metrics', function() {
            var run = store.capture('AStarFinder', {width:5,height:5,walls:[]}, [[0,0],[1,0]], 12.5, 10);
            run.metrics.timeMs.should.equal(12.5);
        });

        it('path length is number of steps (nodes minus 1)', function() {
            var run = store.capture('AStarFinder', {width:5,height:5,walls:[]}, [[0,0],[1,0],[2,0],[3,0]], 5.0, 10);
            run.metrics.pathLength.should.equal(3);
        });

        it('empty path has length 0', function() {
            var run = store.capture('AStarFinder', {width:5,height:5,walls:[]}, [], 5.0, 0);
            run.metrics.pathLength.should.equal(0);
        });

        it('single-node path has length 0', function() {
            var run = store.capture('AStarFinder', {width:5,height:5,walls:[]}, [[0,0]], 1.0, 1);
            run.metrics.pathLength.should.equal(0);
        });

        it('should include timestamp', function() {
            var before = Date.now();
            var run = store.capture('AStarFinder', {width:5,height:5,walls:[]}, [], 1.0, 0);
            var after = Date.now();
            run.timestamp.should.be.within(before, after);
        });

        it('should store map walls', function() {
            var walls = [[1,0],[2,0]];
            var run = store.capture('AStarFinder', {width:5,height:5,walls:walls}, [[0,0]], 1.0, 1);
            run.map.walls.should.eql(walls);
        });

        it('should store map dimensions', function() {
            var run = store.capture('AStarFinder', {width:10,height:8,walls:[]}, [], 1.0, 0);
            run.map.width.should.equal(10);
            run.map.height.should.equal(8);
        });

        it('should assign a unique id', function() {
            var r1 = store.capture('AStarFinder', {width:5,height:5,walls:[]}, [], 1.0, 0);
            var r2 = store.capture('AStarFinder', {width:5,height:5,walls:[]}, [], 1.0, 0);
            r1.id.should.not.equal(r2.id);
        });
    });

    describe('save and load', function() {
        it('should load empty array when no runs saved', function() {
            store.load().should.eql([]);
        });

        it('should save a run and retrieve it', function() {
            var run = store.capture('DijkstraFinder', {width:3,height:3,walls:[]}, [[0,0],[1,0]], 5.0, 8);
            store.save(run);
            var runs = store.load();
            runs.length.should.equal(1);
            runs[0].algorithm.should.equal('DijkstraFinder');
        });

        it('should accumulate multiple runs in order', function() {
            var r1 = store.capture('AStarFinder', {width:5,height:5,walls:[]}, [[0,0],[1,0]], 3.0, 5);
            var r2 = store.capture('DijkstraFinder', {width:5,height:5,walls:[]}, [[0,0],[1,0],[2,0]], 8.0, 12);
            store.save(r1);
            store.save(r2);
            var runs = store.load();
            runs.length.should.equal(2);
            runs[0].algorithm.should.equal('AStarFinder');
            runs[1].algorithm.should.equal('DijkstraFinder');
        });

        it('load should return a copy, not the internal array', function() {
            store.save(store.capture('AStarFinder', {width:5,height:5,walls:[]}, [], 1.0, 0));
            var runs = store.load();
            runs.pop();
            store.load().length.should.equal(1);
        });
    });

    describe('clear', function() {
        it('should remove all saved runs', function() {
            store.save(store.capture('AStarFinder', {width:5,height:5,walls:[]}, [], 1.0, 1));
            store.save(store.capture('DijkstraFinder', {width:5,height:5,walls:[]}, [], 1.0, 1));
            store.clear();
            store.load().length.should.equal(0);
        });

        it('clear on empty store should be a no-op', function() {
            store.clear();
            store.load().should.eql([]);
        });
    });

    describe('compare', function() {
        it('should return empty array when no runs saved', function() {
            store.compare().should.eql([]);
        });

        it('should return one entry per saved run', function() {
            store.save(store.capture('AStarFinder', {width:5,height:5,walls:[]}, [[0,0],[1,0]], 3.0, 5));
            store.save(store.capture('DijkstraFinder', {width:5,height:5,walls:[]}, [[0,0],[1,0],[2,0]], 8.0, 12));
            store.compare().length.should.equal(2);
        });

        it('each entry has algorithm and metrics', function() {
            store.save(store.capture('BreadthFirstFinder', {width:5,height:5,walls:[]}, [[0,0],[1,0]], 6.0, 7));
            var cmp = store.compare();
            cmp[0].should.have.property('algorithm');
            cmp[0].should.have.property('metrics');
            cmp[0].algorithm.should.equal('BreadthFirstFinder');
        });

        it('each entry has timestamp', function() {
            store.save(store.capture('AStarFinder', {width:5,height:5,walls:[]}, [], 1.0, 0));
            var cmp = store.compare();
            cmp[0].should.have.property('timestamp');
        });

        it('metrics include nodesExplored, pathLength, timeMs', function() {
            store.save(store.capture('AStarFinder', {width:5,height:5,walls:[]}, [[0,0],[1,0],[2,0]], 4.2, 9));
            var m = store.compare()[0].metrics;
            m.should.have.property('nodesExplored');
            m.should.have.property('pathLength');
            m.should.have.property('timeMs');
            m.nodesExplored.should.equal(9);
            m.pathLength.should.equal(2);
            m.timeMs.should.equal(4.2);
        });
    });

    describe('scoreCard', function() {
        it('should return formatted score card data for a run', function() {
            var run = store.capture('AStarFinder', {width:5,height:5,walls:[]}, [[0,0],[1,0],[2,0]], 7.3, 15);
            var card = store.scoreCard(run);
            card.algorithm.should.equal('AStarFinder');
            card.metrics.nodesExplored.should.equal(15);
            card.metrics.pathLength.should.equal(2);
            card.metrics.timeMs.should.equal(7.3);
            card.should.have.property('timestamp');
        });

        it('should include formatted time string', function() {
            var run = store.capture('AStarFinder', {width:5,height:5,walls:[]}, [], 7.3456, 5);
            var card = store.scoreCard(run);
            card.formattedTime.should.match(/ms$/);
        });

        it('should handle string timeMs without throwing', function() {
            var run = store.capture('AStarFinder', {width:5,height:5,walls:[]}, [], '12.5000', 3);
            var card = store.scoreCard(run);
            card.formattedTime.should.equal('12.5000 ms');
        });

        it('formattedTime has 4 decimal places', function() {
            var run = store.capture('AStarFinder', {width:5,height:5,walls:[]}, [], 3.1, 2);
            var card = store.scoreCard(run);
            card.formattedTime.should.equal('3.1000 ms');
        });
    });

    describe('custom storage backend', function() {
        it('should use injected storage for save and load', function() {
            var saved = [];
            var customStorage = {
                save:  function(run) { saved.push(run); },
                load:  function()    { return saved.slice(); },
                clear: function()    { saved = []; }
            };
            var customStore = new RunStore(customStorage);
            var run = customStore.capture('DijkstraFinder', {width:3,height:3,walls:[]}, [[0,0],[1,0]], 5.0, 4);
            customStore.save(run);
            saved.length.should.equal(1);
            customStore.load().length.should.equal(1);
        });

        it('should use injected storage for clear', function() {
            var saved = [];
            var customStorage = {
                save:  function(run) { saved.push(run); },
                load:  function()    { return saved.slice(); },
                clear: function()    { saved = []; }
            };
            var customStore = new RunStore(customStorage);
            customStore.save(customStore.capture('AStarFinder', {width:3,height:3,walls:[]}, [], 1.0, 1));
            customStore.clear();
            customStore.load().length.should.equal(0);
        });
    });
});
