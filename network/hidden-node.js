var Edge = require("./base/edge");
var Node = require("./base/node");
var ParentNode = require("./base/parent-node");

var HiddenNode = function(options) {
    ParentNode.call(this, options);
    this.edges = [];
};

HiddenNode.prototype = new ParentNode();
HiddenNode.prototype.constructor = HiddenNode;

HiddenNode.prototype.calculateDelta = function(weight, parentDelta, activationDerivative) {
    Node.prototype.calculateDelta.call(this, weight, parentDelta, activationDerivative);
    ParentNode.prototype.pushDeltaForward.call(this, activationDerivative);
};

module.exports = HiddenNode;