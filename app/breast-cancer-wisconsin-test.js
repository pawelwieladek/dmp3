var argv = require('yargs').argv;
var colors = require("colors/safe");

var Problem = require("../problems/breast-cancer-wisconsin");

console.log(colors.white("Breast Cancer Wisconsin tests"));
console.log("---");

argv.i = argv.i || 1;
argv.j = argv.j || 1;
argv.k = argv.k || 1;

for (var k = 0; k < argv.k; k++) {
    for (var j = 0; j < argv.j; j++) {
        for (var i = 1; i <= argv.i; i++) {
            var problem = new Problem({
                problemNumber: i,
                backpropagationIterations: k > 0 ? 10 * Math.pow(2, k) : 1,
                informationGainTrainIterations: 10 * Math.pow(2, j),
                lazyTrainInnerTrainIterations: Math.pow(2, j),
                lazyTrainMaximumTries: Math.pow(2, j),
                datasetFile: "../resources/breast-cancer-wisconsin.csv"
            });
            problem.solve();
        }
    }
}