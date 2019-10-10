/* jshint esversion:6 */

/**
 * a controller for a simple parameter
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
    this.listening = false; // automatically update display
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

    // test if a variable is an object, not an array
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
     * @method ParamController#setupOnChange
     */
    ParamController.prototype.setupOnChange = function() {
        const element = this.uiElement;
        const controller = this;
        element.onChange = function() {
            const value = element.getValue();
            controller.params[controller.property] = value;
            controller.lastValue = value; // avoid unnecessary display update (listening)
            controller.callback(value);
        };
    };

    /**
     * making a ui control element, same as in "lib/dat.gui.min2.js", one on each line
     * call from creator function
     * @method ParamController#create
     */
    ParamController.prototype.create = function(low, high, step) {
        const design = this.gui.design;
        const controller = this;
        const paramValue = this.params[this.property];
        this.lastValue = paramValue;
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
        // what should be done if value changes or button clicked
        this.callback = function(value) {
            console.log("callback value " + value);
        };
        if (isArray(low) || isObject(low)) {
            // low, the first parameter for limits is an array or object, thus make a selection
            this.createLabel(this.property);
            const id = DOM.createId();
            DOM.create("select", id, "#" + this.domElementId);
            DOM.style("#" + id, "font-size", design.buttonFontSize + px);
            const select = new SelectValues(id);
            this.uiElement = select;
            select.setLabelsValues(low);
            select.setValue(paramValue);
            this.setupOnChange();
        } else if (isBoolean(paramValue)) {
            // the parameter value is boolean, thus make a BooleanButton
            this.createLabel(this.property);
            const id = DOM.createId();
            DOM.create("button", id, "#" + this.domElementId);
            DOM.style("#" + id,
                "minWidth", design.onOffButtonWidth + px,
                "font-size", design.buttonFontSize + px);
            const button = new BooleanButton(id);
            this.uiElement = button;
            button.setValue(paramValue);
            this.setupOnChange();
        } else if (!isDefined(paramValue) || (typeof paramValue === "function")) {
            // there is no parameter value with the property or it is a function
            // thus make a button with the property as text, no label
            this.createLabel("");
            const id = DOM.createId();
            DOM.create("button", id, "#" + this.domElementId, this.property);
            DOM.style("#" + id, "font-size", design.buttonFontSize + px);
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
                "width", design.textInputWidth + px,
                "font-size", design.buttonFontSize + px);
            const textInput = new TextInput(id);
            textInput.setValue(paramValue);
            this.uiElement = textInput;
            this.setupOnChange();
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
                "width", design.numberInputWidth + px,
                "font-size", design.buttonFontSize + px);
            DOM.style("#" + button.idPlus + ",#" + button.idMinus + ",#" + button.idMin + ",#" + button.idMax,
                "font-size", design.buttonFontSize + px);
            if (isInteger(high)) {
                button.setRange(low, high);
            } else if (isInteger(low)) {
                button.setLow(low);
            } else {
                button.setLow(0);
            }
            button.setValue(paramValue);
            this.uiElement = button;
            this.setupOnChange();
        } else if (isInteger(paramValue) && isInteger(low) && isInteger(high) && isNumber(step) && (Math.abs(step - 1) < 0.01)) {
            // the parameter value is integer, and the low limit too 
            // high is integer  and step is integer equal to 1
            // thus make a range element with plus/minus button 
            this.createLabel(this.property);
            const id = DOM.createId();
            DOM.create("span", id, "#" + this.domElementId);
            const range = Range.createPlusMinus(id);
            DOM.style("#" + this.labelId,
                "transform", "translateY(" + (-design.rangeVOffset) + "px)");
            DOM.style("#" + range.idText,
                "width", design.numberInputWidth + px,
                "font-size", design.buttonFontSize + px,
                "transform", "translateY(" + (-design.rangeVOffset) + "px)");
            DOM.style("#" + range.idRange,
                "width", design.rangeSliderLengthShort + px);
            DOM.style("#" + range.idPlus + ",#" + range.idMinus,
                "font-size", design.buttonFontSize + px,
                "transform", "translateY(" + (-design.rangeVOffset) + "px)");
            range.setRange(low, high);
            range.setStep(1);
            range.setValue(paramValue);
            this.uiElement = range;
            this.setupOnChange();
        } else if (isNumber(paramValue) && isNumber(low) && isNumber(high)) {
            // param value and range limits are numbers, at least one of them is not integer or there is a non-integer step value 
            // thus use a range element
            this.createLabel(this.property);
            const id = DOM.createId();
            DOM.create("span", id, "#" + this.domElementId);
            const range = Range.create(id);
            DOM.style("#" + this.labelId,
                "transform", "translateY(" + (-design.rangeVOffset) + "px)");
            DOM.style("#" + range.idText,
                "width", design.numberInputWidth + px,
                "font-size", design.buttonFontSize + px,
                "transform", "translateY(" + (-design.rangeVOffset) + "px)");
            DOM.style("#" + range.idRange,
                "width", design.rangeSliderLengthLong + px);

            range.setRange(low, high);
            if (isNumber(step)) {
                range.setStep(step);
            }
            range.setValue(paramValue);
            this.uiElement = range;
            this.setupOnChange();
        } else {
            // no idea/error
            this.createLabel(this.property + " *** error");
        }
        return this;
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
     * @method ParamController#hidePopup
     * @param {boolean} always
     */
    ParamController.prototype.hidePopup = function(always) {
        if (isObject(this.popupDiv) && (always || !this.doNotHidePopup)) {
            this.popupDiv.style.display = "none";
            console.log("hide");
        }
        this.doNotHidePopup = false;
    };

    /**
     * show the popup if it exists 
     * @method ParamController#showPopup
     */
    ParamController.prototype.showPopup = function() {
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
     * @method ParamController#createPopup
     * @return {Div} the popup div 
     */
    ParamController.prototype.createPopup = function() {
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
            console.log("dom contr click");
        };
        return this.popupDiv;
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

    // setting and getting values:
    // Be careful. Two different values, of the ui and the object.
    // they have to be synchronized
    // different values: use the ui value, change the object value
    // if the value of the param object changes, then update the object via callback

    /**
     * set the value of the controller and last value field
     * set the value of the param object and call the callback to enforce synchronization
     * (Note that this.setValue() is not the same as this.uiElement.setValue())
     * Can we assume that the param object is synchronized with its data? Is this probable? Can we save work?
     * @method ParamController#setValue
     * @param {whatever} value
     */
    ParamController.prototype.setValue = function(value) {
        console.log("set " + value);
        this.lastValue = value;
        this.params[this.property] = value;
        this.uiElement.setValue(value);
        this.callback(value);
    };

    /**
     * get the value of the controller
     * (should be the same as the value for the param object
     * the param object should be updated to reflect the value
     * @method ParamController#getValue
     * @return {whatever} value
     */
    ParamController.prototype.getValue = function() {
        return this.uiElement.getValue();
    };

    /**
     * set the value of the controller according to the actual value of the parameter in the params object
     * do not update the param object
     * updates display automatically
     * @method ParamController#updateDisplay
     */
    ParamController.prototype.updateDisplay = function() {
        const value = this.params[this.property];
        this.lastValue = value;
        this.uiElement.setValue(value);
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
        if (typeof this.popupDiv === "object") {
            this.popupDiv = null;
            this.popupDiv.remove();
            this.uiElement.onClick = null;
            console.log("romove popup");
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

}());
