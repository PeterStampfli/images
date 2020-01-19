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
 * make a text input , color input and range
 * @creator ParamColor
 * @param {ParamGui} design - object that defines the design
 * @param {htmlElement} domElement - container for the controller, div or span
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property - for the field of object to change, params[property]
 */

export function ParamColor(design, domElement, params, property) {
    this.design = design;
    this.domElement = domElement;
    this.params = params;
    this.property = property;
    this.listening = false; // automatically update display
    this.helpButton = null;
    // the button or whatever the user interacts with
    this.uiElement = null;

    /**
     * callback for changes
     * @method paramControllerMethods.callback
     * @param {anything} value
     */
    this.callback = function(value) {
        console.log("callback value " + value);
    };


    this.label = document.createElement("span");
    this.label.textContent = this.property;
    this.label.style.fontSize = design.labelFontSize + "px";
    // minimum width for alignment of inputs
    this.label.style.display = "inline-block";
    this.label.style.minWidth = design.labelWidth + "px";
    // space between label and controller or left border
    this.label.style.paddingLeft = design.spaceWidth + "px";
    this.label.style.paddingRight = design.spaceWidth + "px";
    this.domElement.appendChild(this.label);

    let color = this.params[this.property];
    const hasAlpha = ColorInput.hasAlpha(color);
    const colorInput = new ColorInput(this.domElement, hasAlpha);
    colorInput.setWidths(design.colorTextWidth, design.colorColorWidth, design.colorRangeWidth);
    colorInput.setValue(color);
    // we need the root gui dom element to be able to see size of the text input element
    colorInput.setFontSize(design.buttonFontSize); // attention: reading offsetHeight !
    this.uiElement = colorInput;
    this.setupOnChange();
    this.setupOnInteraction();
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

Object.assign(ParamColor.prototype, paramControllerMethods);

/**
 * destroy the controller
 * @method ParamColor#destroy
 */
ParamColor.prototype.destroy = function() {
    if (this.helpButton !== null) {
        this.helpButton.destroy();
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
ParamColor.prototype.remove = ParamColor.prototype.destroy;
