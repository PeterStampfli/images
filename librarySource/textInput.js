/**
 * a text input element (container)
 * to simplify construction and destruction
 * to have same interface as other ui elements
 * @constructor TextInput
 * @param {String} idName - of an html input element
 */

/* jshint esversion:6 */

function TextInput(idName) {
    this.idName = idName;
    this.element = document.getElementById(idName);
    DOM.attribute("#" + idName, "type", "text");
    DOM.style("#" + idName, "cursor", "pointer");

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
}

(function() {
    "use strict";
    const px = "px";

    /**
     * update the color style of the element depending on whether its pressed or hovered
     * always call if states change, use for other buttons too
     * @method NumberButton#updateStyle
     */
    TextInput.prototype.updateStyle = Button.prototype.updateStyle;

    /**
     * setup the color styles defaults, use for other buttons too
     * @method NumberButton#colorStyleDefaults
     */
    TextInput.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;

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
        this.element.value = text;
    };

    /**
     * destroy the checkbox
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

}());
