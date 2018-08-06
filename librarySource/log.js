/**
 * log information on a special div
 * @namespace Log
 */

var Log = {};


(function() {
    "use strict";

    // see if it is setup
    Log.isReady = false;
    Log.idName = "messageLogger";
    Log.divName = Log.idName + "div";


    /**
     * setup of the logging div, and other things
     * @method Log.setup
     */
    Log.setup = function() {
        Log.isReady = true;
        DOM.create("div", Log.divName, "body");
        DOM.style("#" + Log.divName, "zIndex", "9", "position", "fixed", "overflow", "auto");
        DOM.style("#" + Log.divName, "backgroundColor", "rgba(255,200,200,1)", "color", "black");
        DOM.style("#" + Log.divName, "width", 300 + px, "height", 100 + px, "left", 0 + px, "top", 0 + px);

        DOM.create("pre", Log.idName, "#" + Log.divName);
        DOM.style("#" + Log.idName, "margin", "2px");
        Log.pre = document.getElementById(Log.idName);
    };

    /**
     * place the logging div
     * @method Log.position
     * @param {integer} left
     * @param {integer} top
     */
    Log.position = function(left, top) {
        if (Log.isReady) {
            DOM.style("#" + Log.divName, "left", left + px, "top", top + px);
        }
    };

    /**
     * set dimensions of logging div
     * @method Log.dimensions
     * @param {integer} width
     * @param {integer} height
     */
    Log.dimension = function(width, height) {
        if (Log.isReady) {
            DOM.style("#" + Log.divName, "width", width + px, "height", height + px);
        }
    };

    /**
     * log a message
     * @method Log.message
     * @param {string} text
     */
    Log.message = function(text) {
        if (Log.isReady) {
            Log.pre.innerHTML = text + "\n" + Log.pre.innerHTML;
        }
    };


}());
