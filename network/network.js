var Utils = require("./utils");
var RootNode = require("./root-node");

var Network = function(options) {
    options = options || {};
    this.rootNode = new RootNode();
    this.activationFunction = options.activationFunction || Utils.sigmoid;
    this.activationDerivative = options.activationDerivative || Utils.sigmoidDerivative;
    this.learningRate = options.learningRate || 0.01;
    this.momentum = options.momentum || 0.01;
    this.iterations = options.iterations || 1;
};

Network.prototype.train = function(data) {
    var i;

    var inputSize = data[0].input.length;
    this.rootNode.initializeInput(inputSize);

    for(i = 0; i < this.iterations; i++) {
        data.forEach(function (datum) {
            this.learn(datum.input, datum.output);
        }.bind(this));
    }
};

Network.prototype.learn = function(input, output) {
    this.rootNode.feedForward(input, this.activationFunction);
    this.rootNode.calculateDelta(output, this.activationDerivative);
    this.rootNode.adjustWeights(this.learningRate, this.momentum);
};

Network.prototype.backpropagateError = function(error) {
    this.rootNode.calculateDeltaForError(error, this.activationDerivative);
    this.rootNode.adjustWeights(this.learningRate, this.momentum);
};

Network.prototype.run = function(input) {
    this.rootNode.feedForward(input, this.activationFunction);
    if(isNaN(this.rootNode.output)) {
        return this.rootNode.output;
    }
    return this.rootNode.output;
};

Network.prototype.freeze = function() {
    this.rootNode.freezeRecursive();
};

/**
 * Information gain needs to know the partition of results for current data set
 * We calculate partition of good & bad classification for first & second class
 * @param data
 * @returns {{p_high: number, n_high: number, p_low: number, n_low: number}}
 */
Network.prototype.getNetworkPartition = function(data) {
    this.rootNode.initializeInput(data[0].input.length);
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
    // set of examples incorrectly classified by the network
    var InCorrectlyClassifiedExamples = [];
    // iterate all examples
    var iteration = 1;
    data.forEach(function(datum) {
        // get target class expected by the example
        var expectedOutput = datum.output;
        // calculate network classification for the example input
        // datum.network is optional property used for mocking network output
        var networkOutput = this.denormalize((datum.hasOwnProperty("network")) ? datum.network : this.run(datum.input));
        if(expectedOutput == firstClass) {
            // handle positive example
            if(networkOutput == firstClass) {
                // update count of high network outputs
                PositiveExamplesHighCount++;
            } else if (networkOutput == secondClass) {
                // update count of low network outputs
                PositiveExamplesLowCount++;
                // store incorrectly classified example
                InCorrectlyClassifiedExamples.push({datum: datum, networkOutput: networkOutput});
            } else {
                console.log("Expected example output not within expected classes.");
            }
        } else if(expectedOutput == secondClass) {
            // handle negative example
            if(networkOutput == firstClass) {
                // update count of high network outputs
                NegativeExamplesHighCount++;
                // store incorrectly classified example
                InCorrectlyClassifiedExamples.push({datum: datum, networkOutput: networkOutput});
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

    return {
        positiveExamplesHighCount: PositiveExamplesHighCount,
        negativeExamplesHighCount: NegativeExamplesHighCount,
        positiveExamplesLowCount: PositiveExamplesLowCount,
        negativeExamplesLowCount: NegativeExamplesLowCount,
        inCorrectlyClassifiedExamples: InCorrectlyClassifiedExamples,
        classes: classes
    };
};

Network.prototype.denormalize = function(output) {
    return (output > 0.5) ? 1.0 : 0.0;
};

/**
 * Gets current information gain using entropy for partition of results for current data set
 * @param data
 */
Network.prototype.getInformationGain = function(data) {
    var partition = this.getNetworkPartition(data);
    return Utils.informationGain(
        partition.positiveExamplesHighCount,
        partition.negativeExamplesHighCount,
        partition.positiveExamplesLowCount,
        partition.negativeExamplesLowCount
    );
};

/**
 *
 * @param data
 * @param iterations
 */
Network.prototype.informationGainTrain = function(data,iterations) {
    // train network for a given number of iterations
    for(var i = 0; i < iterations; i++)
    {
        // get current information gain for the network
        var currentEntropy = this.getInformationGain(data);
        var partition = this.getNetworkPartition(data);
        // get entropy of network with 1 less negative example error
        var negativeEntropy = 0;
        if(partition.negativeExamplesHighCount > 0) {
            negativeEntropy = Utils.informationGain(
                partition.positiveExamplesHighCount,
                partition.negativeExamplesHighCount - 1,
                partition.positiveExamplesLowCount,
                partition.negativeExamplesLowCount + 1
            );
        }
        // get entropy of network with 1 less positive example error
        var positiveEntropy = 0;
        if(partition.positiveExamplesLowCount > 0) {
            positiveEntropy = Utils.informationGain(
                partition.positiveExamplesHighCount + 1,
                partition.negativeExamplesHighCount,
                partition.positiveExamplesLowCount - 1,
                partition.negativeExamplesLowCount
            );
        }
        // get information gain for 1 less negative example error
        var negativeInformationGain = currentEntropy - negativeEntropy;
        // get information gain for 1 less positive example error
        var positiveInformationGain = currentEntropy - positiveEntropy;
        // perform normalization
        var normalizedValue = Math.max(negativeInformationGain,positiveInformationGain);
        var adjustedNegativeInformationGain = negativeInformationGain / normalizedValue;
        var adjustedPositiveInformationGain = positiveInformationGain / normalizedValue;
        // randomly permute training instances
        // var shuffledData = _.shuffle(data); //todo: what is the point?
        partition.inCorrectlyClassifiedExamples.forEach(function(example) {
            //error = CalcError(net, datum)
            var error = example.datum.output - example.networkOutput;
            if(example.datum.output == partition.classes[0]) {
                // positive example (expected class is first class / high)
                error *= adjustedPositiveInformationGain;
            } else {
                // negative example (expected class is second class / low)
                error *= adjustedNegativeInformationGain;
            }
            //console.log("informationGainTrain - error: " + error);
            //Update the nonfrozen weights with standard back propagation
            this.backpropagateError(error);
        }.bind(this));
    }
};

Network.prototype.clone = function clone() {
    return Utils.copy(this);
};

module.exports = Network;