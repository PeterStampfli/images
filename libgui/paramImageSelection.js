import {
    paramControllerMethods,
    ImageSelect
} from "./modules.js";

/**
 * make a controller with an image selection
 * choices as an object with (label: value pairs)
 * for choosing images:
 * set labels and image urls as two strings, key value pairs of an object choices={ "label1": "URL1", ...},
 * for other uses (presets): image is only a label 
 * then use an object made of labels (again as keys) and value objects with image and value fields
 * this value field is actually choosen (the preset object), thus
 * choices={"label1": {"image": "URL1", value: someData}, ...}
 * @creator ParamImageSelection
 * @param {ParamGui} gui - the controller is in this gui
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property - for the field of object to change, params[property]
 * @param {object} choices 
 */

export function ParamImageSelection(gui, params, property, choices) {
    this.gui = gui;
    this.params = params;
    this.property = property;
    this.listening = false; // automatically update display
    this.initCreate(); // create this.domElement with padding
        this.createLabel(this.property);
        this.label.style.verticalAlign="top";
    const imageSelect = new ImageSelect(this.domElement);
    imageSelect.setChoices(choices);
    imageSelect.setValue(this.params[this.property]);
    const design = this.gui.design;
    imageSelect.setFontSize(design.buttonFontSize);
    imageSelect.setImageSize(design.imageSelectWidth, design.imageSelectHeight);
imageSelect.setVerticalSpacing(design.paddingVertical);

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
// this.hidePopup
// this.showPopup
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