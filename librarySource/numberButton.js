/**
 * a button to input numbers, needs button.js
 * <input type="text" class="numbers" id="outputWidthChooser" maxlength="4" />
 * 
 * @constructor NumberButton
 * @param {String} idName name (id) of an html element
 */

function NumberButton(idName) {
    "use strict";

    this.element = document.getElementById(idName);
    this.hover = false;
    this.pressed = false;
    this.colorStyleDefaults();
    this.updateStyle();

    /**
     * action upon change, strategy pattern
     * @method Button#onclick
     */
    this.onchange = function() {};

    var button = this;

    this.element.onchange = function() {
        button.onchange();
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
    NumberButton.prototype.updateStyle = Button.prototype.updateStyle;

    /**
     * setup the color styles defaults, use for other buttons too
     * @method NumberButton#colorStyleDefaults
     */
    NumberButton.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;

    /**
     * read the integer value of the text of a button of type="text"
     * @method NumberButton#getValue
     * @returns {integer} value resulting from parsing the button text
     */
    NumberButton.prototype.getValue = function() {
        return parseInt(this.element.value, 10);
    };

    /**
     * set the text of a button of type="text" according to a given number
     * @method NumberButton#setValue
     * @param {number} number the number value to show in the button
     */
    NumberButton.prototype.setValue = function(number) {
        this.element.value = number.toString();
    };
}());
