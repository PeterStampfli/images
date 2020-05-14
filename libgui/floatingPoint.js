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
    this.digits = 1;
    this.addButtons = [];
    this.range = false;
    this.hover = false;
    this.pressed = false; // corresponds to focus
    this.active = true;
    // limiting the number range: defaults, minimum is zero, maximum is very large
    this.minValue = -1e10;
    this.maxValue = 1e10;
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

FloatingPoint.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;
FloatingPoint.prototype.updateStyle = Integer.prototype.updateStyle;
FloatingPoint.prototype.setIndicatorColors = Integer.prototype.setIndicatorColors;
FloatingPoint.prototype.setFontSize = Integer.prototype.setFontSize;
FloatingPoint.prototype.setInputWidth = Integer.prototype.setInputWidth;
FloatingPoint.prototype.setActive = Integer.prototype.setActive;
FloatingPoint.prototype.setRangeLimits = Integer.prototype.setRangeLimits;
FloatingPoint.prototype.quantizeClamp = Integer.prototype.quantizeClamp;
FloatingPoint.prototype.setCyclic = Integer.prototype.setCyclic;
FloatingPoint.prototype.setInputRangeIndicator = FixedPoint.prototype.setInputRangeIndicator;
FloatingPoint.prototype.createButton = Integer.prototype.createButton;
FloatingPoint.prototype.createAddButton = Integer.prototype.createAddButton;
FloatingPoint.prototype.createMulButton = Integer.prototype.createMulButton;
FloatingPoint.prototype.createMiniButton = Integer.prototype.createMiniButton;
FloatingPoint.prototype.createMaxiButton = Integer.prototype.createMaxiButton;
FloatingPoint.prototype.createSuggestButton = Integer.prototype.createSuggestButton;
FloatingPoint.prototype.getValue =FixedPoint.prototype.getValue ;

FloatingPoint.prototype.createRange = Integer.prototype.createRange;
FloatingPoint.prototype.setRangeWidth = Integer.prototype.setRangeWidth;
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
        this.setRangeLimits();
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
        this.setRangeLimits();
        this.setInputRangeIndicator(this.getValue());
    } else {
        console.error('FloatingPoint#setMax: argument is not integer, it is ' + value);
    }
};

/**
 * no offset value for fixedPoint, do nothing
 * @method FloatingPoint#setOffset
 */
FixedPoint.prototype.setOffset = function() {};

// quantizing, nothing for FloatingPoint
FloatingPoint.prototype.quantize = function(x) {
    return x;
};

/**
 * no step value for floating point, do nothing 
 * @method FloatingPoint#setStep
 * @param {number} value
 */
FloatingPoint.prototype.setStep = function(value) {};

// determine number of digits after decimal point
// integer numbers and very small numbers give one
FloatingPoint.prototype.determineDigits = function(value) {
    let text = value.toString();
// may use scientific notation for numbers with magnitude smaller than 1e**-7
console.log(text)
if (text.indexOf('e')>=0){
	 text=text.split('e');
	 let significand=text[0];
	 const magnitude=text[1];
	 let significandDigits=0;                  // for numbers like 2e-3 with integer significand
	 if (significand.indexOf('.')>=0){         // significand has decimal point, look at digits after the point
significand=significand.split('.');
significandDigits=significand[1].length;
	 }

	return Math.max(1,significandDigits-parseInt(magnitude));
}
else {


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
    // digits are difference between position of first nonzero digit and ddecimal point, at least one
    return Math.max(1, index - pointPosition);
}
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
        value = this.quantizeClamp(value);
        this.digits=this.determineDigits(value)
        this.setInputRangeIndicator(value);
        this.lastValue = value;
    } else {
        console.error('FloatingPoint#setValue: argument is not a number, it is ' + value);
    }
};