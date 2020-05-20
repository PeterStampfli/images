/* jshint esversion: 6 */

/**
 * input for 'floating' point numbers with varying number of digits after deccimal point
 * @constructor FloatingPoint
 * @param {DOM element} parentDOM - html element, 'div' or 'span'
 */

import {
    Button,
    guiUtils,
    Integer,
    FixedPoint
} from "./modules.js";

export function FloatingPoint(parentDOM) {
    this.parentDOM = parentDOM;
    this.input = document.createElement("input");
    this.input.value = '00';
    guiUtils.style(this.input)
        .attribute("type", "text")
        .textAlign("right")
        .verticalAlign("middle")
        .parent(parentDOM);
    this.maxDigits = 15;
    this.setDigits(1);
    this.additionalButtons = [];
    this.range = false;
    this.hover = false;
    this.pressed = false; // corresponds to focus
    this.active = true;
    // limiting the number range: defaults, minimum is zero, maximum is very large
    this.minValue = Number.MIN_VALUE;
    this.maxValue = Number.MAX_VALUE;
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
    // including number of digits
    this.input.onchange = function() {
        let value = parseFloat(button.input.value, 10);
        if (!guiUtils.isNumber(value)) {
            value = button.lastValue;
        }
        const digits = button.determineDigits(value);
        button.setDigits(digits);
        value = button.quantizeClamp(value);
        button.setInputRangeIndicator(value);
        // it may be that after quantization we get the same number, then nothing changed, but we need update of ui
        if (button.lastValue !== value) {
            button.lastValue = value;
            button.onChange(value);
        }
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
                event.preventDefault();
                event.stopPropagation();
                button.changeDigit(-1);
            } else if (key === "ArrowUp") {
                event.preventDefault();
                event.stopPropagation();
                button.changeDigit(1);
            }
        }
    };
}

// reusing code ...

FloatingPoint.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;
FloatingPoint.prototype.updateStyle = Integer.prototype.updateStyle;
FloatingPoint.prototype.setIndicatorColors = Integer.prototype.setIndicatorColors;
FloatingPoint.prototype.setFontSize = Integer.prototype.setFontSize;
FloatingPoint.prototype.setInputWidth = Integer.prototype.setInputWidth;
FloatingPoint.prototype.setActive = Integer.prototype.setActive;
FloatingPoint.prototype.quantize = FixedPoint.prototype.quantize;
FloatingPoint.prototype.quantizeClamp = Integer.prototype.quantizeClamp;
FloatingPoint.prototype.setCyclic = Integer.prototype.setCyclic;
FloatingPoint.prototype.setInputRangeIndicator = FixedPoint.prototype.setInputRangeIndicator;
FloatingPoint.prototype.setRangeLimitsStep = Integer.prototype.setRangeLimitsStep;

/**
 * create additional buttons that do something
 * @method FloatingPoint.createButton
 * @param {String} text - shown in the button
 * @param {htmlElement} parentDOM
 * @param {function} changeValue - function(value), returns changed value
 * @return the button
 */
FloatingPoint.prototype.createButton = function(text, parentDOM, changeValue) {
    const additionalButton = new Button(text, parentDOM);
    const button = this;
    additionalButton.onInteraction = function() {
        button.onInteraction();
    };
    additionalButton.onClick = function() {
        button.input.focus();
        let value = button.getValue();
        value = changeValue(value);
        // the number of digits might have changed
        const digits = button.determineDigits(value);
        button.setDigits(digits);
        value = button.quantizeClamp(value);
        // it may be that after quantization we get the same number, then nothing changed, but we need update of ui
        if (button.lastValue !== value) {
            button.lastValue = value;
            button.setInputRangeIndicator(value);
            button.onChange(value);
        } else {
            button.setInputRangeIndicator(value);
        }
    };
    this.additionalButtons.push(additionalButton);
    return additionalButton;
};

FloatingPoint.prototype.createAddButton = Integer.prototype.createAddButton;
FloatingPoint.prototype.createMulButton = Integer.prototype.createMulButton;
FloatingPoint.prototype.createMiniButton = Integer.prototype.createMiniButton;
FloatingPoint.prototype.createMaxiButton = Integer.prototype.createMaxiButton;
FloatingPoint.prototype.createSuggestButton = Integer.prototype.createSuggestButton;

FloatingPoint.prototype.createRange = FixedPoint.prototype.createRange;
FloatingPoint.prototype.setRangeWidth = Integer.prototype.setRangeWidth;
FloatingPoint.prototype.setIndicatorElement = Integer.prototype.setIndicatorElement;
FloatingPoint.prototype.destroy = Integer.prototype.destroy;

// setting parameters, now float values and not integers

/**
 * set the minimum value for numbers, maxValue is unchanged
 * @method FloatingPoint#setMin
 * @param {number} value
 */
FloatingPoint.prototype.setMin = function(value) {
    if (guiUtils.isNumber(value)) {
        this.minValue = value;
        this.setRangeLimitsStep();
        this.setInputRangeIndicator(this.getValue());
    } else {
        console.error('FloatingPoint#setMin: argument is not a number, it is ' + value);
    }
};

/**
 * set the maximum value for numbers, maxValue is unchanged
 * @method FloatingPoint#setMax
 * @param {number} value
 */
FloatingPoint.prototype.setMax = function(value) {
    if (guiUtils.isNumber(value)) {
        this.maxValue = value;
        this.setRangeLimitsStep();
        this.setInputRangeIndicator(this.getValue());
    } else {
        console.error('FloatingPoint#setMax: argument is not integer, it is ' + value);
    }
};

/**
 * set the number of digits to use after decimal point
 * at least one
 * set the corresponding step and inverse step
 * sets range limits and step
 * does Not update appearance of ui elements
 * @method FloatingPoint.setDigits
 * @param{int} n
 */
FloatingPoint.prototype.setDigits = function(n) {
    n = Math.max(1, n);
    this.digits = n;
    this.step = Math.pow(10, -n);
    this.invStep = Math.round(1 / this.step);
    this.setRangeLimitsStep();
};

/**
 * no step value for floating point, do nothing 
 * @method FloatingPoint#setStep
 * @param {number} value
 */
FloatingPoint.prototype.setStep = function(value) {};

/**
 * no offset value for fixedPoint, do nothing
 * @method FloatingPoint#setOffset
 */
FixedPoint.prototype.setOffset = function() {};

// determine number of digits after decimal point
// integer numbers and very small numbers give one
FloatingPoint.prototype.determineDigits = function(value) {
    let text = value.toString();
    // may use scientific notation for numbers with magnitude smaller than 1e**-7
    if (text.indexOf('e') >= 0) {
        text = text.split('e');
        let significand = text[0];
        const magnitude = text[1];
        let significandDigits = 0; // for numbers like 2e-3 with integer significand
        if (significand.indexOf('.') >= 0) { // significand has decimal point, look at digits after the point
            significand = significand.split('.');
            significandDigits = significand[1].length;
        }
        return Math.max(1, significandDigits - parseInt(magnitude));
    } else {
        const pointPosition = text.indexOf('.');
        // for safety, there is always a decimal point except for this.maxDigits==0
        if (pointPosition < 0) {
            return 1;
        }
        let index = text.length - 1;
        // find first digit from the right different to zero
        while (text[index] === '0') {
            index -= 1;
        }
        // digits are difference between position of first nonzero digit and decimal point, at least one
        return Math.max(1, index - pointPosition);
    }
};

/**
 * read the numerical value of the text input element
 * to be safe: if it is not a number, then use the last value
 * keep it in limits, quantize it according to present step and offset
 * make it cyclic
 * note that it does not change the number of digits
 * @method FloatingPoint#getValue
 * @return {number}
 */
FloatingPoint.prototype.getValue = function() {
    let value = parseFloat(this.input.value, 10);
    if (!guiUtils.isNumber(value)) {
        value = this.lastValue;
    }
    value = this.quantizeClamp(value);
    return value;
};

/**
 * set the value of the text, range and indicator elements
 * checks range and quantizes
 * sets lastValue to same number
 * @method FloatingPoint#setValue
 * @param {number} value 
 */
FloatingPoint.prototype.setValue = function(value) {
    if (guiUtils.isNumber(value)) {
        const digits = this.determineDigits(value);
        this.setDigits(digits);
        value = this.quantizeClamp(value);
        this.setInputRangeIndicator(value);
        this.lastValue = value;
    } else {
        console.error('FloatingPoint#setValue: argument is not a number, it is ' + value);
    }
};

/**
 * change value of digit at the left of the cursor in the input element
 * depending on direction argument (positive increases digit, negative decreases)
 * change at least by this.step, (else it is a larger power of ten)
 * @method FloatingPoint#changeDigit
 * @param {float} direction - makes plus or minus changes
 */
FloatingPoint.prototype.changeDigit = function(direction) {
    console.log('changedigit');
    const inputLength = this.input.value.length;
    let value = this.getValue();
    let cursorPosition = this.input.selectionStart;
    // for negative numbers the cursor position may not be smaller than 1 (at the right of the minus sign)
    if (value < 0) { // beware of the minus sign
        cursorPosition = Math.max(cursorPosition, 1);
    }
    // get position of the dot
    let pointPosition = this.input.value.indexOf('.');
    // then we can determine the power
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
    const change = Math.pow(10, power);
    if (direction > 0) {
        value += change;
    } else {
        value -= change;
    }
    // if cursor is at end of input string then we get an additional digit
    if (cursorPosition === inputLength) {
        this.setDigits(this.digits + 1);
    }
    value = this.quantizeClamp(value);
    if (value !== this.lastValue) {
        this.lastValue = value;
        this.setInputRangeIndicator(value);
        // the number may have changed, cursorposition is relative to point position
        // Attention: integer part may have changed number of digit, may change sign
        pointPosition = this.input.value.indexOf('.');
        if (power >= 0) {
            cursorPosition = pointPosition - 1 - power; // integer part: cursor at left of point, left of changing digit
        } else {
            cursorPosition = pointPosition - power; // fractional part at the right of the point
        }
        if (value > 0) {
            cursorPosition = Math.max(cursorPosition, 0);
        } else {
            cursorPosition = Math.max(cursorPosition, 1);
        }
        this.input.setSelectionRange(cursorPosition, cursorPosition);
        this.onChange(value);
    }
};