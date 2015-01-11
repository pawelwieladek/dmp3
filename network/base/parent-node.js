var Node = require("./node");
var Edge = require("./edge");
var InputNode = require("./../input-node");

var ParentNode = function(options) {
    Node.call(this, options);
    this.edges = [];
    this.inputSize = 0;
};

ParentNode.prototype = new Node();
ParentNode.prototype.constructor = ParentNode;

ParentNode.prototype.initializeInput = function(inputSize) {
    this.inputSize = inputSize;
    var i;
    for(i = 0; i < this.inputSize; i++) {
        var inputNode = new InputNode();
        var edge = new Edge(inputNode);
        this.edges.push(edge);
    }
};

ParentNode.prototype.freeze = function() {
    this.edges.forEach(function(edge) {
        edge.freeze();
    });
};

ParentNode.prototype.freezeRecursive = function() {
    this.edges.forEach(function(edge) {
        edge.freeze();
        if(edge.node.edges != null) {
            edge.node.freezeRecursive();
        }
    });
};

ParentNode.prototype.calculateWeightedSum = function() {
    var sum = 0;
    this.edges.forEach(function(edge) {
        sum += edge.weight * edge.node.output;
    });
    return sum;
};

ParentNode.prototype.feedForward = function(input, activationFunction) {
    this.edges.forEach(function(edge) {
        edge.node.feedForward(input, activationFunction);
    });

    var sum = 0;
    sum += this.bias;
    sum += this.calculateWeightedSum();

    this.output = activationFunction(sum);
};

ParentNode.prototype.pushDeltaForward = function(activationDerivative) {
    this.edges.forEach(function(edge) {
        edge.propagateDelta(this.delta, activationDerivative);
    }.bind(this));
};

ParentNode.prototype.adjustWeights = function(learningRate, momentum) {
    this.edges.forEach(function(edge) {
        edge.calculateWeight(learningRate, momentum, this.delta);
    }.bind(this));

    this.bias += learningRate * this.delta;
};

ParentNode.prototype.expand = function() { };

module.exports = ParentNode;