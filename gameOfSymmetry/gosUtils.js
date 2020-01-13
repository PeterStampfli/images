export const gosUtils = {};


// convert integer 0..255 to hex string

gosUtils.toString = function(i) {
    let result = i.toString(16);
    if (result.length === 1) {
        result = "0" + result;
    }
    return result;
};

const logItemLimit = 20;

/**
 * log a square array, limited
 * @method gosUtils.logArray
 * @param {array} array
 */
gosUtils.logArray = function(array) {
    const size = Math.floor(Math.sqrt(array.length + 0.1));
    console.log("array, size: " + size);
    const limit = Math.min(logItemLimit, size);
    for (var j = 0; j < limit; j++) {
        const base = size * j;
        let line = gosUtils.toString(j) + ": ";
        for (var i = 0; i < limit; i++) {
            if ((i % 5 === 0) && (i > 0)) {
                line += " |";
            }
            line += " " + gosUtils.toString(array[i + base]);
        }
        console.log(line);
    }
};