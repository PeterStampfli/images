/**
 * a color input element (container)
 * to simplify construction and destruction
 * to have same interface as other ui elements
 * @constructor ColorInput
 * @param {String} idName - of an html input element
 */

/* jshint esversion:6 */
import {
    Button
} from "./modules.js";


export function ColorInput(idName) {
    this.idName = idName;
    this.element = document.getElementById(idName);
    DOM.attribute("#" + idName, "type", "color");
    DOM.style("#" + idName, "cursor", "pointer");
    this.element.select(); // magic for old browsers that have no color input, text instead

    this.hover = false;
    this.colorStyleDefaults();
    this.updateStyle();

    /**
     * action upon change, closing the popup dialogue
     * @method Button#onClick
     */
    this.onChange = function() {
        console.log("onChange");
    };

    /**
     * action upon manipulation of the color input popup and closing the popup dialogue
     * @method Button#onClick
     */
    this.onInput = function() {
        console.log("onInput");
    };

    var colorInput = this;

    this.element.onchange = function() {
        colorInput.onInput();
        colorInput.onChange();
    };

    this.element.oninput = function() {
        colorInput.onInput();
        console.log("input");
    };

    // hovering
    this.element.onmouseenter = function() {
        colorInput.hover = true;
        colorInput.updateStyle();
    };

    this.element.onmouseleave = function() {
        colorInput.hover = false;
        colorInput.updateStyle();
    };
}

(function() {
    "use strict";
    const px = "px";

    /**
     * update the color style of the element depending on whether it is hovered
     * always call if states change, use for other buttons too
     * @method ColorInput#updateStyle
     */
    ColorInput.prototype.updateStyle = function() {
        if (this.hover) {
            this.element.style.backgroundColor = this.backgroundColorUpHover;
        } else {
            this.element.style.backgroundColor = this.backgroundColorUp;
        }
    };

    /**
     * setup the color styles defaults, use for other buttons too
     * @method NumberButton#colorStyleDefaults
     */
    ColorInput.prototype.colorStyleDefaults = function() {
        this.backgroundColorUp = Button.backgroundColorUp;
        this.backgroundColorUpHover = Button.backgroundColorUpHover;
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

}());

window.ColorInput = ColorInput;
