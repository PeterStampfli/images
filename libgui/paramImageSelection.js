import {
    paramControllerMethods,
    ImageSelect,
    ParamGui,
    guiUtils
} from "./modules.js";

/**
 * make a controller with an image selection
 * each choice is an object with a name, icon and value field
 * choice={name: "name as string", icon: "URL for icon image", value: whatever}
 * the value can be an image URL, a preset (URL of json file)
 * multiple choices are put together in an array
 * @creator ParamImageSelection
 * @param {ParamGui} gui - the gui it is in
 * @param {htmlElement} domElement - container for the controller, div or span
 * @param {Object} params - object that has the parameter as a field
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property - for the field of object to change, params[property]
 * @param {array} choices - an array of choice objects
 */

export function ParamImageSelection(gui, domElement, params, property, choices) {
    const design = gui.design;
    this.design = design;
    this.domElement = domElement;
    this.params = params;
    this.property = property;
    this.listening = false; // automatically update display
    this.helpButton = null;
    // the user interacts with
    this.uiElement = null;

    /**
     * callback for changes
     * @method paramControllerMethods.callback
     * @param {anything} value
     */
    this.callback = function(value) {
        console.log("callback value " + value);
    };
    this.createLabel(this.property);
    this.label.style.verticalAlign = "middle";
    // the input elements in the main UI (not the popup)
    // stacking vertically
    this.selectDiv = document.createElement("div");
    this.selectDiv.style.display = "inline-block";
    this.selectDiv.style.verticalAlign = "middle";
    this.selectDiv.style.textAlign = "center";
    this.domElement.appendChild(this.selectDiv);
    const imageSelect = new ImageSelect(this.selectDiv, this.design);
    // if user images can be loaded, then add a vertical space and a button
    if (this.design.acceptUserImages) {
        // the user image input button
        const vSpace = document.createElement("div");
        vSpace.style.height = this.design.spaceWidth + "px";
        this.selectDiv.appendChild(vSpace);
        imageSelect.acceptUserImages(this.selectDiv);
    }
    // add the gui image
    guiUtils.hSpace(this.domElement, this.design.spaceWidth);
    imageSelect.createGuiImage(this.domElement);
    imageSelect.addChoices(choices);
    imageSelect.setValue(this.params[this.property]);
    this.uiElement = imageSelect;
    this.setupOnChange();
    // on interaction: call close popups, 
    // mark that this image selection interacts, do not close its own popup
    this.callsClosePopup = false;

    const paramImageSelection = this;

    imageSelect.onInteraction = function() {
        paramImageSelection.onInteraction();
    };

    this.onInteraction = function() {
        paramImageSelection.callsClosePopup = true;
        ParamGui.closePopups();
        paramImageSelection.callsClosePopup = false;
    };
}

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
 * close the popup
 * most controllers don't have a popup, thus this method stub does nothing
 * overwrite for controllers with a popup
 * @method ImageSelect.closePopup
 */
ParamImageSelection.prototype.closePopup = function() {
    if (!this.callsClosePopup) {
        this.uiElement.closePopup();
    }
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
