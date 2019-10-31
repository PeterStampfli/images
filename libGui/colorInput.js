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


/**
 * get value of colorInput
 * @method ColorInput#getValue
 * @return String, the color as hex string "#rrggbb"
 */
ColorInput.prototype.getValue = function() {
    console.log("getvaluecolor");
    return this.element.value;
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