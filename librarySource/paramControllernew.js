/* jshint esversion:6 */

/**
 * a controller for a parameter
 * with visuals, in a common div
 * @creator ParamController
 * @param {ParamGui} gui - the controller is in this gui
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property - for the field of object to change, params[property]
 * @param {float/integer/array} low - determines lower limit/choices (optional)
 * @param {float/integer} high - determines upper limit (optional)
 * @param {float/integer} step - determines step size (optional)
 */

function ParamController(gui, params, property, low, high, step) {
    this.gui = gui;
    this.params = params;
    this.property = property;
    this.listening = false; // switch off automatically update display
    this.create(low, high, step);
}

(function() {
    "use strict";
    const px = "px";

    // functions that check parameters, for overloading methods

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

    // test if a variable is a function
    function isFunction(p) {
        return ((typeof p) === "function");
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
            "minWidth", this.gui.controllerLabelWidth + px,
            "display", "inline-block",
            "font-size", this.gui.controllerLabelFontSize + px,
            "paddingLeft", this.gui.paddingHorizontal + px,
            "paddingRight", this.gui.paddingHorizontal + px);
    };

    /*
     * making a ui control element, same as in "lib/dat.gui.min2.js", one on each line
     * using data stored in this.fields as defined in creator
     * @method ParamController#create
     * @param {float/integer/array} low - determines lower limit/choices (optional)
     * @param {float/integer} high - determines upper limit (optional)
     * @param {float/integer} step - determines step size (optional)
     */
    ParamController.prototype.create = function(low, high, step) {
        this.uiElement = null;
        const controller = this;
        const paramValue = this.params[this.property];
        this.lastValue = paramValue;
        this.rememberedValue = paramValue;
        // create a div for all elements of the controller
        this.domElementId = DOM.createId();
        // it lies in the bodyDiv of the ParamGui
        this.domElement = DOM.create("div", this.domElementId, "#" + this.gui.bodyDivId);
        // make a regular spacing between labels ???
        DOM.style("#" + this.domElementId,
            "minHeight", this.gui.minControllerHeight + px,
            "paddingTop", this.gui.paddingVertical + px
        );
        // the button or whatever the user interacts with
        this.uiElement = null;
        // what should be done if value changes or button clicked
        this.callback = function(value) {
            console.log("callback value " + value);
        };
        if (isArray(low) || isObject(low)) {
            // low, the first parameter for limits is an array or object, thus make a selection
            this.createLabel(this.property);
            const id = DOM.createId();
            DOM.create("select", id, "#" + this.domElementId);
            DOM.style("#" + id, "font-size", this.gui.buttonFontSize + px);
            const select = new SelectValues(id);
            this.uiElement = select;
            select.setLabelsValues(low);
            select.setValue(paramValue);
        } else if (isBoolean(paramValue)) {
            // the parameter value is boolean, thus make a BooleanButton
            this.createLabel(this.property);
            const id = DOM.createId();
            DOM.create("button", id, "#" + this.domElementId);
            DOM.style("#" + id,
                "minWidth", this.gui.onOffButtonWidth + px,
                "font-size", this.gui.buttonFontSize + px);
            const button = new BooleanButton(id);
            this.uiElement = button;
            button.setValue(paramValue);
        } else if (!isDefined(paramValue) || (typeof paramValue === "function")) {
            // there is no parameter value with the property or it is a function
            // thus make a button with the property as text, no label
            this.createLabel("");
            const id = DOM.createId();
            DOM.create("button", id, "#" + this.domElementId, this.property);
            DOM.style("#" + id, "font-size", this.gui.buttonFontSize + px);
            const button = new Button(id);
            this.uiElement = button;
            if (typeof paramValue === "function") {
                this.callback = paramValue;
            }
            button.onClick = function() {
                controller.callback();
            };
        } else if (isString(paramValue)) {
            // the parameter value is a string thus make a text input button
            this.createLabel(this.property);
            const id = DOM.createId();
            DOM.create("input", id, "#" + this.domElementId);
            DOM.style("#" + id,
                "width", this.gui.textInputWidth + px,
                "font-size", this.gui.buttonFontSize + px);
            const textInput = new TextInput(id);
            textInput.setValue(paramValue);
            this.uiElement = textInput;
        } else if (isInteger(paramValue) && (!isDefined(low) || isInteger(low)) &&
            (!isDefined(high) || isInteger(high)) && !isDefined(step)) {
            // the parameter value is integer, and the low limit is integer or undefined 
            // high is integer or not defined, and step is not defined/ not supplied in call
            // thus make an (integer) number button 
            this.createLabel(this.property);
            const id = DOM.createId();
            DOM.create("span", id, "#" + this.domElementId);
            const button = NumberButton.createInfinity(id);
            DOM.style("#" + button.idName,
                "width", this.gui.numberInputWidth + px,
                "font-size", this.gui.buttonFontSize + px);
            DOM.style("#" + button.idPlus + ",#" + button.idMinus + ",#" + button.idMin + ",#" + button.idMax,
                "font-size", this.gui.buttonFontSize + px);
            if (isInteger(high)) {
                button.setRange(low, high);
            } else if (isInteger(low)) {
                button.setLow(low);
            } else {
                button.setLow(0);
            }
            button.setValue(paramValue);
            this.uiElement = button;
        } else if (isInteger(paramValue) && isInteger(low) && isInteger(high) && isNumber(step) && (Math.abs(step - 1) < 0.01)) {
            // the parameter value is integer, and the low limit too 
            // high is integer  and step is integer equal to 1
            // thus make a range element with plus/minus button 
            this.createLabel(this.property);
            const id = DOM.createId();
            DOM.create("span", id, "#" + this.domElementId);
            const range = Range.createPlusMinus(id);
            DOM.style("#" + this.labelId,
                "position", "relative",
                "top", (-this.gui.rangeVOffset) + px);
            DOM.style("#" + range.idText,
                "width", this.gui.numberInputWidth + px,
                "font-size", this.gui.buttonFontSize + px,
                "position", "relative",
                "top", (-this.gui.rangeVOffset) + px);
            DOM.style("#" + range.idRange,
                "width", this.gui.rangeSliderLengthShort + px);
            DOM.style("#" + range.idPlus + ",#" + range.idMinus,
                "font-size", this.gui.buttonFontSize + px,
                "position", "relative",
                "top", (-this.gui.rangeVOffset) + px);
            range.setRange(low, high);
            range.setStep(1);
            range.setValue(paramValue);
            this.uiElement = range;
        } else if (isNumber(paramValue) && isNumber(low) && isNumber(high)) {
            // param value and range limits are numbers, at least one of them is not integer or there is a non-integer step value 
            // thus use a range element
            this.createLabel(this.property);
            const id = DOM.createId();
            DOM.create("span", id, "#" + this.domElementId);
            const range = Range.create(id);
            DOM.style("#" + this.labelId,
                "position", "relative",
                "top", (-this.gui.rangeVOffset) + px);
            DOM.style("#" + range.idText,
                "width", this.gui.numberInputWidth + px,
                "font-size", this.gui.buttonFontSize + px,
                "position", "relative",
                "top", (-this.gui.rangeVOffset) + px);
            DOM.style("#" + range.idRange,
                "width", this.gui.rangeSliderLengthLong + px);
            range.setRange(low, high);
            if (isNumber(step)) {
                range.setStep(step);
            }
            range.setValue(paramValue);
            this.uiElement = range;
        } else {
            // no idea/error
            this.createLabel(this.property + " *** error");
        }
        // set up onChange function of ui element (if exists)
        if (isDefined(this.uiElement) && isFunction(this.uiElement.onChange)) {
            const element = this.uiElement;
            this.uiElement.onChange = function() {
                const value = element.getValue();
                controller.params[controller.property] = value;
                controller.lastValue = value; // avoid unnecessary display update (listening)
                controller.callback(value);
            };
        }
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
    ParamController.prototype.onClick = ParamController.prototype.onChange;

    /**
     * set the callback function for onchange events, because it is the dat.gui api
     * @method ParamController#onFinishChange
     * @param {function} callback - function(value), with value of controller as argument
     * @return this
     */
    ParamController.prototype.onFinishChange = ParamController.prototype.onChange;

    /**
     * set the value of the controller and last value field
     * @method ParamController#setValue
     * @param {whatever} value
     */
    ParamController.prototype.setValue = function(value) {
        this.lastValue = value;
        this.uiElement.setValue(value);
    };

    /**
     * get the value of the controller
     * @method ParamController#getValue
     * @return {whatever} value
     */
    ParamController.prototype.getValue = function() {
        return this.uiElement.getValue();
    };

    /**
     * set the value of the controller according to the actual value of the parameter in the params object
     * updates display automatically
     * @method ParamController#updateDisplay
     */
    ParamController.prototype.updateDisplay = function() {
        this.setValue(this.params[this.property]);
    };

    /**
     * updateDisplay and lastValue field If controller is Listening  and parameter value has changed
     * @method ParamController#updateDisplayIfListening
     */
    ParamController.prototype.updateDisplayIfListening = function() {
        if (this.listening) {
            if (this.params[this.property] !== this.lastValue) {
                this.updateDisplay();
            }
        }
    };

    /**
     * not implemented: periodically call updateDisplay to show changes automatically
     * because of dat.gui api
     * @method ParamController#listen
     * @return this, for chaining
     */
    ParamController.prototype.listen = function() {
        this.listening = true;
        ParamGui.startListening();
        return this;
    };

    /**
     * remember values of an object with data
     * use same object as for adding the controller
     * @method ParamController#remember
     * @param {Object} params - an object containing parameter values
     */
    ParamController.prototype.remember = function(params) {
        console.log("remmber");
        if (params === this.params) {
            const value = params[this.property];
            if (isDefined(value)) {
                this.rememberedValue = value;
            }
        }
    };


    /**
     * changes the label text, instead of property name, to show something more interesting
     * for buttons changes the button text
     * @method ParamController#name
     * @param {String} label
     * @return this, for chaining
     */
    ParamController.prototype.name = function(label) {
        let toChange = this.label;
        if (this.uiElement instanceof Button) {
            toChange = this.uiElement.element;
        }
        toChange.removeChild(toChange.firstChild);
        const textNode = document.createTextNode(label);
        toChange.appendChild(textNode);
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
        DOM.style("#" + this.domElementId, "display", "block");
        return this;
    };

    /**
     * destroy the controller
     * @method ParamController#destroy
     */
    ParamController.prototype.destroy = function() {
        this.uiElement.destroy();
        this.uiElement = null;
        this.label.remove();
        this.label = null;
        this.domElement.remove();
        this.domElement = null;
        this.params = null;
        this.callback = null;
        this.gui = null;
    };

    /**
     * same as destroy, but is in dat.gui api
     * @method ParamController.remove
     */
    ParamController.prototype.remove = ParamController.prototype.destroy;

}());