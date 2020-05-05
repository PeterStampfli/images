/* jshint esversion: 6 */

/**
 * a text input element
 * to simplify construction and destruction
 * to have same interface as other ui elements
 * @constructor TextInput
 * @param {DOM element} parent, an html element, best "div"
 */

import {
    Button,
    guiUtils
} from "./modules.js";

export function TextInput(parent) {
    this.element = document.createElement("input");
    parent.appendChild(this.element);
    this.element.setAttribute("type", "text");

    this.hover = false;
    this.pressed = false;
    this.active = true;

    this.colorStyleDefaults();
    this.updateStyle();

    /**
     * action upon change, strategy pattern
     * @method Button#onClick
     */
    this.onChange = function() {
        console.log("nada");
    };

    /**
     * action upon mouse down, doing an interaction
     * @method TestInput#onInteraction
     */
    this.onInteraction = function() {
        console.log("textinput select Interaction");
    };

    var textInput = this;
    this.element.onchange = function() {
        textInput.onChange();
    };

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

const px = "px";

/**
 * update the color style of the element depending on whether its pressed or hovered
 * always call if states change, use for other buttons too
 * @method TextInput#updateStyle
 */
TextInput.prototype.updateStyle = Button.prototype.updateStyle;

/**
 * setup the color styles defaults, use for other buttons too
 * @method TextInput#colorStyleDefaults
 */
TextInput.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;

/**
 * set fontsize of the button, in px
 * @method TextInput#setFontSize
 * @param {integer} size
 */
TextInput.prototype.setFontSize = function(size) {
    this.element.style.fontSize = size + "px";
};

/**
 * set width of the button, in px
 * @method TextInput#setFontSize
 * @param {integer} width
 */
TextInput.prototype.setWidth = function(width) {
    this.element.style.width = width + "px";
};

/**
 * set if button is active
 * @method TextInput#setActive
 * @param {boolean} on
 */
TextInput.prototype.setActive = function(on) {
    if (this.active !== on) {
        this.active = on;
        this.element.disabled = !on;
        if (on) {
            this.element.style.cursor = "text";
        } else {
            this.element.style.cursor = "default";
            this.pressed = false;
            this.hover = false;
        }
        this.updateStyle();
    }
};

/**
 * get value of textInput
 * @method TextInput#getValue
 * @return String, the text
 */
TextInput.prototype.getValue = function() {
    return this.element.value;
};

/**
 * set value of checkbox
 * @method TextInput#setValue
 * @param {String} text
 */
TextInput.prototype.setValue = function(text) {
    if (guiUtils.isString(text)) {
        this.element.value = text;
    } else {
        console.error("Text controller, setValue: argument is not a string:");
        console.log('its value is ' + text + ' of type "' + (typeof text) + '"');
    }
};

/**
 * destroy the textinput
 * @method TextInput#destroy
 */
TextInput.prototype.destroy = function() {
    this.onChange = null;
    this.element.onchange = null;
    this.element.onmouseenter = null;
    this.element.onmouseleave = null;
    this.element.onblur = null;
    this.element.onfocus = null;
    this.element.remove();
    this.element = null;
};