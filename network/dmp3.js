var Utils = require("./utils");
var Network = require("./network");

var Dmp3 = function(options) {
    options = options || {};
    // configuration
    this.informationGainTrainIterations = 1000;
    this.lazyTrainInnerTrainIterations = 10;
    this.lazyTrainMaximumTries = 20;
};

Dmp3.prototype.learn = function(data) {
    // test calls
    var net = new Network();
    this.improvementDrivenTraining(net,data);
};

/**
 * Improvement driven training aka "IDT"
 * Is used to train new children when they are added to DMP3 network.
 * @param currentNetwork
 * @param data
 */
Dmp3.prototype.improvementDrivenTraining = function(currentNetwork,data) {
    currentNetwork.informationGainTrain(data,this.informationGainTrainIterations);
    currentNetwork = this.lazyTrain(currentNetwork,data,this.lazyTrainInnerTrainIterations,this.lazyTrainMaximumTries);
    return currentNetwork;
};

/**
 * Trains cloned instances of current network to find the best one
 *
 * @param currentNetwork
 * @param data
 * @param iterations
 * @param maxtries
 */
Dmp3.prototype.lazyTrain = function(currentNetwork, data, iterations,maxtries) {
    // initialize best network with current
    var bestNetwork = currentNetwork.clone();
    // perform training maxtries times
    for(var i = 0; i < maxtries; i++)
    {
        // train currentNetwork
        currentNetwork.informationGainTrain(data,iterations);
        // check if trained network has better information gain than bestNetwork
        if(currentNetwork.getInformationGain(data) > bestNetwork.getInformationGain(data))
        {
            // update bestNetworm with currentNetwork
            bestNetwork = currentNetwork.clone();
            i = 0;
        }
    }
    return bestNetwork;
};

module.exports = Dmp3;