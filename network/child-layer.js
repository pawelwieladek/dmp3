var Utils = require("./utils");
var Layer = require("./layer");
var ChildNode = require("./child-node");

var ChildLayer = function() {
    Layer.call(this);
};

ChildLayer.prototype = new Layer();
ChildLayer.prototype.constructor = ChildLayer;

ChildLayer.prototype.addChild = function (inputSize, weightFunction) {
    weightFunction = weightFunction || Utils.randomBipolar;
    var child = new ChildNode({ bias: weightFunction() });
    child.initialize(inputSize);
    this.nodes.push(child);
    this.weights.push(weightFunction());
    this.changes.push(0);
};

ChildLayer.prototype.addChildrenNodes = function(inputSize) {
    this.addChild(inputSize, Utils.randomPositive);
    this.addChild(inputSize, Utils.randomNegative);
};

ChildLayer.prototype.feedForward = function(input, activationFunction) {
    var i;
    for(i = 0; i < this.nodes.length; i++) {
        this.nodes[i].feedForward(input, activationFunction);
    }
};

ChildLayer.prototype.calculateDeltas = function(activationDerivative, parentDelta) {
    var i;
    for(i = 0; i < this.nodes.length; i++) {
        this.nodes[i].calculateDeltas(this.weights[i], parentDelta, activationDerivative);
    }
};

ChildLayer.prototype.adjustWeights = function(learningRate, momentum, delta) {
    Layer.prototype.adjustWeights.call(this, learningRate, momentum, delta);
    var i;
    for(i = 0; i < this.nodes.length; i++) {
        this.nodes[i].adjustWeights(learningRate, momentum);
    }
};

module.exports = ChildLayer;