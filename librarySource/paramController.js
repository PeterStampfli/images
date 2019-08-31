/* jshint esversion:6 */

/**
 * a controller for a parameter
 * with visuals, in a common div
 * @creator ParamController
 * @param {String} idContainer - identifier of containing html element
 * @param {Object} params - object that has the parameter as a field
 * @param {String} key - for the field of params to change, params[key]
 */

function ParamController(idContainer, params, key) {
    // a div for all controller elements
    this.divId = DOM.createId();
    this.div = DOM.create("div", this.divId, "#" + idContainer);

    DOM.style("#" + this.divId, "minHeight", ParamController.minHeight + px);
    DOM.style("#" + this.divId, "backgroundColor", "red");
    // remember params
    this.params = params;
    this.key = key;
    const keySpanId = DOM.createId();
    DOM.create("span", keySpanId, "#" + this.divId, key);
    DOM.style("#" + keySpanId, "minWidth", ParamController.keyMinWidth + px, "display", "inline-block", "font-size", ParamController.keyFontSize + px);
    DOM.addSpace(this.divId);
    // the button or whatever the user interacts with
    this.uiElement = null;
}


(function() {
    "use strict";

    const px = "px";

    // add some defaults, especially styles
    // styles, change the values of these fields if you do not like them
    // do changes in your program

    // alignment: minimal width for writing the key strings

    ParamController.keyMinWidth = 100;

    // fontsize for key 
    ParamController.keyFontSize = 16;

    // vertical spacing: minimum height overall
    ParamController.minHeight = 30;

    // checking parameters, for overloading methods

    // test if a variable is defined, and not missing in the call, 
    // returns true if defined
    // a missing parameter is "undefined"
    function isDefined(p) {
        return ((typeof p) !== "undefined") && (p !== null);
    }

    // test if a variable is a boolean
    function isBoolean(p) {
        return ((typeof p) === "boolean");
    }

    // test if a variable is a string
    function isString(p) {
        return ((typeof p) === "string");
    }

    // test if a variable is an integer number
    // excluding float, NaN and infinite numbers (because of Number.isInteger)
    // returns true for 5.0 and other integers written as floating point
    function isInteger(p) {
        return ((typeof p) === "number") && (Number.isInteger(p));
    }

    // test if a variable is an floating point number
    // excluding integer, NaN and infinite numbers
    function isFloat(p) {
        return ((typeof p) === "number") && (!Number.isNaN(p)) && (!Number.isInteger(p)) && (Number.isFinite(p));
    }

    // test if avariable is an array
    function isArray(p) {
        return ((typeof p) === "object") && (Array.isArray(p));
    }

    // test if a variable is an object
    // excluding array and null
    function isObject(p) {
        return ((typeof p) === "object") && (!Array.isArray(p)) && (p !== null);
    }



}());
