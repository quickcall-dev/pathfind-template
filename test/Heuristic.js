var PF = require('..');

describe('Heuristic', function() {
    var H = PF.Heuristic;
    var F = Math.SQRT2 - 1;

    describe('manhattan', function() {
        it('should return dx + dy', function() {
            H.manhattan(3, 4).should.equal(7);
        });

        it('should return 0 for (0, 0)', function() {
            H.manhattan(0, 0).should.equal(0);
        });
    });

    describe('euclidean', function() {
        it('should return sqrt(dx^2 + dy^2)', function() {
            H.euclidean(3, 4).should.equal(5);
        });

        it('should return 0 for (0, 0)', function() {
            H.euclidean(0, 0).should.equal(0);
        });
    });

    describe('octile', function() {
        it('should handle dx < dy branch', function() {
            H.octile(2, 5).should.equal(F * 2 + 5);
        });

        it('should handle dx >= dy branch', function() {
            H.octile(5, 2).should.equal(F * 2 + 5);
        });

        it('should return 0 for (0, 0)', function() {
            H.octile(0, 0).should.equal(0);
        });

        it('should be symmetric', function() {
            H.octile(3, 7).should.equal(H.octile(7, 3));
        });
    });

    describe('chebyshev', function() {
        it('should return max(dx, dy)', function() {
            H.chebyshev(3, 4).should.equal(4);
        });

        it('should return 0 for (0, 0)', function() {
            H.chebyshev(0, 0).should.equal(0);
        });

        it('should be symmetric', function() {
            H.chebyshev(3, 7).should.equal(H.chebyshev(7, 3));
        });
    });
});
