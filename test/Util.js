var PF = require('..');
var Grid = PF.Grid;
var Node = PF.Node;

describe('Utility functions', function () {
    describe('interpolate', function () {
        it('should return the interpolated path', function () {
            PF.Util.interpolate(0, 1, 0, 4).should.eql([
                [0, 1], [0, 2], [0, 3], [0, 4]
            ]);
        });
    });

    describe('expandPath', function () {
        it('should return an empty array given an empty array', function () {
            PF.Util.expandPath([]).should.eql([]);
        });

        it('should return the expanded path', function () {
            PF.Util.expandPath([
                [0, 1], [0, 4]
            ]).should.eql([
                [0, 1], [0, 2], [0, 3], [0, 4]
            ]);

            PF.Util.expandPath([
                [0, 1], [0, 4], [2, 6]
            ]).should.eql([
                [0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [2, 6]
            ]);
        });
    });

    describe('compressPath', function () {
        it('should return the original path if it is too short to compress', function () {
            PF.Util.compressPath([]).should.eql([]);
        });

        it('should return a compressed path', function () {
            PF.Util.compressPath([
                [0, 1], [0, 2], [0, 3], [0, 4]
            ]).should.eql([
                [0, 1], [0, 4]
            ]);

            PF.Util.compressPath([
                [0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [2, 6]
            ]).should.eql([
                [0, 1], [0, 4], [2, 6]
            ]);
        });
    });

    describe('interpolate (additional cases)', function() {
        it('should return all coords on a horizontal line', function() {
            PF.Util.interpolate(0, 0, 4, 0).should.eql([
                [0, 0], [1, 0], [2, 0], [3, 0], [4, 0]
            ]);
        });

        it('should return all coords on a diagonal line', function() {
            PF.Util.interpolate(0, 0, 2, 2).should.eql([
                [0, 0], [1, 1], [2, 2]
            ]);
        });

        it('should return single element when start equals end', function() {
            PF.Util.interpolate(2, 3, 2, 3).should.eql([[2, 3]]);
        });
    });

    describe('compressPath (edge cases)', function() {
        it('should return single-element path unchanged', function() {
            PF.Util.compressPath([[1, 2]]).should.eql([[1, 2]]);
        });

        it('should return two-element path unchanged', function() {
            PF.Util.compressPath([[0, 0], [1, 1]]).should.eql([[0, 0], [1, 1]]);
        });
    });

    describe('backtrace', function() {
        it('should return the path from start to end', function() {
            var n1 = new Node(0, 0);
            var n2 = new Node(1, 0);
            var n3 = new Node(2, 0);
            n2.parent = n1;
            n3.parent = n2;
            PF.Util.backtrace(n3).should.eql([[0, 0], [1, 0], [2, 0]]);
        });

        it('should return single-node path when no parent', function() {
            var n = new Node(3, 5);
            PF.Util.backtrace(n).should.eql([[3, 5]]);
        });
    });

    describe('biBacktrace', function() {
        it('should concatenate two backtraced paths meeting in middle', function() {
            // forward chain: (0,0) -> (1,0) -> (2,0)
            var a1 = new Node(0, 0), a2 = new Node(1, 0), a3 = new Node(2, 0);
            a2.parent = a1;
            a3.parent = a2;
            // backward chain: (5,0) -> (4,0) -> (3,0)
            var b1 = new Node(5, 0), b2 = new Node(4, 0), b3 = new Node(3, 0);
            b2.parent = b1;
            b3.parent = b2;
            // biBacktrace(a3, b3) = [0,1,2] + reverse([5,4,3]) = [0..5]
            PF.Util.biBacktrace(a3, b3).should.eql([
                [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]
            ]);
        });
    });

    describe('pathLength', function() {
        it('should return 0 for single-node path', function() {
            PF.Util.pathLength([[0, 0]]).should.equal(0);
        });

        it('should return correct length for horizontal path', function() {
            PF.Util.pathLength([[0, 0], [3, 0]]).should.equal(3);
        });

        it('should return correct length for 3-4-5 diagonal', function() {
            PF.Util.pathLength([[0, 0], [3, 4]]).should.equal(5);
        });

        it('should sum segment lengths for multi-step path', function() {
            PF.Util.pathLength([[0, 0], [1, 0], [1, 1]]).should.equal(2);
        });
    });

    describe('smoothenPath', function() {
        it('should preserve start and end on obstacle-free grid', function() {
            var grid = new Grid(5, 5);
            var path = [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]];
            var smoothed = PF.Util.smoothenPath(grid, path);
            smoothed[0].should.eql([0, 0]);
            smoothed[smoothed.length - 1].should.eql([0, 4]);
        });

        // NOTE: exercises the `lastValidCoord` implicit-global bug at Util.js:167
        // `lastValidCoord` is assigned without var/let/const — triggers implicit global
        it('should insert waypoint before blocked segment (exposes lastValidCoord implicit global bug)', function() {
            var grid = new Grid(5, 5);
            // block (2,0) so straight line from (0,0) to (3,0) is obstructed
            grid.setWalkableAt(2, 0, false);
            var path = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]];
            var smoothed = PF.Util.smoothenPath(grid, path);
            smoothed[0].should.eql([0, 0]);
            smoothed[smoothed.length - 1].should.eql([4, 0]);
            // must detour around obstacle, so more than 2 waypoints
            smoothed.length.should.be.above(2);
        });
    });

});
