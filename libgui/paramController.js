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
 * inside a given container, using given design
 * if the container is a "div":
 *   same as in "lib/dat.gui.min2.js", 
 * if the container is a "span"
 *   minimized version for multiple controls on a line
 * @creator ParamController
 * @param {ParamGui} design - object that defines the design
 * @param {htmlElement} domElement - container for the controller, div (popup depends on style) or span (always use popup)
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property - for the field of object to change, params[property]
 * @param {float/integer/array} low - determines lower limit/choices (optional)
 * @param {float/integer} high - determines upper limit (optional)
 * @param {float/integer} step - determines step size (optional)
 */
export function ParamController(design, domElement, params, property, low, high, step) {
    this.design = design;
    this.domElement = domElement;
    this.params = params;
    this.property = property;
    this.listening = false; // automatically update display
    this.helpButton = null;
    // the button or whatever the user interacts with
    this.uiElement = null;
    // a popup for additional buttons
    this.popup = false;
    // the container for additional buttons
    this.buttonContainer = this.domElement;

    /**
     * callback for changes
     * @method paramControllerMethods.callback
     * @param {anything} value
     */
    this.callback = function(value) {
        console.log("callback value " + value);
    };
    this.createLabel(this.property);
    const paramValue = this.params[this.property];
    const controller = this;
    if (guiUtils.isArray(low) || guiUtils.isObject(low)) {
        // low, the first parameter for limits is an array or object, thus make a selection
        const selectValues = new SelectValues(this.domElement);
        selectValues.setFontSize(design.buttonFontSize);
        this.uiElement = selectValues;
        selectValues.addOptions(low);
        selectValues.setValue(paramValue);
        this.setupOnChange();
        this.setupOnInteraction();
    } else if (guiUtils.isBoolean(paramValue)) {
        // the parameter value is boolean, thus make a BooleanButton
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
        this.label.textContent = "";
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
        const textInput = new TextInput(this.domElement);
        textInput.setWidth(design.textInputWidth);
        textInput.setFontSize(design.buttonFontSize);
        textInput.setValue(this.params[this.property]);
        this.uiElement = textInput;
        this.setupOnChange();
        this.setupOnInteraction();
    } else if (guiUtils.isNumber(paramValue)) {
        // it is a number
        const button = new NumberButton(this.domElement);
        button.setInputWidth(design.numberInputWidth);
        // separating space to additional elements
        guiUtils.hSpace(this.domElement, NumberButton.spaceWidth);
        // set limits and step
        if (guiUtils.isNumber(low)) {
            button.setLow(low);
        }
        if (guiUtils.isNumber(high)) {
            button.setHigh(high);
        }
        if (guiUtils.isNumber(step)) {
            button.setStep(step);
        } else {
            button.setStep(NumberButton.findStep(paramValue));
        }
        button.setValue(paramValue);
        this.uiElement = button;

        // special methods

        /**
         * make that the number input is cyclic
         * @method ParamController#cyclic
         * @return this - for chaining
         */
        this.cyclic = function() {
            button.setCyclic();
            return this;
        };

        /**
         * make an add button
         * @method ParamController#createAddButton
         * @param {string} text
         * @param {number} amount
         * @return this controller
         */
        this.createAddButton = function(text, amount) {
            button.createAddButton(text, this.buttonContainer, amount);
            guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
            return this;
        };

        /**
         * make plus and minus 1 buttons
         * @method ParamController#createPlusMinusButtons
         * @return this controller
         */
        ParamController.prototype.createPlusMinusButtons = function() {
            this.createAddButton("-1", -1);
            this.createAddButton("+1", 1);
            return this;
        };

        /**
         * make an multiplication button
         * @method ParamController#createMulButton
         * @param {string} text
         * @param {number} amount
         * @return this controller
         */
        this.createMulButton = function(text, amount) {
            button.createMulButton(text, this.buttonContainer, amount);
            guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
            return this;
        };

        /**
         * make multiply and divide by 2 buttons
         * @method ParamController#createMulDivButtons
         * @return this controller
         */
        ParamController.prototype.createMulDivButtons = function() {
            this.createMulButton("/ 2", 0.5);
            this.createMulButton("* 2", 2);
            return this;
        };

        /**
         * create a button that sets the minimum value
         * @method ParamController#createMiniButton
         * @return this - the controller
         */
        this.createMiniButton = function() {
            button.createMiniButton(this.buttonContainer);
            guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
            return this;
        };

        /**
         * create a button that sets the maximum value
         * @method ParamController#createMaxiButton
         * @return this - the controller
         */
        this.createMaxiButton = function() {
            button.createMaxiButton(this.buttonContainer);
            guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
            return this;
        };

        /**
         * make min and max buttons
         * @method ParamController#createMaxMinButtons
         * @return this controller
         */
        ParamController.prototype.createMaxMinButtons = function() {
            this.createMiniButton();
            this.createMaxiButton();
            return this;
        };

        /**
         * create a button that moves cursor to the left
         * @method ParamController#createLeftButton
         * @return this - the controller
         */
        this.createLeftButton = function() {
            button.createLeftButton(this.buttonContainer);
            guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
            return this;
        };

        /**
         * create a button that moves cursor to the right
         * @method ParamController#createRightButton
         * @return this - the controller
         */
        this.createRightButton = function() {
            button.createRightButton(this.buttonContainer);
            guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
            return this;
        };

        /**
         * create a button that decreases value at cursor
         * @method ParamController#createDecButton
         * @return this - the controller
         */
        this.createDecButton = function() {
            button.createDecButton(this.buttonContainer);
            guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
            return this;
        };

        /**
         * create a button that increases value at cursor
         * @method ParamController#createIncButton
         * @return this - the controller
         */
        this.createIncButton = function() {
            button.createIncButton(this.buttonContainer);
            guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
            return this;
        };

        /**
         * create the leftDownUpRight buttons
         * @method ParamController#createLeftDownUpRightButtons
         */
        this.createLeftDownUpRightButtons = function() {
            this.createLeftButton();
            this.createDecButton();
            this.createIncButton();
            this.createRightButton();
        };

        /**
         * create a range element of short length
         * @method ParamController#createSmallRange
         */
        this.createSmallRange = function() {
            button.createRange(this.buttonContainer);
            button.setRangeWidth(this.design.rangeSliderLengthShort);
            guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        };

        /**
         * create a range element of long length
         * @method ParamController#createLongRange
         */
        this.createLongRange = function() {
            button.createRange(this.buttonContainer);
            button.setRangeWidth(this.design.rangeSliderLengthLong);
            guiUtils.hSpace(this.buttonContainer, NumberButton.spaceWidth);
        };

        this.setupOnChange();
        this.setupOnInteraction();
    } else {
        // no idea/error
        this.createLabel(this.property + " *** error: no controll");
        console.log("no fitting controller found");
        console.log(low);
        console.log(high);
        console.log(step);
    }
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

/**
 * make that numberbuttons and range elements become cyclic
 * deafult: other buttons without effect
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
    this.uiElement.destroy(); // destroyes the additional secondary buttons and the range too
    this.uiElement = null;
    if (this.label) {
        this.label.remove();
        this.label = null;
    }
    this.domElement.remove();
    this.domElement = null;
    this.buttonContainer = null;
    this.params = null;
    this.callback = null;
};

/**
 * same as destroy, but is in dat.gui api
 * @method ParamController.remove
 */
ParamController.prototype.remove = ParamController.prototype.destroy;