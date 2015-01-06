var _ = require("underscore");

function tanh(x) {
    if(x === Infinity) {
        return 1;
    } else if(x === -Infinity) {
        return -1;
    } else {
        var y = Math.exp(2 * x);
        if (y != Infinity) {
            return (y - 1) / (y + 1);
        } else {
            return 1;
        }
    }
}

function tanhDerivative(x) {
    return 1 - Math.pow(x, 2);
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function randomBipolar() {
    return randomRange(-0.5, 0.5);
}

function zeros(size) {
    var array = new Array(size);
    for (var i = 0; i < size; i++) {
        array[i] = 0;
    }
    return array;
}

function randoms(size, randomFunction) {
    var array = new Array(size);
    for (var i = 0; i < size; i++) {
        array[i] = randomFunction();
    }
    return array;
}

var Node = function() {
    this.error = 0;
    this.delta = 0;
    this.output = 0;
    this.bias = randomBipolar();
};

var Layer = function() {
    this.nodes = [];
    this.weights = [];
    this.changes = [];
};

Layer.prototype.initialize = function(size) {
    var i;

    for(i = 0; i < size; i++) {
        this.nodes.push(new Node());
    }

    this.weights = randoms(size, randomBipolar);
    this.changes = zeros(size);
};

Layer.prototype.getWeightedSum = function() {
    var sum = 0;
    var i;

    for(i = 0; i < this.nodes.length; i++) {
        sum += this.weights[i] * this.nodes[i].output;
    }
    return sum;
};

Layer.prototype.calculateDeltas = function(activationDerivative, parentDelta) {
    var i;

    for(i = 0; i < this.nodes.length; i++) {
        this.nodes[i].error = this.weights[i] * parentDelta;
        this.nodes[i].delta = this.nodes[i].error * activationDerivative(this.nodes[i].output);
    }
};

Layer.prototype.adjustWeights = function(learningRate, momentum, delta) {
    var i;

    for(i = 0; i < this.nodes.length; i++) {
        this.changes[i] = (learningRate * delta * this.nodes[i].output) + (momentum * this.changes[i]);
        this.weights[i] += this.changes[i];
    }
};

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

var Network = function(options) {
    options = options || {};
    this.rootNode = new RootNode();
    this.activationFunction = options.activationFunction || tanh;
    this.activationDerivative = options.activationDerivative || tanhDerivative;
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

var data = [];
var total = 100;
for(var i = -total; i < total; i++) {
    data.push({
        input: [i / total],
        output: i > 0 ? 1 : -1
    });
}

data = _.shuffle(data);

var net = new Network();
net.train(data);
var result = net.run([9 / total]);


console.log(result);
