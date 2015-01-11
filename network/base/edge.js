var Utils = require("./../utils");

function Edge(node, options) {
    options = options || {};
    this.weight = options.weight || Utils.randomBipolar();
    this.change = 0;
    this.isFrozen = false;
    this.node = node;
}

Edge.prototype.propagateDelta = function(parentDelta, activationDerivative) {
    if(!this.isFrozen) {
        this.node.calculateDelta(this.weight, parentDelta, activationDerivative);
    }
};

Edge.prototype.calculateWeight = function(learningRate, momentum, delta) {
    if(!this.isFrozen) {
        this.change = (learningRate * delta * this.node.output) + (momentum * this.change);
        this.weight += this.change;

        this.node.adjustWeights(learningRate, momentum);
    }
};

Edge.prototype.freeze = function() {
    this.isFrozen = true;
    this.node.freeze();
};

module.exports = Edge;