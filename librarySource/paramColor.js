/* jshint esversion:6 */

import {
    paramControllerMethods,
    DOM
} from "./modules.js";

/**
 * a controller for color
 * with visuals, in a common div
 * created with input field for color code, color input element and range for alpha value
 * with method to delete/switch off alpha chanel (safer than gessing from parameter value)
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

// standard color strings
// without alpha: #rrggbb
// with alpha: #rrggbbaa
// transforms to color without alpha: #rgb -> #rrggbb, #rgba -> #rrggbb, #rrggbb, #rrggbbaa -> #rrggbb
// transforms to color with alpha: #rgb -> #rrggbbff, #rgba -> #rrggbbaa, #rrggbb -> #rrggbbff

/**
 * transform a string to a standard rgb string
 * does not check the input for errors, does the most obvious
 * @method ParamColor.rgbFrom
 * @param {String} color
 * @return String, the transformed color string
 */
ParamColor.rgbFrom = function(color) {
    const length = color.length;
    var result;
    if ((length === 4) || (length === 5)) { // #rgb or #rgba
        const red = color.charAt(1);
        const green = color.charAt(2);
        const blue = color.charAt(3);
        result = "#" + red + red + green + green + blue + blue;
    } else { // #rrggbb  or #rrggbbaa
        result = color.substring(0, 7);
    }
    return result;
};

/**
 * transform a string to a standard rgba string
 * does not check the input for errors, does the most obvious
 * @method ParamColor.rgbaFrom
 * @param {String} color
 * @return String, the transformed color string
 */
ParamColor.rgbaFrom = function(color) {
    const length = color.length;
    let result = color;
    if ((length === 4) || (length === 5)) { // #rgb or #rgba
        const red = color.charAt(1);
        const green = color.charAt(2);
        const blue = color.charAt(3);
        const alpha = (length === 5) ? color.charAt(4) : "f";
        result = "#" + red + red + green + green + blue + blue + alpha + alpha;
    } else if (length === 7) { // #rrggbb 
        result += "ff";
    }
    return result;
};

/**
 * transform a color string and an integer alpha to a standard rgba string
 * does not check the input for errors, does the most obvious
 * @method ParamColor.rgbaFromRGBAndAlpha
 * @param {String} color
 * @param {integer} alpha
 * @return String, the transformed color string
 */
ParamColor.rgbaFromRGBAndAlpha = function(color, alpha) {
    alpha = Math.max(0, Math.min(255, Math.round(alpha)));
    return ParamColor.rgbFrom(color) + alpha.toString(16);
};

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
     * @method ParamController#create
     */
    ParamColor.prototype.create = function() {
        this.initCreate();
        const design = this.gui.design;
        const paramValue = this.params[this.property];
        const controller = this;
        const type = (typeof paramValue);
        if (type === "string") {
            this.type = "css";
        }
        // the parameter value is a string thus make a text input button
        this.createLabel(this.property);
        const colorInput = this.styledColorInput(this.domElementId);
        this.uiElement = colorInput;
        colorInput.onInput = function() {
            const value = colorInput.getValue();
            controller.params[controller.property] = value;
            controller.lastValue = value; // avoid unnecessary display update (listening)
            controller.callback(value);
        };
        colorInput.onChange = function() {
            const value = colorInput.getValue();
            controller.finishCallback(value);
        };
        if (this.type === "css") {
            colorInput.setValue(paramValue);
        }
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

}());


self.ParamColor = ParamColor;
