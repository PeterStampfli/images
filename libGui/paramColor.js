/* jshint esversion:6 */

import {
    paramControllerMethods,
    DOM,
    TextInput,
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
 * transform string to standard color
 * depending if there is alpha or not
 * @method ParamColor#colorFrom
 * @param {String} color
 * @return String, the transformed color string
 */
ParamColor.prototype.colorFrom = function(color) {
    if (this.hasAlpha) {
        return ParamColor.rgbaFrom(color);
    } else {
        return ParamColor.rgbFrom(color);
    }
};

/**
 * get alpha value from color string
 * returns 255 if hasAlpha==false
 * @method ParamColor#alphaFrom
 * @param {String} color
 * @return integer alpha value
 */
ParamColor.prototype.alphaFrom = function(color) {
    if (this.hasAlpha) {
        return parseInt(ParamColor.rgbaFrom(color).substring(7), 16);
    } else {
        return 255;
    }
};

/**
 * transform a color string and an integer alpha to a standard rgba string
 * does not check the input for errors, does the most obvious
 * @method ParamColor.rgbaFromRGBAndAlpha
 * @param {String} color - may also be rgba, a is discarded
 * @param {integer} alpha
 * @return String, the transformed color string
 */
ParamColor.rgbaFromRGBAndAlpha = function(color, alpha) {
    alpha = Math.max(0, Math.min(255, Math.round(alpha)));
    return ParamColor.rgbFrom(color) + alpha.toString(16);
};

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
 * @method ParamController#create
 */
ParamColor.prototype.create = function() {
    this.initCreate();
    const design = this.gui.design;
    const paramValue = this.params[this.property];
    const controller = this;
    const type = (typeof paramValue);
    // we do only strings for color
    // test if we have an alpha channel, #rgba or #rrggbbaa
    this.hasAlpha = (paramValue.length === 5) || (paramValue.length === 9);
    // create the various input elements
    this.createLabel(this.property);
    const textInputId = DOM.createId();
    DOM.create("input", textInputId, "#" + this.domElementId);
    DOM.style("#" + textInputId,
        "width", design.colorStringInputWidth + px,
        "font-size", design.buttonFontSize + px);
    this.textInput = new TextInput(textInputId);

    DOM.addSpace(this.domElementId);

    const colorInputId = DOM.createId();
    DOM.create("input", colorInputId, "#" + this.domElementId);
    DOM.style("#" + colorInputId,
        "width", design.colorInputWidth + px,
        "transform", "translateY(" + (design.colorVOffset) + "px)");


    this.colorInput = new ColorInput(colorInputId);

    if (this.hasAlpha) {
        const rangeInputId = DOM.createId();
        DOM.create("input", rangeInputId, "#" + this.domElementId);
        DOM.style("#" + rangeInputId,
            "width", design.colorRangeWidth + px,
            "transform", "translateY(" + (design.rangeVOffset) + "px)",
            "cursor", "pointer");
        this.rangeElement = document.getElementById(rangeInputId);
        this.rangeElement.setAttribute("type", "range");
        this.rangeElement.step = 1;
        this.rangeElement.max = 255;
        this.rangeElement.min = 0;
    }

    // interactions
    this.textInput.onChange = function() {
        console.log("text onchnage " + controller.textInput.getValue());


    };

    this.colorInput.onInput = function() {
        console.log("color oninput " + controller.colorInput.getValue());

    };

    this.colorInput.onChange = function() {
        console.log("color onchange " + controller.colorInput.getValue());

    };

    if (this.hasAlpha) {

        this.rangeElement.oninput = function() {
            console.log("rangeElement oninput " + controller.rangeElement.value);
            const color = ParamColor.rgbaFromRGBAndAlpha(controller.textInput.getValue(), controller.rangeElement.value);
            console.log(color);
            controller.input(color);
        };

        this.rangeElement.onchange = function() {
            console.log("rangeElement onchange " + controller.rangeElement.value);

        };
    }


    /*

            this.colorInput.onInput = function() {
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
            */
    this.setValue(paramValue);
    return this;
};


/**
 * get value from the text input element in standard form 
 * @method ParamColor#getValue
 * @return String for the color, depending if hasAlpha
 */
ParamColor.prototype.getValue = function() {
    return this.colorFrom(this.textInput.getValue());
};

/**
 * set value of the controller and the parameter
 * does not call the callback
 * transforms to standard color string format
 * @method paramControllerMethods.setValue
 * @param {String} value - color string
 */
ParamColor.prototype.setValueOnly = function(value) {
    this.params[this.property] = this.colorFrom(value);
    this.updateDisplay();
};

/**
 * set the value of the display (controller) according to the actual value of the parameter in the params object
 * updates the lastValue field
 * do not update the param object
 * updates display automatically
 * @method paramColor#updateDisplay
 */
ParamColor.prototype.updateDisplay = function() {
    const color = this.params[this.property];
    this.lastValue = color;
    this.textInput.setValue(color);
    this.colorInput.setValue(ParamColor.rgbFrom(color));
    if (this.hasAlpha) {
        this.rangeElement.value = this.alphaFrom(color);
    }
};


/**
 * to do upon input -> callback
 * set last value
 * @method ParamColor#input
 */
ParamColor.prototype.input = function(value) {
    this.lastValue = value; // avoid unnecessary display update (listening)
    const changed = (this.params[this.property] !== value);
    this.setValueOnly(value);

    if (changed) {
        this.params[this.property] = value;
        this.callback(value);
        console.log("called callback");
    }
};

/**
 * to do upon change -> callback, finishCallback
 * merits more reflection
 * not to confuse with controller.onChange(function) (datGui !!)
 * set last value
 * @method ParamColor#change
 */
ParamColor.prototype.change = function() {
    this.input();
    this.finishCallback();
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