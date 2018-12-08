/**
 * approximating functions with linear table interpolation and other math
 * @namespace Fast
 */

/* jshint esversion:6 */

const px = "px";

var Fast = {};

(function() {
    "use strict";

    /**
     * make a table of function values for linear interpolation
     * uses typed float32 arrays
     * @function makeTable
     * @memberof Fast
     * @param {float} start - the table starts here
     * @param {float} end - the table ends here
     * @param {integer} nIntervals - number of intervals between start and end
     * @param {function} theFunction - depends on x, make a table for this function
     * @return {array} array of floats, length is nIntervals+2 (required for "interpolation" at x===end)
     */
    Fast.makeTable = function(start, end, nIntervals, theFunction) {
        var step = (end - start) / nIntervals;
        var x = start;
        var nValues = nIntervals + 2;
        var table = new Float32Array(nValues);
        for (var i = 0; i < nValues; i++) {
            table[i] = theFunction(x);
            x += step;
        }
        return table;
    };


    /*
    preparing for the fast sine and cosine functions
    */
    var nIntervals = Math.round(Math.pow(2, 12));
    var nSinIntervalsM1 = nIntervals - 1;
    var sinTabFactor = nIntervals / 2 / Math.PI;
    const sinTable = Fast.makeTable(0, 2 * Math.PI, nIntervals, Math.sin);
    const cosTable = Fast.makeTable(0, 2 * Math.PI, nIntervals, Math.cos);

    /**
     * fast sin(x) function from interpolation
     * @function sin
     * @memberof Fast
     * @param {float} x
     * @return {float} the sine function value at x
     */
    Fast.sin = function(x) {
        var index;
        x *= sinTabFactor;
        index = Math.floor(x);
        x -= index;
        index = index & nSinIntervalsM1;
        const base = sinTable[index];
        return base + (sinTable[index + 1] - base) * x;
    };

    /**
     * fast cos(x) function from interpolation
     * @function cos
     * @memberof Fast
     * @param {float} x
     * @return {float} the cosine function value at x
     */
    Fast.cos = function(x) {
        var index;
        x *= sinTabFactor;
        index = Math.floor(x);
        x -= index;
        index = index & nSinIntervalsM1;
        const base = cosTable[index];
        return base + (cosTable[index + 1] - base) * x;
    };

    /**
     * pair of fast cos and sin function values from interpolation
     * use only if calculated very often (for each pixel)
     * @function cosSin
     * @memberof Fast
     * @param {float} x
     * @param {Vector2} v - unit vector at angle x, v.x =cos(x) and v.y=sin(x) values,
     */

    Fast.cosSin = function(x, v) {
        var index;
        x *= sinTabFactor;
        index = Math.floor(x);
        x -= index;
        index = index & nSinIntervalsM1;
        v.x = cosTable[index];
        v.x += (cosTable[index + 1] - v.x) * x;
        v.y = sinTable[index];
        v.y += (sinTable[index + 1] - v.y) * x;
    };

    /*
    preparing the fast exponential function
    */
    var expMaxArgument = Math.floor(Math.log(Number.MAX_VALUE)) + 1;
    var expMinArgument = Math.floor(Math.log(Number.MIN_VALUE));
    var expTabIntPartMaxIndex = expMaxArgument - expMinArgument;

    var expTabIntPart = Fast.makeTable(expMinArgument, expMaxArgument, expTabIntPartMaxIndex, Math.exp);
    nIntervals = 1000;
    var expTabFracFactor = nIntervals;
    var expTabFracPart = Fast.makeTable(0, 1, nIntervals, Math.exp);

    Fast.exp = function(x) {
        var indexToIntPart, indexToFractPart;
        indexToIntPart = Math.floor(x);
        x = expTabFracFactor * (x - indexToIntPart);
        indexToFractPart = Math.floor(x);
        x -= indexToFractPart;
        const fractPartBase = expTabFracPart[indexToFractPart++];
        return expTabIntPart[Math.max(0, Math.min(expTabIntPartMaxIndex, indexToIntPart - expMinArgument))] *
            (fractPartBase + (expTabFracPart[indexToFractPart] - fractPartBase) * x);
    };

    /*
    prepare the fast log function: table for values between 1 and 2
    */
    nIntervals = 1000;
    var logTabFactor = nIntervals;
    var logTable = Fast.makeTable(1, 2, nIntervals, Math.log);


    /**
     * fast log function, fallback to native log for large value, using inversion for small values
     * slower than native log for chrome, twice times faster for firefox
     * @function log
     * @memberof Fast
     * @param {float} x
     * @return {float} the log(x) value
     */
    Fast.log = function(x) {
        var index;
        var ln = 0;
        var iX;
        var iDiv = 1;
        if (x <= 0) {
            return NaN;
        }
        if (x < 1) {
            return -this.log(1 / x);
        }
        if (x >= 2147483647) { // 2**31-1
            return Math.log(x);
        }
        iX = Math.floor(x);
        if (iX >= 65536) {
            iX = iX >> 16;
            iDiv = iDiv << 16;
            ln = 11.090354;
        }
        if (iX >= 256) {
            iX = iX >> 8;
            iDiv = iDiv << 8;
            ln += 5.545177;
        }
        if (iX >= 16) {
            iX = iX >> 4;
            iDiv = iDiv << 4;
            ln += 2.772588;
        }
        if (iX >= 4) {
            iX = iX >> 2;
            iDiv = iDiv << 2;
            ln += 1.386294;
        }
        if (iX >= 2) {
            iX = iX >> 1;
            iDiv = iDiv << 1;
            ln += 0.693147;
        }
        x = (x / iDiv - 1) * logTabFactor;
        index = Math.floor(x);
        x -= index;
        const base = logTable[index];
        return ln + base + (logTable[index + 1] - base) * x;
    };

    /*
    prepare the fast atan2 function
    */
    nIntervals = 1000;
    var atanTabFactor = nIntervals;
    var atanTable = Fast.makeTable(0, 1, nIntervals, Math.atan);

    /**
     * the fast atan2 function (for polar coordinates)
     * @function atan2
     * @memberof Fast
     * @param {float} y - r*sin(atan2(y,x))
     * @param {float} x - r*cos(atan2(y,x))
     * @return {float} the atan2(y,x) value
     */

    // take care of (0,0)

    Fast.atan2 = function(y, x) {
        var index;
        if (x > 0) {
            if (y > 0) {
                if (x > y) {
                    x = atanTabFactor * y / x;
                    index = Math.floor(x);
                    x -= index;
                    const base = atanTable[index];
                    return base + (atanTable[index + 1] - base) * x;
                } else {
                    x = atanTabFactor * x / y;
                    index = Math.floor(x);
                    x -= index;
                    const base = atanTable[index];
                    return 1.5707963268 - (base + (atanTable[index + 1] - base) * x);
                }
            } else {
                if (y > -x) {
                    x = -atanTabFactor * y / x;
                    index = Math.floor(x);
                    x -= index;
                    const base = atanTable[index];
                    return -(base + (atanTable[index + 1] - base) * x);
                } else { // y<=-x<0
                    x = -atanTabFactor * x / y;
                    index = Math.floor(x);
                    x -= index;
                    const base = atanTable[index];
                    return -1.5707963268 + base + (atanTable[index + 1] - base) * x;
                }
            }
        } else if (x < 0) {
            if (y > 0) {
                if (x < -y) {
                    x = -atanTabFactor * y / x;
                    index = Math.floor(x);
                    x -= index;
                    const base = atanTable[index];
                    return 3.1415926536 - (base + (atanTable[index + 1] - base) * x);
                } else {
                    if (x > -Fast.epsilon) { // on the x-axis, y>0
                        return 1.5707963268;
                    }
                    x = -atanTabFactor * x / y;
                    index = Math.floor(x);
                    x -= index;
                    const base = atanTable[index];
                    return 1.5707963268 + base + (atanTable[index + 1] - base) * x;
                }
            } else {
                if (x < y) {
                    x = atanTabFactor * y / x;
                    index = Math.floor(x);
                    x -= index;
                    const base = atanTable[index];
                    return -3.1415926536 + base + (atanTable[index + 1] - base) * x;
                } else { // y<=x<0
                    x = atanTabFactor * x / y;
                    index = Math.floor(x);
                    x -= index;
                    const base = atanTable[index];
                    return -1.5707963268 - (base + (atanTable[index + 1] - base) * x);
                }
            }
        } else { // x=0 we are on the y-axis
            if (y >= 0) {
                return 1.5707963268;
            } else {
                return -1.5707963268;
            }
        }
    };

    /**
    * the original (slow) gauss function exp(-x * x)
	* @function originalGauss
	* @memberof Fast
	* @param {float} x
	* @return {float} the exp(-x * x) value

    */
    Fast.originalGauss = function(x) {
        return Math.exp(-x * x);
    };

    /*
    make the table for the gauss function exp(-x**2), x<4
    */

    nIntervals = 2000;
    var gaussTabFactor = 0.25 * nIntervals;
    var gaussTable = Fast.makeTable(0, 4, nIntervals, Fast.originalGauss);

    /**
     * look up gauss for small args, equal to zero for abs(x)>4
     * @function gauss
     * @memberof Fast
     * @param {float} x
     * @return {float} the exp(-x * x) value
     */
    Fast.gauss = function(x) {
        var index;
        x = Math.abs(x);
        if (x >= 4) {
            return 0;
        }
        x = gaussTabFactor * x;
        index = Math.floor(x);
        x -= index;
        const base = gaussTable[index];
        return base + (gaussTable[index + 1] - base) * x;
    };


    /**
     * return a value clamped between max and min  
     * @method Fast.clamp 
     * @para {int/float} min 
     * @para {int/float} x 
     * @para {int/float} max  
     */
    Fast.clamp = function(min, x, max) {
        return Math.max(min, Math.min(x, max));
    };

    /**
     * check if two numbers are equal
     * @method Fast.areEqual
     * @param {float} one
     * @param {float} two
     * @return true if both numbers are nearly equal (within epsilon)
     */
    Fast.epsilon = 0.001;
    Fast.areEqual = function(one, two) {
        return Math.abs(one - two) < Fast.epsilon;
    };

    /**
     * get last element of any array
     * @method Fast.last
     * @param {array} array
     * @return the last element
     */
    Fast.last = function(array) {
        return array[array.length - 1];
    };


    /**
     * scale an array of circles, or other objects with a scale(factor) method
     * @method Fast.scale
     * @param {ArrayOfCircle} circles - will be scaled
     * @param {float} factor
     */
    Fast.scale = function(circles, factor) {
        circles.forEach(circle => {
            circle.scale(factor);
        });
    };

    /**
     * update an array of lines, or other objects with an update-method
     * @method Fast.update
     * @param {ArrayOfLine} lines - their update method will be called
     */
    Fast.update = function(lines) {
        lines.forEach(line => {
            line.update();
        });
    };

    /**
     * log a small array 
     * @method Fast.logSmallArray
     * @param {Array} data
     * @param {integer} width - number of items in a row
     * @param {integer} height - number of rows
     */
    Fast.logSmallArray = function(data, width, height) {
        var out;

        console.log(width);
        for (var j = height - 1; j >= 0; j--) {
            out = j + ": ";
            for (var i = 0; i < width; i++) {
                out += " " + data[j * width + i];
            }
            console.log(out);
        }
    };

    /**
     * log an array of objects with a log() method
     * @method Fast.logArrayOfObjects
     * @param {String} message - or nothing
     */
    Fast.logArrayOfObjects = function(data, message) {
        if (message) {
            message += ": ";
        } else {
            message = "";
        }
        console.log(message + "Array:");
        const length = data.length;
        for (var i = 0; i < length; i++) {
            data[i].log("index " + i);
        }
        console.log("-------------END--------------");
    };


    /**
     * solve quadratic equation ax**2+bx+c=0
     * only for real solutions
     * solutions are in Fast.xLow and Fast.xHigh
     * @method Fast.quadraticEquation
     * @param {float} a
     * @param {float} b
     * @param {float} c
     * @param {Vector2} data - x and y fields are the lower and higher solutions, data.x < data.y
     * @return {boolean} true if there are real solutions
     */
    Fast.quadraticEquation = function(a, b, c, data) {
        const rootArg = b * b - 4 * a * c;
        if (rootArg < 0) {
            data.x = 0;
            data.y = 0;
            return false;
        }
        if (b > 0) {
            data.x = 0.5 * (-b - Math.sqrt(rootArg)) / a;
            data.y = c / a / data.x;
        } else {
            data.y = 0.5 * (-b + Math.sqrt(rootArg)) / a;
            data.x = c / a / data.y;
        }
        console.log(a * data.x * data.x + b * data.x + c);
        console.log(a * data.y * data.y + b * data.y + c);
        return true;
    };

    // triangles

    /**
     * for convenience:find the cathe=sqrt(hypo**2-other cathe**)
     * @method Fast.cathe
     * @param {float} hypot
     * @param {float} cathe
     * @return float - sqrt(hypot**2-cathe**2)
     */
    Fast.cathe = function(hypot, cathe) {
        return Math.sqrt(hypot * hypot - cathe * cathe);
    };

    /**
     * find the lenght of a side of a triangle. The lenghts of two sides are known and the angle joining the two sides
     * length of side c of a triangle with sides of length a and b, meeting at an angle gamma
     * resulting from cosine law (generalized phytagoras)
     * @method Fast.triangleCOfAGammaB
     * @param {float} a
     * @param {float} gamma
     * @param {float} b
     * @return length of side c
     */
    Fast.triangleCOfAGammaB = function(a, gamma, b) {
        return Math.sqrt(a * a + b * b - 2 * a * b * Fast.cos(gamma));
    };

    /**
     * find an angle of a triangle. The lenght of all three sides are known
     * angle gamma of a triangle with sides of length a,b and c
     * resulting from cosine law (generalized phytagoras)
     * @method Fast.triangleGammaOfABC
     * @param {float} a
     * @param {float} b
     * @param {float} c
     * @return angle gamma
     */
    Fast.triangleGammaOfABC = function(a, b, c) {
        return Math.acos((a * a + b * b - c * c) / (2 * a * b));
    };

    /**
     *  find the length of a side of a triangle
     * the length of two sides is known and an angle joining the unknown side with one known side
     * returns number of solutions (0,1 or 2 as only positive lengths count)
     * solutions in data
     * @method Fast.triangleAOfBetaCB
     * @param {float} beta 
     * @param {float} c
     * @param {float} b
     * @param {Vector2} data - x and y fields are used to return lengths (Vector2 has a pool)
     * @return integer - number of solutions (0,1 or 2 as only positive lengths count)
     */
    Fast.triangleAOfBetaCB = function(beta, c, b, data) {
        Fast.cosSin(beta);
        let d = c * Fast.sinResult; // distance of point A between sides b and c to the unknown side a
        if (b < d) {
            Fast.xHigh = 0;
            Fast.xLow = 0;
            return false;
        } else {
            const base = c * Fast.cosResult;
            d = Math.sqrt(b * b - d * d);
            data.x = base - d;
            data.y = base + d;
            return true;
        }
    };


    /**
     * find a braket of opposed function values
     * @method Fast#bracket
     * @param {function} f - f(x)
     * @param {Vector2} data - x and y fields are used as input and output for the interval (Vector2 has a pool)
     * @return true if bracket found with f(x1)*f(x2)<0, false else
     */
    Fast.bracket = function(f, data) {
        let x1 = data.x;
        let x2 = data.y;
        let f1 = f(x1);
        let f2 = f(x2);
        const maxIt = 50;
        const factor = 1.5;
        for (var i = 0; i < maxIt; i++) {
            if ((f1 * f2) < 0) {
                data.x = x1;
                data.y = x2;
                return true;
            }
            if (Math.abs(f1) > Math.abs(f2)) {
                x1 = x2 + factor * (x2 - x1);
                f1 = f(x1);
            } else {
                x2 = x1 + factor * (x1 - x2);
                f1 = f(x2);
            }
        }
        console.log("**** Bracket failed " + f);
        return false;
    };

    /**
     * find zero of a function with bisection
     * @method Fast#bisection
     * @param {function} f - f(x)
     * @param {Vector2} data - x and y fields are used (Vector2 has a pool)
     * @return true if zero found, in data.x1, false else
     */
    Fast.bisection = function(f, data) {
        let x1 = data.x;
        let x2 = data.y;
        let f1 = f(x1);
        let f2 = f(x2);
        const epsilon = 0.00001;
        const maxIt = 50;
        // get bracket if not already there
        if (f1 * f2 > 0) {
            if (!Fast.bracket(f, data)) {
                return false;
            }
            x1 = data.x;
            x2 = data.y;
            f1 = f(x1);
            f2 = f(x2);
        }
        // make that f(x1)<0, if not exchange
        if (f1 > 0) {
            let h = f1;
            f1 = f2;
            f2 = h;
            h = x1;
            x1 = x2;
            x2 = h;
        }
        // find zero
        for (var i = 0; i < maxIt; i++) {
            if (Math.abs(x2 - x1) < epsilon) {
                data.x = x1;
                data.y = x2;
                return true;
            }
            let xn = 0.5 * (x1 + x2);
            let fn = f(xn);
            if (fn < 0) {
                f1 = fn;
                x1 = xn;
            } else {
                f2 = fn;
                x2 = xn;
            }
        }
        console.log("**** bisection failed " + f);
        return false;
    };
    //console.time("stcihwort")
    //console.timeEnd("stcihwort")

}());
