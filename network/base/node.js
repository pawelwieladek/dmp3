var Utils = require("./../utils");

var Node = function(options) {
    options = options || {};
    this.error = 0;
    this.delta = 0;
    this.output = 0;
    this.bias = options.bias || Utils.randomBipolar();
};

Node.prototype.calculateDelta = function(weight, parentDelta, activationDerivative) {
    this.error = weight * parentDelta;
    this.delta = this.error * activationDerivative(this.output);
};

module.exports = Node;