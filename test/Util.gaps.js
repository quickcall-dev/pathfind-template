/**
 * Util.gaps.js — covers Util edge-cases not in test/Util.js
 * Gaps: 1, 2, 4, 5, 12, 13 from test-writer-1 assignments
 */
var PF = require('..');
var Grid = PF.Grid;

describe('Util (gap coverage)', function() {

    // ------------------------------------------------------------------
    // Gap 1 — smoothenPath: 1-node path
    // len < 2 causes loop to never run (starts at i=2).
    // Result: [[x0,y0],[x1,y1]] where both come from path[0] → duplicate.
    // ------------------------------------------------------------------
    describe('smoothenPath — 1-node path', function() {
        it('returns a 2-element array with the same coord duplicated', function() {
            var grid = new Grid(5, 5);
            var path = [[2, 3]];
            var smoothed = PF.Util.smoothenPath(grid, path);
            // len=1: x0=y0=x1=y1=path[0], loop skipped, newPath=[[2,3]] then push [2,3]
            smoothed.length.should.equal(2);
            smoothed[0].should.eql([2, 3]);
            smoothed[1].should.eql([2, 3]);
        });
    });

    // ------------------------------------------------------------------
    // Gap 2 — smoothenPath: lastValidCoord implicit global bug
    // `lastValidCoord` at Util.js:167 has no var/let/const.
    // Verify second independent call is not corrupted by stale global state.
    // ------------------------------------------------------------------
    describe('smoothenPath — sequential calls (lastValidCoord implicit global)', function() {
        it('second call result is independent of first call obstacle state', function() {
            var grid = new Grid(5, 5);
            // Block (2,0) so first call detours
            grid.setWalkableAt(2, 0, false);

            // Call 1: path that hits obstacle — sets global lastValidCoord
            var path1 = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]];
            var smoothed1 = PF.Util.smoothenPath(grid, path1);
            smoothed1[0].should.eql([0, 0]);
            smoothed1[smoothed1.length - 1].should.eql([4, 0]);
            // detour → more than 2 waypoints
            smoothed1.length.should.be.above(2);

            // Call 2: clean vertical path on same grid (no obstacles in column 0)
            var path2 = [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]];
            var smoothed2 = PF.Util.smoothenPath(grid, path2);
            // Should compress to just start and end — no obstacles
            smoothed2[0].should.eql([0, 0]);
            smoothed2[smoothed2.length - 1].should.eql([0, 4]);
            // Stale lastValidCoord from call 1 must not corrupt call 2
            smoothed2.length.should.equal(2);
        });
    });

    // ------------------------------------------------------------------
    // Gap 4 — smoothenPath: two-node path
    // Loop runs from i=2 to i<2 → zero iterations.
    // Result should equal the original two-node path.
    // ------------------------------------------------------------------
    describe('smoothenPath — two-node path', function() {
        it('returns [start, end] unchanged when len == 2', function() {
            var grid = new Grid(5, 5);
            var path = [[0, 0], [4, 4]];
            var smoothed = PF.Util.smoothenPath(grid, path);
            smoothed.length.should.equal(2);
            smoothed[0].should.eql([0, 0]);
            smoothed[1].should.eql([4, 4]);
        });
    });

    // ------------------------------------------------------------------
    // Gap 5 — expandPath: single-element path
    // len=1 < 2 → returns [] (empty), NOT [path[0]].
    // This is documented behavior: expand needs at least 2 coords.
    // ------------------------------------------------------------------
    describe('expandPath — single-element path', function() {
        it('returns [] for a one-element path (len < 2 guard)', function() {
            PF.Util.expandPath([[3, 4]]).should.eql([]);
        });
    });

    // ------------------------------------------------------------------
    // Gap 12 — interpolate: both axes negative direction (sx=-1, sy=-1)
    // ------------------------------------------------------------------
    describe('interpolate — negative direction (sx=-1, sy=-1)', function() {
        it('returns correct coords when x1 < x0 and y1 < y0', function() {
            PF.Util.interpolate(3, 3, 0, 0).should.eql([
                [3, 3], [2, 2], [1, 1], [0, 0]
            ]);
        });

        it('negative x only (sx=-1, sy=+1)', function() {
            PF.Util.interpolate(3, 0, 0, 3).should.eql([
                [3, 0], [2, 1], [1, 2], [0, 3]
            ]);
        });

        it('negative y only (sx=+1, sy=-1)', function() {
            PF.Util.interpolate(0, 3, 3, 0).should.eql([
                [0, 3], [1, 2], [2, 1], [3, 0]
            ]);
        });
    });

    // ------------------------------------------------------------------
    // Gap 13 — compressPath: 3-element collinear straight path
    // All three on same line → middle point removed → 2-element result.
    // ------------------------------------------------------------------
    describe('compressPath — 3-element collinear path', function() {
        it('compresses horizontal collinear 3-point path to 2 endpoints', function() {
            PF.Util.compressPath([[0, 0], [1, 0], [2, 0]]).should.eql([[0, 0], [2, 0]]);
        });

        it('compresses vertical collinear 3-point path to 2 endpoints', function() {
            PF.Util.compressPath([[0, 0], [0, 1], [0, 2]]).should.eql([[0, 0], [0, 2]]);
        });

        it('compresses diagonal collinear 3-point path to 2 endpoints', function() {
            PF.Util.compressPath([[0, 0], [1, 1], [2, 2]]).should.eql([[0, 0], [2, 2]]);
        });
    });
});
