/* jshint esversion: 6 */

/**
 * input for fixed point numbers
 * given constant number of digits after decimal point (at least one)
 * @constructor FixedPoint
 * @param {DOM element} parentDOM - html element, 'div' or 'span'
 */

import {
    Button,
    guiUtils,
    Integer
} from "./modules.js";

export function FixedPoint(parentDOM) {
    this.parentDOM = parentDOM;
    this.input = document.createElement("input");
    this.input.value = '00';
    guiUtils.style(this.input)
        .attribute("type", "text")
        .textAlign("right")
        .verticalAlign("middle")
        .parent(parentDOM);
    this.addButtons = [];
    this.range = false;
    this.hover = false;
    this.pressed = false; // corresponds to focus
    this.active = true;
    // limiting the number range: defaults, minimum is zero, maximum is very large
    this.minValue = -1e10;
    this.maxValue = 1e10;
    this.setStep(0.001);
    this.cyclic = false;
    // remember the last value, for starters an extremely improbable value
    this.lastValue = this.minValue;
    this.colorStyleDefaults();
    this.updateStyle();
    // do we want to show the indicator in the background
    this.indicatorElement = false;
    this.setIndicatorColors("#aaaa99", "#ddddff");

    const button = this;

    /**
     * action upon change of the number
     * @method Integer#onchange
     * @param {integer} value
     */
    this.onChange = function(value) {
        console.log("onChange value " + button.getValue());
    };

    /**
     * action upon mouse down, doing an interaction
     * @method Integer#onInteraction
     */
    this.onInteraction = function() {
        console.log("numberInteraction");
    };

    // if the text of the input element changes: read text as number and update everything
    this.input.onchange = function() {
        button.action(parseFloat(button.input.value));
    };

    this.input.onmousedown = function() {
        if (button.active) {
            button.onInteraction();
        }
    };

    // onfocus /onblur corresponds to pressed
    this.input.onfocus = function() {
        if (button.active) {
            button.pressed = true;
            button.updateStyle();
        }
    };

    this.input.onblur = function() {
        button.pressed = false;
        button.updateStyle();
    };

    // hovering
    this.input.onmouseenter = function() {
        if (button.active) {
            button.hover = true;
            button.updateStyle();
        }
    };

    this.input.onmouseleave = function() {
        if (button.active) {
            button.hover = false;
            button.updateStyle();
        }
    };

    this.input.onwheel = function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (button.pressed && button.active) {
            button.changeDigit(-event.deltaY);
        }
        return false;
    };

    this.input.onkeydown = function(event) {
        let key = event.key;
        if (button.pressed && button.active) {
            if (key === "ArrowDown") {
                button.changeDigit(-1);
                event.preventDefault();
                event.stopPropagation();
            } else if (key === "ArrowUp") {
                button.changeDigit(1);
                event.preventDefault();
                event.stopPropagation();
            }
        }
    };
}

// reusing code ...

FixedPoint.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;
FixedPoint.prototype.updateStyle = Integer.prototype.updateStyle;
FixedPoint.prototype.setIndicatorColors = Integer.prototype.setIndicatorColors;
FixedPoint.prototype.setFontSize = Integer.prototype.setFontSize;
FixedPoint.prototype.setInputWidth = Integer.prototype.setInputWidth;
FixedPoint.prototype.setActive = Integer.prototype.setActive;
FixedPoint.prototype.setInputRangeIndicator = Integer.prototype.setInputRangeIndicator;
FixedPoint.prototype.setRangeLimits = Integer.prototype.setRangeLimits;
FixedPoint.prototype.quantizeClamp = Integer.prototype.quantizeClamp;
FixedPoint.prototype.setCyclic = Integer.prototype.setCyclic;

FixedPoint.prototype.createButton = Integer.prototype.createButton;
FixedPoint.prototype.createAddButton = Integer.prototype.createAddButton;
FixedPoint.prototype.createMulButton = Integer.prototype.createMulButton;
FixedPoint.prototype.createMiniButton = Integer.prototype.createMiniButton;
FixedPoint.prototype.createMaxiButton = Integer.prototype.createMaxiButton;
FixedPoint.prototype.createSuggestButton = Integer.prototype.createSuggestButton;

FixedPoint.prototype.createRange = Integer.prototype.createRange;
FixedPoint.prototype.setRangeWidth = Integer.prototype.setRangeWidth;
FixedPoint.prototype.destroy = Integer.prototype.destroy;

// setting parameters, now float values and not integers

/**
 * set the minimum value for numbers, maxValue is unchanged
 * @method FixedPoint#setMin
 * @param {number} value
 */
FixedPoint.prototype.setMin = function(value) {
    if (guiUtils.isInteger(value)) {
        this.minValue = value;
        this.setRangeLimits();
        this.setInputRangeIndicator(this.getValue());
    } else {
        console.error('FixedPoint#setMin: argument is not a number, it is ' + value);
    }
};

/**
 * set the maximum value for numbers, maxValue is unchanged
 * @method FixedPoint#setMax
 * @param {number} value
 */
FixedPoint.prototype.setMax = function(value) {
    if (guiUtils.isInteger(value)) {
        this.maxValue = value;
        this.setRangeLimits();
        this.setInputRangeIndicator(this.getValue());
    } else {
        console.error('FixedPoint#setMax: argument is not integer, it is ' + value);
    }
};

/**
 * no offset value for fixedPoint, do nothing
 * @method FixedPoint#setOffset
 */
FixedPoint.prototype.setOffset = function() {};

// quantizing, special for fixedPoint, no offset, step size as 1/integer 
FixedPoint.prototype.quantize = function(x) {
    return Math.round(this.invStep * x) / this.invStep;
};

/**
 * set the step value for numbers, 
 * inverse value rounded to integer, number of digits
 * @method FixedPoint#setStep
 * @param {number} value
 */
FixedPoint.prototype.setStep = function(value) {
    if (guiUtils.isNumber(value)) {
        this.invStep = Math.max(2, Math.round(1 / value));
        this.step = 1 / this.invStep;
        // number of digits depend on step: rounding up
        this.digits = Math.floor(Math.log10(this.invStep) - 0.01) + 1;
        this.setRangeLimits();
        this.setInputRangeIndicator(this.getValue());
    } else {
        console.error('FixedPoint#setStep: argument is not a number, it is ' + value);
    }
};

/**
 * read the numerical value of the text input element
 * to be safe: if it is not a number, then use the last value
 * keep it in limits, quantize it according to step and offset
 * make it cyclic
 * this means that you can always use its return value
 * @method FixedPoint#getValue
 * @return {number}
 */
FixedPoint.prototype.getValue = function() {
    let value = parseFloat(this.input.value);
    if (!guiUtils.isNumber(value)) {
        value = this.lastValue;
    }
    return this.quantizeClamp(value);
};

/**
 * set the value of the text, range and indicator elements
 * checks range and quantizes
 * sets lastValue to same number
 * @method FixedPoint#setValue
 * @param {number} value 
 */
FixedPoint.prototype.setValue = function(value) {
    if (guiUtils.isNumber(value)) {
        value = this.quantizeClamp(value);
        this.setInputRangeIndicator(value);
        this.lastValue = value;
    } else {
        console.error('FixedPoint#setValue: argument is not a number, it is ' + value);
    }
};

/**
 * the value of the input element or the range element may have changed:
 *  if it is different to the last value then set text range and indicator, call onChange
 * else set text and indicator only
 * @method FixedPoint#action
 * @param {number} value
 */
FixedPoint.prototype.action = function(value) {
    if (guiUtils.isNumber(value)) {
        value = this.quantizeClamp(value);
        // it may be that after quantization we get the same number, then nothing changed, but we need update of ui
        if (this.lastValue !== value) {
            this.lastValue = value;
            this.setInputRangeIndicator(value);
            this.onChange(value);
        } else {
            this.setInputRangeIndicator(value);
        }
    } else {
        console.error('FixedPoint#action: argument is not a number, it is ' + value);
        this.setInputRangeIndicator(this.lastValue);
    }
};

/**
 * change value of digit at the left of the cursor in the input element
 * depending on direction argument (positive increases digit, negative decreases)
 * change at least by this.step, (else it is a larger power of ten)
 * @method FixedPoint#changeDigit
 * @param {float} direction - makes plus or minus changes
 */
FixedPoint.prototype.changeDigit = function(direction) {
    const inputLength = this.input.value.length;
    const value = this.getValue();
    // if cursor is at (rightside) end of input value, then correct it to position before the end
    let cursorPosition = Math.min(this.input.selectionStart, this.input.value.length - 1);
    // for negative numbers the cursor position may not be smaller than 1 (at the right of the minus sign)
    if (value < 0) { // beware of the minus sign
        cursorPosition = Math.max(cursorPosition, 1);
    }
    // get position of the dot
    let pointPosition = this.input.value.indexOf('.');
    let power = 0;
    if (cursorPosition < pointPosition) {
        console.log('intpart');
        power = pointPosition - 1 - cursorPosition;
    } else {
        // if cursor at left of point: change first digit after the point
        if (cursorPosition === pointPosition) {
            cursorPosition = pointPosition + 1;
        }
        power = -(cursorPosition - pointPosition);
    }
    const change = Math.max(this.step, Math.pow(10, power));
    if (direction > 0) { // again the minus sign
        this.action(value + change);
    } else {
        this.action(value - change);
    }
    // the number may have changed, cursorposition is relative to point position
    // Attention: integer part may have changed number of digit, may change sign
    pointPosition = this.input.value.indexOf('.');
    if (power >= 0) {
        cursorPosition = pointPosition - 1 - power; // integer part: cursor at left of point, left of changing digit
    } else {
        cursorPosition = pointPosition - power; // fractional part at the right of the point
    }
    if (this.getValue() > 0) {
        cursorPosition = Math.max(cursorPosition, 0);
    } else {
        cursorPosition = Math.max(cursorPosition, 1);
    }
    this.input.setSelectionRange(cursorPosition, cursorPosition);
};