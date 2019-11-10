import {
    paramControllerMethods
} from "./modules.js";

/**
 * a controller for color with visuals, in a common div
 * created with input field for color code, color input element and range for alpha value
 * depending on initial parameter value
 * if it is a string of type #rgb or #rrggbb then it has no alpha channel
 * if it is a string of type #rgba or #rrggbbaa then it has an alpha channel
 *  (that should be safe because of different lengths of strings)
 * @creator ParamImageSelection
 * @param {ParamGui} gui - the controller is in this gui
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property - for the field of object to change, params[property]
 */

export function ParamImageSelection(gui, params, property) {
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

Object.assign(ParamImageSelection.prototype, paramControllerMethods);

/**
 * make a text input , color input and range
 assume that param value is correct color format
 * @method ParamController#create
 */
ParamImageSelection.prototype.create = function() {
    this.initCreate(); // create this.domElement with padding
    const design = this.gui.design;
    let imageChoice = this.params[this.property];
    const controller = this;
    const leftDiv = document.createElement("div"); // div with label and other things, including spacing at left and right
    // space between label, controller things and image or left border
    leftDiv.style.paddingLeft = design.labelSpacing + "px";
    leftDiv.style.paddingRight = design.labelSpacing + "px";
    leftDiv.style.minWidth = design.controllerLabelWidth + "px";
    leftDiv.style.display = "inline-block";
    this.label = document.createElement("div");
    this.label.textContent = this.property;
    this.label.style.fontSize = design.controllerLabelFontSize + "px";
    this.label.style.paddingBottom = design.paddingVertical + "px"; // spacing to next

    leftDiv.appendChild(this.label);

    const selectDiv = document.createElement("div");
    selectDiv.style.paddingBottom = design.paddingVertical + "px"; // spacing to next
    selectDiv.style.paddingLeft = design.labelSpacing + "px";

    selectDiv.style.backgroundColor = "green";

    selectDiv.textContent = "select";

    leftDiv.appendChild(selectDiv);




    const buttonUpDiv = document.createElement("div");
    buttonUpDiv.textContent = "buttonup";
    buttonUpDiv.style.paddingLeft = design.labelSpacing + "px";
    buttonUpDiv.style.paddingBottom = design.paddingVertical + "px"; // spacing to next

    buttonUpDiv.style.backgroundColor = "orange";

    leftDiv.appendChild(buttonUpDiv);


    const buttonDownDiv = document.createElement("div");
    buttonDownDiv.textContent = "buttondownp";
    buttonDownDiv.style.paddingLeft = design.labelSpacing + "px";

    buttonDownDiv.style.backgroundColor = "orange";

    leftDiv.appendChild(buttonDownDiv);



    const image = document.createElement("img");

    image.src = "abendfalter.jpg";
    //image.style.display = "inline-block";
    image.style.width = "200px";
    image.style.height = "100%";
    image.style.verticalAlign = "top";
    image.style.objectFit = "contain";
    image.style.objectPosition = "left center";


    /*
    this.createLabel(this.property);
    const hasAlpha = ColorInput.hasAlpha(color);
    const colorInput = new ColorInput(this.domElement, hasAlpha);
    colorInput.setWidths(design.colorTextWidth, design.colorColorWidth, design.colorRangeWidth);
    colorInput.setValue(color);
    // get root
    colorInput.setFontSize(this.gui.getRoot().domElement, design.buttonFontSize); // attention: reading offsetHeight !
    this.uiElement = colorInput;
    this.setupOnChange();
    */

    this.domElement.appendChild(leftDiv);
    this.domElement.appendChild(image);
    this.domElement.style.backgroundColor = "yellow";

    this.gui.bodyDiv.appendChild(this.domElement);
    return this;
};

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
ParamImageSelection.prototype.remove = ParamImageSelection.prototype.destroy;