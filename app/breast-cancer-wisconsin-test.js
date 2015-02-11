var argv = require('yargs').argv;
var colors = require("colors/safe");

var Problem = require("../problems/breast-cancer-wisconsin");

argv.i = argv.i || 1;
argv.j = argv.j || 1;
argv.k = argv.k || 1;

var results = {
    structure: [],
    accuracy: []
};

function loop(iterator, limit) {
    if (iterator >= limit) {
        var averageStructure = results.structure.reduce(function(a, b) { return a + b; }) / results.structure.length;
        var averageAccuracy = results.accuracy.reduce(function(a, b) { return a + b; }) / results.accuracy.length;
        console.log(averageAccuracy + "," + averageStructure);
        return;
    }

    var problem = new Problem({
        backpropagationIterations: argv.k,
        informationGainTrainIterations: argv.j,
        lazyTrainInnerTrainIterations: argv.j,
        lazyTrainMaximumTries: argv.j,
        datasetFile: "../resources/breast-cancer-wisconsin.csv"
    });
    problem.solve().then(function(output) {
        results.structure.push(output.structure);
        results.accuracy.push(output.accuracy);
        loop(iterator + 1, limit);
    });
}

loop(0, argv.i);