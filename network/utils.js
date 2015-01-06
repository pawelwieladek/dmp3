module.exports.tanh = function tanh(x) {
    if(x === Infinity) {
        return 1;
    } else if(x === -Infinity) {
        return -1;
    } else {
        var y = Math.exp(2 * x);
        if (y != Infinity) {
            return (y - 1) / (y + 1);
        } else {
            return 1;
        }
    }
};

module.exports.tanhDerivative = function tanhDerivative(x) {
    return 1 - Math.pow(x, 2);
};

module.exports.sigmoid = function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

module.exports.sigmoidDerivative = function sigmoidDerivative(x) {
    return (1 - x) * x;
}

module.exports.randomRange = function randomRange(min, max) {
    return Math.random() * (max - min) + min;
};

module.exports.randomBipolar = function randomBipolar() {
    return module.exports.randomRange(-0.5, 0.5);
};

module.exports.randomPositive = function randomBipolar() {
    return module.exports.randomRange(-0.0, 0.5);
};

module.exports.randomNegative = function randomBipolar() {
    return module.exports.randomRange(-0.5, 0.0);
};

module.exports.zeros = function zeros(size) {
    var array = new Array(size);
    for (var i = 0; i < size; i++) {
        array[i] = 0;
    }
    return array;
};

module.exports.randoms = function randoms(size, randomFunction) {
    var array = new Array(size);
    for (var i = 0; i < size; i++) {
        array[i] = randomFunction();
    }
    return array;
};