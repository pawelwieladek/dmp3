var Edge = require("./base/edge");
var Utils = require("./utils");
var HiddenNode = require("./hidden-node");

var ChildNode = function(options) {
    HiddenNode.call(this, options);
    this.edges = [];
};

ChildNode.prototype = new HiddenNode();
ChildNode.prototype.constructor = ChildNode;

ChildNode.prototype.expand = function (weightFunction) {
    weightFunction = weightFunction || Utils.randomBipolar;

    var hidden = new HiddenNode({ bias: weightFunction() });
    hidden.initializeInput(this.inputSize);

    var edge = new Edge(hidden, { weight: weightFunction() });
    this.edges.push(edge);
};

ChildNode.prototype.expandWith = function(hiddenNodesNumber) {
    var i;
    for(i = 0; i < hiddenNodesNumber; i++) {
        this.expand();
    }
};

module.exports = ChildNode;