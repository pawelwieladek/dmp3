var _ = require("underscore");
var Network = require("../network/network");

var i;
var data = [];
var totalData = 10;

var normalizeInput = function(input) {
    return [input / totalData];
};

var determineSign = function(input) {
    return input > 0 ? 1 : 0;
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

var net = new Network();

net.train(data);

console.log("Backpropagation tests");

var result;
result = net.run(normalizeInput(9));
console.log("Expected: 1");
console.log("Actual: " + result);
result = net.run(normalizeInput(-9));
console.log("Expected: 0");
console.log("Actual: " + result);