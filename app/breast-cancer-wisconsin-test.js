var _ = require("underscore");
var Problem = require("../problems/breast-cancer-wisconsin");

console.log("Breast Cancer Wisconsin tests");

var BreastCancer = new Problem({
    datasetFile: "../resources/breast-cancer-wisconsin.csv"
});
BreastCancer.solve();