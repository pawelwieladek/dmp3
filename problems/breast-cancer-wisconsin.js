var Q = require('q');
var fs = require('fs');
var path = require("path");
var parse = require("csv-parse");
var _ = require("underscore");
var colors = require("colors/safe");

var Network = require("../network/network");
var Dmp3 = require("../network/dmp3");
var logger = require("../network/utils").logger;

function Problem(options) {
    this.dataTrain = [];
    this.dataTest = [];
    this.maxValue = 0;
    this.backpropagationIterations = options.backpropagationIterations;
    this.informationGainTrainIterations = options.informationGainTrainIterations;
    this.lazyTrainInnerTrainIterations = options.lazyTrainInnerTrainIterations;
    this.lazyTrainMaximumTries = options.lazyTrainMaximumTries;
    this.denormalize = function(val) {
        return (val > 0.5) ? 1.0 : 0.0;
    };

    this.datasetFile = options.datasetFile;
    this.inputClasses = [];
}

Problem.prototype = {
    readDatasetFile: function() {
        return Q.nfcall(fs.readFile, path.join(__dirname, this.datasetFile), "utf-8");
    },
    parseCsv: function(content) {
        return Q.nfcall(parse, content, { columns: true, skip_empty_lines: true });
    },
    preFormatData: function(dataset) {
        return Q.fcall(function() {
            return _.map(dataset, function(pattern) {
                return _.values(pattern).map(function(val) { return val; } );
            });
        }.bind(this));
    },
    getInputClasses: function(dataset) {
        return Q.fcall(function() {
            for(var i = 0; i < dataset[0].length; i++)
            {
                var attributeClasses = _.map(dataset, function(x) { return x[i] }.bind(this));
                this.inputClasses[i] = _.uniq(attributeClasses);
                if(this.inputClasses[i].length > this.maxValue) {
                    this.maxValue = this.inputClasses[i].length;
                }
            }
            return dataset;
        }.bind(this));
    },
    normalizeData: function(dataset) {
        return Q.fcall(function() {
            return _.map(dataset, function(pattern) {
                var data = {
                    input: []
                };
                for(var i = 0; i < pattern.length; i++)
                {
                    // get class index
                    var classIndex = _.indexOf(this.inputClasses[i],pattern[i]);

                    // store in output or input property
                    if(i == (pattern.length - 1)) {
                        data.output = classIndex;
                    } else {
                        // split attribute into multiple inputs of number matching input classes
                        // all inputs are 0 and current class input gets value of 1
                        this.inputClasses[i].forEach(function(inputClass, index){
                            if (index == classIndex) {
                                data.input.push(1);
                            } else {
                                data.input.push(0);
                            }
                        }.bind(this));
                        //data.input.push = (classIndex / (this.inputClasses[i].length -1));
                    }
                }
                return data;
            }.bind(this));
        }.bind(this));
    },
    segmentData: function(dataset) {
        return Q.fcall(function() {
            dataset = _.shuffle(dataset);
            this.dataTrain = dataset.slice(0,(dataset.length / 10) * 9);
            this.dataTest = dataset.slice((dataset.length / 10) * 9);
        }.bind(this));
    },
    trainNetwork: function() {
        return Q.fcall(function() {
            logger.d(colors.blue("### DMP started ###"));

            var dmp3 = new Dmp3({
                backpropagationIterations: this.backpropagationIterations,
                informationGainTrainIterations: this.informationGainTrainIterations,
                lazyTrainInnerTrainIterations: this.lazyTrainInnerTrainIterations,
                lazyTrainMaximumTries: this.lazyTrainMaximumTries
            });

            var network = dmp3.learn(this.dataTrain);

            this.backpropagationIterations = dmp3.backpropagationIterations;
            this.informationGainTrainIterations = dmp3.informationGainTrainIterations;
            this.lazyTrainInnerTrainIterations = dmp3.lazyTrainInnerTrainIterations;
            this.lazyTrainMaximumTries = dmp3.lazyTrainMaximumTries;

            logger.d(colors.blue("### Training finished ###"));
            logger.d(colors.magenta("Network structure: " + network.rootNode.toString()));

            return network;
        }.bind(this));
    },
    testNetwork: function(network) {
        return Q.fcall(function() {
            var results = [];
            var positive = 0;
            var negative = 0;
            this.dataTest.forEach(function(datum) {
                var output = network.run(datum.input);
                var expected = datum.output;
                if(this.denormalize(output) == expected) {
                    positive++;
                } else {
                    negative++;
                }
                results.push({
                    outputAccurate: output,
                    outputDenormalized: this.denormalize(output),
                    expected: expected
                });
            }.bind(this));
            var accuracy = (positive / (positive + negative));

            logger.v(colors.white("backpropagationIterations: " + this.backpropagationIterations));
            logger.v(colors.white("informationGainTrainIterations: " + this.informationGainTrainIterations));
            logger.v(colors.white("lazyTrainInnerTrainIterations: " + this.lazyTrainInnerTrainIterations));
            logger.v(colors.white("lazyTrainMaximumTries: " + this.lazyTrainMaximumTries));
            logger.v(colors.magenta("Network structure: " + network.rootNode.toString()));
            logger.v(colors.cyan("Network nodes number: " + network.rootNode.countNodes()));
            logger.v(colors.green("Network accuracy: " + accuracy));
            logger.d(colors.white("Number of results: " + results.length));
            logger.d(colors.grey("=== Results ==="));
            logger.d("outputAccurate,outputDenormalized,expected");
            results.forEach(function(result) {
                logger.d(result.outputAccurate + "," + result.outputDenormalized + "," + result.expected);
            });

            return {
                structure: network.rootNode.countNodes(),
                accuracy: accuracy
            };
        }.bind(this));
    },
    solve: function() {
        return this.readDatasetFile()
            .then(this.parseCsv.bind(this))
            .then(this.preFormatData.bind(this))
            .then(this.getInputClasses.bind(this))
            .then(this.normalizeData.bind(this))
            .then(this.segmentData.bind(this))
            .then(this.trainNetwork.bind(this))
            .then(this.testNetwork.bind(this))
            .fail(function(err) {
                logger.d(err);
            })
    }
};

module.exports = Problem;