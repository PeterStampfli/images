/**
 * a button to input numbers, needs an input element
 * <input type="text" class="numbers" id="outputWidthChooser" maxlength="4" />
 * 
 * default is for integer numbers, can be changed to float with given step size (rounding)
 * default range is 0 to 1000000000
 * 
 * @constructor NumberButton - better use NumberButton.create
 * @param {String} idName name (id) of an html (text) input element, attribute type will be set to text
 * @param {String} idPlus - optional, id of an HTML button element, for plus button, increases by 1
 * @param {String} idMinus - optional, id of an HTML button element, for minus button, decreases by 1
 */

/* jshint esversion:6 */

function NumberButton(idName, idPlus, idMinus) {
    "use strict";
    this.isInteger = true;
    this.step = 1;
    this.element = document.getElementById(idName);
    this.element.setAttribute("type", "text");
    this.hover = false;
    this.pressed = false;
    // limiting the number range: defaults, minimum is zero, maximum is very large
    this.minValue = 0;
    this.maxValue = 1000000000;
    // increasing and decreasing    
    if (arguments.length > 1) {
        this.createPlusMinusButtons(idPlus, idMinus);
    } else {
        this.plusButton = null;
        this.MinusButton = null;
    }
    // remember the last value, for starters an extremely improbable value
    this.lastValue = -1000000000;
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
     * set numbers to float
     * @method NumberButton#setFloat
     * @param {float} step - the step size (rounding), default is 0.0001
     */
    NumberButton.prototype.setFloat = function(step) {
        if (arguments.length < 1) {
            step = 0.0001;
        }
        this.isInteger = false;
        this.step = step;
    };

    /**
     * set the allowed range of numbers, correct value if out of range
     * @method NumberButton#setRange
     * @param {integer} minValue
     * @param {integer} maxValue
     */
    NumberButton.prototype.setRange = function(minValue, maxValue) {
        this.minValue = minValue;
        this.maxValue = maxValue;
        // clamp value in range
        this.setValue(Fast.clamp(this.minValue, this.getValue(), this.maxValue));
    };


    /**
     * quantize a number according to step and clamp to range
     * @method NumberButton#quantizeClamp
     * @param {float} x
     * @return float, quantized x
     */
    NumberButton.prototype.quantizeClamp = function(x) {
        return Fast.clamp(this.minValue, this.step * Math.round(x / this.step), this.maxValue);
    };


    /**
     * read the value of the text of a button of type="text"
     * @method NumberButton#getValue
     * @returns {integer} value resulting from parsing the button text
     */
    NumberButton.prototype.getValue = function() {
        return this.quantizeClamp(parseFloat(this.element.value));
    };

    /**
     * set the text of a button of type="text" according to a given number
     * sets lastValue to same number
     * does nothing else, use it for initialization
     * @method NumberButton#setValue
     * @param {integer} number - the number value to show in the button
     * @param {String} text - default is number to string
     */
    NumberButton.prototype.setValue = function(number, text) {
        number = this.quantizeClamp(number);
        this.lastValue = number;
        if (arguments.length < 2) {
            this.element.value = number.toString();
        } else {
            this.element.value = text;
        }
    };

    /**
     * set the text of a button of type="text" according to a given number
     * check if it is a number and quantize it and clamp it in the range, if number changes do this.onchange
     * thus we can use it for initialization
     * @method NumberButton#updateValue
     * @param {integer} number - the number value to show in the button
     */
    NumberButton.prototype.updateValue = function(number) {
        if (isNaN(number)) { // overwrite garbage, do nothing
            this.setValue(this.lastValue);
        } else {
            number = this.quantizeClamp(number);
            if (this.lastValue != number) { // does it really change??
                this.setValue(number); // update numbers before action
                this.onChange(number);
            } else { // it does not change, clean up garbage
                this.setValue(this.lastValue);
            }
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


    /**
     * create an number button with up and down buttons, maximum 4 digits
     * Attention: set font sizes afterwards
     * @method NumberButton.create
     * @param {String} idSpan - id of the span conatining the number button
     * @return NumberButton
     */
    NumberButton.create = function(idSpan) {
        DOM.create("input", idSpan + "input", "#" + idSpan);
        DOM.create("span", idSpan + "extraspace1", "#" + idSpan, " ");
        DOM.create("button", idSpan + "up", "#" + idSpan, "up");
        DOM.create("span", idSpan + "extraspace2", "#" + idSpan, " ");
        DOM.create("button", idSpan + "dn", "#" + idSpan, "dn");
        DOM.style("#" + idSpan + "up" + ",#" + idSpan + "dn", "borderRadius", 1000 + px);
        let numberButton = new NumberButton(idSpan + "input", idSpan + "up", idSpan + "dn");
        return numberButton;
    };

}());
