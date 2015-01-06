var Utils = require("./utils");

var Node = function() {
    this.error = 0;
    this.delta = 0;
    this.output = 0;
    this.bias = Utils.randomBipolar();
};

module.exports = Node;