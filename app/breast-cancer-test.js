var Problem = require("../problems/breast-cancer");

console.log("Breast Cancer tests");

var BreastCancer = new Problem({ datasetFile: "../resources/breast-cancer.csv" });
BreastCancer.solve();