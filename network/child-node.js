var Node = require("./node");
var Layer = require("./layer");

var ChildNode = function(options) {
    Node.call(this, options);
    this.inputLayer = new Layer();
};

ChildNode.prototype = new Node();
ChildNode.prototype.constructor = Node;

ChildNode.prototype.initialize = function(inputSize) {
    this.inputLayer.initialize(inputSize);
};

ChildNode.prototype.feedForward = function(input, activationFunction) {
    var sum = 0;

    this.inputLayer.updateOutput(input);

    sum += this.bias;
    sum += this.inputLayer.getWeightedSum();

    this.output = activationFunction(sum);
};

ChildNode.prototype.calculateDeltas = function(parentWeight, parentDelta, activationDerivative) {
    this.error = parentWeight * parentDelta;
    this.delta = this.error * activationDerivative(this.output);

    this.inputLayer.calculateDeltas(activationDerivative, this.delta);
};

ChildNode.prototype.adjustWeights = function(learningRate, momentum) {
    // adjust weights of hidden nodes
    this.bias += learningRate * this.delta;
};

module.exports = ChildNode;