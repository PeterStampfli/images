/* jshint esversion:6 */

/**
 * methods for all kind of (parameter) controllers
 * use Object.assign(.....prototype,paramControllerMethods);
 * @namespace paramControllerMethods
 */

paramControllerMethods = {};

(function() {
    "use strict";
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
     * connect the ui controller with the param object:
     * sets the onChange function of the ui element
     * onChange sets the param[property] value, the lastValue field
     * (synchronizes ui display and data object)
     * and calls the callback
     * @method paramControllerMethods.setupOnChange
     */
    paramControllerMethods.setupOnChange = function() {
        const element = this.uiElement;
        const controller = this;
        element.onChange = function() {
            const value = element.getValue();
            controller.params[controller.property] = value;
            controller.lastValue = value; // avoid unnecessary display update (listening)
            controller.callback(value);
        };
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
        if (isObject(this.popupDiv)) {
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
     * @return {Div} the popup div 
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
        return this.popupDiv;
    };

    /**
     * set the callback function for onchange events
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
     * set the callback function for onchange events, because it is the dat.gui api
     * @method paramControllerMethods.onFinishChange
     * @param {function} callback - function(value), with value of controller as argument
     * @return this
     */
    paramControllerMethods.onFinishChange = paramControllerMethods.onChange;

    // setting and getting values:
    // Be careful. Two different values, of the ui and the object.
    // they have to be synchronized
    // different values: use the ui value, change the object value
    // if the value of the param object changes, then update the object via callback

    /**
     * set the value of the controller and last value field
     * set the value of the param object
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
     * set the value of the controller according to the actual value of the parameter in the params object
     * do not update the param object
     * updates display automatically
     * @method paramControllerMethods.updateDisplay
     */
    paramControllerMethods.updateDisplay = function() {
        const value = this.params[this.property];
        this.lastValue = value;
        this.uiElement.setValue(value);
    };

    /**
     * updateDisplay and lastValue field If controller is Listening  and parameter value has changed
     * @method paramControllerMethods.updateDisplayIfListening
     */
    paramControllerMethods.updateDisplayIfListening = function() {
        if (this.listening) {
            if (this.params[this.property] !== this.lastValue) {
                this.updateDisplay();
            }
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

}());
