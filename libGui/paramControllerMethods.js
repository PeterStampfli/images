/**
 * methods for all kind of (parameter) controllers
 * use Object.assign(.....prototype,paramControllerMethods);
 * @namespace paramControllerMethods
 */

/* jshint esversion:6 */
import {
    DOM,
    SelectValues,
    BooleanButton,
    NumberButton,
    Range,
    TextInput,
    Button,
    ColorInput,
    ParamGui
} from "./modules.js";

export const paramControllerMethods = {};

const px = "px";

/**
 * make a label with given text and space
 * make link to label and space elements, to be able to change/delete
 * @method paramControllerMethods.createLabel
 * @param {String} text
 */
paramControllerMethods.createLabel = function(text) {
    const design = this.gui.design;
    this.labelId = DOM.createId();
    this.label = DOM.create("span", this.labelId, "#" + this.domElementId, text);
    DOM.style("#" + this.labelId,
        "minWidth", design.controllerLabelWidth + px,
        "display", "inline-block",
        "font-size", design.controllerLabelFontSize + px,
        "paddingLeft", design.labelSpacing + px,
        "paddingRight", design.labelSpacing + px);
};

/**
 * initialize creation
 * create the div, initialize parameter values
 * set uiElement to null, default callback
 * @method paramControllerMethods.initCreate
 */
paramControllerMethods.initCreate = function() {
    const design = this.gui.design;
    // create a div for all elements of the controller
    this.domElementId = DOM.createId();
    // it lies in the bodyDiv of the ParamGui
    this.domElement = DOM.create("div", this.domElementId, "#" + this.gui.bodyDivId);
    // make a regular spacing between labels ???
    DOM.style("#" + this.domElementId,
        "minHeight", design.minControllerHeight + px,
        "marginBottom", design.paddingVertical + px,
        "marginTop", design.paddingVertical + px
    );
    // the button or whatever the user interacts with
    this.uiElement = null;

    /**
     * instant callback for small changes
     * @method paramControllerMethods.callback
     * @param {anything} value
     */
    this.callback = function(value) {
        console.log("callback value " + value);
    };

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

//  creating basic controllers

/**
 * create a bare styled color input
 * @method paramControllerMethods.styledColorInput
 * @param {String} containerId - id of the enclosing div 
 * @return textInput
 */
paramControllerMethods.styledColorInput = function(containerId) {
    const design = this.gui.design;
    const id = DOM.createId();
    DOM.create("input", id, "#" + containerId);
    DOM.style("#" + id,
        "width", design.colorInputWidth + px,
        "font-size", design.buttonFontSize + px,
        "transform", "translateY(" + (design.colorVOffset) + "px)");
    const colorInput = new ColorInput(id);
    return colorInput;
};

/**
 * create a bare styled text input
 * @method paramControllerMethods.styledTextInput
 * @param {String} containerId - id of the enclosing div 
 * @return textInput
 */
paramControllerMethods.styledTextInput = function(containerId) {
    const design = this.gui.design;
    const id = DOM.createId();
    DOM.create("input", id, "#" + containerId);
    DOM.style("#" + id,
        "width", design.textInputWidth + px,
        "font-size", design.buttonFontSize + px);
    return new TextInput(id);
};

/**
 * create a bare styled button, width adapts to button text
 * @method paramControllerMethods.styledButton
 * @param {String} text - button text 
 * @param {String} containerId - id of the enclosing div 
 * @return button
 */
paramControllerMethods.styledButton = function(text, containerId) {
    const design = this.gui.design;
    const id = DOM.createId();
    DOM.create("button", id, "#" + containerId, text);
    DOM.style("#" + id,
        "font-size", design.buttonFontSize + px);
    return new Button(id);
};

/**
 * create a bare styled boolean button, width onoff button width
 * @method paramControllerMethods.styledBooleanButton
 * @param {String} containerId - id of the enclosing div 
 * @return button
 */
paramControllerMethods.styledBooleanButton = function(containerId) {
    console.log(containerId)
    const container=document.querySelector("#"+containerId);
    const design = this.gui.design;
    
    const result=new BooleanButton(container);
    result.setWidth(design.onOffButtonWidth);
    result.setFontSize(design.buttonFontSize);
    return result;
};

/**
 * create a bare styled select element,  adjusts to options width
 * @method paramControllerMethods.styledSelect
 * @param {String} containerId - id of the enclosing div 
 * @return button
 */
paramControllerMethods.styledSelect = function(containerId) {
    const design = this.gui.design;
    const id = DOM.createId();
    DOM.create("select", id, "#" + containerId);
    DOM.style("#" + id,
        "font-size", design.buttonFontSize + px);
    return new SelectValues(id);
};

/**
 * create a bare styled numberbutton element, with plus/minus and min/max buttons
 * @method paramControllerMethods.styledNumberButton
 * @param {String} containerId - id of the enclosing div 
 * @return button
 */
paramControllerMethods.styledNumberButton = function(containerId) {
    const design = this.gui.design;
    const id = DOM.createId();
    DOM.create("span", id, "#" + containerId);
    const button = NumberButton.createInfinity(id);
    DOM.style("#" + button.idName,
        "width", design.numberInputWidth + px,
        "font-size", design.buttonFontSize + px);
    DOM.style("#" + button.idPlus + ",#" + button.idMinus + ",#" + button.idMin + ",#" + button.idMax,
        "font-size", design.buttonFontSize + px);
    return button;
};

/**
 * create a bare styled range element
 * @method paramControllerMethods.styledRange
 * @param {String} containerId - id of the enclosing div 
 * @return button
 */
paramControllerMethods.styledRange = function(containerId) {
    const design = this.gui.design;
    const id = DOM.createId();
    DOM.create("span", id, "#" + containerId);
    const range = Range.create(id);
    DOM.style("#" + range.idText,
        "width", design.numberInputWidth + px,
        "font-size", design.buttonFontSize + px);
    DOM.style("#" + range.idRange,
        "width", design.rangeSliderLengthLong + px);
    return range;
};

/**
 * create a bare styled range element for integers with plus/minus buttons
 * @method paramControllerMethods.styledRangeForIntegers
 * @param {String} containerId - id of the enclosing div 
 * @return button
 */
paramControllerMethods.styledRangeForIntegers = function(containerId) {
    const design = this.gui.design;
    const id = DOM.createId();
    DOM.create("span", id, "#" + containerId);
    const range = Range.createPlusMinus(id);
    DOM.style("#" + range.idText,
        "width", design.numberInputWidth + px,
        "font-size", design.buttonFontSize + px,
        "transform", "translateY(" + (-design.rangeVOffset) + "px)");
    DOM.style("#" + range.idRange,
        "width", design.rangeSliderLengthShort + px);
    DOM.style("#" + range.idPlus + ",#" + range.idMinus,
        "font-size", design.buttonFontSize + px,
        "transform", "translateY(" + (-design.rangeVOffset) + "px)");
    range.setStep(1);
    return range;
};

// popups for complicated controls
// this.popupDiv is a div that contains the popup elements
// this.popupDivId is its id
// this.hidePopup(always) is a method that hides the popup (visibility hidden)
// this.showPopup() is a method that shows the popup (visibility visible)
// this.createPopup() creates the this.popup div of height zero
// this.doNotHidePopup if true this.hidePopup does not hide popup except always=true

/**
 * hide the popup if it exists 
 * and either always=true or controller.doNotHidePopup=false
 * @method paramControllerMethods.hidePopup
 * @param {boolean} always
 */
paramControllerMethods.hidePopup = function(always) {
    if ((typeof this.popupDiv === "object") && (always || !this.doNotHidePopup)) {
        this.popupDiv.style.display = "none";
        console.log("hide");
    }
    this.doNotHidePopup = false;
};

/**
 * show the popup if it exists 
 * @method paramControllerMethods.showPopup
 */
paramControllerMethods.showPopup = function() {
    if (typeof this.popupDiv === "object") {
        console.log("show");
        this.popupDiv.style.display = "block";
    }
};

/**
 * create a popup div with height zero 
 * in the div of the controller
 * call AFTER creating the basic controller
 * creates an onClick function on the controller div to open/keep visible the popup
 * the rootGui domElement has an onclick event that hides popups
 * @method paramControllerMethods.createPopup
 */
paramControllerMethods.createPopup = function() {
    this.popupDivId = DOM.createId();
    this.popupDiv = DOM.create("div", this.popupDivId, "#" + this.domElementId);
    DOM.style("#" + this.popupDivId,
        "color", this.gui.design.popupColor,
        "backgroundColor", this.gui.design.popupBackgroundColor
    );
    this.hidePopup(true);
    const controller = this;
    this.domElement.onclick = function(event) {
        controller.showPopup();
        controller.doNotHidePopup = true;
    };
};

/**
 * set the callback function for onchange events
 * will be called for any input changes
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
        toChange = this.uiElement.element;
    }
    toChange.removeChild(toChange.firstChild);
    const textNode = document.createTextNode(label);
    toChange.appendChild(textNode);
    return this;
};

/**
 * make the controller disappear including its space (display==none)
 * @method paramControllerMethods.hide
 * @return this
 */
paramControllerMethods.hide = function() {
    DOM.displayNone(this.domElementId);
    return this;
};

/**
 * make the controller visible including its space (display==initial)
 * @method paramControllerMethods.show
 * @return this
 */
paramControllerMethods.show = function() {
    DOM.style("#" + this.domElementId, "display", "block");
    return this;
};
