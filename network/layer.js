var Utils = require("./utils");
var Node = require("./node");

var Layer = function() {
    this.nodes = [];
    this.weights = [];
    this.changes = [];
};

Layer.prototype.initialize = function(size) {
    var i;
    for(i = 0; i < size; i++) {
        this.nodes.push(new Node());
    }

    this.weights = Utils.randoms(size, Utils.randomBipolar);
    this.changes = Utils.zeros(size);
};

Layer.prototype.updateOutput = function(input) {
    var i;
    for(i = 0; i < this.nodes.length; i++) {
        this.nodes[i].output = input[i];
    }
};

Layer.prototype.getWeightedSum = function() {
    var sum = 0;
    var i;
    for(i = 0; i < this.nodes.length; i++) {
        sum += this.weights[i] * this.nodes[i].output;
    }
    return sum;
};

Layer.prototype.calculateDeltas = function(activationDerivative, parentDelta) {
    var i;
    for(i = 0; i < this.nodes.length; i++) {
        this.nodes[i].error = this.weights[i] * parentDelta;
        this.nodes[i].delta = this.nodes[i].error * activationDerivative(this.nodes[i].output);
    }
};

Layer.prototype.adjustWeights = function(learningRate, momentum, delta) {
    var i;
    for(i = 0; i < this.nodes.length; i++) {
        this.changes[i] = (learningRate * delta * this.nodes[i].output) + (momentum * this.changes[i]);
        this.weights[i] += this.changes[i];
    }
};

module.exports = Layer;