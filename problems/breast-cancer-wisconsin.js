var Q = require('q');
var fs = require('fs');
var path = require("path");
var parse = require("csv-parse");
var _ = require("underscore");

var Network = require("../network/network");
var Dmp3 = require("../network/dmp3");

function Problem(options) {
    this.dataTrain = [];
    this.dataTest = [];
    this.globalError = [];
    this.maxValue = 0;
    this.normalize = function(val) {
        return (val / (1.2 * this.maxValue)) + 0.001;
    };
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
                        // normalize class index to match valid range
                        data.input[i] = (classIndex / (this.inputClasses[i].length -1));
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
            dmp3 = new Dmp3();
            network = dmp3.learn(this.dataTrain);
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
            console.log(results);
            console.log("Network accuracy: " + accuracy);
            return results;
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
                console.log(err);
            })
    }
};

module.exports = Problem;