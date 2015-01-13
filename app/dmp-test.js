var _ = require("underscore");
var Network = require("../network/network");
var Dmp3 = require("../network/dmp3");

//console.log("Information Gain tests");
//
//// test information gain with example of O's and X's from DMP3 description
//data = [];
//for(i = 0; i < 13; i++) {
//    data.push({
//        input: 0.0,
//        output: 1.0,
//        network: 1.0
//    });
//}
//for(i = 0; i < 25; i++) {
//    data.push({
//        input: 0.0,
//        output: 1.0,
//        network: 0.0
//    });
//}
//for(i = 0; i < 7; i++) {
//    data.push({
//        input: 0.0,
//        output: 0.0,
//        network: 0.0
//    });
//}
//var network = new Network();
//network.train(data);
//result = network.getInformationGain(data);
//network = null;
//console.log("Expected: 0.085");
//console.log("Actual: " + result);

console.log("DMP3 learn tests");
var i;
var data = [];
var totalData = 10;

var normalizeInput = function(input) {
    return [input / totalData];
};

var determineSign = function(input) {
    return input > 0 ? 1.0 : 0.0;
};

var identity = function(input) {
    return input / totalData;
};

for(i = -totalData; i < totalData; i++) {
    data.push({
        input: normalizeInput(i),
        output: determineSign(i)
    });
}

data = _.shuffle(data);

dmp3 = new Dmp3();
network = dmp3.learn(data);
result = network.run(normalizeInput(9));
console.log("Expected: 1");
console.log("Actual: " + result);
result = network.run(normalizeInput(-9));
console.log("Expected: 0");
console.log("Actual: " + result);
