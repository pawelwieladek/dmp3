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

module.exports.randomRange = function randomRange(min, max) {
    return Math.random() * (max - min) + min;
};

module.exports.randomBipolar = function randomBipolar() {
    return module.exports.randomRange(-0.5, 0.5);
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

module.exports.information = function information(p, n) {
    var result = -( (p / (p + n)) * this.log(2, p / (p + n)) + (n / (p + n)) * this.log(2, n / (p + n)) );
    return result;
};

module.exports.informationPartition = function informationPartition(p_high, n_high, p_low, n_low) {
    var p = p_high + p_low;
    var n = n_high + n_low;
    var result = ((p_high + n_high) / (p + n)) * this.information(p_high, n_high) + ((p_low + n_low) / (p + n)) * this.information(p_low, n_low);
    return result;
};

module.exports.informationGain = function informationGain(p_high, n_high, p_low, n_low) {
    var p = p_high + p_low;
    var n = n_high + n_low;
    var result = this.information(p, n) - this.informationPartition(p_high, n_high, p_low, n_low);
    return result;
};

module.exports.log = function log(base, n) {
    if(n == 0) {
        return 0;
    }
    var result = Math.log(n) / Math.log(base);
    return result;
};