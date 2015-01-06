var _ = require("underscore");
var Network = require("../network/network");

var data = [];
var totalData = 100;

var normalizeInput = function(input) {
    return [input / totalData];
};

var determineSign = function(input) {
    return input > 0 ? 1 : -1;
};

var identity = function(input) {
    return input / totalData;
};

for(var i = -totalData; i < totalData; i++) {
    data.push({
        input: normalizeInput(i),
        output: determineSign(i)
    });
}

data = _.shuffle(data);

var net = new Network();
net.train(data);

var result = net.run(normalizeInput(9));

console.log(result);

// test information gain with example of O's and X's from DMP3 description
console.log("---Information Gain tests---");
data = [];
for(var i = 0; i < 13; i ++) {
    data.push({
        input: 0.0,
        output: 1.0,
        network: 1.0
    });
}
for(var j = 0; j < 25; j ++) {
    data.push({
        input: 0.0,
        output: 1.0,
        network: 0.0
    });
}
for(var k = 0; k < 7; k ++) {
    data.push({
        input: 0.0,
        output: 0.0,
        network: 0.0
    });
}
console.log("DMP3 example of O's and X's: " + net.getInformationGain(data));