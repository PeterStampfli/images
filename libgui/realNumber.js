/* jshint esversion: 6 */

/**
 * input for 'floating' point numbers with varying number of digits after deccimal point
 * @constructor FloatingPoint
 * @param {DOM element} parentDOM - html element, 'div' or 'span'
 */

import {
    Button,
    guiUtils
} from "./modules.js";

export function RealNumber(parentDOM) {
    this.parentDOM = parentDOM;
    this.input = document.createElement("input");
    this.element = this.input; // to be able to use button#methods
    this.input.value = '00';
    guiUtils.style(this.input)
        .attribute("type", "text")
        .textAlign("right")
        .verticalAlign("middle")
        .parent(parentDOM);
    // step size for quantization, determines maxDigits
    this.step = 0.001;
    // maximum number of digits after decimal point
    this.maxDigits = 9;
    this.step = 1e-9;
    // set step makes fixed point true : show all digits, even trailing zeros
    this.fixedpoint = false;
    // offset for integer quantization
    this.offset = 0;
    // number of digits shown after decimal point (no trailing zeros)
    this.visibleDigits = 3;
    this.additionalButtons = [];
    this.range = false;
    this.hover = false;
    this.pressed = false; // corresponds to focus
    this.active = true;
    // limiting the number range: defaults, minimum is zero, maximum is very large
    this.minValue = -Number.MAX_VALUE;
    this.maxValue = Number.MAX_VALUE;
    this.cyclic = false;
    // remember the last value, for starters an extremely improbable value
    this.lastValue = this.minValue;
    this.colorStyleDefaults();
    this.updateStyle();
    // do we want to show the indicator in the background
    this.indicatorElement = false;
    this.setIndicatorColors("#aaaa99", "#ddddff");

    const realNumber = this;

    /**
     * action upon change of the number
     * @method RealNumber#onchange
     * @param {integer} value
     */
    this.onChange = function(value) {
        console.log("onChange value " + realNumber.getValue());
    };

    /**
     * action upon mouse down, doing an interaction
     * @method RealNumber#onInteraction
     */
    this.onInteraction = function() {
        console.log("numberInteraction");
    };

    // if the text of the input element changes: read text as number and update everything
    // including number of digits
    this.input.onchange = function() {
        // we have to read the full value, not cutting off digits
        // thus we cannot use getValue
        let value = parseFloat(realNumber.input.value, 10);
        if (!guiUtils.isNumber(value)) {
            value = realNumber.lastValue;
        }
        realNumber.determineVisibleDigits(value);
        value = realNumber.quantizeClamp(value);
        realNumber.setInputRangeIndicator(value);
        // it may be that after quantization we get the same number, then nothing changed, but we need update of ui
        if (realNumber.lastValue !== value) {
            realNumber.lastValue = value;
            realNumber.onChange(value);
        }
    };

    this.input.onmousedown = function() {
        if (realNumber.active) {
            realNumber.onInteraction();
        }
    };

    // onfocus /onblur corresponds to pressed
    this.input.onfocus = function() {
        if (realNumber.active) {
            realNumber.pressed = true;
            realNumber.updateStyle();
        }
    };

    this.input.onblur = function() {
        realNumber.pressed = false;
        realNumber.updateStyle();
    };

    // hovering
    this.input.onmouseenter = function() {
        if (realNumber.active) {
            realNumber.hover = true;
            realNumber.updateStyle();
        }
    };

    this.input.onmouseleave = function() {
        if (realNumber.active) {
            realNumber.hover = false;
            realNumber.updateStyle();
        }
    };

    this.input.onwheel = function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (realNumber.pressed && realNumber.active) {
            realNumber.changeDigit(-event.deltaY);
        }
        return false;
    };

    this.input.onkeydown = function(event) {
        let key = event.key;
        if (realNumber.pressed && realNumber.active) {
            if (key === "ArrowDown") {
                event.preventDefault();
                event.stopPropagation();
                realNumber.changeDigit(-1);
            } else if (key === "ArrowUp") {
                event.preventDefault();
                event.stopPropagation();
                realNumber.changeDigit(1);
            }
        }
    };
}

RealNumber.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;
RealNumber.prototype.updateStyle = Button.prototype.updateStyle;
RealNumber.prototype.setFontSize = Button.prototype.setFontSize;
RealNumber.prototype.setWidth = Button.prototype.setWidth;
RealNumber.prototype.setMinWidth = Button.prototype.setMinWidth;

// width for spaces in px
RealNumber.spaceWidth = 5;

/**
 * set width of the input, in px
 * @method RealNumber#setInputWidth
 * @param {integer} width
 */
RealNumber.prototype.setInputWidth = function(width) {
    this.input.style.width = width + "px";
};

/**
 * set the indicator colors
 * @method RealNumber#setIndicatorColors
 * @param {string} colorLeft
 * @param {string} colorRight
 */
RealNumber.prototype.setIndicatorColors = function(colorLeft, colorRight) {
    this.indicatorColorLeft = colorLeft;
    this.indicatorColorRight = colorRight;
};

/**
 * switch on the indicator, set its element (it's the background) , adjust to current value
 * @method RealNumber#setIndicatorElement
 * @param {html element} element
 */
RealNumber.prototype.setIndicatorElement = function(element) {
    this.indicatorElement = element;
    const value = this.getValue();
    this.setInputRangeIndicator(value);
};

/**
 * set the text value of the input element
 * set the range element if it exists
 * set the indicator if it exists
 * depending on this.visibleDigits as determined elsewhere
 * @method RealNumber#setInputRange
 * @param {number} value
 */
RealNumber.prototype.setInputRangeIndicator = function(value) {
    let text = value.toFixed(this.visibleDigits);
    if (this.range) {
        this.range.value = text;
    }
    const cursorPosition = this.input.selectionStart;
    this.input.value = text;
    this.input.setSelectionRange(cursorPosition, cursorPosition);
    if (this.indicatorElement) {
        let pos = 100 * (value - this.minValue);
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
 * set if ui element is active
 * @method RealNumber#setActive
 * @param {boolean} on
 */
RealNumber.prototype.setActive = function(on) {
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
        this.additionalButtons.forEach(button => button.setActive(on));
        this.updateStyle();
    }
};

/**
 * set the limits and step of the range element (if there is one)
 * such that it always gives the correct value
 * @method RealNumber#updateRangeParameters
 */
RealNumber.prototype.updateRangeParameters = function() {
    if (this.range) {
        this.range.step = this.step;
        this.range.min = this.quantizeClamp(this.minValue);
        this.range.max = this.quantizeClamp(this.maxValue);
    }
};

/**
 * set the minimum value for numbers, maxValue is unchanged
 * @method RealNumber#setMin
 * @param {number} x
 */
RealNumber.prototype.setMin = function(x) {
    if (guiUtils.isNumber(x)) {
        this.minValue = x;
        this.updateRangeParameters();
        const value = this.getValue(); // quantizes and limits
        this.determineVisibleDigits(value);
        this.setInputRangeIndicator(value);
    } else {
        console.error('RealNumber#setMin: argument is not a number, it is ' + x);
    }
};

/**
 * set the maximum value for numbers, maxValue is unchanged
 * @method RealNumber#setMax
 * @param {number} x
 */
RealNumber.prototype.setMax = function(x) {
    if (guiUtils.isNumber(x)) {
        this.maxValue = x;
        this.updateRangeParameters();
        const value = this.getValue(); // quantizes and limits
        this.determineVisibleDigits(value);
        this.setInputRangeIndicator(value);
    } else {
        console.error('RealNumber#setMax: argument is not integer, it is ' + x);
    }
};

/**
 * set the step value for numbers,
 * determine maximum number of digits after decimal point
 * value larger or equal to 1 give integers 
 * values smaller than 1 will be integer fractions
 * @method RealNumber#setStep
 * @param {number} x
 */
RealNumber.prototype.setStep = function(x) {
    if (guiUtils.isNumber(x)) {
        if (x >= 0.99) {
            // integers
            this.step = Math.round(x);
            this.maxDigits = 0;
        } else {
            this.step = x;
            // maximum number of digits after decimal point depend on step: rounding up
            // make that 0.01,0.02,0.05 all give 2 digits
            this.maxDigits = Math.floor(-Math.log10(x) - 0.01) + 1;
            this.fixedpoint = true;
        }
        this.updateRangeParameters();
        const value = this.getValue(); // quantizes and limits
        this.determineVisibleDigits(value);
        this.setInputRangeIndicator(value);
    } else {
        console.error('RealNumber#setStep: argument is not a number, it is ' + x);
    }
};

/**
 * set offset value for quantization of integers
 * @method RealNumber#setOffset
 * @param {number} x
 */
RealNumber.prototype.setOffset = function(x) {
    if (guiUtils.isNumber(x)) {
        this.offset = x;
        this.updateRangeParameters();
        const value = this.getValue(); // quantizes and limits
        this.determineVisibleDigits(value);
        this.setInputRangeIndicator(value);
    } else {
        console.error('RealNumber#setOffset: argument is not a number, it is ' + x);
    }
};

/**
 * set that cyclic numbers are used (wraparound number range)
 * going from this.minValue to this.maxValue-this.step
 * @method RealNumber#setCyclic
 * @param {boolean} isCyclic - optional, default is truee
 */
RealNumber.prototype.setCyclic = function(isCyclic = true) {
    this.cyclic = isCyclic;
    this.updateRangeParameters();
    const value = this.getValue(); // quantizes and limits
    this.determineVisibleDigits(value);
    this.setInputRangeIndicator(value);
};

// determine visible number of digits after decimal point
RealNumber.prototype.determineVisibleDigits = function(value) {
    if (this.fixedpoint) {
        this.visibleDigits = this.maxDigits;
    } else {
        let text = value.toFixed(this.maxDigits);
        // look only on as many digits as needed for this.step
        const pointPosition = text.indexOf('.');
        if (pointPosition < 0) {
            this.visibleDigits = 0; // for integers, this.Step >= 1
        } else {
            let index = text.length - 1;
            // find first digit from the right different to zero
            while (text[index] === '0') {
                index -= 1;
            }
            // digits are difference between position of first nonzero digit and decimal point
            this.visibleDigits = index - pointPosition;
        }
    }
};

// quantize with respect to offset
RealNumber.prototype.quantize = function(x) {
    x -= this.offset;
    x = Math.round(x / this.step) * this.step;
    x += this.offset;
    return x;
};

/**
 * wraparound if cyclic
 * clamp to range
 * quantize a number according to step, with offset as basis 
 * @method RealNumber#quantizeClamp
 * @param {number} x
 * @return quantized number in limits
 */
RealNumber.prototype.quantizeClamp = function(x) {
    if (this.cyclic) {
        // wraparound, between minValue (inclusive) and maxValue (exclusive)
        // min=0,max=6 results in possible values of 0,1,2,3,4,5
        x -= this.minValue;
        const d = this.maxValue - this.minValue;
        x = x - d * Math.floor(x / d);
        x += this.minValue;
        x = this.quantize(x);
        // it may now be outside the limits, but not by more than one step
        if (x < this.minValue) {
            x += this.step;
        }
        if (x >= this.maxValue) {
            x -= this.step;
        }
    } else {
        // keep in limits
        x = Math.min(this.maxValue, Math.max(this.minValue, x));
        x = this.quantize(x);
        // it may now be outside the limits, but not by more than one step
        if (x < this.minValue) {
            x += this.step;
        }
        if (x > this.maxValue) {
            x -= this.step;
        }
    }
    return x;
};

/**
 * read the numerical value of the text input element
 * to be safe: if it is not a number, then use the last value
 * keep it in limits, quantize it according to step and offset
 * make it cyclic if it is cyclic
 * this means that it is safe to use its return value
 * @method RealNumber#getValue
 * @return {integer}
 */
RealNumber.prototype.getValue = function() {
    let value = parseFloat(this.input.value, 10);
    if (!guiUtils.isNumber(value)) {
        value = this.lastValue;
    }
    value = this.quantizeClamp(value);
    this.determineVisibleDigits(value);
    this.setInputRangeIndicator(value);
    return value;
};

/**
 * set the value of the text, range and indicator elements
 * checks range and quantizes
 * sets lastValue to same number
 * @method RealNumber#setValue
 * @param {number} value 
 */
RealNumber.prototype.setValue = function(value) {
    if (guiUtils.isNumber(value)) {
        value = this.quantizeClamp(value);
        this.determineVisibleDigits(value);
        this.setInputRangeIndicator(value);
        this.lastValue = value;
    } else {
        console.error('RealNumber#setValue: argument is not a number, it is ' + value);
    }
};

/*
 * get power corresponding to the right of cursor
 * skip negative sign,
 * skip decimal point
 * lowest power is (-this.maxDigits)
 */
RealNumber.prototype.powerFromCursorPosition = function() {
    var power;
    let cursorPosition = this.input.selectionStart;
    // for negative numbers the cursor position may not be smaller than 1 (at the right of the minus sign)
    if (this.getValue() < 0) {
        cursorPosition = Math.max(cursorPosition, 1);
    }
    // get position of the dot
    const pointPosition = this.input.value.indexOf('.');

    if (pointPosition < 0) {
        // no point, integer: relevant power is zero if cursor is before end of input string
        power = this.input.value.length - 1 - cursorPosition;
    } else {
        // fractional number, power from point position relative to cursor
        if (cursorPosition < pointPosition) {
            power = pointPosition - 1 - cursorPosition;
        } else {
            // if cursor at left of point: change first digit after the point
            if (cursorPosition === pointPosition) {
                cursorPosition = pointPosition + 1;
            }
            power = -(cursorPosition - pointPosition);
        }
    }
    // do not change digits at the left of the last admitted digit -> lower limit
    power = Math.max(power, -this.maxDigits);
    return power;
};

/*
 * determine correct cursor position for given power
 * note that determining the power we have restricted its value to >= - this.maxDigits
 */
RealNumber.prototype.cursorPositionFromPower = function(power) {
    var cursorPosition;
    const pointPosition = this.input.value.indexOf('.');
    if (pointPosition < 0) {
        // no point, integer
        cursorPosition = this.input.value.length - 1 - power;
    } else {
        // fractional number, cursorposition relative to point position
        if (power >= 0) {
            cursorPosition = pointPosition - 1 - power; // integer part: cursor at left of point, left of changing digit
        } else {
            cursorPosition = pointPosition - power; // fractional part at the right of the point
        }
    }
    return cursorPosition;
};

/**
 * change value of digit at the left of the cursor in the input element
 * depending on direction argument (positive increases digit, negative decreases)
 * change at least by this.step, (else it is a larger power of ten)
 * @method RealNumber#changeDigit
 * @param {float} direction - makes plus or minus changes
 */
RealNumber.prototype.changeDigit = function(direction) {
    let value = this.getValue();
    const power = this.powerFromCursorPosition();
    const change = Math.max(this.step, Math.pow(10, power));
    if (direction > 0) {
        value += change;
    } else {
        value -= change;
    }
    value = this.quantizeClamp(value);
    if (value !== this.lastValue) {
        this.lastValue = value;
        // if cursor is at end of input string then we get an additional visible digit
        // but we do not clear trailing zeros
        if (this.input.selectionStart === this.input.value.length) {
            this.visibleDigits = Math.min(this.visibleDigits + 1, this.maxDigits);
        }
        this.determineVisibleDigits(value);
        this.setInputRangeIndicator(value);
        let cursorPosition = this.cursorPositionFromPower(power);
        if (value >= 0) {
            cursorPosition = Math.max(cursorPosition, 0);
        } else {
            cursorPosition = Math.max(cursorPosition, 1);
        }
        this.input.setSelectionRange(cursorPosition, cursorPosition);
        this.onChange(value);
    }
};

/**
 * create additional buttons that do something
 * @method RealNumber.createButton
 * @param {String} text - shown in the button
 * @param {htmlElement} parentDOM
 * @param {function} changeValue - function(value), returns changed value
 * @return the button
 */
RealNumber.prototype.createButton = function(text, parentDOM, changeValue) {
    const additionalButton = new Button(text, parentDOM);
    const realNumber = this;
    additionalButton.onInteraction = function() {
        realNumber.onInteraction();
    };
    additionalButton.onClick = function() {
        realNumber.input.focus();
        let value = realNumber.getValue();
        value = changeValue(value);
        value = realNumber.quantizeClamp(value);
        // it may be that after quantization we get the same number, then nothing changed, but we need update of ui
        if (realNumber.lastValue !== value) {
            realNumber.lastValue = value;
            realNumber.determineVisibleDigits(value);
            realNumber.setInputRangeIndicator(value);
            realNumber.onChange(value);
        } else {
            realNumber.setInputRangeIndicator(value);
        }
    };
    this.additionalButtons.push(additionalButton);
    return additionalButton;
};


/**
 * create a button that adds to the number
 * @method RealNumber#createAddButton
 * @param {String} text
 * @param {htmlelement} parentDOM
 * @param {number} amount - can be negative too
 * @return the button
 */
RealNumber.prototype.createAddButton = function(text, parentDOM, amount) {
    const button = this;
    return this.createButton(text, parentDOM, function(value) {
        return value + amount;
    });
};

/**
 * create a button that multiplies the number
 * @method RealNumber #createMulButton
 * @param {String} text
 * @param {htmlelement} parentDOM
 * @param {number} factor - can be less than 1 too
 * @return the button
 */
RealNumber.prototype.createMulButton = function(text, parentDOM, factor) {
    const button = this;
    return this.createButton(text, parentDOM, function(value) {
        return value * factor;
    });
};

/**
 * create a button that sets the minimum value
 * @method RealNumber#createMiniButton
 * @param {htmlelement} parentDOM
 * @return the button
 */
RealNumber.prototype.createMiniButton = function(parentDOM) {
    const button = this;
    return this.createButton("min", parentDOM, function() {
        return button.minValue;
    });
};

/**
 * create a button that sets the maximum value
 * @method RealNumber#createMaxiButton
 * @param {htmlelement} parentDOM
 * @return the button
 */
RealNumber.prototype.createMaxiButton = function(parentDOM) {
    const button = this;
    return this.createButton("max", parentDOM, function() {
        if (button.cyclic) {
            return button.maxValue - button.step; // avoid irritating jump from right to left
        } else {
            return button.maxValue;
        }
    });
};

/**
 * create a button with a suggested value
 * @method RealNumber#createSuggestButton
 * @param {htmlelement} parentDOM
 * @param {float} value
 */
RealNumber.prototype.createSuggestButton = function(parentDOM, suggestion) {
    const button = this;
    return this.createButton(suggestion + "", parentDOM, function() {
        return suggestion;
    });
};

/**
 * create a interacting range element
 * @method RealNumber#createRange
 * @param {htmlElement} parentDOM
 * @return the range element
 */
RealNumber.prototype.createRange = function(parentDOM) {
    if (this.range) {
        console.log("**** RealNumber#createRange: range already exists");
    } else {
        this.range = document.createElement("input");
        guiUtils.style(this.range)
            .attribute("type", "range")
            .cursor("pointer")
            .verticalAlign("middle")
            .parent(parentDOM);
        this.updateRangeParameters();
        this.range.value = this.getValue();

        const realNumber = this;

        // doing things continously
        this.range.oninput = function() {
            let value = parseFloat(realNumber.range.value, 10);
            // does the value change?
            if (realNumber.lastValue !== value) {
                // it may be that after quantization we get the same number, then nothing changed, but we need update of ui
                if (realNumber.lastValue !== value) {
                    realNumber.lastValue = value;
                    realNumber.determineVisibleDigits(value);
                    realNumber.setInputRangeIndicator(value);
                    realNumber.onChange(value);
                } else {
                    realNumber.setInputRangeIndicator(value);
                }
            }
        };

        this.range.onchange = function() {}; // change already done by input event

        this.range.onkeydown = function() {
            if (realNumber.active) {
                realNumber.onInteraction();
            }
        };
        this.range.onmousedown = function() {
            if (realNumber.active) {
                realNumber.onInteraction();
            }
        };
        this.range.onwheel = function() {
            if (realNumber.active) {
                realNumber.onInteraction();
            }
        };
    }
    return this.range;
};

/**
 * set width of the range, in px
 * @method RealNumber#setRangeWidth
 * @param {integer} width
 */
RealNumber.prototype.setRangeWidth = function(width) {
    this.range.style.width = width + "px";
};

/**
 * destroy the realNumber, taking care of all references, deletes the associated html input element
 * @method RealNumber#destroy
 */
RealNumber.prototype.destroy = function() {
    this.onChange = null;
    this.input.onchange = null;
    this.input.onfocus = null;
    this.input.onblur = null;
    this.input.onmouseenter = null;
    this.input.onmousedown = null;
    this.input.onmouseleave = null;
    this.input.onwheel = null;
    this.input.onkeydown = null;
    this.input.remove();
    this.input = null;
    this.additionalButtons.forEach(button => button.destroy());
    this.additionalButtons.lenght = 0;
    if (this.range) {
        this.range.onchange = null;
        this.range.oninput = null;
        this.range.onkeydown = null;
        this.range.onmousedown = null;
        this.range.onwheel = null;
    }
};