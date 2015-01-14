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
    var result = 1 / (1 + Math.exp(-x));
    if(isNaN(result)) {
        return result;
    }
    return result;
};

module.exports.sigmoidDerivative = function sigmoidDerivative(x) {
    var result = (1 - x) * x;
    if(isNaN(result)) {
        return result;
    }
    return result;
};

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

module.exports.information = function information(p, n) {
    if((p + n) == 0 || p == 0 || n == 0) {
        return 0;
    }
    var result = -( (p / (p + n)) * this.log(2, p / (p + n)) + (n / (p + n)) * this.log(2, n / (p + n)) );
    if(isNaN(result)) {
        return result;
    }
    return result;
};

module.exports.informationPartition = function informationPartition(p_high, n_high, p_low, n_low) {
    var p = p_high + p_low;
    var n = n_high + n_low;
    if((p + n) == 0 || (p_high + n_high) == 0 || (p_low + n_low) == 0) {
        return 0;
    }
    var result = ((p_high + n_high) / (p + n)) * this.information(p_high, n_high) + ((p_low + n_low) / (p + n)) * this.information(p_low, n_low);
    if(isNaN(result)) {
        return result;
    }
    return result;
};

module.exports.informationGain = function informationGain(p_high, n_high, p_low, n_low) {
    var p = p_high + p_low;
    var n = n_high + n_low;
    var result = this.information(p, n) - this.informationPartition(p_high, n_high, p_low, n_low);
    if(isNaN(result)) {
        return result;
    }
    return result;
};

module.exports.log = function log(base, n) {
    if(n == 0) {
        return 0;
    }
    var result = Math.log(n) / Math.log(base);
    return result;
};

/**
 *
 * @description
 * Creates a deep copy of `source`, which should be an object or an array.
 *
 * * If no destination is supplied, a copy of the object or array is created.
 * * If a destination is provided, all of its elements (for arrays) or properties (for objects)
 *   are deleted and then all elements/properties from the source are copied to it.
 * * If `source` is not an object or array (inc. `null` and `undefined`), `source` is returned.
 * * If `source` is identical to 'destination' an exception will be thrown.
 *
 * @returns {*} The copy or updated `destination`, if `destination` was specified.
 */
module.exports.copy = function copy(source, destination, stackSource, stackDest) {
    if (isWindow(source)) {
        console.log("Can't copy! Making copies of Window or Scope instances is not supported.");
    }

    if (!destination) {
        destination = source;
        if (source) {
            if (isArray(source)) {
                destination = copy(source, [], stackSource, stackDest);
            } else if (isRegExp(source)) {
                destination = new RegExp(source.source, source.toString().match(/[^\/]*$/)[0]);
                destination.lastIndex = source.lastIndex;
            } else if (isObject(source)) {
                var emptyObject = Object.create(Object.getPrototypeOf(source));
                destination = copy(source, emptyObject, stackSource, stackDest);
            }
        }
    } else {
        if (source === destination) console.log("Can't copy! Source and destination are identical.");

        stackSource = stackSource || [];
        stackDest = stackDest || [];

        if (isObject(source)) {
            var index = stackSource.indexOf(source);
            if (index !== -1) return stackDest[index];

            stackSource.push(source);
            stackDest.push(destination);
        }

        var result;
        if (isArray(source)) {
            destination.length = 0;
            for (var i = 0; i < source.length; i++) {
                result = copy(source[i], null, stackSource, stackDest);
                if (isObject(source[i])) {
                    stackSource.push(source[i]);
                    stackDest.push(result);
                }
                destination.push(result);
            }
        } else {
            var h = destination.$$hashKey;
            if (isArray(destination)) {
                destination.length = 0;
            } else {
                /*
                @author: Krzysztof Sobczak
                custom modification of Angular iteration over properties
                to delete destination object properties
                 */
                for (key in destination) {
                    if (destination.hasOwnProperty(key)) {
                        delete destination[key];
                    }
                }
            }
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    result = copy(source[key], null, stackSource, stackDest);
                    if (isObject(source[key])) {
                        stackSource.push(source[key]);
                        stackDest.push(result);
                    }
                    destination[key] = result;
                }
            }
            setHashKey(destination,h);
        }

    }
    return destination;
};

/**
 * Angular helper functions for copy implementation
 */

function setHashKey(obj, h) {
    if (h) {
        obj.$$hashKey = h;
    }
    else {
        delete obj.$$hashKey;
    }
}

var toString = Object.prototype.toString;

function isObject(value) {
    return value !== null && typeof value === 'object';
}

var isArray = Array.isArray;

function isRegExp(value) {
    return toString.call(value) === '[object RegExp]';
}

function isWindow(obj) {
    return obj && obj.window === obj;
}

/**
 * End of Angular helper functions
 */