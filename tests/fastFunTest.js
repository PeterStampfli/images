/**
 * time a scalar function of a scalar argument. Logs execution time for given number of calls.
 * @function funTestTiming
 * @param {function} fun - fun(x) returning a float, x is float
 * @param {float} start - lower bound of intervall of test values
 * @param {float} end - upper bound of intervall of test values
 * @param {integer} nSteps - number of function evaluations
 */
function funTestTiming(fun, start, end, nSteps) {
    "use strict";
    var step = (end - start) / nSteps;
    var x, sum;
    var message = nSteps + " function evals";
    x = start;
    sum = 0;
    console.time(message);
    while (x <= end) {
        sum += fun(x);
        x += step;
    }
    console.timeEnd(message);
}

/**
 * check for maximum absolute error difference, comparing two functions
 * @function funTestAbsError
 * @param {function} fun1 - fun(x) returning a float, x is float
 * @param {function} fun2 - fun(x) returning a float, x is float
 * @param {float} start - lower bound of intervall of test values
 * @param {float} end - upper bound of intervall of test values
 * @param {integer} nSteps - number of function evaluations
 */
function funTestAbsError(fun1, fun2, start, end, nSteps) {
    var x = start;
    var xMax = -11111111;
    var absError = 0;
    var absErrorMax = -1;
    var step = (end - start) / nSteps;
    while (x <= end) {
        absError = Math.abs(fun1(x) - fun2(x));
        if (absError > absErrorMax) {
            absErrorMax = absError;
            xMax = x;
        }
        x += step;
    }
    console.log("max absolute error: " + absErrorMax + " at " + xMax);
}

/**
 * check for maximum relative error difference, comparing two functions
 * @function funTestRelError
 * @param {function} fun1 - fun(x) returning a float, x is float
 * @param {function} fun2 - fun(x) returning a float, x is float
 * @param {float} start - lower bound of intervall of test values
 * @param {float} end - upper bound of intervall of test values
 * @param {integer} nSteps - number of function evaluations
 */
function funTestRelError(fun1, fun2, start, end, nSteps) {
    "use strict";
    var x = start;
    var xMax = -11111111;
    var relError = 0;
    var relErrorMax = -1;
    var step = (end - start) / nSteps;
    var val1, val2;
    while (x <= end) {
        val1 = fun1(x);
        val2 = fun2(x);
        relError = 2 * Math.abs(val1 - val2) / (Math.abs(val1) + Math.abs(val2));
        if (relError > relErrorMax) {
            relErrorMax = relError;
            xMax = x;
        }
        x += step;
    }
    console.log("max relative error: " + relErrorMax + " at " + xMax);
}

/**
 * comparing two functions, results logged at each data point
 * @function funTestAbsError
 * @param {function} fun1 - fun(x) returning a float, x is float
 * @param {function} fun2 - fun(x) returning a float, x is float
 * @param {float} start - lower bound of intervall of test values
 * @param {float} end - upper bound of intervall of test values
 * @param {integer} nSteps - number of function evaluations
 */
function funTestCompare(fun1, fun2, start, end, nSteps) {
    "use strict";
    var x = start;
    var step = (end - start) / nSteps;
    var val1, val2, error;
    console.log("compare:  x, first function, second function, error");
    while (x <= end + 0.01) {
        val1 = fun1(x);
        val2 = fun2(x);
        error = val1 - val2;
        console.log(x.toPrecision(3) + " " + val1.toPrecision(3) +
            " " + val2.toPrecision(3) +
            " " + error.toPrecision(3));
        x += step;
    }
}

/**
 * log a function at each data point
 * @function funTestLog
 * @param {function} fun - fun(x) returning a float, x is float
 * @param {float} start - lower bound of intervall of test values
 * @param {float} end - upper bound of intervall of test values
 * @param {integer} nSteps - number of function evaluations
 */
function funTestLog(fun, start, end, nSteps) {
    "use strict";
    var x = start;
    var step = (end - start) / nSteps;
    console.log("logging:  x, function");
    while (x <= end + 0.01) {
        console.log(x.toPrecision(3) + " " + fun(x).toPrecision(3));
        x += step;
    }

}
