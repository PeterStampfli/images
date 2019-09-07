/* jshint esversion:6 */

/**
 * a controller for a parameter
 * with visuals, in a common div
 * @creator ParamController
 * @param {String} idContainer - identifier of containing html element
 * @param {Object} object - object that has the parameter as a field
 * @param {String} property - for the field of object to change, object[property]
 * @param {float/integer/array} low - determines lower limit/choices (optional)
 * @param {float/integer} high - determines upper limit (optional)
 * @param {float/integer} step - determines step size (optional)
 */

function ParamController(idContainer, object, property, low, high, step) {
    this.object = object;
    this.property = property;
    this.low = low;
    this.high = high;
    this.step = step;
    // the controller goes into this DOM element
    this.domElementId = DOM.createId();
    this.domElement = DOM.create("div", this.domElementId, "#" + idContainer);
    DOM.style("#" + this.domElementId, "minHeight", ParamController.minHeight + px);
    // a div for showing the property or other label, minimum width for alignment
    // the button or whatever the user interacts with
    this.uiElement = null;
    // what should be done if value changes or button clicked
    this.callback = function(value) {
        console.log("callback value " + value);
    };
    this.create();
}

(function() {
    "use strict";
    const px = "px";

    // add some defaults, especially styles
    // styles, change the values of these fields if you do not like them
    // do changes in your program

    // alignment: minimal width for writing the property strings


    // fontsize for buttons
    ParamController.buttonFontSize = 14;

    // vertical spacing: minimum height overall=== distance between baselines
    //  if controller not too large/minHeight too low
    ParamController.minHeight = 30;



    // width (min) of on/off buttons
    ParamController.onOffButtonWidth = 60;

    // width for text input
    ParamController.textInputWidth = 200;

    // width for number input
    ParamController.numberInputWidth = 60;

    // length of slider for range element
    ParamController.rangeSliderLength = 120;

    // vertical offset for range slider
    ParamController.rangeVOffset = 4;

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
        this.label = DOM.create("span", this.labelId, "#" + this.domElementId, text);
        DOM.style("#" + this.labelId,
            "minWidth", ParamGui.labelWidth + px,
            "display", "inline-block",
            "font-size", ParamGui.labelFontSize + px,
            "paddingLeft", ParamGui.paddingHorizontal + px,
            "paddingRight", ParamGui.paddingHorizontal + px);
    };


    // freaking grunt
    ParamController.prototype.makeSelectOptionAction = function(value) {
        const controller = this;
        const action = function() {
            controller.object[controller.property] = value;
            controller.callback(value);
        };
        return action;
    };

    /*
     * making a ui control element, same as in "lib/dat.gui.min2.js", one on each line
     * object contains data as fields
     * property is a String, the property to the field of object we want to change
     * the value of object[property] determines the kind of uiElement together with
     * parameters that define the values/ value range possible
     */
    ParamController.prototype.create = function() {
        this.uiElement = null;
        const controller = this;
        const paramValue = this.object[this.property];
        if (isArray(this.low) || isObject(this.low)) {
            this.createLabel(this.property);
            const id = DOM.createId();
            DOM.create("select", id, "#" + this.domElementId);
            DOM.style("#" + id, "font-size", ParamController.buttonFontSize + px);
            const select = new SelectValues(id);
            this.uiElement = select;
            select.setLabelsValues(this.low);
            select.setValue(paramValue);
            select.onChange = function() {
                const value = select.getValue();
                controller.object[controller.property] = value;
                controller.callback(value);
            };
        } else {
            if (isBoolean(paramValue)) {
                // the parameter value is boolean - thus make a BooleanButton
                console.log("boolean button");
                this.createLabel(this.property);
                const id = DOM.createId();
                DOM.create("button", id, "#" + this.domElementId);
                DOM.style("#" + id,
                    "minWidth", ParamController.onOffButtonWidth + px,
                    "font-size", ParamController.buttonFontSize + px);
                const button = new BooleanButton(id);
                this.uiElement = button;
                button.setValue(paramValue);
                button.onChange = function() {
                    const value = button.getValue();
                    controller.object[controller.property] = value;
                    controller.callback(value);
                };
            } else if (!isDefined(paramValue)) {
                // there is no parameter value with the property - thus make a button with the property as text, no label
                console.log("button");
                this.createLabel("");
                const id = DOM.createId();
                DOM.create("button", id, "#" + this.domElementId, this.property);
                DOM.style("#" + id, "font-size", ParamController.buttonFontSize + px);
                const button = new Button(id);
                this.uiElement = button;
                button.onClick = function() {
                    controller.callback();
                };
            } else if (isString(paramValue)) {
                // the parameter value is a string thus make a text input button
                console.log("text input button");
                this.createLabel(this.property);
                const id = DOM.createId();
                DOM.create("input", id, "#" + this.domElementId);
                DOM.style("#" + id,
                    "width", ParamController.textInputWidth + px,
                    "font-size", ParamController.buttonFontSize + px);
                const textInput = new TextInput(id);
                textInput.setValue(paramValue);
                this.uiElement = textInput;
                textInput.onChange = function() {
                    const value = textInput.getValue();
                    controller.object[controller.property] = value;
                    controller.callback(value);
                };
            } else if (isInteger(paramValue) && isInteger(this.low) && (!isDefined(this.high) || isInteger(this.high)) && !isDefined(this.step)) {
                // the parameter value is integer, and the low limit too 
                // high is integer or not defined and step is not defined/ not supplied in call- make an (integer) number button 
                console.log("integer button");
                this.createLabel(this.property);
                const id = DOM.createId();
                DOM.create("span", id, "#" + this.domElementId);
                const button = NumberButton.createInfinity(id);
                DOM.style("#" + button.idName,
                    "width", ParamController.numberInputWidth + px,
                    "font-size", ParamController.buttonFontSize + px);
                DOM.style("#" + button.idPlus + ",#" + button.idMinus + ",#" + button.idMin + ",#" + button.idMax,
                    "font-size", ParamController.buttonFontSize + px);
                if (isInteger(this.high)) {
                    button.setRange(this.low, this.high);
                } else {
                    button.setLow(this.low);
                }
                button.setValue(paramValue);
                this.uiElement = button;
                button.onChange = function() {
                    const value = button.getValue();
                    controller.object[controller.property] = value;
                    controller.callback(value);
                };
            } else if (isNumber(paramValue) && isNumber(this.low) && isNumber(this.high)) {
                // param value and range limits are numbers, at least one is not integer or there is a step size given
                // thus use a range element
                console.log("range element");
                this.createLabel(this.property);
                const id = DOM.createId();
                DOM.create("span", id, "#" + this.domElementId);
                const range = Range.create(id);
                DOM.style("#" + range.idText,
                    "width", ParamController.numberInputWidth + px,
                    "font-size", ParamController.buttonFontSize + px);
                DOM.style("#" + range.idRange,
                    "width", ParamController.rangeSliderLength + px,
                    "position", "relative",
                    "top", ParamController.rangeVOffset + px);
                range.setRange(this.low, this.high);
                if (isNumber(this.step)) {
                    range.setStep(this.step);
                }
                range.setValue(paramValue);
                this.uiElement = range;
                range.onChange = function() {
                    const value = range.getValue();
                    controller.object[controller.property] = value;
                    controller.callback(value);
                };
            }
        }
        return this;
    };

    /**
     * change the label text, instead of key, to show something more interesting
     * @method ParamController#setLabel
     * @param {String} label
     * @return this, for chaining
     */
    ParamController.prototype.setLabel = function(label) {
        this.label.innerHTML = label;
        return this;
    };

    /**
     * make the controller disappear including its space (display==none)
     * @method ParamController#hide
     * @return this
     */
    ParamController.prototype.hide = function() {
        DOM.displayNone(this.domElementId);
        return this;
    };

    /**
     * make the controller visible including its space (display==initial)
     * @method ParamController#show
     * @return this
     */
    ParamController.prototype.show = function() {
        DOM.display(this.domElementId);
        return this;
    };

    /**
     * set the callback function for onchange events
     * @method ParamController#onChange
     * @param {function} callback - function(value), with value of controller as argument
     * @return this
     */
    ParamController.prototype.onChange = function(callback) {
        this.callback = callback;
        return this;
    };

    /**
     * set the callback function for onclick events
     * (same as onChange)
     * @method ParamController#onClick
     * @param {function} callback - function()
     * @return this
     */
    ParamController.prototype.onClick = function(callback) {
        this.callback = callback;
        return this;
    };

}());
