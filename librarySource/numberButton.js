/**
 * a button to input numbers,
 * 
 * default is for integer numbers, can be changed to float with given step size (rounding) * 
 * 
 * @constructor NumberButton - better use factory NumberButton.create
 * @param {String} idName name (id) of an html (text) input element, attribute type will be set to text
 * @param {String} idPlus - optional, id of an HTML button element, for plus button, increases by 1
 * @param {String} idMinus - optional, id of an HTML button element, for minus button, decreases by 1
 * @param {String} idMin - optional, id of an HTML button element, set number to minimum value
 * @param {String} idMax - optional, id of an HTML button element,set number to maximum value
 */

/* jshint esversion:6 */

function NumberButton(idName, idPlus, idMinus, idMin, idMax) {
    "use strict";
    this.idName = idName;
    this.element = document.getElementById(idName);
    this.element.setAttribute("type", "text");
    DOM.style("#" + this.idName, "text-align", "right");
    this.idPlus = (arguments.length > 1) ? idPlus : false;
    this.idMinus = (arguments.length > 2) ? idMinus : false;
    this.idMin = (arguments.length > 3) ? idMin : false;
    this.idMax = (arguments.length > 4) ? idMax : false;
    this.hover = false;
    this.pressed = false;
    this.active = true;
    // limiting the number range: defaults, minimum is zero, maximum is very large
    this.minValue = 0;
    this.maxValue = NumberButton.maxValue;
    this.step = 1;
    // remember the last value, for starters an extremely improbable value
    this.lastValue = -1000000000;
    this.colorStyleDefaults();
    this.updateStyle();

    const button = this;

    // increasing and decreasing    
    this.plusButton = null;
    if (this.idPlus !== false) {
        this.plusButton = new Button(idPlus);
        this.plusButton.onClick = function() {
            button.updateValue(button.lastValue + 1);
        };
    }
    this.minusButton = null;
    if (this.idMinus !== false) {
        this.minusButton = new Button(idMinus);
        this.minusButton.onClick = function() {
            button.updateValue(button.lastValue - 1);
        };
    }

    // go to max or min value
    this.minButton = null;
    if (this.idMin !== false) {
        this.minButton = new Button(idMin);
        this.minButton.onClick = function() {
            button.updateValue(button.minValue);
        };
    }

    this.maxButton = null;
    if (this.idMax !== false) {
        this.maxButton = new Button(idMax);
        this.maxButton.onClick = function() {
            button.updateValue(button.maxValue);
        };
    }

    /**
     * action upon change, strategy pattern
     * @method NumberButton#onclick
     * @param {integer} value
     */
    this.onChange = function(value) {};

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
    const px = "px";

    //effective value for infinity, change if too low
    NumberButton.maxValue = 1000;

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
     * quantize a number according to step and clamp to range
     * @method NumberButton#quantizeClamp
     * @param {float} x
     * @return float, quantized x
     */
    NumberButton.prototype.quantizeClamp = function(x) {
        return Math.max(this.minValue, Math.min(this.step * Math.round(x / this.step), this.maxValue));
    };

    /**
     * change step to number smaller than 1 to get float
     * @method NumberButton#setStep
     * @param {float} step - the step size (rounding)
     */
    NumberButton.prototype.setStep = function(step) {
        this.step = step;
        // quantize value
        this.setValue(this.quantizeClamp(this.getValue()));
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
        this.setValue(this.quantizeClamp(this.getValue()));
    };

    /**
     * set the lower limit for numbers, correct value if out of range
     * @method NumberButton#setLow
     * @param {integer} minValue
     */
    NumberButton.prototype.setLow = function(minValue) {
        this.setRange(minValue, NumberButton.maxValue);
    };

    /**
     * read the value of the text of a button of type="text"
     * note that the element.onchange routine makes shure that 
     * the value will be a number if this is called after onchange event
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
     * @param {integer} number - the number value to show in the button, verified number !!
     */
    NumberButton.prototype.setValue = function(number) {
        number = this.quantizeClamp(number);
        this.lastValue = number;
        this.element.value = number.toString();
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
            }
        }
    };

    /**
     * destroy the button, taking care of all references, deletes the associated html element
     * may be too careful
     * set reference to the button to null
     * @method NumberButton#destroy
     */
    NumberButton.prototype.destroy = function() {
        this.onChange = null;
        this.element.onChange = null;
        this.element.onfocus = null;
        this.element.onblur = null;
        this.element.onmouseenter = null;
        this.element.onmouseleave = null;
        this.element.remove();
        this.element = null;
        if (this.plusButton != null) {
            this.plusButton.destroy();
            this.plusButton = null;
        }
        if (this.minusButton != null) {
            this.minusButton.destroy();
            this.minusButton = null;
        }
        if (this.minButton != null) {
            this.minButton.destroy();
            this.minButton = null;
        }
        if (this.maxButton != null) {
            this.maxButton.destroy();
            this.maxButton = null;
        }
    };

    /**
     * create an number button with up and down buttons, maximum 4 digits
     * Attention: set font sizes afterwards
     * @method NumberButton.create
     * @param {String} idSpan - id of the span conatining the number button
     * @return NumberButton
     */
    NumberButton.create = function(idSpan) {
        const inputId = DOM.createId();
        DOM.create("input", inputId, "#" + idSpan);
        DOM.addSpace(idSpan);
        const dnId = DOM.createButton(idSpan, "<");
        DOM.addSpace(idSpan);
        const upId = DOM.createButton(idSpan, ">");
        DOM.style("#" + upId + ",#" + dnId, "borderRadius", 1000 + px);
        let numberButton = new NumberButton(inputId, upId, dnId);
        return numberButton;
    };

    /**
     * create an number button with up and down buttons and max and min button, maximum 4 digits
     * Attention: set font sizes afterwards
     * @method NumberButton.createInfinity
     * @param {String} idSpan - id of the span conatining the number button
     * @return NumberButton
     */
    NumberButton.createInfinity = function(idSpan) {
        const inputId = DOM.createId();
        DOM.create("input", inputId, "#" + idSpan);
        DOM.addSpace(idSpan);
        const dnId = DOM.createButton(idSpan, "-");
        DOM.addSpace(idSpan);
        const upId = DOM.createButton(idSpan, "+");
        DOM.addSpace(idSpan);
        const minId = DOM.createButton(idSpan, "min");
        DOM.addSpace(idSpan);
        const maxId = DOM.createButton(idSpan, "max");
        DOM.style("#" + upId + ",#" + dnId + ",#" + minId + ",#" + maxId, "borderRadius", "1000px");
        let numberButton = new NumberButton(inputId, upId, dnId, minId, maxId);
        return numberButton;
    };

}());
