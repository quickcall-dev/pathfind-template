var PF = require('..');

describe('DiagonalMovement', function() {
    var DM = PF.DiagonalMovement;

    it('Always should equal 1', function() {
        DM.Always.should.equal(1);
    });

    it('Never should equal 2', function() {
        DM.Never.should.equal(2);
    });

    it('IfAtMostOneObstacle should equal 3', function() {
        DM.IfAtMostOneObstacle.should.equal(3);
    });

    it('OnlyWhenNoObstacles should equal 4', function() {
        DM.OnlyWhenNoObstacles.should.equal(4);
    });
});
