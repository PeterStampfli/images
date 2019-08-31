/**
 * a button to input numbers together with a slider
 * default is value between 0 and 1
 * @constructor Range - better use Range.create
 * @param {String} idText - id of HTML input element, will be set to type text
 * @param {String} idRange - id of HTML input element, will be set to type range
 */

/* jshint esversion:6 */

function Range(idText, idRange) {
    this.idText = idText;
    this.idRange = idRange;
    this.textElement = document.getElementById(idText);
    this.textElement.setAttribute("type", "text");
    DOM.style("#" + this.idText, "text-align", "right");
    this.rangeElement = document.getElementById(idRange);
    this.rangeElement.setAttribute("type", "range");
    this.rangeElement.setAttribute("class", "range");
    this.rangeElement.style.cursor = "pointer";
    this.rangeElement.step = "any";
    this.setStep(0.01);
    this.lastValue = 0.5;
    this.setRange(0, 1);
    this.colorStyleDefaults(); // the colors/backgroundcolors for different states

    const range = this;

    // the text element alone
    this.textHover = false;
    this.textPressed = false;
    this.updateTextStyle();

    // hovering
    this.textElement.onmouseenter = function() {
        range.textHover = true;
        range.updateTextStyle();
    };

    this.textElement.onmouseleave = function() {
        range.textHover = false;
        range.updateTextStyle();
    };

    // doing things
    this.textElement.onchange = function() {
        range.updateValue(range.getValueText());
    };

    // onfocus /onblur corresponds to pressed
    this.textElement.onfocus = function() {
        range.textPressed = true;
        range.updateTextStyle();
    };

    this.textElement.onblur = function() {
        range.textPressed = false;
        range.updateTextStyle();
    };

    // the range element alone
    this.rangeHover = false;
    this.rangePressed = false;
    this.updateRangeStyle();

    // doing things
    this.rangeElement.onchange = function() {
        range.updateValue(range.getValueRange());
    };

    // hovering
    this.rangeElement.onmouseenter = function() {
        range.rangeHover = true;
        range.updateRangeStyle();
    };

    this.rangeElement.onmouseleave = function() {
        range.rangeHover = false;
        range.updateRangeStyle();
    };

    /**
     * action upon change, strategy pattern
     * @method Range#onclick
     * @param {integer} value
     */
    this.onChange = function(value) {};
}



(function() {
    "use strict";

    /**
     * setup the color styles defaults, use for other buttons too
     * @method NumberButton#colorStyleDefaults
     */
    Range.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;

    /**
     * update the color style of the text input element depending on whether its pressed or hovered
     * always call if states change, use for other buttons too
     * @method Range#updateTextStyle
     */
    Range.prototype.updateTextStyle = function() {
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
     * update the color style of the range input element depending on whether its pressed or hovered
     * always call if states change, use for other buttons too
     * @method Range#updateRangeStyle
     */
    Range.prototype.updateRangeStyle = function() {
        if (this.rangePressed) {
            if (this.rangeHover) {
                this.rangeElement.style.backgroundColor = this.backgroundColorDownHover;
            } else {
                this.rangeElement.style.backgroundColor = this.backgroundColorDown;
            }
        } else {
            if (this.rangeHover) {
                this.rangeElement.style.backgroundColor = this.backgroundColorUpHover;
            } else {
                this.rangeElement.style.backgroundColor = this.backgroundColorUp;
            }
        }
    };


    /**
     * return a value clamped between max and min  
     * @function clamp 
     * @para {int/float} min 
     * @para {int/float} x 
     * @para {int/float} max  
     */
    function clamp(min, x, max) {
        return Math.max(min, Math.min(x, max));
    }

    /**
     * read the float value of the text input element
     * @method Range#getValueText
     * @returns {float} value resulting from parsing the button text
     */
    Range.prototype.getValueText = function() {
        return parseFloat(this.textElement.value);
    };

    /**
     * read the float value of the range input element
     * @method Range#getValueRange
     * @returns {float} value resulting from parsing the button text
     */
    Range.prototype.getValueRange = function() {
        return parseFloat(this.rangeElement.value);
    };

    /**
     * get the value for doing something
     * @method Range#getValueRange
     * @return float - the value
     */
    Range.prototype.getValue = function() {
        return this.lastValue;
    };

    /**
     * set the values of the text input element and the rangeElement
     * sets lastValue to same number
     * does nothing else, use it for initialization
     * @method Range#setValue
     * @param {integer} number - the number value to show in the button
     * @param {String} text - default is number to string
     */
    Range.prototype.setValue = function(number, text) {
        number = this.quantize(number);
        this.lastValue = number;
        this.textElement.value = number.toString();
        this.rangeElement.value = number.toString();
        if (arguments.length < 2) {
            this.textElement.value = number.toString();
        } else {
            this.textElement.value = text;
        }
    };

    /**
     * set the textInput and rangeInput according to a given number
     * check if it is a number and clamp it in the range, if number changes do this.onchange
     * thus we can use it for initialization
     * @method Range#updateValue
     * @param {float} number - the number value to show in the button
     */
    Range.prototype.updateValue = function(number) {
        if (isNaN(number)) { // overwrite garbage, do nothing
            this.setValue(this.lastValue);
        } else {
            number = clamp(this.minValue, number, this.maxValue);
            if (this.lastValue != number) { // does it really change??
                this.setValue(number); // update numbers before action
                this.onChange(number);
            } else { // it does not change, clean up garbage
                this.setValue(this.lastValue);
            }
        }
    };

    /**
     * set the allowed range of numbers, correct value if out of range
     * @method Range#setRange
     * @param {integer} minValue
     * @param {integer} maxValue
     */
    Range.prototype.setRange = function(minValue, maxValue) {
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.rangeElement.min = minValue;
        this.rangeElement.max = maxValue;
        // clamp value in range
        this.setValue(clamp(this.minValue, this.lastValue, this.maxValue));
    };

    /**
     * quantize a number according to step
     * @method Range#quantize
     * @param {float} x
     * @return float, quantized x
     */
    Range.prototype.quantize = function(x) {
        return this.step * Math.floor(0.5 + x / this.step);
    };

    /**
     * set the step of the slider, used too for quantization of text input/output
     * @method Range#setStep
     * @param {float} step
     */
    Range.prototype.setStep = function(step) {
        this.step = step;
        this.rangeElement.step = step;
    };

    /**
     * destroy the range thing, taking care of all references, deletes the associated html element
     * may be too careful
     * set reference to the button to null
     * @method Range#destroy
     */
    Range.prototype.destroy = function() {
        this.onChange = null;
        this.textElement.onchange = null;
        this.textElement.onfocus = null;
        this.textElement.onblur = null;
        this.textElement.onmouseenter = null;
        this.textElement.onmouseleave = null;
        this.textElement.remove();
        this.textElement = null;
        this.rangeElement.onmouseenter = null;
        this.rangeElement.onmouseleave = null;
        this.rangeElement.onchange = null;
        this.rangeElement.remove();
        this.rangeElement = null;
    };

    /**
     * create a range button combination
     * Attention: set font sizes afterwards
     * @method Range.create
     * @param {String} idSpan - id of the span containing the number button
     * @return Range
     */
    Range.create = function(idSpan) {
        DOM.create("input", idSpan + "text", "#" + idSpan);
        DOM.create("input", idSpan + "range", "#" + idSpan);
        let range = new Range(idSpan + "text", idSpan + "range");
        return range;
    };

}());
