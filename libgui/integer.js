/* jshint esversion: 6 */

/**
 * input for integer numbers
 * @constructor Integer
 * @param {DOM element} parentDOM - html element, 'div' or 'span'
 */

import {
    Button,
    guiUtils
} from "./modules.js";

export function Integer(parentDOM) {
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
    this.minValue = Number.MIN_SAFE_INTEGER;
    this.maxValue = Number.MAX_SAFE_INTEGER;
    this.step = 1;
    this.offset = 0;
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
     * @method NumberButton#onchange
     * @param {integer} value
     */
    this.onChange = function(value) {
        console.log("onChange value " + button.getValue());
    };

    /**
     * action upon mouse down, doing an interaction
     * @method NumberButton#onInteraction
     */
    this.onInteraction = function() {
        console.log("numberInteraction");
    };

    // if the text of the input element changes: read text as number and update everything
    this.input.onchange = function() {
        button.updateValue(parseFloat(button.input.value));
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

// the same for all number input types
//===========================================================

/**
 * setup the color styles defaults, use for other buttons too
 * @method Integer#colorStyleDefaults
 */
Integer.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;

/**
 * update the color style of the input depending on whether its pressed or hovered
 * always call if states change, use for other buttons too
 * @method Integer#updateStyle
 */
Integer.prototype.updateStyle = function() {
    if (this.active) {
        if (this.pressed) {
            if (this.hover) {
                guiUtils.style(this.input)
                    .color(this.colorDownHover)
                    .backgroundColor(this.backgroundColorDownHover);
            } else {
                guiUtils.style(this.input)
                    .color(this.colorDown)
                    .backgroundColor(this.backgroundColorDown);
            }
        } else {
            if (this.hover) {
                guiUtils.style(this.input)
                    .color(this.colorUpHover)
                    .backgroundColor(this.backgroundColorUpHover);
            } else {
                guiUtils.style(this.input)
                    .color(this.colorUp)
                    .backgroundColor(this.backgroundColorUp);
            }
        }
    } else {
        guiUtils.style(this.input)
            .color(this.colorInactive)
            .backgroundColor(this.backgroundColorInactive);
    }
};

/**
 * set the indicator colors
 * @method Integer#setIndicatorColors
 * @param {string} colorLeft
 * @param {string} colorRight
 */
Integer.prototype.setIndicatorColors = function(colorLeft, colorRight) {
    this.indicatorColorLeft = colorLeft;
    this.indicatorColorRight = colorRight;
};

/**
 * set fontsize of the number button, in px
 * @method Integer#setFontSize
 * @param {integer} size
 */
Integer.prototype.setFontSize = function(size) {
    this.input.style.fontSize = size + "px";
    this.addButtons.forEach(button => button.setFontSize(size));
};

/**
 * set width of the input, in px
 * @method Integer#setInputWidth
 * @param {integer} width
 */
Integer.prototype.setInputWidth = function(width) {
    this.input.style.width = width + "px";
};

/**
 * set if button is active
 * @method Integer#setActive
 * @param {boolean} on
 */
Integer.prototype.setActive = function(on) {
    if (this.active !== on) {
        this.active = on;
        this.input.disabled = !on;
        if (on) {
            this.input.style.cursor = "text";
        } else {
            this.input.style.cursor = "default";
            this.pressed = false;
            this.hover = false;
        }
        if (this.range) {
            this.range.disabled = !on;
            if (on) {
                this.range.style.cursor = "pointer";
            } else {
                this.range.style.cursor = "default";
            }
        }
        this.addButtons.forEach(button => button.setActive(on));
        this.updateStyle();
    }
};

/**
 * set the text value of the input element
 * set the range element if it exists
 * set the indicator if it exists
 * for positive numbers and zero add a leading space 
 * (takes the place of the minus sign for negative numbers) 
 * @method Integer#setInputRange
 * @param {integer} n
 */
Integer.prototype.setInputRangeIndicator = function(n) {
    let text = n.toString();
    if (this.range) {
        this.range.value = text;
    }
    if (n >= 0) {
        text = " " + text;
    }
    this.input.value = text;
    if (this.indicatorElement) {
        let pos = 100 * (n - this.minValue);
        if (this.cyclic) {
            pos /= (this.maxValue - this.minValue - this.step);
        } else {
            pos /= (this.maxValue - this.minValue);
        }
        pos = Math.round(pos);
        let backgroundStyle = "linear-gradient(90deg, " + this.indicatorColorLeft + " ";
        backgroundStyle += pos + "%, " + this.indicatorColorRight + " " + pos + "%)";
        this.indicatorElement.style.background = backgroundStyle;
    }
};

/**
 * set the limits of the range element (if there is one)
 * @method Integer#setRangeLimits
 */
Integer.prototype.setRangeLimits = function() {
    if (this.range) {
        this.range.min = this.minValue;
        if (this.cyclic) {
            this.range.max = this.maxValue - this.step; // avoid irritating jump from right to left
        } else {
            this.range.max = this.maxValue;
        }
    }
};

// special for integer
//=================================================

// quantize with respect to offset
Integer.prototype.quantize = function(n) {
    n -= this.offset;
    n = Math.round(n / this.step) * this.step;
    return n + this.offset;
};

/**
 * wraparound if cyclic
 * clamp to range
 * quantize a number according to step, with offset as basis 
 * @method Integer#quantizeClamp
 * @param {int} n
 * @return int, quantized n
 */
Integer.prototype.quantizeClamp = function(n) {
    if (this.cyclic) {
        // wraparound, between minValue (inclusive) and maxValue (exclusive)
        // min=0,max=6 results in possible values of 0,1,2,3,4,5
        n -= this.minValue;
        const d = this.maxValue - this.minValue;
        n = n - d * Math.floor(n / d);
        n += this.minValue;
        n = this.quantize(n);
        // it may now be outside the limits, but not by more than one step
        if (n < this.minValue) {
            n += this.step;
        }
        if (n >= this.maxValue) {
            n -= this.step;
        }
    } else {
        // keep in limits
        n = Math.min(this.maxValue, Math.max(this.minValue, n));
        n = this.quantize(n);
        // it may now be outside the limits, but not by more than one step
        if (n < this.minValue) {
            n += this.step;
        }
        if (n > this.maxValue) {
            n -= this.step;
        }
    }
    return n;
};

/**
 * set the minimum value for numbers, maxValue is unchanged
 * @method Integer#setMin
 * @param {integer} value
 */
Integer.prototype.setMin = function(value) {
    if (guiUtils.isInteger(value)) {
        this.minValue = value;
        this.setRangeLimits();
        this.setInputRangeIndicator(this.getValue());
    } else {
        console.error('Integer#setMin: argument is not integer, it is ' + value);
    }
};

/**
 * set the maximum value for numbers, maxValue is unchanged
 * @method Integer#setMax
 * @param {integer} value
 */
Integer.prototype.setMax = function(value) {
    if (guiUtils.isInteger(value)) {
        this.maxValue = value;
        this.setRangeLimits();
        this.setInputRangeIndicator(this.getValue());
    } else {
        console.error('Integer#setMax: argument is not integer, it is ' + value);
    }
};

/**
 * set the step value for numbers, maxValue is unchanged
 * @method Integer#setStep
 * @param {integer} value
 */
Integer.prototype.setStep = function(value) {
    if (guiUtils.isInteger(value)) {
        this.step = value;
        this.setRangeLimits();
        this.setInputRangeIndicator(this.getValue());
    } else {
        console.error('Integer#setStep: argument is not integer, it is ' + value);
    }
};

/**
 * set the offset value for numbers, maxValue is unchanged
 * @method Integer#setOffset
 * @param {integer} value
 */
Integer.prototype.setOffset = function(value) {
    if (guiUtils.isInteger(value)) {
        this.offset = value;
        this.setRangeLimits();
        this.setInputRangeIndicator(this.getValue());
    } else {
        console.error('Integer#setOffset: argument is not integer, it is ' + value);
    }
};

/**
 * set that cyclic numbers are used (wraparound number range)
 * @method Integer#setCyclic
 */
Integer.prototype.setCyclic = function() {
    this.cyclic = true;
    this.setRangeLimits();
    this.setInputRangeIndicator(this.getValue());
};

/**
 * read the numerical value of the text input element
 * to be safe: if it is not an integer, then use the last value
 * keep it in limits, quantize it according to step and offset
 * make it cyclic
 * this means that you can always use its return value
 * @method Integer#getValue
 * @return {integer}
 */
Integer.prototype.getValue = function() {
    let n = parseInt(this.input.value, 10);
    if (!guiUtils.isInteger(n)) {
        n = this.lastValue;
    }
    return this.quantizeClamp(n);
};

/**
 * set the value of the text, range and indicator elements
 * checks range and quantizes
 * sets lastValue to same number
 * @method Integer#setValue
 * @param {integer} value 
 */
Integer.prototype.setValue = function(value) {
    if (guiUtils.isInteger(value)) {
        value = this.quantizeClamp(value);
        this.setInputRangeIndicator(value);
        this.lastValue = value;
    } else {
        console.error('Integer#setValue: argument is not integer, it is ' + value);
    }
};


/**
 * change value of digit at the left of the cursor in the input element
 * depending on direction argument (positive increases digit, negative decreases)
 * @method Integer#changeDigit
 * @param {float} direction - makes plus or minus changes
 */
Integer.prototype.changeDigit = function(direction) {
    console.log(direction);
};