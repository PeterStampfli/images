/* jshint esversion:6 */

/**
 * a controller for color
 * with visuals, in a common div
 * @creator ParamColor
 * @param {ParamGui} gui - the controller is in this gui
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property - for the field of object to change, params[property]
 */

function ParamColor(gui, params, property) {
    this.gui = gui;
    this.params = params;
    this.property = property;
    this.listening = false; // automatically update display
    this.create();
}

(function() {
    "use strict";
    const px = "px";

    /**
     * inherit from paramController (load before?)
     * make a label with given text and space
     * make link to label and space elements, to be able to change/delete
     * @method ParamColor.createLabel
     * @param {String} text
     */
    ParamColor.prototype.createLabel = ParamController.prototype.createLabel;

    /**
     * inherit from paramController (load before?)
     * connect the ui controller with the param object:
     * sets the onChange function of the ui element
     * onChange sets the param[property] value, the lastValue field
     * (synchronizes ui display and data object)
     * and calls the callback
     * @method ParamColor#setupOnChange
     */
    ParamColor.prototype.setupOnChange = ParamController.prototype.setupOnChange;

    /**
     * making a ui control element, same as in "lib/dat.gui.min2.js", one on each line
     * call from creator function
     * @method ParamController#create
     */
    ParamColor.prototype.create = function() {
        const design = this.gui.design;
        const controller = this;
        const paramValue = this.params[this.property];
        const type = (typeof paramValue);
        if (type === "string") {
            this.type = "css";
        }
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
        if (this.type === "css") {
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
     * @method ParamColor#hidePopup
     * @param {boolean} always
     */
    ParamColor.prototype.hidePopup = function(always) {
        if ((typeof this.popupDiv === "object") && (always || !this.doNotHidePopup)) {
            this.popupDiv.style.display = "none";
            console.log("hide");
        }
        this.doNotHidePopup = false;
    };

    /**
     * show the popup if it exists 
     * @method ParamColor#showPopup
     */
    ParamColor.prototype.showPopup = function() {
        if (typeof this.popupDiv === "object") {
            console.log("show");
            this.popupDiv.style.display = "block";
        }
    };

    /**
     * inherit from ParamController
     * set the callback function for onchange events
     * @method ParamColor#onChange
     * @param {function} callback - function(value), with value of controller as argument
     * @return this
     */
    ParamColor.prototype.onChange = ParamController.prototype.onChange;

    /**
     * inherit from ParamController
     * same as destroy, but is in dat.gui api
     * @method ParamController.remove
     */
    ParamColor.prototype.remove = ParamColor.prototype.destroy;

    /**
     * inherit from ParamController
     * set the callback function for onclick events
     * (same as onChange)
     * @method ParamController#onClick
     * @param {function} callback - function()
     * @return this
     */
    ParamController.prototype.onClick = ParamController.prototype.onChange;

    /**
     * inherit from ParamController
     * set the callback function for onchange events, because it is the dat.gui api
     * @method ParamController#onFinishChange
     * @param {function} callback - function(value), with value of controller as argument
     * @return this
     */
    ParamController.prototype.onFinishChange = ParamController.prototype.onChange;

    /**
     * set the value of the controller and last value field
     * @method ParamColor#setValue
     * @param {whatever} value
     */
    ParamColor.prototype.setValue = ParamController.prototype.setValue;

    /**
     * inherit from ParamController
     * get the value of the controller
     * Note that depending on this.type we need to do different things
     * @method ParamColor#getValue
     * @return {whatever} value
     */
    ParamColor.prototype.getValue = ParamController.prototype.getValue;

    /**
     * Note that depending on this.type we need to do different things
     * set the value of the controller according to the actual value of the parameter in the params object
     * updates display automatically
     * @method ParamColor#updateDisplay
     */
    ParamColor.prototype.updateDisplay = function() {
        const value = this.params[this.property];
        this.lastValue = value;
        this.uiElement.setValue(value);
    };

    /**
     * inherit from ParamController
     * updateDisplay and lastValue field If controller is Listening  and parameter value has changed
     * @method ParamColor#updateDisplayIfListening
     */
    ParamColor.prototype.updateDisplayIfListening = ParamController.prototype.updateDisplayIfListening;

    /**
     * inherit from ParamController
     * periodically call updateDisplay to show changes automatically
     * @method ParamColor#listen
     * @return this, for chaining
     */
    ParamColor.prototype.listen = ParamController.prototype.listen;

    /**
     * inherit from ParamController
     * changes the label text, instead of property name, to show something more interesting
     * for buttons changes the button text
     * @method ParamColor#name
     * @param {String} label
     * @return this, for chaining
     */
    ParamColor.prototype.name = ParamController.prototype.name;

    /**
     * inherit from ParamController
     * make the controller disappear including its space (display==none)
     * @method ParamColor#hide
     * @return this
     */
    ParamColor.prototype.hide = ParamController.prototype.hide;

    /**
     * inherit from ParamController
     * make the controller visible including its space (display==initial)
     * @method ParamColor#show
     * @return this
     */
    ParamColor.prototype.show = ParamController.prototype.show;

}());
