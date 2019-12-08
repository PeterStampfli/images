import {
    paramControllerMethods,
    ImageSelect
} from "./modules.js";

/**
 * make a controller with an image selection
 * each choice is an object with a name, icon and value field
 * choice={name: "name as string", icon: "URL for icon image", value: whatever}
 * the value can be an image URL, a preset (URL of json file)
 * multiple choices are put together in an array
 * @creator ParamImageSelection
 * @param {ParamGui} gui - the controller is in this gui
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property - for the field of object to change, params[property]
 * @param {array} choices - an array of choice objects
 */

export function ParamImageSelection(gui, params, property, choices) {
    this.gui = gui;
    this.params = params;
    this.property = property;
    this.listening = false; // automatically update display
    this.initCreate(); // create this.domElement with padding
    this.createLabel(this.property);
    this.label.style.verticalAlign = "middle";

    const design = this.gui.design;
    const newDesign = {
        // image select panel part
        panelSpaceWidth: design.labelSpacing,
        panelFontSize: design.buttonFontSize,

    };


    const imageSelect = new ImageSelect(this.domElement, newDesign);
    imageSelect.addChoices(choices);
    imageSelect.setValue(this.params[this.property]);
    this.uiElement = imageSelect;
    this.setupOnChange();
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

Object.assign(ParamImageSelection.prototype, paramControllerMethods);

/**
 * destroy the controller
 * @method ParamImageSelection#destroy
 */
ParamImageSelection.prototype.destroy = function() {
    if (this.helpButton !== null) {
        this.helpButton.destroy();
    }
    this.uiElement.destroy();
    this.uiElement = null;

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
ParamImageSelection.prototype.remove = ParamImageSelection.prototype.destroy;