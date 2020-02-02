/**
 * a line of ui controller elements
 * more than one button on a line
 * @creator ParamLine
 * @param {object} designParam - object that defines the design
 * @param {htmlElement} domElement - container for the controller, div (popup depends on style) or span (always use popup)
 */
import {
    guiUtils,
    ParamController,
    Button,
    InstantHelp,
    ParamGui
} from "./modules.js";

export function ParamLine(designParam, domElement) {
    this.domElement = domElement;
    // a list of all controllers 
    // must have a destroy method, an updateDisplayIfListening method
    this.elements = [];
    this.design = {};
    const design = this.design;
    Object.assign(design, designParam);
    // always popup:
    design.popupForNumberController = true;

}


// some of these methods are the same as for paramGui


/**
 * remove an element: destroy and remove from array of elements
 * @method ParamLine#remove
 * @param {Object} element - to remove, with a destroy method
 */
ParamLine.prototype.remove = function(element) {
    const index = this.elements.indexOf(element);
    if (index >= 0) {
        this.elements.splice(index, 1);
    }
    element.destroy();
};


/**
 * add a span with a space to the parent element
 * use ParamGui.spaceWidth as parameter !!!
 * @method ParamLine#addSpace
 */
ParamLine.prototype.addSpace = function() {
    ParamGui.addSpace(this.domElement);
};


/**
 * we might want to change design parameters for parts of a gui/folder
 * @method ParamLine#changeDesign
 * @param {...Object} design - design parameters as fields (key,value pairs) of objects, multiple objects possible
 * @return this
 */
ParamGui.prototype.changeDesign = function(design) {
    // update design parameters
    for (var i = 0; i < arguments.length; i++) {
        guiUtils.updateValues(this.design, arguments[i]);
    }
};

/**
 * add a help alert
 * @method ParamLine#addHelp
 * @param {String} message - can have html
 */
ParamLine.prototype.addHelp = function(message) {
    this.helpButton = new InstantHelp(message, this.titleDiv);
    this.helpButton.setFontSize(this.design.titleFontSize);
};

/**
 * propagate updateDisplayIfListening events 
 * @method ParamLine#updateDisplayIfListening
 */
ParamLine.prototype.updateDisplayIfListening = function() {
    this.elements.forEach(function(element) {
        element.updateDisplayIfListening();
    });
};

/**
 * close popups
 * @method ParamLine#closePopup
 */
ParamLine.prototype.closePopup = function() {
    this.elements.forEach(element => element.closePopup());
};


/**
 * destroy the line, and the containing dom element
 * @method ParamLine#destroy
 */
ParamLine.prototype.destroy = function() {
    if (this.helpButton !== null) {
        this.helpButton.destroy();
    }
    this.elements.forEach(element => element.destroy());
    this.elements.length = 0;
    if (this.label) {
        this.label.remove();
        this.label = null;
    }
    if (this.domElement) {
        this.domElement.remove();
        this.domElement = null;
    }
};
