var Utils = require("./utils");
var Network = require("./network");

var Dmp3 = function(options) {
    options = options || {};
    // configuration
    this.informationGainTrainIterations = 1000;
    this.lazyTrainInnerTrainIterations = 10;
    this.lazyTrainMaximumTries = 20;
};

/**
 * Learn network with DMP3 algorithm
 * @param data
 * @return Network
 */
Dmp3.prototype.learn = function(data) {
    // test calls
    //var net = new Network();
    //this.improvementDrivenTraining(net,data);

    /*
    the number of hidden nodes for new children.
     */
    var numberOfHiddenNodes = 0;

    /*
     start with a single node perceptron network
      */
    var currentNetwork = new Network();

    /*
    train 3 copies of the network
    and choose the trained network with the best information gain
     */
    // get initial information gain
    var currentInformationGain = currentNetwork.getInformationGain(data);
    // get 3 copies of the network
    var networks = [];
    for(var k = 0; k < 3; k++)
    {
        // get copy of currentNetwork
        networks.push(currentNetwork.clone());
    }
    networks.forEach(function(network){
        // train network
        network.train(data);
        // get information gain
        var networkInformationGain = network.getInformationGain(data);
        // check if information gain is better than in current network
        if(networkInformationGain > currentInformationGain)
        {
            // set current best network
            currentNetwork = network;
            currentInformationGain = networkInformationGain;
        }
    });
    networks = null;

    /*
     freeze the weights of parent_net (currentNetwork)
     */
    //todo: freezing

    var noImprovement = 0;

    do {

        var newNetwork = currentNetwork.clone();
        /*
         allocate a left and right child with h hidden nodes each
         connect each of these children to the root node of new_net
         */
        newNetwork.rootNode.expandWith(numberOfHiddenNodes);

        /*
         train 3 copies of new_net with IDT
         */
        // get initial information gain
        var newNetworkInformationGain = newNetwork.getInformationGain(data);
        // get 3 copies of the newNetwork
        networks = [];
        for(k = 0; k < 3; k++)
        {
            // get copy of newNetwork
            networks.push(newNetwork.clone());
        }
        networks.forEach(function(network){
            // train network
            network = this.improvementDrivenTraining(network,data);
            // get information gain
            var networkInformationGain = network.getInformationGain(data);
            // check if information gain is better than in new network
            if(networkInformationGain > currentInformationGain)
            {
                // set current best network as newNetwork
                newNetwork = network;
                newNetworkInformationGain = networkInformationGain;
            }
        }.bind(this));
        networks = null;

        // // check if new network information gain is better than in current network
        if(newNetworkInformationGain > currentInformationGain)
        {
            // set newNetwork as current network
            currentNetwork = newNetwork;
            currentInformationGain = newNetworkInformationGain;
            noImprovement = 0;
            /*
             freeze the weights of parent_net (currentNetwork)
             */
            //todo: freezing
        } else {
            noImprovement += 1;
            numberOfHiddenNodes += 1;
        }

    } while(noImprovement < 3);

    // return learned network
    return currentNetwork;

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