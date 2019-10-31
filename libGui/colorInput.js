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
    DOM
} from "./modules.js";


export function ColorInput(parent, hasAlpha) {
    this.parent = parent;
    this.hasAlpha = hasAlpha;
    this.textElement = document.createElement("input");
    parent.appendChild(this.textElement);
    this.textElement.setAttribute("type", "text");
    this.textHover = false;
    this.textPressed = false;
    this.addSpace();


    this.colorElement = document.createElement("input");
    parent.appendChild(this.colorElement);
    this.colorElement.setAttribute("type", "color");
    this.colorElement.style.cursor = "pointer";
    this.colorElement.style.outline = "none";
    this.colorElement.style.verticalAlign = "middle";
    this.colorElement.select(); // magic for old browsers that have no color input, text instead

    this.colorHover = false;


    if (hasAlpha) {
        this.addSpace();

        this.rangeElement = document.createElement("input");
        parent.appendChild(this.rangeElement);
        this.rangeElement.setAttribute("type", "range");
        this.rangeElement.style.cursor = "pointer";
        this.rangeElement.style.verticalAlign = "middle"; // range is essentially an image, inline element
        this.rangeElement.step = 1;
        this.rangeElement.min = 0;
        this.rangeElement.max = 255;



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


    // hovering
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
        console.log("text onchange");
    };


    this.colorElement.oninput = function() {
        console.log("color oninput ");

    };

    this.colorElement.onchange = function() {
        console.log("color onchange ");
    };

    if (hasAlpha) {
        this.rangeElement.oninput = function() {
            console.log("range oninput");
        };
        this.rangeElement.onchange = function() {
            console.log("range onchange");
        };
    }

    this.colorStyleDefaults();
    this.updateColorStyle();
    this.updateTextStyle();

    /**
     * action upon change
     * @method Button#onClick
     */
    this.onChange = function() {
        console.log("onChange");
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
 * add a span with a space to the parent element
 * use ColorInput.spaceWidth as parameter !!!
 * @method ColorInput#addSpace
 */
ColorInput.prototype.addSpace = function() {
    const theSpan = document.createElement("span");
    theSpan.style.width = ColorInput.spaceWidth + "px";
    theSpan.style.display = "inline-block";
    this.parent.appendChild(theSpan);
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
    return ColorInput.rgbFrom(color) + alpha.toString(16);
};

/**
 * get value of colorInput,assumes that the textelement has the correct value
 * @method ColorInput#getValue
 * @return String, the color as hex string "#rrggbb"
 */
ColorInput.prototype.getValue = function() {
    console.log("getvaluecolor");
    return this.textElement.value;
};

/**
 * set value of input
 * @method ColorInput#setValue
 * @param {String} text
 */
ColorInput.prototype.setValue = function(text) {
    this.element.value = text;
};

/**
 * destroy the checkbox
 * @method ColorInput#destroy
 */
ColorInput.prototype.destroy = function() {
    this.onChange = null;
    this.onInput = null;
    this.element.onchange = null;
    this.element.oninput = null;
    this.element.onmouseenter = null;
    this.element.onmouseleave = null;
    this.element.remove();
    this.element = null;
};