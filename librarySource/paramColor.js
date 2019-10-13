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

    // "inherit" paramControllerMethods:
    //======================================
    //
    // this.createLabel
    // this.setupOnChange
    // this.hidePopup
    // this.shoePopup
    // this.hidePopup
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

    Object.assign(ParamColor.prototype, paramControllerMethods);

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


    /**
     * same as destroy, but is in dat.gui api
     * @method ParamController.remove
     */
    ParamColor.prototype.remove = ParamColor.prototype.destroy;


}());
