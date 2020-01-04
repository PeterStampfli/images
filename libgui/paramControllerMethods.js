/**
 * methods for all kind of (parameter) controllers
 * use Object.assign(.....prototype,paramControllerMethods);
 * @namespace paramControllerMethods
 */

import {
    SelectValues,
    BooleanButton,
    NumberButton,
    TextInput,
    Button,
    InstantHelp,
    ColorInput,
    ParamGui
} from "./modules.js";

export const paramControllerMethods = {};

/**
 * make a label with given text and space
 * make link to label and space elements, to be able to change/delete
 * @method paramControllerMethods.createLabel
 * @param {String} text
 */
paramControllerMethods.createLabel = function(text) {
    const design = this.gui.design;
    this.label = document.createElement("span");
    this.label.textContent = text;
    this.label.style.fontSize = design.labelFontSize + "px";
    // minimum width for alignment of inputs
    this.label.style.display = "inline-block";
    this.label.style.minWidth = design.labelWidth + "px";
    // space between label and controller or left border
    this.label.style.paddingLeft = design.spaceWidth + "px";
    this.label.style.paddingRight = design.spaceWidth + "px";
    this.domElement.appendChild(this.label);
};

/**
 * initialize creation
 * create the div, initialize parameter values
 * set uiElement to null, default callback
 * attention:  attach to dom later
 *   this.gui.bodyDiv.appendChild(this.domElement);
 * @method paramControllerMethods.initCreate
 */
paramControllerMethods.initCreate = function() {
    this.helpButton = null;
    const design = this.gui.design;
    // create a div for all elements of the controller
    this.domElement = document.createElement("div");
    // make a regular spacing between elements
    this.domElement.style.paddingTop = design.paddingVertical + "px";
    this.domElement.style.paddingBottom = design.paddingVertical + "px";
    // space at right between help button and border
    this.domElement.style.paddingRight = design.spaceWidth + "px";

    // the button or whatever the user interacts with
    this.uiElement = null;

    /**
     * callback for changes
     * @method paramControllerMethods.callback
     * @param {anything} value
     */
    this.callback = function(value) {
        console.log("callback value " + value);
    };
};

/**
 * add a help alert
 * @method paramControllerMethods.addHelp
 * @param {String} message - with html markup
 * @return this, for chaining
 */
paramControllerMethods.addHelp = function(message) {
    this.helpButton = new InstantHelp(message, this.domElement);
    this.helpButton.setFontSize(this.gui.design.buttonFontSize);
    return this;
};

/**
 * connect the ui controller with the param object:
 * sets the onChange function of the ui element
 * onChange sets the param[property] value
 * (synchronizes ui display and data object)
 * and calls the callback ONLY if the parameter value changes
 * basic functionality, use other element.onChange for complicated controllers
 * @method paramControllerMethods.setupOnChange
 */
paramControllerMethods.setupOnChange = function() {
    const element = this.uiElement;
    const controller = this;
    element.onChange = function() {
        const value = element.getValue();
        if (controller.params[controller.property] !== value) {
            controller.params[controller.property] = value;
            controller.callback(value);
        }
    };
};

/**
 * setup the onInteraction function of the ui element:
 * calling the ParamGui.closePopup method
 * @method paramControllerMethods.setupOnInteraction
 */
paramControllerMethods.setupOnInteraction = function() {
    const element = this.uiElement;
    element.onInteraction = function() {
        ParamGui.closePopup();
    };
};

/**
 * set the callback function for onchange events
 * this is DIFFERENT to my usual definition to be compatible with dat.gui
 * @method paramControllerMethods.onChange
 * @param {function} callback - function(value), with value of controller as argument
 * @return this
 */
paramControllerMethods.onChange = function(callback) {
    this.callback = callback;
    return this;
};

/**
 * set the callback function for onclick events
 * (same as onChange)
 * @method paramControllerMethods.onClick
 * @param {function} callback - function()
 * @return this
 */
paramControllerMethods.onClick = paramControllerMethods.onChange;

/**
 * set the callback function for onchange events
 * will be called for any input changes
 * same as onChange
 * this is here for compatibility to datGui
 * @method paramControllerMethods.onFinishChange
 * @param {function} callback - function(value), with value of controller as argument
 * @return this
 */

paramControllerMethods.onFinishChange = function(callback) {
    this.callback = callback;
    return this;
};

// setting and getting values:
// Be careful. Two different values, of the ui and the object.
// they have to be synchronized
// different values: use the ui value, change the object value
// if the value of the param object changes, then update the object via callback

/**
 * set the value of the param object
 * updates display (and last value field)
 * DOES NOT call the callback()
 * (good for multiple parameter changes, use callback only at last change
 * (Note that this.setValue() is not the same as this.uiElement.setValue())
 * Can we assume that the param object is synchronized with its data? Is this probable? Can we save work?
 * @method paramControllerMethods.setValue
 * @param {whatever} value
 */
paramControllerMethods.setValueOnly = function(value) {
    this.params[this.property] = value;
    this.updateDisplay();
};

/**
 * set the value of the controller and last value field
 * set the value of the param object and call the callback to enforce synchronization
 * (Note that this.setValue() is not the same as this.uiElement.setValue())
 * Can we assume that the param object is synchronized with its data? Is this probable? Can we save work?
 * @method paramControllerMethods.setValue
 * @param {whatever} value
 */
paramControllerMethods.setValue = function(value) {
    this.setValueOnly(value);
    this.callback(value);
};

/**
 * get the value of the controller
 * (should be the same as the value for the param object
 * the param object should be updated to reflect the value
 * @method paramControllerMethods.getValue
 * @return {whatever} value
 */
paramControllerMethods.getValue = function() {
    return this.uiElement.getValue();
};

/**
 * set the value of the display (controller) according to the actual value of the parameter in the params object
 * do not update the param object
 * updates display automatically
 * @method paramControllerMethods.updateDisplay
 */
paramControllerMethods.updateDisplay = function() {
    const value = this.params[this.property];
    this.uiElement.setValue(value);
};

/**
 * updateDisplay If controller is Listening
 * happens even if parameter value has not changed, as this requires not much work
 * @method paramControllerMethods.updateDisplayIfListening
 */
paramControllerMethods.updateDisplayIfListening = function() {
    if (this.listening) {
        this.updateDisplay();
    }
};

/**
 * not implemented: periodically call updateDisplay to show changes automatically
 * because of dat.gui api
 * @method paramControllerMethods.listen
 * @return this, for chaining
 */
paramControllerMethods.listen = function() {
    this.listening = true;
    ParamGui.startListening();
    return this;
};

/**
 * changes the label text, instead of property name, to show something more interesting
 * for buttons changes the button text
 * @method paramControllerMethods.name
 * @param {String} label
 * @return this, for chaining
 */
paramControllerMethods.name = function(label) {
    let toChange = this.label;
    if (this.uiElement instanceof Button) {
        this.uiElement.setText(label);
    } else {
        this.label.textContent = label;
    }
    return this;
};

/**
 * make the controller disappear including its space (display==none)
 * @method paramControllerMethods.hide
 * @return this
 */
paramControllerMethods.hide = function() {
    this.domElement.style.display = "none";
    return this;
};

/**
 * make the controller visible including its space (display==initial)
 * @method paramControllerMethods.show
 * @return this
 */
paramControllerMethods.show = function() {
    this.domElement.style.display = "block";
    return this;
};

/**
 * for controllers with popup: close the popup
 * most controllers don't have a popup, thus this method stub does nothing
 * overwrite for controllers with a popup
 * @method paramControllerMethods.closePopup
 */
paramControllerMethods.closePopup = function() {};
