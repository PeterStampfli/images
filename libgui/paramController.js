import {
    guiUtils,
    paramControllerMethods,
    ParamImageSelection,
    BooleanButton,
    Button,
    SelectValues,
    TextInput,
    NumberButton,
    Range
} from "./modules.js";

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

// test if a variable is an object, not an array
// excluding array and null
function isObject(p) {
    return ((typeof p) === "object") && (!Array.isArray(p)) && (p !== null);
}

/**
 * a controller for a simple parameter
 * with visuals, in a common div
 * making a ui control element, same as in "lib/dat.gui.min2.js", one on each line
 * @creator ParamController
 * @param {ParamGui} gui - the controller is in this gui
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property - for the field of object to change, params[property]
 * @param {float/integer/array} low - determines lower limit/choices (optional)
 * @param {float/integer} high - determines upper limit (optional)
 * @param {float/integer} step - determines step size (optional)
 */

export function ParamController(gui, params, property, low, high, step) {
    this.gui = gui;
    this.params = params;
    this.property = property;
    this.listening = false; // automatically update display
    this.initCreate();
    const design = this.gui.design;
    const paramValue = this.params[this.property];
    const controller = this;
    if (isArray(low) || isObject(low)) {
        // low, the first parameter for limits is an array or object, thus make a selection
        this.createLabel(this.property);
        const selectValues = new SelectValues(this.domElement);
        selectValues.setFontSize(design.buttonFontSize);
        this.uiElement = selectValues;
        selectValues.addOptions(low);
        selectValues.setValue(paramValue);
        this.setupOnChange();
        this.setupOnInteraction();
    } else if (isBoolean(paramValue)) {
        // the parameter value is boolean, thus make a BooleanButton
        this.createLabel(this.property);
        const button = new BooleanButton(this.domElement);
        button.setWidth(design.booleanButtonWidth);
        button.setFontSize(design.buttonFontSize);
        this.uiElement = button;
        button.setValue(paramValue);
        this.setupOnChange();
        this.setupOnInteraction();
    } else if (!isDefined(paramValue) || (typeof paramValue === "function")) {
        // there is no parameter value with the property or it is a function
        // thus make a button with the property as text, no label
        this.createLabel("");
        const button = new Button(this.property, this.domElement);
        button.setFontSize(design.buttonFontSize);
        this.uiElement = button;
        if (typeof paramValue === "function") {
            this.callback = paramValue;
        }
        button.onClick = function() {
            controller.callback();
        };
        this.setupOnInteraction();
    } else if (isString(paramValue)) {
        // the parameter value is a string thus make a text input button
        this.createLabel(this.property);
        const textInput = new TextInput(this.domElement);
        textInput.setWidth(design.textInputWidth);
        textInput.setFontSize(design.buttonFontSize);
        textInput.setValue(this.params[this.property]);
        this.uiElement = textInput;
        this.setupOnChange();
        this.setupOnInteraction();
    } else if (isInteger(paramValue) && (!isDefined(low) || isInteger(low)) &&
        (!isDefined(high) || isInteger(high)) && !isDefined(step)) {
        // the parameter value is integer, and the low limit is integer or undefined 
        // high is integer or not defined, and step is not defined/ not supplied in call
        // thus make an (integer) number button 
        this.createLabel(this.property);
        const button = new NumberButton(this.domElement, true, true);
        button.setWidth(design.numberInputWidth);
        button.setFontSize(design.buttonFontSize);
        if (isInteger(high)) {
            button.setRange(low, high);
        } else if (isInteger(low)) {
            button.setLow(low);
        } else {
            button.setLow(0);
        }
        button.setValue(paramValue);
        // here we can use the cyclic() method, give it some sense
        this.cyclic = function() {
            button.setCyclic();
            return this;
        };
        this.uiElement = button;
        this.setupOnChange();
        this.setupOnInteraction();
    } else if (isInteger(paramValue) && isInteger(low) && isInteger(high) && isNumber(step) && (Math.abs(step - 1) < 0.01)) {
        // the parameter value is integer, and the low limit too 
        // high is integer and step is integer equal to 1
        // thus make a range element with plus/minus button 
        this.createLabel(this.property);
        const range = new Range(this.domElement, true);
        range.setFontSize(design.buttonFontSize);
        range.setWidths(design.numberInputWidth, design.rangeSliderLengthShort);
        range.setStep(1);
        range.setRange(low, high);
        range.setValue(paramValue);
        // here we can use the cyclic() method, give it some sense
        this.cyclic = function() {
            range.setCyclic();
            return this;
        };
        this.uiElement = range;
        this.setupOnChange();
        this.setupOnInteraction();
    } else if (isNumber(paramValue) && isNumber(low) && isNumber(high)) {
        // param value and range limits are numbers, at least one of them is not integer or there is a non-integer step value 
        // thus use a range element
        this.createLabel(this.property);
        const range = new Range(this.domElement, false);
        range.setFontSize(design.buttonFontSize);
        range.setWidths(design.numberInputWidth, design.rangeSliderLengthLong);
        range.setRange(low, high);
        if (isNumber(step)) {
            range.setStep(step);
        }
        range.setValue(paramValue);
        this.cyclic = function() {
            range.setCyclic();
            return this;
        };
        this.uiElement = range;
        this.setupOnChange();
        this.setupOnInteraction();
    } else {
        // no idea/error
        this.createLabel(this.property + " *** error: no controll");
        console.log("no controll found");
        console.log(low);
        console.log(high);
        console.log(step);
    }
    // change dom after all work has been done
    this.gui.bodyDiv.appendChild(this.domElement);
}

// "inherit" paramControllerMethods:
//======================================
//
// this.createLabel
// this.setupOnChange
// this.show
// this.onChange 
// this.onClick
// this.onFinishChange
// this.setValueOnly
// this.setValue
// this.getValue
// this.updateDisplay
// this.updateDisplayIfListening
// this.listening
// this.name

Object.assign(ParamController.prototype, paramControllerMethods);

const px = "px";

/**
 * make that numberbuttons and range elements become cyclic
 * other buttons without effect
 * @method ParamController#cyclic
 * @return this for chaining
 */
// here a do nothing stub for non-number controllers
ParamController.prototype.cyclic = function() {
    return this;
};

/**
 * destroy the controller
 * @method ParamController#destroy
 */
ParamController.prototype.destroy = function() {
    if (this.helpButton !== null) {
        this.helpButton.destroy();
    }
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
