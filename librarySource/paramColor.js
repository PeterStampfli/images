/* jshint esversion:6 */


import {
    paramControllerMethods,
    DOM
} from "./modules.js";

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
        this.initCreate();
        const design = this.gui.design;
        const paramValue = this.params[this.property];
        const controller = this;
        const type = (typeof paramValue);
        if (type === "string") {
            this.type = "css";
        }
        if (this.type === "css") {
            // the parameter value is a string thus make a text input button
            this.createLabel(this.property);
            const textInput = this.styledTextInput(this.domElementId);
            textInput.setValue(paramValue);
            this.uiElement = textInput;
            this.setupOnChange();
        }
        return this;
    };

    /**
     * destroy the controller
     * @method ParamColor#destroy
     */
    ParamColor.prototype.destroy = function() {
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
    ParamColor.prototype.remove = ParamColor.prototype.destroy;

}());

export {
    ParamColor
};
