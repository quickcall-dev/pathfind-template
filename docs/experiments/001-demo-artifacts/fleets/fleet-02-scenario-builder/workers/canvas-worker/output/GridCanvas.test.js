'use strict';

var should = require('should');
var GridCanvas = require('./GridCanvas');

describe('GridCanvas', function() {

    describe('initialization', function() {
        it('should create a 15x15 grid by default', function() {
            var gc = new GridCanvas();
            gc.width.should.equal(15);
            gc.height.should.equal(15);
        });

        it('should accept custom dimensions', function() {
            var gc = new GridCanvas(10, 8);
            gc.width.should.equal(10);
            gc.height.should.equal(8);
        });

        it('should initialize all cells as empty', function() {
            var gc = new GridCanvas();
            for (var y = 0; y < 15; y++) {
                for (var x = 0; x < 15; x++) {
                    gc.getCellType(x, y).should.equal('empty');
                }
            }
        });

        it('should have no start or end points initially', function() {
            var gc = new GridCanvas();
            should(gc.getStart()).be.null();
            should(gc.getEnd()).be.null();
        });
    });

    describe('wall toggling', function() {
        var gc;
        beforeEach(function() { gc = new GridCanvas(); });

        it('should toggle empty cell to wall', function() {
            gc.toggleWall(3, 4);
            gc.getCellType(3, 4).should.equal('wall');
        });

        it('should toggle wall back to empty', function() {
            gc.toggleWall(3, 4);
            gc.toggleWall(3, 4);
            gc.getCellType(3, 4).should.equal('empty');
        });

        it('should not toggle wall on start cell', function() {
            gc.setStart(2, 2);
            gc.toggleWall(2, 2);
            gc.getCellType(2, 2).should.equal('start');
        });

        it('should not toggle wall on end cell', function() {
            gc.setEnd(5, 5);
            gc.toggleWall(5, 5);
            gc.getCellType(5, 5).should.equal('end');
        });

        it('should ignore out-of-bounds coordinates', function() {
            (function() { gc.toggleWall(-1, 0); }).should.not.throw();
            (function() { gc.toggleWall(0, 15); }).should.not.throw();
            (function() { gc.toggleWall(15, 0); }).should.not.throw();
        });
    });

    describe('start/end placement', function() {
        var gc;
        beforeEach(function() { gc = new GridCanvas(); });

        it('should set start point', function() {
            gc.setStart(1, 2);
            gc.getCellType(1, 2).should.equal('start');
            gc.getStart().should.deepEqual({ x: 1, y: 2 });
        });

        it('should set end point', function() {
            gc.setEnd(7, 8);
            gc.getCellType(7, 8).should.equal('end');
            gc.getEnd().should.deepEqual({ x: 7, y: 8 });
        });

        it('should move start to new position', function() {
            gc.setStart(1, 1);
            gc.setStart(5, 5);
            gc.getCellType(1, 1).should.equal('empty');
            gc.getCellType(5, 5).should.equal('start');
        });

        it('should move end to new position', function() {
            gc.setEnd(1, 1);
            gc.setEnd(9, 9);
            gc.getCellType(1, 1).should.equal('empty');
            gc.getCellType(9, 9).should.equal('end');
        });

        it('should clear wall when start placed on it', function() {
            gc.toggleWall(3, 3);
            gc.setStart(3, 3);
            gc.getCellType(3, 3).should.equal('start');
        });

        it('should clear wall when end placed on it', function() {
            gc.toggleWall(6, 6);
            gc.setEnd(6, 6);
            gc.getCellType(6, 6).should.equal('end');
        });

        it('should not allow start and end on same cell', function() {
            gc.setStart(4, 4);
            gc.setEnd(4, 4);
            gc.getCellType(4, 4).should.equal('end');
            should(gc.getStart()).be.null();
        });

        it('should ignore out-of-bounds for start', function() {
            (function() { gc.setStart(-1, 0); }).should.not.throw();
            should(gc.getStart()).be.null();
        });

        it('should ignore out-of-bounds for end', function() {
            (function() { gc.setEnd(0, 20); }).should.not.throw();
            should(gc.getEnd()).be.null();
        });
    });

    describe('getState', function() {
        it('should return full grid state', function() {
            var gc = new GridCanvas();
            gc.setStart(0, 0);
            gc.setEnd(14, 14);
            gc.toggleWall(7, 7);

            var state = gc.getState();
            state.width.should.equal(15);
            state.height.should.equal(15);
            state.start.should.deepEqual({ x: 0, y: 0 });
            state.end.should.deepEqual({ x: 14, y: 14 });
            state.walls.should.containEql({ x: 7, y: 7 });
        });

        it('should return immutable snapshot — mutations do not affect returned state', function() {
            var gc = new GridCanvas();
            gc.toggleWall(1, 1);
            var state = gc.getState();
            gc.toggleWall(1, 1); // remove wall
            state.walls.should.containEql({ x: 1, y: 1 });
        });
    });

    describe('toMatrix', function() {
        it('should export 0/1 matrix — walls are 1', function() {
            var gc = new GridCanvas(3, 3);
            gc.toggleWall(1, 1);
            var m = gc.toMatrix();
            m.length.should.equal(3);
            m[0].length.should.equal(3);
            m[1][1].should.equal(1);
            m[0][0].should.equal(0);
        });

        it('should treat start and end as walkable (0)', function() {
            var gc = new GridCanvas(3, 3);
            gc.setStart(0, 0);
            gc.setEnd(2, 2);
            var m = gc.toMatrix();
            m[0][0].should.equal(0);
            m[2][2].should.equal(0);
        });
    });

    describe('reset', function() {
        it('should clear all walls, start, and end', function() {
            var gc = new GridCanvas();
            gc.setStart(0, 0);
            gc.setEnd(14, 14);
            gc.toggleWall(5, 5);
            gc.reset();

            should(gc.getStart()).be.null();
            should(gc.getEnd()).be.null();
            gc.getState().walls.length.should.equal(0);
            gc.getCellType(5, 5).should.equal('empty');
        });
    });

    describe('setState', function() {
        it('should restore state from a snapshot', function() {
            var gc = new GridCanvas();
            gc.setStart(1, 1);
            gc.setEnd(13, 13);
            gc.toggleWall(3, 3);
            var snap = gc.getState();

            var gc2 = new GridCanvas();
            gc2.setState(snap);
            gc2.getCellType(1, 1).should.equal('start');
            gc2.getCellType(13, 13).should.equal('end');
            gc2.getCellType(3, 3).should.equal('wall');
        });
    });

    describe('setWall', function() {
        var gc;
        beforeEach(function() { gc = new GridCanvas(); });

        it('should directly set a wall without toggling', function() {
            gc.setWall(5, 5);
            gc.getCellType(5, 5).should.equal('wall');
        });

        it('should not unset an existing wall', function() {
            gc.setWall(5, 5);
            gc.setWall(5, 5); // second call keeps wall
            gc.getCellType(5, 5).should.equal('wall');
        });

        it('should not overwrite start cell', function() {
            gc.setStart(2, 2);
            gc.setWall(2, 2);
            gc.getCellType(2, 2).should.equal('start');
        });

        it('should not overwrite end cell', function() {
            gc.setEnd(8, 8);
            gc.setWall(8, 8);
            gc.getCellType(8, 8).should.equal('end');
        });

        it('should ignore out-of-bounds', function() {
            (function() { gc.setWall(20, 0); }).should.not.throw();
        });
    });

    describe('onChange', function() {
        it('should fire callback after toggleWall', function() {
            var gc = new GridCanvas();
            var fired = 0;
            gc.onChange(function() { fired++; });
            gc.toggleWall(1, 1);
            fired.should.equal(1);
        });

        it('should fire callback after setStart', function() {
            var gc = new GridCanvas();
            var fired = 0;
            gc.onChange(function() { fired++; });
            gc.setStart(0, 0);
            fired.should.equal(1);
        });

        it('should fire callback after setEnd', function() {
            var gc = new GridCanvas();
            var fired = 0;
            gc.onChange(function() { fired++; });
            gc.setEnd(14, 14);
            fired.should.equal(1);
        });

        it('should fire callback after reset', function() {
            var gc = new GridCanvas();
            var fired = 0;
            gc.onChange(function() { fired++; });
            gc.reset();
            fired.should.equal(1);
        });

        it('should pass current state snapshot to callback', function() {
            var gc = new GridCanvas();
            var received;
            gc.onChange(function(state) { received = state; });
            gc.setStart(3, 3);
            received.start.should.deepEqual({ x: 3, y: 3 });
        });
    });

});
