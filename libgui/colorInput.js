/**
 * a color input element (container)
 * to simplify construction and destruction
 * to have same interface as other ui elements
 * @constructor ColorInput
 * @param {DOM element} parent, an html element, best "div"
 * @param {boolean} hasAlpha  (optional), for rgba
 */

import {
    Button
} from "./modules.js";

export function ColorInput(parent, hasAlpha) {
    this.parent = parent;
    this.hasAlpha = hasAlpha;
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
    this.colorElement = document.createElement("input");
    this.colorElement.setAttribute("type", "color");
    this.colorElement.style.cursor = "pointer";
    this.colorElement.style.outline = "none";
    this.colorElement.style.verticalAlign = "middle";
    this.colorElement.select(); // magic for old browsers that have no color input, text instead
    parent.appendChild(this.colorElement);
    this.colorHover = false;
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
    if (hasAlpha) { // give all parts a value, set lastValue
        this.setValue("#00000000");
    } else {
        this.setValue("#000000");
    }

    const colorInput = this;

    // hovering, focus -> styling
    this.textElement.onmouseenter = function() {
        colorInput.textHover = true;
        colorInput.updateTextStyle();
    };

    this.textElement.onmouseleave = function() {
        colorInput.textHover = false;
        colorInput.updateTextStyle();
    };

    // onfocus /onblur corresponds to pressed
    this.textElement.onfocus = function() {
        colorInput.textPressed = true;
        colorInput.updateTextStyle();
    };

    this.textElement.onblur = function() {
        colorInput.textPressed = false;
        colorInput.updateTextStyle();
    };

    this.colorElement.onmouseenter = function() {
        colorInput.colorHover = true;
        colorInput.updateColorStyle();
    };

    this.colorElement.onmouseleave = function() {
        colorInput.colorHover = false;
        colorInput.updateColorStyle();
    };

    // doing things
    this.textElement.onchange = function() {
        let color = colorInput.textElement.value;
        if (color.charAt(0) !== "#") { // in case add missing # at beginning
            color = "#" + color;
        }
        colorInput.updateValue(color);
    };

    function colorElementInput() {
        let color = colorInput.colorElement.value;
        if (colorInput.hasAlpha) { // combine rgb with alpha from range (all elements are synchro)
            color = ColorInput.rgbaFromRGBAndAlpha(color, colorInput.rangeElement.value);
        }
        colorInput.updateValue(color);
    }

    this.colorElement.oninput = colorElementInput;
    this.colorElement.onchange = colorElementInput;

    if (hasAlpha) {
        this.rangeElement.oninput = colorElementInput;
        this.rangeElement.onchange = colorElementInput;
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
};

/**
 * update the color style of the element depending on whether it is hovered
 * always call if states change, use for other buttons too
 * @method ColorInput#updateStyle
 */
ColorInput.prototype.updateColorStyle = function() {
    if (this.colorHover) {
        this.colorElement.style.backgroundColor = this.backgroundColorUpHover;
    } else {
        this.colorElement.style.backgroundColor = this.backgroundColorUp;
    }
};

/**
 * set fontsize, in px
 * ATTENTION: colorInput has to be attached to the DOM to  be able to get offsetHeight!
 *  a hidden gui folder lies outside the DOM, thus we have to do some acrobatics to get it
 * @method ColorInput#setFontSize
 * @param {DOMElement} domElement - a html element that is part of the DOM
 * @param {integer} size
 */
ColorInput.prototype.setFontSize = function(domElement, size) {
    this.textElement.style.fontSize = size + "px";
    // switch textElement to domElement
    const parent = this.textElement.parentElement;
    //   parent.removeChild(this.textElement);
    domElement.appendChild(this.textElement);
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

// standard color strings
// without alpha: #rrggbb
// with alpha: #rrggbbaa
// transforms to color without alpha: #rgb -> #rrggbb, #rgba -> #rrggbb, #rrggbb, #rrggbbaa -> #rrggbb
// transforms to color with alpha: #rgb -> #rrggbbff, #rgba -> #rrggbbaa, #rrggbb -> #rrggbbff

const hexDigits = "0123456789abcdef";

/**
 * test if a string is a correct color string
 * @method ColorInput.isColorFormat
 * @param {String} color
 * @return true isf color is in correct format
 */
ColorInput.isColorFormat = function(color) {
    if (color.charAt(0) !== "#") {
        return false;
    }
    const length = color.length;
    if ((length != 4) && (length != 5) && (length != 7) && (length != 9)) {
        return false;
    }
    for (var i = 1; i < length; i++) {
        if (hexDigits.indexOf(color.charAt(i)) < 0) { // indexOf returns zero if char not found
            return false;
        }
    }
    return true;
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
 * transform a color string and an integer alpha to a standard rgba string
 * does not check the input for errors, does the most obvious
 * @method ColorInput.rgbaFromRGBAndAlpha
 * @param {String} color - may also be rgba, a is discarded
 * @param {integer} alpha
 * @return String, the transformed color string
 */
ColorInput.rgbaFromRGBAndAlpha = function(color, alpha) {
    alpha = Math.max(0, Math.min(255, Math.round(alpha)));
    alpha = alpha.toString(16);
    if (alpha.length === 1) {
        alpha = "0" + alpha;
    }
    return ColorInput.rgbFrom(color) + alpha;
};

/**
 * get value of colorInput,assumes that the textelement has the correct value
 * @method ColorInput#getValue
 * @return String, the color as hex string "#rrggbb"
 */
ColorInput.prototype.getValue = function() {
    return this.textElement.value;
};

/**
 * set value of input, does nothing if wrong, changes to standard format if ok
 * @method ColorInput#setValue
 * @param {String} text
 */
ColorInput.prototype.setValue = function(text) {
    text = text.toLowerCase();
    if (ColorInput.isColorFormat(text)) {
        const color = this.colorFrom(text);
        this.lastValue = color;
        this.textElement.value = color;
        this.colorElement.value = ColorInput.rgbFrom(color);
        if (this.hasAlpha) {
            this.rangeElement.value = this.alphaFrom(color);
        }
    }
};

/**
 * check if text is a color
 * if color changes do this.onChange and set element values
 * thus we can use it for initialization
 * @method ColorInput#updateValue
 * @param {String} text - the color
 */
ColorInput.prototype.updateValue = function(text) {
    text = text.toLowerCase();
    if (ColorInput.isColorFormat(text)) {
        const color = this.colorFrom(text);
        if (this.lastValue !== color) {
            this.setValue(color);
            this.onChange(color);
        }
    } else {
        this.setValue(this.lastValue);
    }
};

/**
 * destroy the checkbox
 * @method ColorInput#destroy
 */
ColorInput.prototype.destroy = function() {
    this.onChange = null;
    this.onInput = null;
    this.textElement.onchange = null;
    this.textElement.onmouseenter = null;
    this.textElement.onmouseleave = null;
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
        this.rangeElement.remove();
        this.rangeElement = null;
    }
};
