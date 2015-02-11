var Network = require("./network");
var colors = require("colors/safe");
var logger = require("./utils").logger;

var Dmp3 = function(options) {
    // configuration
    this.backpropagationIterations = options.backpropagationIterations;
    this.informationGainTrainIterations = options.informationGainTrainIterations || 1; //default 1000
    this.lazyTrainInnerTrainIterations = options.lazyTrainInnerTrainIterations || 1; //default 10
    this.lazyTrainMaximumTries = options.lazyTrainMaximumTries || 1; //default 20
    this.mainIterations = options.mainIterations || 1; //default 3
};

/**
 * Learn network with DMP3 algorithm
 * @param data
 * @return Network
 */
Dmp3.prototype.learn = function(data) {
    var loopNumber = 0;
    logger.d(colors.white("DMP loop nr " + loopNumber++));

    /*
    the number of hidden nodes for new children.
     */
    var numberOfHiddenNodes = 0;

    /*
     start with a single node perceptron network
      */
    var currentNetwork = new Network({
        iterations: this.backpropagationIterations
    });

    this.backpropagationIterations = currentNetwork.iterations;

    logger.d(colors.magenta("Current network structure: " + currentNetwork.rootNode.toString()));

    /*
    train 3 copies of the network
    and choose the trained network with the best information gain
     */
    // get initial information gain
    var currentInformationGain = currentNetwork.getInformationGain(data);

    logger.d(colors.yellow("Current network information gain: " + currentInformationGain));

    // get 3 copies of the network
    var networks = [];
    for(var k = 0; k < this.mainIterations; k++)
    {
        // get copy of currentNetwork
        networks.push(currentNetwork.clone());
    }
    networks.forEach(function(network, index){
        // train network
        network.train(data);
        // get information gain
        var networkInformationGain = network.getInformationGain(data);

        logger.d(colors.yellow("Network clone " + (index + 1) + " information gain: " + networkInformationGain));

        // check if information gain is better than in current network
        if(networkInformationGain > currentInformationGain)
        {
            logger.d(colors.green("This clone is better than current network."));
            // set current best network
            currentNetwork = network;
            currentInformationGain = networkInformationGain;
        }
    });
    networks = null;

    /*
     freeze the weights of parent_net (currentNetwork)
     */
    currentNetwork.freeze();
    logger.d(colors.cyan("Freeze current network"));

    var noImprovement = 0;

    do {

        logger.d(colors.white("DMP loop nr " + loopNumber++));
        logger.d(colors.grey("Clone current network into new network"));
        var newNetwork = currentNetwork.clone();
        /*
         allocate a left and right child with h hidden nodes each
         connect each of these children to the root node of new_net
         */
        newNetwork.rootNode.expandWith(numberOfHiddenNodes);
        logger.d(colors.magenta("New network structure: " + newNetwork.rootNode.toString()));

        /*
         train 3 copies of new_net with IDT
         */
        // get initial information gain
        var newNetworkInformationGain = newNetwork.getInformationGain(data);
        logger.d(colors.yellow("New network information gain: " + newNetworkInformationGain));

        // get 3 copies of the newNetwork
        networks = [];
        for(k = 0; k < this.mainIterations; k++)
        {
            // get copy of newNetwork
            networks.push(newNetwork.clone());
        }
        networks.forEach(function(network, i){
            // train network
            network = this.improvementDrivenTraining(network,data);
            // get information gain
            var networkInformationGain = network.getInformationGain(data);

            logger.d(colors.yellow("New network clone " + (i + 1) + " information gain: " + networkInformationGain));

            // check if information gain is better than in new network
            if(networkInformationGain > currentInformationGain)
            {
                logger.d(colors.green("This clone is better than new network."));
                // set current best network as newNetwork
                newNetwork = network;
                newNetworkInformationGain = networkInformationGain;
            }
        }.bind(this));
        networks = null;

        // // check if new network information gain is better than in current network
        if(newNetworkInformationGain > currentInformationGain)
        {
            logger.d(colors.green("New network information gain is better than current network."));
            // set newNetwork as current network
            currentNetwork = newNetwork;
            currentInformationGain = newNetworkInformationGain;
            noImprovement = 0;
            numberOfHiddenNodes = 0;
            /*
             freeze the weights of parent_net (currentNetwork)
             */
            currentNetwork.freeze();
            logger.d(colors.cyan("Freeze current network"));
        } else {
            logger.d(colors.red("No improvement. Expand hidden nodes structure."));
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
            // update bestNetwork with currentNetwork
            bestNetwork = currentNetwork.clone();
            i = 0;
        }
    }
    return bestNetwork;
};

module.exports = Dmp3;