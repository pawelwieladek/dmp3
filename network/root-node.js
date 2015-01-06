var Node = require("./node");
var Layer = require("./layer");

var RootNode = function() {
    Node.call(this);
    this.inputLayer = new Layer();
};

RootNode.prototype = new Node();
RootNode.prototype.constructor = Node;

RootNode.prototype.initialize = function(size) {
    this.inputLayer.initialize(size);
};

RootNode.prototype.feedForward = function(input, activationFunction) {
    var sum = 0;
    var i;

    for(i = 0; i < this.inputLayer.nodes.length; i++) {
        this.inputLayer.nodes[i].output = input[i];
    }

    sum += this.bias;

    // feed forward children

    sum += this.inputLayer.getWeightedSum();

    this.output = activationFunction(sum);
};

RootNode.prototype.calculateDeltas = function(output, activationDerivative) {
    this.error = output - this.output;
    this.delta = this.error * activationDerivative(this.output);

    this.inputLayer.calculateDeltas(activationDerivative, this.delta);
};

RootNode.prototype.adjustWeights = function(learningRate, momentum) {
    this.inputLayer.adjustWeights(learningRate, momentum, this.delta);
    this.bias += learningRate * this.delta;
};

module.exports = RootNode;