/**
 * a button to input numbers, needs an input element
 * <input type="text" class="numbers" id="outputWidthChooser" maxlength="4" />
 * 
 * @constructor NumberButton
 * @param {String} idName name (id) of an html text input element
 * @param {String} idPlus - optional, id for plus button
 * @param {String} idMinus - optional, id for minus button
 */

/* jshint esversion:6 */

function NumberButton(idName, idPlus, idMinus) {
    "use strict";

    this.element = document.getElementById(idName);
    console.log(this.element);
    if (arguments.length > 1) {
        this.createPlusMinusButtons(idPlus, idMinus);
    }
    this.hover = false;
    this.pressed = false;
    // limiting the number range: defaults, minimum is zero, maximum is very large
    this.minValue = 0;
    this.maxValue = 1000000000;
    // increasing and decreasing 
    this.plusButton = null;
    this.MinusButton = null;
    // remember the last value, for starters an extremely improbable value
    this.lastValue = -1000000000;
    this.colorStyleDefaults();
    this.updateStyle();

    /**
     * action upon change, strategy pattern
     * @method Button#onclick
     * @param {integer} value
     */
    this.onChange = function(value) {};

    var button = this;

    this.element.onchange = function() {
        button.updateValue(button.getValue());
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
     * set the allowed range of numbers
     * @method NumberButton#setRange
     * @param {integer} minValue
     * @param {integer} maxValue
     */
    NumberButton.prototype.setRange = function(minValue, maxValue) {
        this.minValue = minValue;
        this.maxValue = maxValue;
    };

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
     * sets lastValue to same number
     * does nothing else, use it for initialization
     * @method NumberButton#setValue
     * @param {integer} number - the number value to show in the button
     */
    NumberButton.prototype.setValue = function(number) {
        this.element.value = number.toString();
        this.lastValue = number;
    };
    /**
     * set the text of a button of type="text" according to a given number
     * check if it is in the range, if number changes do this.onchange
     * thus we can use it for initialization
     * @method NumberButton#updateValue
     * @param {integer} number - the number value to show in the button
     */
    NumberButton.prototype.updateValue = function(number) {
        number = Math.min(this.maxValue, Math.max(this.minValue, number));
        let lastValue = this.lastValue;
        this.setValue(number);
        if (lastValue != number) { // does it really change??
            this.onChange(number);
        }
    };

    /**
     * create buttons for increasing and decreasing the value
     * @method NumberButton#createPlusMinusButtons
     * @param {String} idPlus - id for the plus button
     * @param {String} idMinus - id for the minus button
     */
    NumberButton.prototype.createPlusMinusButtons = function(idPlus, idMinus) {
        this.plusButton = new Button(idPlus);
        this.minusButton = new Button(idMinus);
        let numberButton = this;
        this.plusButton.onClick = function() {
            numberButton.updateValue(numberButton.getValue() + 1);
        };
        this.minusButton.onClick = function() {
            numberButton.updateValue(numberButton.getValue() - 1);
        };
    };
}());
