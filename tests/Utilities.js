//////////////////////////////////////////////
/////
/////    Miscellaneous general utilities
/////
/////

//// 

////  First, many functions for objects and arrays
//// Second, many math shortcuts

//////////////////////////////////////////////
/////
/////    Functions for strings and arrays
/////
/////

//
//  convenient check if variable is defined 
//

/* jshint esversion:6 */

function isDefined(x) {
    return (x !== undefined);
}

//
//  return value if value is defined
//  return defaultValue otherwise 
//
function getParam(value, defaultValue) {

    if (isDefined(value))
        return value;
    else
        return defaultValue;
}



function arrayEqualArray(a, b) {
    if (Array.isArray(a)) {
        if (Array.isArray(b)) {
            var matchSoFarQ = (a.length == b.length);
            var i = 0;
            while (matchSoFarQ && i < a.length) {
                matchSoFarQ = (arrayEqualArray(a[i], b[i]));
                i++;
            }
            return matchSoFarQ;
        } else return false;
    } else if (Array.isArray(b)) {
        return false;
    } else return (a == b);
}

function arrayInArray(outer, inner) {
    if (Array.isArray(outer)) {
        if (Array.isArray(inner)) {
            var foundQ = false;
            var i = 0;
            while (!foundQ && i < outer.length) {
                foundQ = arrayEqualArray(inner, outer[i]);
                i++;
            }
            return foundQ;
        } else {
            return outer.includes(inner)
        };
    } else return false;
}

function arrayReverse(a) {
    var revArray = [];
    for (i = 0; i < a.length; i++) {
        revArray.unshift(a[i]);
    }
    return revArray;
}

function objectToString(object, forMathematicaQ = false, prec = 4) {
    // we'll assume we are only dealing with arrays, objects, NaN, null, undefined, number, boolean
    var out = "";
    var C = "{",
        D = "}";
    var type = typeof object;
    if (object == null) {
        type = "null"
    }
    if (Array.isArray(object)) {
        type = "array";
        if (!forMathematicaQ) {
            C = "[";
            D = "]";
        }
    }
    if (object instanceof complexN) {
        type = "complexN";
    }
    switch (type) {
        case "complexN":
            return object.toString(forMathematicaQ, prec);
            break;
        case "boolean":
            if (forMathematicaQ) {
                if (object) {
                    return "True"
                } else {
                    return "False"
                };
                break;
            } else {
                if (object) {
                    return "T"
                } else {
                    return "F"
                }
            };
            break;
        case "number":
            if (isNaN(object)) {
                return "NaN";
            } else if (Number.isInteger(object)) {
                return object.toString();
            } else {
                return object.toFixed(prec)
            };
            break;
        case "undefined":
            return "undefined";
            break;
        case "null":
            return "null";
            break;
        case "string":
            return object;
            break;
        case "array":
            var out = C,
                cnt = 0;
            object.forEach(function(element) {
                cnt++;
                out += objectToString(element, forMathematicaQ, prec) + ","
            })
            if (cnt > 0) {
                out = out.slice(0, -1);
            }
            out += D;
            return out;
            break;
        case "object":
            var out = C,
                cnt = 0;
            Object.keys(object).forEach(function(key) {
                cnt++;
                if (forMathematicaQ) {
                    out += C + objectToString(key, forMathematicaQ) + "," + objectToString(object[key], forMathematicaQ) + D + ",";
                } else {
                    out += objectToString(key, forMathematicaQ) + ":" + objectToString(object[key], forMathematicaQ) + ","
                }
            })
            if (cnt > 0) {
                out = out.slice(0, -1);
            }
            out += D;
            return out;
            break;
        default:
            return "";
    }
}



function arrayToString(array, forMathematicaQ = false, prec = 4) {
    var out = "";
    var C, D;
    if (forMathematicaQ) {
        C = "{";
        D = "}";
    } else {
        C = "[";
        D = "]";
    }
    if (typeof array === "boolean") {
        if (forMathematicaQ) {
            if (array) {
                out += "True"
            } else {
                out += "False"
            }
        } else {
            if (array) {
                out += "true"
            } else {
                out += "false"
            }
        }
    } else if (Array.isArray(array)) {
        out = C;
        var cnt = 0;
        array.forEach(function(element) {
            cnt++;
            out += arrayToString(element, forMathematicaQ) + ","
        })
        if (cnt > 0) {
            out = out.slice(0, -1);
        }
        out += D
    } else if (isNaN(array)) {
        out += array.toString()
    } else if (Number.isInteger(array)) {
        out += array.toString()
    } else {
        out += array.toFixed(prec)
    }
    return out
}


//
// convert float array into a string with given precision, with line breaks
//
function iArrayToString(f, precision) {
    var s = "[";
    var slen = 80;
    for (var i = 0; i < f.length; i++) {
        s += f[i].toFixed(precision);
        if (i < f.length - 1) s += ", ";
        if (s.length - slen > 80) {
            s += "\n";
            slen += s.length;
        }
    }
    s += "]";
    return s;
}



//////////////////////////////////////////////
/////
/////    Math shortcuts
/////
/////



const PI = Math.PI;
const TPI = 2 * PI;
const HPI = PI / 2;
const TORADIANS = PI / 180.;
//const EPSILON = 2*Number.EPSILON
const EPSILON = 1e-10;
const SHORTEPSILON = .00000001;

// for convenience; could convert to, say, Stampfli's Fast methods

function cos(a) {
    return Math.cos(a);
}

function sin(a) {
    return Math.sin(a);
}

function sec(a) {
    return Math.sec(a);
}

function csc(a) {
    return Math.csc(a);
}

function tan(a) {
    return Math.tan(a);
}

function cot(a) {
    return 1 / (Math.tan(a));
}

function cosh(a) {
    return Math.cosh(a);
}

function tanh(a) {
    return Math.tanh(a);
}

function acosh(a) {
    return Math.acosh(a);
}

function asin(a) {
    return Math.asin(a);
}

function atan(a) {
    return Math.atan(a);
}

function asinh(a) {
    return Math.asinh(a);
}

function atanh(a) {
    return Math.atanh(a);
}

function sinh(a) {
    return Math.sinh(a);
}

function coth(a) {
    return 1 / (Math.tanh(a));
}

function abs(a) {
    return Math.abs(a);
}

function sqrt(a) {
    return Math.sqrt(a);
}

function exp(x) {
    return Math.exp(x);
}

function max(x, y) {
    return Math.max(x, y);
}

function mod(a, b) {
    if (a < 0) {
        return (a % b) + abs(b)
    } else return a % b
}
