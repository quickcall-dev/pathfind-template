/**
 * Node.gaps.js — covers Node edge-cases not in test/Node.js
 * Gap 16: walkable=0 (falsy non-undefined) and walkable=undefined (explicit)
 */
var PF = require('..');

describe('Node (gap coverage)', function() {

    // ------------------------------------------------------------------
    // Gap 16 — walkable=0: falsy but not undefined → stored as 0 not coerced
    // ------------------------------------------------------------------
    describe('walkable=0 (falsy, not undefined)', function() {
        it('stores 0 directly (not coerced to false)', function() {
            var node = new PF.Node(1, 2, 0);
            // walkable = (0 === undefined ? true : 0) → 0
            node.walkable.should.equal(0);
        });

        it('walkable=0 is falsy', function() {
            var node = new PF.Node(1, 2, 0);
            node.walkable.should.not.be.ok();
        });
    });

    // ------------------------------------------------------------------
    // Gap 16 — walkable=undefined (explicit arg): behaves same as omitting
    // ------------------------------------------------------------------
    describe('walkable=undefined (explicit argument)', function() {
        it('explicit undefined produces walkable=true same as omitting arg', function() {
            var nodeOmitted = new PF.Node(0, 0);
            var nodeExplicit = new PF.Node(0, 0, undefined);
            nodeExplicit.walkable.should.equal(nodeOmitted.walkable);
            nodeExplicit.walkable.should.equal(true);
        });
    });
});
