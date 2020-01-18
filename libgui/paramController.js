import {
    guiUtils,
    paramControllerMethods,
    ParamImageSelection,
    BooleanButton,
    Button,
    SelectValues,
    TextInput,
    NumberButton
} from "./modules.js";

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
    if (guiUtils.isArray(low) || guiUtils.isObject(low)) {
        // low, the first parameter for limits is an array or object, thus make a selection
        this.createLabel(this.property);
        const selectValues = new SelectValues(this.domElement);
        selectValues.setFontSize(design.buttonFontSize);
        this.uiElement = selectValues;
        selectValues.addOptions(low);
        selectValues.setValue(paramValue);
        this.setupOnChange();
        this.setupOnInteraction();
    } else if (guiUtils.isBoolean(paramValue)) {
        // the parameter value is boolean, thus make a BooleanButton
        this.createLabel(this.property);
        const button = new BooleanButton(this.domElement);
        button.setWidth(design.booleanButtonWidth);
        button.setFontSize(design.buttonFontSize);
        this.uiElement = button;
        button.setValue(paramValue);
        this.setupOnChange();
        this.setupOnInteraction();
    } else if (!guiUtils.isDefined(paramValue) || guiUtils.isFunction(paramValue)) {
        // there is no parameter value with the property or it is a function
        // thus make a button with the property as text, no label
        this.createLabel("");
        const button = new Button(this.property, this.domElement);
        button.setFontSize(design.buttonFontSize);
        this.uiElement = button;
        if (guiUtils.isFunction(paramValue)) {
            this.callback = paramValue;
        }
        button.onClick = function() {
            controller.callback();
        };
        this.setupOnInteraction();
    } else if (guiUtils.isString(paramValue)) {
        // the parameter value is a string thus make a text input button
        this.createLabel(this.property);
        const textInput = new TextInput(this.domElement);
        textInput.setWidth(design.textInputWidth);
        textInput.setFontSize(design.buttonFontSize);
        textInput.setValue(this.params[this.property]);
        this.uiElement = textInput;
        this.setupOnChange();
        this.setupOnInteraction();
    } else if (guiUtils.isInteger(paramValue) && (!guiUtils.isDefined(low) || guiUtils.isInteger(low)) &&
        (!guiUtils.isDefined(high) || guiUtils.isInteger(high)) && !guiUtils.isDefined(step)) {
        // the parameter value is integer, and the low limit is integer or undefined 
        // high is integer or not defined, and step is not defined/ not supplied in call
        // thus make an (integer) number button 
        this.createLabel(this.property);
        const button = new NumberButton(this.domElement);
        button.setInputWidth(design.numberInputWidth);
        // add the usual buttons
        guiUtils.hSpace(this.domElement, NumberButton.spaceWidth);
        button.createAddButton("+1", this.domElement, 1);
        guiUtils.hSpace(this.domElement, NumberButton.spaceWidth);
        button.createAddButton("-1", this.domElement, -1);
        guiUtils.hSpace(this.domElement, NumberButton.spaceWidth);
        button.createMiniButton(this.domElement);
        guiUtils.hSpace(this.domElement, NumberButton.spaceWidth);
        button.createMaxiButton(this.domElement);
        button.setFontSize(design.buttonFontSize);
        if (guiUtils.isInteger(high)) {
            button.setRange(low, high);
        } else if (guiUtils.isInteger(low)) {
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
    } else if (guiUtils.isInteger(paramValue) && guiUtils.isInteger(low) && guiUtils.isInteger(high) && guiUtils.isNumber(step) && (Math.abs(step - 1) < 0.01)) {
        // the parameter value is integer, and the low limit too 
        // high is integer and step is integer equal to 1
        // thus make a range element with plus/minus button 
        this.createLabel(this.property);
        const range = new NumberButton(this.domElement);
        range.setInputWidth(design.numberInputWidth);
        guiUtils.hSpace(this.domElement, NumberButton.spaceWidth);
        // add range
        range.createRange(this.domElement);
        range.setRangeWidth(design.rangeSliderLengthShort);
        // add the usual buttons
        guiUtils.hSpace(this.domElement, NumberButton.spaceWidth);
        range.createAddButton("+1", this.domElement, 1);
        guiUtils.hSpace(this.domElement, NumberButton.spaceWidth);
        range.createAddButton("-1", this.domElement, -1);
        range.setFontSize(design.buttonFontSize);
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
    } else if (guiUtils.isNumber(paramValue) && guiUtils.isNumber(low) && guiUtils.isNumber(high)) {
        // param value and range limits are numbers, at least one of them is not integer or there is a non-integer step value 
        // thus use a range element
        this.createLabel(this.property);
        const range = new NumberButton(this.domElement);
        range.setInputWidth(design.numberInputWidth);
        guiUtils.hSpace(this.domElement, NumberButton.spaceWidth);
        // add range
        range.createRange(this.domElement);
        range.setRangeWidth(design.rangeSliderLengthLong);
        range.setFontSize(design.buttonFontSize);
        range.setRange(low, high);
        if (guiUtils.isNumber(step)) {
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
    } else if (guiUtils.isNumber(paramValue)) {
        // simply a number, not an integer, maybe a lower limit
        this.createLabel(this.property);
        const button = new NumberButton(this.domElement);
        button.setStep(0.01); // reasonable default step (not integer)
        button.setInputWidth(design.numberInputWidth);
        guiUtils.hSpace(this.domElement, NumberButton.spaceWidth);
        button.createMiniButton(this.domElement);
        button.setFontSize(design.buttonFontSize);
        if (guiUtils.isNumber(low)) {
            button.setLow(low);
        } else {
            button.setLow(0);
        }
        button.setValue(paramValue);
        button.setValue(paramValue);
        this.uiElement = button;
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
 * destroy the controller, and the containing dom element
 * @method ParamController#destroy
 */
ParamController.prototype.destroy = function() {
    if (this.helpButton !== null) {
        this.helpButton.destroy();
    }
    this.uiElement.destroy();
    this.uiElement = null;
    if (this.label) {
        this.label.remove();
        this.label = null;
    }
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