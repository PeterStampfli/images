export const gosUtils = {};


// convert integer to string, make that string has at least 3 chars

gosUtils.toString = function(i) {
    let result = i + "";
    if (result.length === 1) {
        result = "  " + result;
    } else if (result.length === 2) {
        result = " " + result;
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
    console.log("array, size: "+size);
    const limit = Math.min(logItemLimit, size);
    for (var j = 0; j < limit; j++) {
        const base = size * j;
        let line = gosUtils.toString(j) + ": ";
        for (var i = 0; i < limit; i++) {
        	if ((i%5===0)&&(i>0)){
        		line+=" |";
        	}
            line += " " + gosUtils.toString(array[i + base]);
        }
        console.log(line);
    }
};


/**
 * fill a square array with numbers that are functions of the indices, module 256
 * @method gosUtils#fillArray
 * @param {array} array
 * @param {function} fun
 */
gosUtils.fillArray = function(array, fun) {
    const size = Math.floor(Math.sqrt(array.length + 0.1));
    let index = 0;
    for (var j = 0; j < size; j++) {

        for (var i = 0; i < size; i++) {
            array[index] = fun(i, j)&255;
            index += 1;
        }
    }
};