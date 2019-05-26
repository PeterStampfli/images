/**
 * a button to input text,
 * 
 * @constructor TextButton 
 * @param {String} idName name (id) of an html (text) input element, attribute type will be set to text
 */

/* jshint esversion:6 */

function TextButton(idName) {
    "use strict";
    this.element = document.getElementById(idName);
    this.element.setAttribute("type", "text");
    this.hover = false;
    this.pressed = false;

    this.colorStyleDefaults();
    this.updateStyle();

    /**
     * action upon change, strategy pattern
     * @method NumberButton#onclick
     * @param {integer} value
     */
    this.onChange = function(value) {};

    var button = this;

    this.element.onchange = function() {
        button.onChange(button.getValue());
    };

    // onfocus /onblur corresponds to pressed
    this.element.onfocus = function() {
        button.pressed = true;
        button.updateStyle();
    };

    this.element.onblur = function() {
        button.pressed = false;
        button.updateStyle();
    };

    // hovering
    this.element.onmouseenter = function() {
        button.hover = true;
        button.updateStyle();
    };

    this.element.onmouseleave = function() {
        button.hover = false;
        button.updateStyle();
    };
}



(function() {
    "use strict";

    /**
     * update the color style of the element depending on whether its pressed or hovered
     * always call if states change, use for other buttons too
     * @method NumberButton#updateStyle
     */
    TextButton.prototype.updateStyle = Button.prototype.updateStyle;

    /**
     * setup the color styles defaults, use for other buttons too
     * @method NumberButton#colorStyleDefaults
     */
    TextButton.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;


    /**
     * read the value of the text input
     * @method TextButton#getValue
     * @returns {String}  the button text
     */
    TextButton.prototype.getValue = function() {
        return this.element.value;
    };

    /**
     * set the value of the text input
     * @method TextButton#setValue
     * @param {String} text
     */
    TextButton.prototype.setValue = function(text) {
        this.element.value = text;
    };


}());
