var _ = require("underscore");
var Problem = require("../problems/heart");

console.log("Heart tests");

var BreastCancer = new Problem({
    datasetFile: "../resources/heart.csv"
});
BreastCancer.solve();