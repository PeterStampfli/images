/* jshint esversion: 6 */

/**
 * a text area for input and output 
 * you can put long and multiline texts into it, can be edited
 * there is no onchange evnt - you need an additional button that makes things happen
 * @constructor TextAreaInOut
 * @param {DOM element} parent, an html element, best "div"
 */

import {
    Button,
    guiUtils
} from "./modules.js";

export function TextAreaInOut(parent) {
    this.element = document.createElement("textarea");
    parent.appendChild(this.element);
    //   this.element.style.cursor = "text";
    this.hover = false;
    this.pressed = false;
    this.active = true;

    this.colorStyleDefaults();
    this.updateStyle();

    // note: There is no onchange 

    /**
     * action upon mouse down, doing an interaction
     * @method TestInput#onInteraction
     */
    this.onInteraction = function() {
        console.log("textinput select Interaction");
    };

    var textInput = this;

    // onfocus /onblur corresponds to pressed
    this.element.onfocus = function() {
        textInput.pressed = true;
        textInput.updateStyle();
    };

    this.element.onblur = function() {
        textInput.pressed = false;
        textInput.updateStyle();
    };

    // hovering
    this.element.onmouseenter = function() {
        textInput.hover = true;
        textInput.updateStyle();
    };

    this.element.onmouseleave = function() {
        textInput.hover = false;
        textInput.updateStyle();
    };

    this.element.onmousedown = function() {
        textInput.onInteraction();
    };
}

/**
 * update the color style of the element depending on whether its pressed or hovered
 * always call if states change, use for other buttons too
 * @method TextAreaInOut#updateStyle
 */
TextAreaInOut.prototype.updateStyle = Button.prototype.updateStyle;

/**
 * setup the color styles defaults, use for other buttons too
 * @method TextAreaInOut#colorStyleDefaults
 */
TextAreaInOut.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;

/**
 * set if textarea is active and you can edit it
 * else you cannot edit, but you can select and copy
 * thus always has text cursor
 * @method TextAreaInOut#setActive
 * @param {boolean} on
 */
TextAreaInOut.prototype.setActive = function(on) {
    if (this.active !== on) {
        this.active = on;
        this.element.readOnly = !on;
        if (!on) {
            this.pressed = false;
            this.hover = false;
        }
        this.updateStyle();
    }
};

/**
 * set fontsize, in px
 * @method TextAreaInOut#setFontSize
 * @param {integer} size
 */
TextAreaInOut.prototype.setFontSize = function(size) {
    this.element.style.fontSize = size + "px";
};

/**
 * set number of rows (horizontal lines)
 * @method TextAreaInOut#setRows
 * @param {integer} n
 */
TextAreaInOut.prototype.setRows = function(n) {
    this.element.rows = n;
};

/**
 * set number of columns (charaacterss per horizontal line)
 * @method TextAreaInOut#setColumns
 * @param {integer} n
 */
TextAreaInOut.prototype.setColumns = function(n) {
    this.element.cols = n;
};

/**
 * get the value (textcontent)
 * @method TextAreaInOut#getValue
 *@return string
 */
TextAreaInOut.prototype.getValue = function() {
    return this.element.value;
};

/**
 * set the value (textcontent)
 * new line escape sequence "\n"
 * @method TextAreaInOut#setValue
 *@param {string} value
 */
TextAreaInOut.prototype.setValue = function(value) {
    this.element.value = value;
};

/**
 * destroy the textarea, taking care of all references, deletes the associated html element
 * may be too careful
 * set reference to the textarea to null
 * @method Button#destroy
 */
TextAreaInOut.prototype.destroy = function() {
    this.onInteraction = null;
    this.onMouseDown = null;
    this.element.onfocus = null;
    this.element.onblur = null;
    this.element.onmousedown = null;
    this.element.onmouseenter = null;
    this.element.onmouseleave = null;
    this.element.remove();
    this.element = null;
};