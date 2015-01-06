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

function I(p, n) {
    var result = -( (p / (p + n)) * log(2, p / (p + n)) + (n / (p + n)) * log(2, n / (p + n)) );
    return result;
}

function IP(p_high, n_high, p_low, n_low) {
    var p = p_high + p_low;
    var n = n_high + n_low;
    var result = ((p_high + n_high) / (p + n)) * I(p_high, n_high) + ((p_low + n_low) / (p + n)) * I(p_low, n_low);
    return result;
}

function InformationGain(p_high, n_high, p_low, n_low) {
    var p = p_high + p_low;
    var n = n_high + n_low;
    var result = I(p, n) - IP(p_high, n_high, p_low, n_low);
    return result;
}

function log(base, n) {
    if(n == 0) {
        return 0;
    }
    var result = Math.log(n) / Math.log(base);
    return result;
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

function sgn(x) {
    return (x > 0.0) ? 1.0 : -1.0;
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
    this.activationFunction = options.activationFunction || sgn;
    this.activationDerivative = options.activationDerivative || sgn;
    this.learningRate = options.learningRate || 0.1;
    this.momentum = options.momentum || 0.5;
    this.iterations = options.iterations || 1000;
};

Network.prototype = {
    /**
     * Information gain needs to know results for current data set
     * We calculate partition of good & bad classification for first & second class
     * Then using entropy we get current information gain
     * @param data
     */
    getInformationGain: function(data) {
        var classes = [1.0,0.0];
        var firstClass = classes[0];
        var secondClass = classes[1];
        // count of network output = "first class" for positive examples
        var PositiveExamplesHighCount = 0;
        // count of network output = "second class" for positive examples
        var PositiveExamplesLowCount = 0;
        // count of network output = "first class" for negative examples
        var NegativeExamplesHighCount = 0;
        // count of network output = "second class" for negative examples
        var NegativeExamplesLowCount = 0;
        // iterate all examples
        data.forEach(function(datum) {
            // get target class expected by the example
            var expectedOutput = datum.output;
            // calculate network classification for the example input
            // datum.network is optional property used for mocking network output
            var networkOutput = (datum.network !== "undefined") ? datum.network : run(datum.input);
            if(expectedOutput == firstClass) {
                // handle positive example
                if(networkOutput == firstClass) {
                    // update count of high network outputs
                    PositiveExamplesHighCount++;
                } else if (networkOutput == secondClass) {
                    // update count of low network outputs
                    PositiveExamplesLowCount++;
                } else {
                    console.log("Expected example output not within expected classes.");
                }
            } else if(expectedOutput == secondClass) {
                // handle negative example
                if(networkOutput == firstClass) {
                    // update count of high network outputs
                    NegativeExamplesHighCount++;
                } else if (networkOutput == secondClass) {
                    // update count of low network outputs
                    NegativeExamplesLowCount++;
                } else {
                    console.log("Expected example output not within expected classes.");
                }
            } else {
                console.log("Expected example output not within expected classes.");
            }
        }.bind(this));
        var p_high = PositiveExamplesHighCount;
        var n_high = NegativeExamplesHighCount;
        var p_low = PositiveExamplesLowCount;
        var n_low = NegativeExamplesLowCount;
        return InformationGain(p_high,n_high,p_low,n_low);
    },
    /**
     * Improvement driven training aka "IDT"
     * Is used to train new children when they are added to DMP3 network.
     * @param data
     */
    improvementDrivenTraining: function(data) {
        var iterations = 1000;
        this.informationGainTrain(data,1000);
        this.lazyTrain(data,10,20);
    },
    /**
     *
     * @param iterations
     */
    informationGainTrain: function(data,iterations) {
        // train network for a given number of iterations
        for(var i = 0; i < iterations; i++)
        {
            // get current information gain for the network
            var currentEntropy = this.getInformationGain(data);
            // get entropy of network with 1 less negative example error
            var negativeEntropy; // todo: implement
            // get entropy of network with 1 less positive example error
            var positiveEntropy; // todo: implement
            // get information gain for 1 less negative example error
            var negativeInformationGain = currentEntropy - negativeEntropy;
            // get information gain for 1 less positive example error
            var positiveInformationGain = currentEntropy - positiveEntropy;
            // perform normalization
            var normalizedValue = Math.max(negativeInformationGain,positiveInformationGain);
            var adjustedNegativeInformationGain = negativeInformationGain / normalizedValue;
            var adjustedPositiveInformationGain = positiveInformationGain / normalizedValue;
            // randomly permutate training instances
            // todo: implement
            //for each incorrectly classified example e in the training set
            //    error = CalcError(net, e)
            //    if e.target = high let error = error * pos_err_adjust
            //    else error = error * neg_err_adjust
            //    // Update the nonfrozen weights with standard back propagation
            //    UpdateNonfrozenWeights(net,error)
            //endfor
        }
    },
    /**
     *
     * @param iterations
     * @param maxtries
     */
    lazyTrain: function(iterations,maxtries) {

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
            //console.log(globalError);
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
    //console.log();
};

//var data = [];
//for(var i = -2500; i < 2500; i += 5) {
//    data.push({
//        input: [i / 2500, i / 2500],
//        output: i > 0 ? 1 : 0
//    });
//}

//data = _.shuffle(data);

var net = new Network(2);
//net.trainWithBackpropagation(data);
//net.run([1.0,1.0]);
//
//console.log(net.rootNode.node.output);

// test information gain with example of O's and X's
console.log("---Information Gain tests---");
data = [];
for(var i = 0; i < 13; i ++) {
    data.push({
        input: 0.0,
        output: 1.0,
        network: 1.0
    });
}
for(var j = 0; j < 25; j ++) {
    data.push({
        input: 0.0,
        output: 1.0,
        network: 0.0
    });
}
for(var k = 0; k < 7; k ++) {
    data.push({
        input: 0.0,
        output: 0.0,
        network: 0.0
    });
}
console.log("DMP3 example of O's and X's: " + net.getInformationGain(data));
