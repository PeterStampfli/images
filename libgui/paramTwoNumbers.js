import {
    paramControllerMethods,
    ImageSelect
} from "./modules.js";

/**
 * make a controller with two real numbers, no limits
 * @creator ParamTwoNumbers
 * @param {ParamGui} gui - the controller is in this gui
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property1 - for the first field of object to change, params[property1]
 * @param {String} property2 - for the second field of object to change, params[property2]
 * @param {String} leftTag - text to show at the left of first input, optional, use "" to skip
 * @param {String} middleTag - text to show between inputs, optional, use "" to skip
 * @param {String} rightTag - text to show at the right of second input, optional, use "" to skip
 */

export function ParamTwoNumbers(gui, params, property1, property2, leftTag = "", middleTag = "", rightTag = "") {
    this.gui = gui;
    this.params = params;
    this.property = property;
    this.listening = false; // automatically update display
    this.initCreate(); // create this.domElement with padding
    this.createLabel(this.property);

    this.gui.bodyDiv.appendChild(this.domElement);
}

const px = "px";

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

Object.assign(ParamTwoNumbers.prototype, paramControllerMethods);

/**
 * destroy the controller
 * @method ParamImageSelection#destroy
 */
ParamTwoNumbers.prototype.destroy = function() {



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
ParamTwoNumbers.prototype.remove = ParamTwoNumbers.prototype.destroy;
