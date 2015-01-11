var Node = require("./base/node");

var InputNode = function(options) {
    Node.call(this, options);
};

InputNode.prototype = new Node();
InputNode.prototype.constructor = InputNode;

InputNode.prototype.feedForward = function(input) {
    this.output = input;
};

InputNode.prototype.adjustWeights = function() { };

InputNode.prototype.freeze = function() { };

module.exports = InputNode;