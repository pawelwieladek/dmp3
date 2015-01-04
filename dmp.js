var _ = require("underscore");

Object.deepExtend = function(destination, source) {
    for (var property in source) {
        if (source.hasOwnProperty(property) && source[property] && source[property].constructor &&
            source[property].constructor === Object) {
            destination[property] = destination[property] || {};
            arguments.callee(destination[property], source[property]);
        } else {
            destination[property] = source[property];
        }
    }
    return destination;
};

function sgn(x) {
    return x > 0 ? 1 : 0;
}

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

function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

function sigmoidDerivative(x) {
    return (1 - x) * x;
}

function randomBipolar() {
    return Math.random() * 0.4 - 0.2;
}

function randomUnipolar() {
    return Math.random() * 0.2;
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

function meanSquaredError(errors) {
    // mean squared error
    var sum = 0;
    for (var i = 0; i < errors.length; i++) {
        sum += Math.pow(errors[i], 2);
    }
    return sum / errors.length;
}

var Node = function(size) {
    this.input = new Array(size);
    this.inputWeights = new Array(size);
    this.output = null;
    this.isFrozen = false;
    this.error = 0;
    this.delta = 0;
    this.inputWeightsChanges = zeros(size);
};

Node.prototype = {
    initWeights: function(weightFunction) {
        for (var i = 0; i < this.inputWeights.length; i++) {
            this.inputWeights[i] = weightFunction();
        }
    },
    adjustWeights: function(learningRate, momentum) {
        for (var i = 0; i < this.inputWeights.length; i++) {
            if (!this.isFrozen) {
                var change = learningRate * this.delta * this.input[i] + this.inputWeightsChanges[i] * momentum;
                this.inputWeightsChanges[i] = change;
                this.inputWeights[i] += change;
            }
        }
    }
};

var HiddenNode = function(size) {
    this.node = new Node(size);
};

HiddenNode.prototype = {
    feedForward: function(input, activationFunction) {
        var sum = 0;
        for (var j = 0; j < this.node.inputWeights.length; j++) {
            sum += this.node.inputWeights[j] * input[j];
        }
        this.node.input = input;
        this.node.output = activationFunction(sum);
    },
    adjustWeights: function(learningRate, momentum) {
        this.node.adjustWeights(learningRate, momentum);
    }
};

var ChildNode = function(size) {
    this.node = new Node(size);
    this.hiddenNodes = [];
    this.hiddenNodesWeights = [];
    this.hiddenNodesWeightsChanges = zeros(size);
};

ChildNode.prototype = {
    feedForward: function(input, activationFunction) {
        this.hiddenNodes.forEach(function(hiddenNode) {
            hiddenNode.feedForward(input, activationFunction);
        });
        var sum = 0;
        for (var i = 0; i < this.hiddenNodesWeights.length; i++) {
            sum += this.hiddenNodesWeights[i] * this.hiddenNodes[i].node.output;
        }
        for (var j = 0; j < this.node.inputWeights.length; j++) {
            sum += this.node.inputWeights[j] * input[j];
        }
        this.node.input = input;
        this.node.output = activationFunction(sum);
    },
    calculateDelta: function(output, activationDerivative) {
        for (var i = 0; i < this.hiddenNodes.length; i++) {
            if (!this.hiddenNodes[i].node.isFrozen) {
                this.hiddenNodes[i].node.error = this.node.delta * this.hiddenNodesWeights[i];
                this.hiddenNodes[i].node.delta = this.hiddenNodes[i].node.error * activationDerivative(output);
            }
        }
    },
    adjustWeights: function(learningRate, momentum) {
        this.hiddenNodes.forEach(function(hiddenNode) {
            if (!hiddenNode.node.isFrozen) {
                hiddenNode.adjustWeights(learningRate, momentum);
            }
        });

        this.node.adjustWeights(learningRate, momentum);

        for (var i = 0; i < this.hiddenNodesWeights.length; i++) {
            if (!this.hiddenNodes[i].node.isFrozen) {
                var change = learningRate * this.delta * this.hiddenNodes[i].node.output + this.hiddenNodesWeightsChanges[i] * momentum;
                this.hiddenNodesWeightsChanges[i] = change;
                this.hiddenNodesWeights[i] += change;
            }
        }
    }
};

var RootNode = function(size) {
    this.node = new Node(size);
    this.childNodes = [];
    this.childNodesWeights = [];
    this.childNodesWeightsChanges = [];

    this.node.initWeights(randomBipolar);
};

RootNode.prototype = {
    feedForward: function(input, activationFunction) {
        this.childNodes.forEach(function(childNode) {
            childNode.feedForward(input, activationFunction);
        });
        var sum = 0;
        for (var i = 0; i < this.childNodesWeights.length; i++) {
            sum += this.childNodesWeights[i] * this.childNodes[i].node.output;
        }
        for (var j = 0; j < this.node.inputWeights.length; j++) {
            sum += this.node.inputWeights[j] * input[j];
        }
        this.node.input = input;
        this.node.output = activationFunction(sum);
    },
    calculateDelta: function(output, activationDerivative) {
        this.node.error = this.node.output - output;
        this.node.delta = this.node.error * activationDerivative(output);

        for (var i = 0; i < this.childNodes.length; i++) {
            if (!this.childNodes[i].node.isFrozen) {
                this.childNodes[i].node.error = this.node.delta * this.childNodesWeights[i];
                this.childNodes[i].node.delta = this.childNodes[i].node.error * activationDerivative(output);
                this.childNodes[i].calculateDelta(output, activationDerivative);
            }
        }
    },
    adjustWeights: function(learningRate, momentum) {
        this.childNodes.forEach(function(childNode) {
            if (!childNode.node.isFrozen) {
                childNode.adjustWeights(learningRate, momentum);
            }
        });

        this.node.adjustWeights(learningRate, momentum);

        for (var i = 0; i < this.childNodesWeights.length; i++) {
            if (!this.childNodes[i].node.isFrozen) {
                var change = learningRate * this.delta * this.childNodes[i].node.output + this.childNodesWeightsChanges[i] * momentum;
                this.childNodesWeightsChanges[i] = change;
                this.childNodesWeights[i] += change;
            }
        }
    }
};

var Network = function(size, options) {
    options = options || {};
    this.rootNode = new RootNode(size);
    this.activationFunction = options.activationFunction || sigmoid;
    this.activationDerivative = options.activationDerivative || sigmoidDerivative;
    this.learningRate = options.learningRate || 0.1;
    this.momentum = options.momentum || 0.5;
    this.iterations = options.iterations || 1000;
};

Network.prototype = {
    getInformationGain: function() {

    },
    trainWithBackpropagation: function(data) {
        var learn = function (input, output) {
            this.rootNode.feedForward(input, this.activationFunction);
            this.rootNode.calculateDelta(output, this.activationDerivative);
            this.rootNode.adjustWeights(this.learningRate, this.momentum);
        }.bind(this);

        var errorSum = 0;
        for(var i = 0; i < this.iterations; i++) {
            data.forEach(function(datum) {
                learn(datum.input, datum.output);
                errorSum += this.rootNode.node.error;
            }.bind(this));
            var globalError = errorSum / data.length;
            console.log(globalError);
        }
    },
    run: function(input) {
        this.rootNode.feedForward(input, this.activationFunction);
    }
};

var DMP = function(data) {
    var inputSize = data[0].input.length;
    var hiddenNodesNumber = 0;
    var networkCopies = [];
    for (var i = 0; i < 3; i++) {
        networkCopies.push(new Network(inputSize));
        networkCopies[i].trainWithBackpropagation(data);
    }
    console.log();
};

var data = [];
for(var i = -2500; i < 2500; i += 5) {
    data.push({
        input: [i / 2500, i / 2500],
        output: i > 0 ? 1 : 0
    });
}

data = _.shuffle(data);

var net = new Network(2);
net.trainWithBackpropagation(data);
net.run([500 / 2500, 500 / 2500]);

console.log(net.rootNode.node.output);