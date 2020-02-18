/**
 * methods for all kind of (parameter) controllers
 * use Object.assign(.....prototype,paramControllerMethods);
 * @namespace paramControllerMethods
 */

import {
    Button,
    InstantHelp,
    ParamGui,
    guiUtils
} from "./modules.js";

export const paramControllerMethods = {};

/**
 * check if the container domElement is a div
 * @method paramControllerMethods.isInDiv
 * @return true if inside a div
 */
paramControllerMethods.isInDiv = function() {
    return this.domElement.tagName.toLowerCase() === "div";
};

/**
 * make a label with given text and space 
 * it is a span, padding at right and left
 * minWidth is default design value or args.minLabelWidth
 * text is the argument text or args.labelText
 * @method paramControllerMethods.createLabel
 * @param {string} text
 */
paramControllerMethods.createLabel = function(text) {
    const design = this.design;
    this.label = document.createElement("span");
    this.label.style.fontSize = design.labelFontSize + "px";
    // minimum width for alignment of inputs
    this.label.style.display = "inline-block";


    this.label.style.minWidth = guiUtils.check(this.args.minLabelWidth, design.labelWidth) + "px";
    this.label.style.textAlign = design.labelTextAlign;
    // space between label and controller or left border
    this.label.style.paddingLeft = design.spaceWidth + "px";
    this.label.style.paddingRight = design.spaceWidth + "px";
    this.domElement.appendChild(this.label);

    //   let text = guiUtils.check(this.property, "");
    text = guiUtils.check(this.args.labelText, text);
    this.label.textContent = text;

};

/**
 * add a help alert
 * @method paramControllerMethods.addHelp
 * @param {String} message - with html markup
 * @return this, for chaining
 */
paramControllerMethods.addHelp = function(message) {
    this.helpButton = new InstantHelp(message, this.domElement);
    this.helpButton.setFontSize(this.design.buttonFontSize);
    return this;
};

/**
 * test if the controller has a params object and a property
 * test if the corresponding field exists
 * in case, change the value
 * @method ParamController.setParamsProperty
 * @param {whatever} value
 */
paramControllerMethods.setParamsProperty = function(value) {
    if (this.params && this.property && guiUtils.isDefined(this.params[this.property])) {
        this.params[this.property] = value;
    }
};

/**
 * connect the ui controller with the param object:
 * sets the onChange function of the ui element
 * onChange sets the param[property] value if param and property are defined
 * (synchronizes ui display and data object)
 * basic functionality, redefine element.onChange for complicated controllers
 * @method paramControllerMethods.setupOnChange
 */
paramControllerMethods.setupOnChange = function() {
    const element = this.uiElement;
    const controller = this;
    // element.onChange gets called only if the value changes
    element.onChange = function() {
        const value = element.getValue();
        controller.setParamsProperty(value);
        controller.callback(value);
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

// setting and getting values. Be careful if a params object exists:
// Two different values, of the ui and the object.
// they have to be synchronized
// different values: use the ui value, change the object value
// if the value of the param object changes, then update the object via callback

/**
 * updates display and set the value of the param object if it exists
 * DOES NOT call the callback()
 * (good for multiple parameter changes, use callback only at last change
 * (Note that this.setValue() is not the same as this.uiElement.setValue())
 * Can we assume that the param object is synchronized with its data? Is this probable? Can we save work?
 * @method paramControllerMethods.setValue
 * @param {whatever} value
 */
paramControllerMethods.setValueOnly = function(value) {
    this.setParamsProperty(value);
    this.uiElement.setValue(value);
};

/**
 * set the value of the controller
 * set the value of the param object (if exists) and call the callback to enforce synchronization
 * (Note that this.setValue() is not the same as this.uiElement.setValue())
 * @method paramControllerMethods.setValue
 * @param {whatever} value
 */
paramControllerMethods.setValue = function(value) {
    this.setParamsProperty(value);
    this.uiElement.setValue(value);
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
 * if params exist, else do nothing
 * @method paramControllerMethods.updateDisplay
 */
paramControllerMethods.updateDisplay = function() {
    if (this.params && this.property && guiUtils.isDefined(this.params[this.property])) {
        const value = this.params[this.property];
        this.uiElement.setValue(value);
    }
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
 * periodically call updateDisplay to show changes automatically
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
 * changes the label text, instead of the property string, to show something more interesting
 * for buttons: changes the button text
 * does nothing if there is no label
 * same as datGui
 * @method paramControllerMethods.name
 * @param {String} label
 * @return this, for chaining
 */
paramControllerMethods.name = function(label) {
    if (this.uiElement instanceof Button) {
        this.uiElement.setText(label);
    } else if (this.label) {
        this.label.textContent = label;
    }
    return this;
};

/**
 * for buttons only, changes the button text
 * same as datGui
 * @method paramControllerMethods.setButtonText
 * @param {String} label
 * @return this, for chaining
 */
paramControllerMethods.setButtonText = function(label) {
    if (this.uiElement instanceof Button) {
        this.uiElement.setText(label);
    }
    return this;
};

/**
 * changes the label text, instead of property name, to show something more interesting
 * for buttons: changes label (starts as empty string)
 * @method paramControllerMethods.setLabel
 * @param {String} label
 * @return this, for chaining
 */
paramControllerMethods.setLabel = function(label) {
    if (this.label) {
        this.label.textContent = label;
    }
    return this;
};

/**
 * delete the label, including its space
 * @method paramControllerMethods.deleteLabel
 * @return this, for chaining
 */
paramControllerMethods.deleteLabel = function() {
    if (this.label) {
        this.label.remove();
        this.label = false;
    }
    return this;
};

/**
 * layout: add a space
 * @method paramControllerMethods.hSpace
 * @param {number} width
 * @return this
 */
paramControllerMethods.hSpace = function(width) {
    guiUtils.hSpace(this.domElement, width);
    return this;
};

/**
 * register parent domElement in guiUtils for styling
 * see docu of guiUtils.style
 * use: controller.style().backgroundColor("red")
 * @method paramControllerMethods.style
 * @return guiUtils
 */
paramControllerMethods.style = function() {
    return guiUtils.style(this.parent);
};

/**
 * set a minimum width for label
 * @method paramControllerMethods.setLabelMinWidth
 * @param {int} width
 * @return this, for chaining
 */
paramControllerMethods.setLabelMinWidth = function(width) {
    if (this.label) {
        this.label.style.minWidth = width + "px";
    }
    return this;
};

/**
 * set a minimum width for the main ui element
 * @method paramControllerMethods.setElementMinWidth
 * @param {int} width
 * @return this, for chaining
 */
paramControllerMethods.setElementMinWidth = function(width) {
    this.uiElement.setMinWidth(width);
    return this;
};

/**
 * make that numberbuttons and range elements become cyclic
 * default: other buttons without effect
 * @method ParamControllerMethods.cyclic
 * @return this for chaining
 */
// here a do nothing stub for non-number controllers
paramControllerMethods.cyclic = function() {
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
