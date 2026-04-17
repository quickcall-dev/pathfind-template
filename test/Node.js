var PF = require('..');

describe('Node', function() {
    it('should default walkable to true', function() {
        var node = new PF.Node(3, 5);
        node.x.should.equal(3);
        node.y.should.equal(5);
        node.walkable.should.equal(true);
    });

    it('should respect explicit walkable=false', function() {
        var node = new PF.Node(1, 2, false);
        node.walkable.should.equal(false);
    });

    it('should respect explicit walkable=true', function() {
        var node = new PF.Node(0, 0, true);
        node.walkable.should.equal(true);
    });
});
