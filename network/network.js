var Utils = require("./utils");
var RootNode = require("./root-node");

var Network = function(options) {
    options = options || {};
    this.rootNode = new RootNode();
    this.activationFunction = options.activationFunction || Utils.tanh;
    this.activationDerivative = options.activationDerivative || Utils.tanhDerivative;
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

/**
 * Information gain needs to know results for current data set
 * We calculate partition of good & bad classification for first & second class
 * Then using entropy we get current information gain
 * @param data
 */
Network.prototype.getInformationGain = function(data) {
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
    return Utils.informationGain(p_high,n_high,p_low,n_low);
};

/**
 * Improvement driven training aka "IDT"
 * Is used to train new children when they are added to DMP3 network.
 * @param data
 */
Network.prototype.improvementDrivenTraining = function(data) {
    var iterations = 1000;
    this.informationGainTrain(data,1000);
    this.lazyTrain(data,10,20);
};

/**
 *
 * @param iterations
 */
Network.prototype.informationGainTrain = function(data,iterations) {
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
};

/**
 *
 * @param iterations
 * @param maxtries
 */
Network.prototype.lazyTrain = function(iterations,maxtries) {

};

module.exports = Network;