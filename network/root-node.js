var Utils = require("./utils");
var Node = require("./node");
var Layer = require("./layer");
var ChildNode = require("./child-node");
var ChildLayer = require("./child-layer");

var RootNode = function(options) {
    Node.call(this, options);
    this.inputLayer = new Layer();
    this.childrenLayer = new ChildLayer();
};

RootNode.prototype = new Node();
RootNode.prototype.constructor = RootNode;

RootNode.prototype.initialize = function(inputSize) {
    this.inputLayer.initialize(inputSize);
};

RootNode.prototype.feedForward = function(input, activationFunction) {
    var sum = 0;

    this.inputLayer.updateOutput(input);
    this.childrenLayer.feedForward(input, activationFunction);

    sum += this.bias;
    sum += this.childrenLayer.getWeightedSum();
    sum += this.inputLayer.getWeightedSum();

    this.output = activationFunction(sum);
};

RootNode.prototype.calculateDeltas = function(output, activationDerivative) {
    this.error = output - this.output;
    this.delta = this.error * activationDerivative(this.output);

    this.inputLayer.calculateDeltas(activationDerivative, this.delta);
    this.childrenLayer.calculateDeltas(activationDerivative, this.delta);
};

RootNode.prototype.adjustWeights = function(learningRate, momentum) {
    this.inputLayer.adjustWeights(learningRate, momentum, this.delta);
    this.bias += learningRate * this.delta;
};

module.exports = RootNode;