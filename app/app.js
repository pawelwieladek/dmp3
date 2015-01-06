var _ = require("underscore");
var Network = require("../network/network");

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

for(var i = -totalData; i < totalData; i++) {
    data.push({
        input: normalizeInput(i),
        output: identity(i)
    });
}

data = _.shuffle(data);

var net = new Network();
net.rootNode.childrenLayer.addChildrenNodes(data[0].input.length);
net.train(data);

var result = net.run(normalizeInput(-5));

console.log(result);