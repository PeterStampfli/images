/* jshint esversion:6 */

/**
 * a controller for color
 * with visuals, in a common div
 * @creator ParamAngle
 * @param {ParamGui} gui - the controller is in this gui
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property - for the field of object to change, params[property]
 */

function ParamAngle(gui, params, property) {
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
     * @method ParamAngle#create
     */
    ParamAngle.prototype.create = function() {
        const design = this.gui.design;
        const controller = this;
        const paramValue = this.params[this.property];



        return this;
    };




    /**
     * same as destroy, but is in dat.gui api
     * @method ParamController.remove
     */
    ParamColor.prototype.remove = ParamColor.prototype.destroy;

}());
