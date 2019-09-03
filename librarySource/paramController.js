/* jshint esversion:6 */

/**
 * a controller for a parameter
 * with visuals, in a common div
 * @creator ParamController
 * @param {String} idContainer - identifier of containing html element
 * @param {Object} params - object that has the parameter as a field
 * @param {String} key - for the field of params to change, params[key]
 * @param {float/integer/array} low - determines lower limit/choices (optional)
 * @param {float/integer} high - determines upper limit (optional)
 * @param {float/integer} step - determines step size (optional)
 */

function ParamController(idContainer, params, key, low, high, step) {
    // remember params
    this.params = params;
    this.key = key;
    this.low = low;
    this.high = high;
    this.step = step;
    // a containing div for controller and label elements
    this.divId = DOM.createId();
    this.div = DOM.create("div", this.divId, "#" + idContainer);
    DOM.style("#" + this.divId, "minHeight", ParamController.minHeight + px);
    //DOM.style("#" + this.divId, "backgroundColor", "red");
    // a div for showing the key or other label, minimum width for alignment
    // the button or whatever the user interacts with
    this.uiElement = null;
    // what should be done if value chnges or button clicked
    this.callback = function() {
        console.log("callback");
    };
    this.create();
}

(function() {
    "use strict";
    const px = "px";

    // add some defaults, especially styles
    // styles, change the values of these fields if you do not like them
    // do changes in your program

    // alignment: minimal width for writing the key strings

    ParamController.keyMinWidth = 100;

    // fontsize for label/key 
    ParamController.labelFontSize = 16;

    // fontsize for buttons
    ParamController.buttonFontSize = 14;

    // vertical spacing: minimum height overall=== distance between baselines
    //  if controller not too large/minHeight too low
    ParamController.minHeight = 30;

    // minimum width for label (key), alignment
    ParamController.labelWidth = 100;

    // width (min) of on/off buttons
    ParamController.onOffButtonWidth = 60;

    // width for text input
    ParamController.textInputWidth = 200;

    // width for number input
    ParamController.numberInputWidth = 60;

    // checking parameters, for overloading methods

    // test if a variable is defined, and not missing in the call, 
    // returns true if defined and not null
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

    // test if a variable is a number
    // excluding NaN and infinite numbers
    function isNumber(p) {
        return ((typeof p) === "number") && (!Number.isNaN(p)) && (Number.isFinite(p));
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

    /**
     * make a label with given text and space
     * make link to label and space elements, to be able to change/delete
     * @method ParamController.createLabel
     * @param {String} text
     */
    ParamController.prototype.createLabel = function(text) {
        this.labelId = DOM.createId();
        this.label = DOM.create("span", this.labelId, "#" + this.divId, text);
        DOM.style("#" + this.labelId, "minWidth", ParamController.labelWidth + px, "display", "inline-block", "font-size", ParamController.labelFontSize + px);
        // spacing between label and element
        this.space = DOM.addSpace(this.divId);
    };

    /*
     * making a ui control element, same as in "lib/dat.gui.min2.js", one on each line
     * params is an object that contains data as fields
     * key is a String, the key to the field of params we want to change
     * the value of params[key] determines the kind of uiElement together with
     * parameters that define the values/ value range possible
     */
    ParamController.prototype.create = function() {
        this.uiElement = null;
        const controller = this;
        if (isArray(this.low)) {
            // an array defines the selection values, key and value are identical
            console.log("create selection from array");
        } else if (isObject(this.low)) {
            // an object defines selection values as value[key] pair, key is shown as option
            console.log("create selection from object");
        } else {
            const paramValue = this.params[this.key];
            if (isBoolean(paramValue)) {
                // the parameter value is boolean - thus make a BooleanButton
                console.log("boolean button");
                this.createLabel(this.key);
                const id = DOM.createId();
                DOM.create("button", id, "#" + this.divId);
                DOM.style("#" + id, "minWidth", ParamController.onOffButtonWidth + px, "font-size", ParamController.buttonFontSize + px);
                const button = new BooleanButton(id);
                this.uiElement = button;
                button.setValue(paramValue);
                button.onChange = function() {
                    controller.params[controller.key] = button.getValue();
                    controller.callback();
                };
            } else if (!isDefined(paramValue)) {
                // there is no parameter value with the key - thus make a button with the key as text, no label
                console.log("button");
                this.createLabel("");
                const id = DOM.createId();
                DOM.create("button", id, "#" + this.divId, this.key);
                DOM.style("#" + id, "font-size", ParamController.buttonFontSize + px);
                const button = new Button(id);
                this.uiElement = button;
                button.onClick = function() {
                    controller.callback();
                };
            } else if (isString(paramValue)) {
                // the parameter value is a string thus make a text input button
                console.log("text input button");

                this.createLabel(this.key);
                const id = DOM.createId();
                DOM.create("input", id, "#" + this.divId);
                DOM.style("#" + id, "width", ParamController.textInputWidth + px, "font-size", ParamController.buttonFontSize + px);
                const textInput = new TextInput(id);
                textInput.setValue(paramValue);
                this.uiElement = textInput;
                textInput.onChange = function() {
                    controller.params[controller.key] = textInput.getValue();
                    controller.callback();
                };
            } else if (isInteger(paramValue) && isInteger(this.low) && !isDefined(this.high) && !isDefined(this.step)) {
                // the parameter value is integer, and the low limit too 
                // high and step are not defined/ not supplied in call- make an (integer) number button with "infinity"==very large number
                console.log("integer button with infinity");
                this.createLabel(this.key);
                const id = DOM.createId();
                DOM.create("span", id, "#" + this.divId);
                const button = NumberButton.createInfinity(id);
                DOM.style("#" + button.idName, "width", ParamController.numberInputWidth + px, "font-size", ParamController.buttonFontSize + px);
                DOM.style("#" + button.idPlus + ",#" + button.idMinus + ",#" + button.idInfinity, "font-size", ParamController.buttonFontSize + px);
                button.setLow(this.low);
                console.log(paramValue);
                button.setValue(paramValue);
                this.uiElement = button;
                button.onChange = function() {
                    controller.params[controller.key] = button.getValue();
                    controller.callback();
                };

            } else if (isInteger(paramValue) && isInteger(this.low) && isInteger(this.high) && !isDefined(this.step)) {
                // parameter value is integer, the low and high limits too, there is no step, thus make an integer number button
                console.log("integer button");
            } else if (isNumber(paramValue) && isNumber(this.low) && isNumber(this.high)) {
                // param value and range limits are numbers, at least one is not integer or there is a step size given
                // thus use a range element
                console.log("range element");
            }

        }
        return this;
    };

}());
