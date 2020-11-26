/* jshint esversion: 6 */

/**
 * a color input element (container)
 * to simplify construction and destruction
 * to have same interface as other ui elements
 * @constructor ColorInput
 * @param {DOM element} parent, an html element, best "div"
 * @param {boolean} hasAlpha  (optional), for rgba
 */

import {
    Button,
    guiUtils
} from "./modules.js";

export function ColorInput(parent, hasAlpha) {
    this.parent = parent;
    this.hasAlpha = hasAlpha;
    this.active = true;
    // a textelement for showing/enetering hex color codes
    this.textElement = document.createElement("input");
    this.textElement.setAttribute("type", "text");
    this.textElement.style.verticalAlign = "middle";
    parent.appendChild(this.textElement);
    this.textHover = false;
    this.textPressed = false;
    this.firstSpace = document.createElement("span");
    this.firstSpace.style.width = ColorInput.spaceWidth + "px";
    this.firstSpace.style.display = "inline-block";
    this.parent.appendChild(this.firstSpace);
    // a color input element, for selecting color with the point and click interface of the browser
    this.colorElement = document.createElement("input");
    this.colorElement.setAttribute("type", "color");
    this.colorElement.style.cursor = "pointer";
    this.colorElement.style.outline = "none";
    this.colorElement.style.verticalAlign = "middle";
    this.colorElement.select(); // magic for old browsers that have no color input, text instead
    parent.appendChild(this.colorElement);
    this.colorHover = false;
    // a range element for the alpha component, to go with the browsers color picker
    if (hasAlpha) {
        const secondSpace = document.createElement("span");
        secondSpace.style.width = ColorInput.spaceWidth + "px";
        secondSpace.style.display = "inline-block";
        this.parent.appendChild(secondSpace);
        this.rangeElement = document.createElement("input");
        this.rangeElement.setAttribute("type", "range");
        this.rangeElement.style.cursor = "pointer";
        this.rangeElement.style.verticalAlign = "middle"; // range is essentially an image, inline element
        this.rangeElement.step = 1;
        this.rangeElement.min = 0;
        this.rangeElement.max = 255;
        parent.appendChild(this.rangeElement);
    }
    // initial value is opaque blue
    if (hasAlpha) {
        this.setValue("#0000ffff");
    } else {
        this.setValue("#0000ff");
    }

    const colorInput = this;

    // calling the onInteraction method
    function interaction() {
        colorInput.onInteraction();
    }

    // hovering, focus -> styling
    this.textElement.onmouseenter = function() {
        if (colorInput.active) {
            colorInput.textHover = true;
            colorInput.updateTextStyle();
        }
    };

    this.textElement.onmouseleave = function() {
        if (colorInput.active) {
            colorInput.textHover = false;
            colorInput.updateTextStyle();
        }
    };

    this.textElement.onmousedown = interaction;

    // onfocus /onblur corresponds to pressed
    this.textElement.onfocus = function() {
        if (colorInput.active) {
            colorInput.textPressed = true;
            colorInput.updateTextStyle();
        }
    };

    this.textElement.onblur = function() {
        if (colorInput.active) {
            colorInput.textPressed = false;
            colorInput.updateTextStyle();
        }
    };

    this.colorElement.onmouseenter = function() {
        if (colorInput.active) {
            colorInput.colorHover = true;
            colorInput.updateColorStyle();
        }
    };

    this.colorElement.onmouseleave = function() {
        if (colorInput.active) {
            colorInput.colorHover = false;
            colorInput.updateColorStyle();
        }
    };

    // doing things
    this.textElement.onchange = function() {
        if (colorInput.active) {
            let color = colorInput.textElement.value;
            if (color.charAt(0) !== "#") { // in case add missing # at beginning
                color = "#" + color;
            }
            colorInput.updateValue(color);
        }
    };

    // get color value from the browsers color input and range element( if there is an alpha)
    // used both for changges in the range element and the RGB color chooser
    function colorElementInput() {
        if (colorInput.active) {
            let color = colorInput.colorElement.value;
            if (colorInput.hasAlpha) { // combine rgb with alpha from range (all elements are synchro)
                color += hexString(colorInput.rangeElement.value);
            }
            colorInput.updateValue(color);
        }
    }

    this.colorElement.oninput = colorElementInput;
    this.colorElement.onchange = colorElementInput;
    this.colorElement.onmousedown = interaction;

    if (hasAlpha) {
        this.rangeElement.oninput = colorElementInput;
        this.rangeElement.onchange = colorElementInput;
        this.rangeElement.onmousedown = interaction;
    }

    this.colorStyleDefaults();
    this.updateColorStyle();
    this.updateTextStyle();

    /**
     * action upon change
     * @method ColorInput#onChange
     * @param {String} color
     */
    this.onChange = function(color) {
        console.log("onChange " + color);
    };

    /**
     * action upon mouse down, doing an interaction
     * @method ColorInput#onInteraction
     */
    this.onInteraction = function() {
        console.log("color input Interaction");
    };
}

// width for spaces in px
ColorInput.spaceWidth = 5;

/**
 * setup the color styles defaults, use for other buttons too
 * @method ColorInput#colorStyleDefaults
 */
ColorInput.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;

/**
 * update the color style of the text input element depending on whether its pressed or hovered
 * always call if states change, use for other buttons too
 * @method ColorInput#updateTextStyle
 */
ColorInput.prototype.updateTextStyle = function() {
    if (this.active) {
        if (this.textPressed) {
            if (this.textHover) {
                this.textElement.style.color = this.colorDownHover;
                this.textElement.style.backgroundColor = this.backgroundColorDownHover;
            } else {
                this.textElement.style.color = this.colorDown;
                this.textElement.style.backgroundColor = this.backgroundColorDown;
            }
        } else {
            if (this.textHover) {
                this.textElement.style.color = this.colorUpHover;
                this.textElement.style.backgroundColor = this.backgroundColorUpHover;
            } else {
                this.textElement.style.color = this.colorUp;
                this.textElement.style.backgroundColor = this.backgroundColorUp;
            }
        }
    } else {
        this.textElement.style.color = this.colorInactive;
        this.textElement.style.backgroundColor = this.backgroundColorInactive;
    }
};

/**
 * update the color style of the element depending on whether it is hovered
 * always call if states change, use for other buttons too
 * @method ColorInput#updateStyle
 */
ColorInput.prototype.updateColorStyle = function() {
    if (this.active) {
        this.colorElement.style.cursor = "pointer";
        if (this.colorHover) {
            this.colorElement.style.backgroundColor = this.backgroundColorUpHover;
        } else {
            this.colorElement.style.backgroundColor = this.backgroundColorUp;
        }
    } else {
        this.colorElement.style.cursor = "default";
        this.colorElement.style.backgroundColor = this.backgroundColorInactive;
    }
};

/**
 * set fontsize, in px
 * make that the color element has the same height.
 * ATTENTION: colorInput has to be attached to the DOM to  be able to get offsetHeight!
 *  a hidden gui folder lies outside the DOM, thus we have to do some acrobatics to get it
 * @method ColorInput#setFontSize
 * @param {integer} size
 */
ColorInput.prototype.setFontSize = function(size) {
    this.textElement.style.fontSize = size + "px";
    // switch textElement to domElement
    const parent = this.textElement.parentElement;
    //   parent.removeChild(this.textElement);
    document.body.appendChild(this.textElement);
    // now we can read the offset height
    this.colorElement.style.height = this.textElement.offsetHeight + "px";
    // switch back
    //    domElement.removeChild(this.textElement);
    parent.insertBefore(this.textElement, this.firstSpace);
};

/**
 * setting widths
 * @method ColorInput#setWidths
 * @param {integer} textWidth
 * @param {integer} colorWidth
 * @param {integer} rangeWidth
 */
ColorInput.prototype.setWidths = function(textWidth, colorWidth, rangeWidth) {
    this.textElement.style.width = textWidth + "px";
    this.colorElement.style.width = colorWidth + "px";
    if (this.hasAlpha) {
        this.rangeElement.style.width = rangeWidth + "px";
    }
};

/**
 * set if input is active
 * @method NumberButton#setActive
 * @param {boolean} on
 */
ColorInput.prototype.setActive = function(on) {
    if (this.active !== on) {
        this.active = on;
        this.textElement.disabled = !on;
        this.updateTextStyle();
        this.colorElement.disabled = !on;
        this.updateColorStyle();
        if (!this.active) {
            this.textHover = false;
            this.textPressed = false;
        }
        if (this.hasAlpha) {
            this.rangeElement.disabled = !on;
            if (this.active) {
                this.rangeElement.style.cursor = "pointer";
            } else {
                this.rangeElement.style.cursor = "default";
            }
        }
    }
};

/*
 * make a 2digits hex string from a number
 * the number is rounded and clamped to 0...255
 * if the argument is a string, parses it. Usually as decimale number. 
 "# ...." and "0x ..." are hexadecimal numbers.
 * If all fails makes an error message and returns "00"
 */
function hexString(number) {
    if (guiUtils.isString(number)) {
        if (number.substring(0, 1) === "#") {
            number = parseInt(number.substring(1), 16);
        } else {
            number = parseInt(number);
        }
    }
    if (!guiUtils.isNumber(number)) {
        console.error('hexString: Input is not a number or number string, its value is ' + number);
        number = 0;
    }
    number = Math.max(0, Math.min(255, Math.round(number)));
    let result = number.toString(16);
    if (result.length === 1) {
        result = "0" + result;
    }
    return result;
}

/**
 * make a color string from an object with red, green and blue fields, eventually an alpha field
 * return false if color fields are missing
 * @method ColorInput.stringFromObject
 * @param {object} obj
 * return hex color string or undefined (==false)
 */
ColorInput.stringFromObject = function(obj) {
    var result;
    if (guiUtils.isDefined(obj.red) && guiUtils.isDefined(obj.green) && guiUtils.isDefined(obj.blue)) {
        result = "#" + hexString(obj.red) + hexString(obj.green) + hexString(obj.blue);
        if (guiUtils.isDefined(obj.alpha)) {
            result += hexString(obj.alpha);
        }
    }
    return result;
};

/**
 * set the red, green and blue fields of a parameter object, and an alpha field
 * depending on a hex color string of form "#rrggbb" or "rrggbbaa"
 * if no "aa" values then alpha=255
 * @method ColorInput.setObject
 * @param {object} obj
 * @ param {String} color
 */
ColorInput.setObject = function(obj, color) {
    obj.red = parseInt(color.substring(1, 3), 16);
    obj.green = parseInt(color.substring(3, 5), 16);
    obj.blue = parseInt(color.substring(5, 7), 16);
    if (color.length === 9) {
        obj.alpha = parseInt(color.substring(7, 9), 16);
    } else {
        obj.alpha=255;
    }
};

/**
 * test if a color string has alpha
 * based on its length: 5 or 9
 * @method ColorInput.hasAlpha
 * @param {String} color
 * @return true if lenght=5 or 9
 */
ColorInput.hasAlpha = function(color) {
    return (color.length === 5) || (color.length === 9);
};

/**
 * transform a string to a standard rgb string
 * does not check the input for errors, does the most obvious
 * @method ColorInput.rgbFrom
 * @param {String} color
 * @return String, the transformed color string
 */
ColorInput.rgbFrom = function(color) {
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
 * @method ColorInput.rgbaFrom
 * @param {String} color
 * @return String, the transformed color string
 */
ColorInput.rgbaFrom = function(color) {
    const length = color.length;
    let result = color;
    if ((length === 4) || (length === 5)) { // #rgb or #rgba
        const red = color.charAt(1);
        const green = color.charAt(2);
        const blue = color.charAt(3);
        const alpha = (length === 5) ? color.charAt(4) : "F";
        result = "#" + red + red + green + green + blue + blue + alpha + alpha;
    } else if (length === 7) { // #rrggbb 
        result += "FF";
    }
    return result;
};

/**
 * transform string to standard color
 * depending if there is alpha or not
 * @method ColorInput#colorFrom
 * @param {String} color
 * @return String, the transformed color string
 */
ColorInput.prototype.colorFrom = function(color) {
    if (this.hasAlpha) {
        return ColorInput.rgbaFrom(color);
    } else {
        return ColorInput.rgbFrom(color);
    }
};

/**
 * get alpha value from color string
 * returns 255 if hasAlpha==false
 * @method ColorInput#alphaFrom
 * @param {String} color
 * @return integer alpha value
 */
ColorInput.prototype.alphaFrom = function(color) {
    if (this.hasAlpha) {
        return parseInt(ColorInput.rgbaFrom(color).substring(7), 16);
    } else {
        return 255;
    }
};

/**
 * get value of colorInput,assumes that the textelement has the correct value
 * @method ColorInput#getValue
 * @param {object} colorObject - optional, gets the color values
 * @return String, the color as hex string "#rrggbb"
 */
ColorInput.prototype.getValue = function(colorObject) {
    if (guiUtils.isObject(colorObject)) {
        ColorInput.setObject(colorObject, this.textElement.value);
    }
    return this.textElement.value;
};

/**
 * set value of input, error message if argument not ok
 * @method ColorInput#setValue
 * @param {String||object} arg - color string or color object with red, green, blue (and alpha)
 */
ColorInput.prototype.setValue = function(arg) {
    let text = arg;
    // get color string from a color object, if there is one
    if (guiUtils.isObject(arg)) {
        text = ColorInput.stringFromObject(arg);
    }
    if (guiUtils.isColorString(text)) {
        const color = this.colorFrom(text);
        this.lastValue = color;
        this.textElement.value = color;
        this.colorElement.value = ColorInput.rgbFrom(color);
        if (this.hasAlpha) {
            this.rangeElement.value = this.alphaFrom(color);
        }
    } else {
        console.error("ColorInput#setValue: argument is not a good color string or object");
        console.log('its value is of type "' + (typeof arg) + '":');
        console.log(arg);
        console.log("should be a color object or a string of form '#rrggbb' or '#rrggbbaa'");
    }
};

/**
 * do not call this method from the outside
 * method is used only if textinput, color or range elements change
 * they convert data into a string
 * check if text is a color
 * if color changes do this.onChange and set element values
 * else reset things
 * @method ColorInput#updateValue
 * @param {String} arg - color string 
 */
ColorInput.prototype.updateValue = function(text) {
    if (guiUtils.isColorString(text)) {
        const color = this.colorFrom(text);
        if (this.lastValue !== color) {
            this.setValue(color);
            this.onChange(color);
        }
    } else {
        this.setValue(this.lastValue); // resets the color text, to overwrite garbage
    }
};

/**
 * destroy this input element
 * @method ColorInput#destroy
 */
ColorInput.prototype.destroy = function() {
    this.onChange = null;
    this.onInput = null;
    this.textElement.onchange = null;
    this.textElement.onmouseenter = null;
    this.textElement.onmouseleave = null;
    this.textElement.onmousedown = null;
    this.textElement.onfocus = null;
    this.textElement.onblur = null;
    this.textElement.remove();
    this.textElement = null;
    this.colorElement.onmouseenter = null;
    this.colorElement.onmouseleave = null;
    this.colorElement.oninput = null;
    this.colorElement.onchange = null;
    this.colorElement.remove();
    this.colorElement = null;
    if (this.hasAlpha) {
        this.rangeElement.oninput = null;
        this.rangeElement.onchange = null;
        this.rangeElement.onmousedown = null;
        this.rangeElement.remove();
        this.rangeElement = null;
    }
};