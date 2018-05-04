/**
 * variuous utilities
 * @namespace Util 
 */

/* jshint esversion:6 */


var Util = {};

(function() {
    "use strict";
    /**
     * logging more easily multiple items
     * @method Util.log 
     * @param {anything} - list of things to log
     */
    Util.log = function(things) {
        let length = arguments.length;
        var message = "";
        for (var i = 0; i < length; i++) {
            message += arguments[i].toString() + " ";
        }
        console.log(message);
        message = "y";
        console.log(Array.from(arguments).reduce((message, argument) => message + " " + argument, "x"));


        message = [1, 2, 3].reduce(function(l, a) {
            console.log(a);
            return l + " " + a.toString();
        }, "x");
        console.log(message);
    };

    /**
     * get the maximum value of an array of numbers
     * @method Util.maximum
     */
}());
