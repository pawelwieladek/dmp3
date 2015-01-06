var Utils = require("./utils");
var RootNode = require("./root-node");

var Network = function(options) {
    options = options || {};
    this.rootNode = new RootNode();
    this.activationFunction = options.activationFunction || Utils.sigmoid;
    this.activationDerivative = options.activationDerivative || Utils.sigmoidDerivative;
    this.learningRate = options.learningRate || 0.1;
    this.momentum = options.momentum || 0.5;
    this.iterations = options.iterations || 20000;
};

Network.prototype.train = function(data) {
    var i;

    var inputSize = data[0].input.length;
    this.rootNode.initialize(inputSize);

    for(i = 0; i < this.iterations; i++) {
        data.forEach(function (datum) {
            this.learn(datum.input, datum.output);
        }.bind(this));
    }
};

Network.prototype.learn = function(input, output) {
    this.rootNode.feedForward(input, this.activationFunction);
    this.rootNode.calculateDeltas(output, this.activationDerivative);
    this.rootNode.adjustWeights(this.learningRate, this.momentum);
};

Network.prototype.run = function(input) {
    this.rootNode.feedForward(input, this.activationFunction);
    return this.rootNode.output;
};

module.exports = Network;