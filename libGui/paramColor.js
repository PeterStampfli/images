/* jshint esversion:6 */

import {
    paramControllerMethods,
    ColorInput
} from "./modules.js";

/**
 * a controller for color with visuals, in a common div
 * created with input field for color code, color input element and range for alpha value
 * depending on initial parameter value
 * if it is a string of type #rgb or #rrggbb then it has no alpha channel
 * if it is a string of type #rgba or #rrggbbaa then it has an alpha channel
 *  (that should be safe because of different lengths of strings)
 * @creator ParamColor
 * @param {ParamGui} gui - the controller is in this gui
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property - for the field of object to change, params[property]
 */

export function ParamColor(gui, params, property) {
    this.gui = gui;
    this.params = params;
    this.property = property;
    this.listening = false; // automatically update display
    this.create();
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

Object.assign(ParamColor.prototype, paramControllerMethods);

/**
 * make a text input , color input and range
 assume that param value is correct color format
 * @method ParamController#create
 */
ParamColor.prototype.create = function() {
    this.initCreate();
    const design = this.gui.design;
    let color = this.params[this.property];
    const controller = this;
    this.createLabel(this.property);
    const hasAlpha = ColorInput.hasAlpha(color);
    const colorInput = new ColorInput(this.domElement, hasAlpha);
    colorInput.setWidths(design.colorTextWidth, design.colorColorWidth, design.colorRangeWidth);
    colorInput.setValue(color);
    this.gui.bodyDiv.appendChild(this.domElement);
    // get root
    colorInput.setFontSize(this.gui.getRoot().domElement,design.buttonFontSize); // attention: reading offsetHeight !
    this.uiElement = colorInput;
    this.setupOnChange();
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