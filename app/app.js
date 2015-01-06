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