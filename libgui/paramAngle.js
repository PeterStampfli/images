import {
    paramControllerMethods,
    AngleScale,
    NumberButton
} from "./modules.js";

/**
 * a controller for color
 * with visuals, in a common div
 * @creator ParamAngle
 * @param {ParamGui} gui - the controller is in this gui
 * @param {Object} params - object that has the parameter as a field
 * @param {String} property - for the field of object to change, params[property]
 */

export function ParamAngle(gui, params, property) {
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

Object.assign(ParamAngle.prototype, paramControllerMethods);


/**
 * making a ui control element, same as in "lib/dat.gui.min2.js", one on each line
 * call from creator function
 * @method ParamAngle#create
 */
ParamAngle.prototype.create = function() {
    this.initCreate();
    const design = this.gui.design;
    const controller = this;
    const paramValue = this.params[this.property];

    this.createLabel(this.property);

    const numberButton = new NumberButton(this.domElement, false, false);
    numberButton.setWidth(design.numberInputWidth);
    numberButton.setFontSize(design.buttonFontSize);
    numberButton.setStep(1);
    numberButton.setRange(-180, 180);
    numberButton.setCyclic();
    this.uiElement = numberButton;


    this.createPopup();

    const angleScale = new AngleScale(this.popupDivId);
    this.angleScale = angleScale;
    this.angleScale.setDimensions(this.gui.design.width, this.gui.design.controllerDiameter);


    this.updateDisplay();

    numberButton.onChange = function() {
        const value = numberButton.getValue();
        angleScale.setAngle(value);
        controller.params[controller.property] = value;
        controller.lastValue = value; // avoid unnecessary display update (listening)
        controller.callback(value);
    };

    angleScale.onChange = function() {
        numberButton.setValue(angleScale.getAngle());
        numberButton.onChange(); // makes correct wraparound
    };


    return this;
};


/**
 * set both numberButton and arrow
 * set the value of the controller according to the actual value of the parameter in the params object
 * do not update the param object
 * updates display automatically
 * @method paramAngle#updateDisplay
 * /
 ParamAngle.prototype.updateDisplay = function() {
    const value = this.params[this.property];
    this.lastValue = value;
    this.uiElement.setValue(value);
    this.angleScale.setAngle(value);
};


/**
 * same as destroy, but is in dat.gui api
 * @method ParamController.remove
 */
ParamAngle.prototype.remove = ParamAngle.prototype.destroy;
