var Edge = require("./base/edge");
var ParentNode = require("./base/parent-node");
var Utils = require("./utils");
var ChildNode = require("./child-node");

var RootNode = function(options) {
    ParentNode.call(this, options);
    this.edges = [];
    this.inputSize = 0;
};

RootNode.prototype = new ParentNode();
RootNode.prototype.constructor = RootNode;

RootNode.prototype.calculateDelta = function(output, activationDerivative) {
    this.error = output - this.output;
    this.delta = this.error * activationDerivative(this.output);

    ParentNode.prototype.pushDeltaForward.call(this, activationDerivative);
};

RootNode.prototype.adjustWeights = function(learningRate, momentum) {
    this.edges.forEach(function(edge) {
        edge.calculateWeight(learningRate, momentum, this.delta);
    }.bind(this));

    this.bias += learningRate * this.delta;
};

RootNode.prototype.addChild = function (weightFunction, hiddenNodesNumber) {
    weightFunction = weightFunction || Utils.randomBipolar;

    var child = new ChildNode({ bias: weightFunction() });
    child.initializeInput(this.inputSize);
    child.expandWith(hiddenNodesNumber);

    var edge = new Edge(child, { weight: weightFunction() });
    this.edges.push(edge);
};

RootNode.prototype.expandWith = function(hiddenNodesNumber) {
    this.addChild(Utils.randomPositive, hiddenNodesNumber);
    this.addChild(Utils.randomNegative, hiddenNodesNumber);
};

module.exports = RootNode;