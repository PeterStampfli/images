/**
 * a button to input numbers,
 *
 * default is for integer numbers, can be changed to float with given step size (rounding) 
 * constructor builds only the basic number input text field
 * 
 * @constructor NumberButton 
 * @param {DOM input} parent, an html input, best "div" or "span"
 */

import {
    Button,
    guiUtils
} from "./modules.js";

export function NumberButton(parent) {
    this.parent = parent;
    this.input = document.createElement("input");
    guiUtils.style(this.input)
        .attribute("type", "text")
        .textAlign("right")
        .verticalAlign("middle")
        .parent(parent);
    this.addButtons = [];
    this.range = false;
    this.hover = false;
    this.pressed = false;
    this.active = true;
    // limiting the number range: defaults, minimum is zero, maximum is very large
    this.minValue = 0;
    this.maxValue = NumberButton.maxValue;
    this.input.value = 0;
    this.setStep(1);
    this.cyclic = false;
    // remember the last value, for starters an extremely improbable value
    this.lastValue = -1000000000;
    this.colorStyleDefaults();
    this.updateStyle();
    // do we want to show the indicator in the background, and where
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
        button.onInteraction();
    };

    // onfocus /onblur corresponds to pressed
    this.input.onfocus = function() {
        button.pressed = true;
        button.updateStyle();
    };

    this.input.onblur = function() {
        button.pressed = false;
        button.updateStyle();
    };

    // hovering
    this.input.onmouseenter = function() {
        button.hover = true;
        button.updateStyle();
    };

    this.input.onmouseleave = function() {
        button.hover = false;
        button.updateStyle();
    };

    this.input.onwheel = function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (button.pressed) {
            button.changeDigit(-event.deltaY);
        }
        return false;
    };

    this.input.onkeydown = function(event) {
        let key = event.key;
        if (button.pressed) {
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

// check if a thing is a numberButton
NumberButton.isNumberButton = function(thing) {
    return thing instanceof NumberButton;
};

/**
 * change/set precision of numbers
 * we are using fixed point numbers
 * NumberButton.eps(ilon)<1 defines the base precision, it is the smallest step size you can use, and the smallest number
 * if you change eps, you might have to increase the width of the text field
 * use NumberButton#setInputWidth
 * NumberButton.inverseEps the integer power of 10 that is close to 1/eps
 * all numbers multiplied with this power are essentially integers (still rounding required)
 * for more details see NumberButton#setStep
 * @method numberButton.setPrecision
 * @param {float} eps
 */
NumberButton.setPrecision = function(eps) {
    NumberButton.eps = Math.min(1, Math.abs(eps));
    if (NumberButton.eps < 0.0000000001) {
        console.error("NumberButton.setPrecision: eps is too small, it is " + eps);
    }
    // get the integer power of ten matching 1/eps
    // any number multiplied with this power should be an integer 
    // (except for errors due to binary representation, thus do rounding)
    NumberButton.inverseEps = Math.pow(10, Math.round(-Math.log10(NumberButton.eps)));
};

// default value
NumberButton.setPrecision(0.0001);

/**
 * find step suitable to given value
 * it is always a negative power of ten, or 1 for integers
 * it corresponds to the fixed point position of the last nonzero digit greater than 1
 * multiplying the value with the inverse of the step makes that it is nearly an integer
 * @method NumberButton.findStep
 * @param {number} value
 * @return a suitable step size, return undefined if value is undefined
 */
NumberButton.findStep = function(value) {
    if (guiUtils.isDefined(value)) {
        if (guiUtils.isInteger(value)) {
            return 1;
        } else {
            const eps = NumberButton.eps; // precision,max number of digits
            value = Math.max(Math.abs(value), 2 * eps);
            let step = 0.1;
            let valueDivStep = value / step;
            while (Math.abs(Math.round(valueDivStep) - valueDivStep) > 0.9 * eps) {
                step *= 0.1;
                valueDivStep = value / step;
            }
            return step;
        }
    } else {
        return value;
    }
};

//effective value for infinity, change if too low
NumberButton.maxValue = 1000;

// width for spaces in px
NumberButton.spaceWidth = 5;

/**
 * update the color style of the input depending on whether its pressed or hovered
 * always call if states change, use for other buttons too
 * @method NumberButton#updateStyle
 */
NumberButton.prototype.updateStyle = function() {
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
 * setup the color styles defaults, use for other buttons too
 * @method NumberButton#colorStyleDefaults
 */
NumberButton.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;

/**
 * switch on the indicator, set its element (it's the background) , adjust to current value
 * @method NumberButton#setIndicatorElement
 * @param {html element} element
 */
NumberButton.prototype.setIndicatorElement = function(element) {
    this.indicatorElement = element;
    this.setValue(this.getValue());
};

/**
 * set the indicator colors
 * @method NumberButton#setIndicatorColors
 * @param {string} colorLeft
 * @param {string} colorRight
 */
NumberButton.prototype.setIndicatorColors = function(colorLeft, colorRight) {
    this.indicatorColorLeft = colorLeft;
    this.indicatorColorRight = colorRight;
};

/**
 * set fontsize of the number button, in px
 * @method NumberButton#setFontSize
 * @param {integer} size
 */
NumberButton.prototype.setFontSize = function(size) {
    this.input.style.fontSize = size + "px";
    this.addButtons.forEach(button => button.setFontSize(size));
};

/**
 * set width of the input, in px
 * @method NumberButton#setInputWidth
 * @param {integer} width
 */
NumberButton.prototype.setInputWidth = function(width) {
    this.input.style.width = width + "px";
};

/**
 * wraparound if cyclic
 * quantize a number according to step, with minValue as basis 
 * see NumberButton#setStep and note that step = this.stepInt / NumberButton.inverseEps;
 * clamp to range
 * @method NumberButton#quantizeClamp
 * @param {float} x
 * @return float, quantized x
 */
NumberButton.prototype.quantizeClamp = function(x) {
    if (this.cyclic) {
        // wraparound, minValue as basis
        x -= this.minValue;
        const d = this.maxValue - this.minValue;
        x = x - d * Math.floor(x / d);
        x += this.minValue;
    }
    // quantize difference to minValue, make that value is larger than min value
    x = Math.max(x - this.minValue, 0);
    // multiply with step size and quantize as integer
    x = Math.round(x * NumberButton.inverseEps / this.stepInt);
    // devide by step size and add to minimum value
    x = this.minValue + x * this.stepInt / NumberButton.inverseEps;
    // make that value is less than max value
    if (x > this.maxValue) {
        x = this.maxValue;
        // attention: the intervall may not be a multiple of the step size
        // quantize again
        x = Math.round((x - this.minValue) * NumberButton.inverseEps / this.stepInt);
        // devide by step size and add to minimum value
        x = this.minValue + x * this.stepInt / NumberButton.inverseEps;
        // the result might now be larger than the maxValue, thus
        if (x > this.maxValue) {
            x -= this.step;
        }
    }
    return x;
};

/**
 * read the value of the text of a button of type="text"
 * note that the element.onchange routine makes shure that 
 * the value will be a number if this is called after onchange event
 * @method NumberButton#getValue
 * @returns {integer} value resulting from parsing the button text
 */
NumberButton.prototype.getValue = function() {
    return this.quantizeClamp(parseFloat(this.input.value));
};

/**
 * set the text of a button of type="text" according to a given number
 * sets lastValue to same number
 * update range and indicator when present
 * does nothing else, use it for initialization
 * @method NumberButton#setValue
 * @param {integer} number - the number value to show in the button, verified number !!
 */
NumberButton.prototype.setValue = function(number) {
    if (guiUtils.isNumber(number)) {
        number = this.quantizeClamp(number);
        this.lastValue = number;
        this.input.value = number.toFixed(this.digitsAfterPoint);
        if (this.range) {
            this.range.value = number.toString();
        }
        if (this.indicatorElement) {
            let pos = 100 * (number - this.minValue);
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
    } else {
        console.error("Number controller, setValue: argument is not a number:");
        console.log('its value is ' + number + ' of type "' + (typeof number) + '"');
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
    if (guiUtils.isNumber(number)) {
        if (this.lastValue !== number) { // does it really change??
            number = this.quantizeClamp(number);
            // it may be that after quantization we get the same number, then nothing changed, but we need update of ui
            if (this.lastValue !== number) {
                this.setValue(number); // update numbers before action
                this.onChange(number);
            } else {
                this.setValue(number); // no action   
            }
        }
    } else {
        this.setValue(this.lastValue); // overwrite garbage, do nothing
    }
};

/**
 * apply all necessary changes after changing the minValue, maxValue, or step
 * after setting cyclic, adding a range
 * affects the range limits and the current value
 * @method NumberButton#applyChanges
 */
NumberButton.prototype.applyChanges = function() {
    if (this.range) {
        this.range.min = this.minValue;
        this.range.max = this.maxValue;
        if (this.cyclic) {
            this.range.max = this.maxValue - this.step; // avoid irritating jump from right to left
        }
    }
    // clamp value in range, update range position
    this.setValue(this.getValue());
};

/**
 * set minimum step size for numbers ("quantization")
 * note problem for step sizes smaller than one: not exactly represented with floating point numbers
 * thus, this.step is not accurate, instead use "decimal" representation
 * this.stepInt is an integer and NumberButton.inverseEps is a power of ten, 
 * then this.step==this.stepInt/NumberButton.inverseEps without error due to finite precision
 * if this.step>=1, then this.stepInvPow=1
 * this.digitsAfterPoint is number of digits after decimal point, used for converting number to string
 * @method NumberButton#setStep
 * @param {float} step - the step size (rounding)
 */
NumberButton.prototype.setStep = function(step) {
    // beware of negative numbers and too small numbers
    const eps = NumberButton.eps; // precision, minimum step size
    step = Math.max(eps, Math.abs(step));
    // analyze: find power of 10, such that step*powerOf10>=0.9 (for safety, 0.9 and not 1)
    this.digitsAfterPoint = 0;
    this.stepInt = Math.round(step * NumberButton.inverseEps);
    this.step = this.stepInt / NumberButton.inverseEps;
    this.digitsAfterPoint = 0;
    // number of digits results from the power of ten times the step giving nearly an integer
    let stepPower10 = this.step;
    while (Math.abs(Math.round(stepPower10) - stepPower10) > eps * stepPower10) {
        this.digitsAfterPoint += 1;
        stepPower10 *= 10;
    }
    this.applyChanges();
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
    this.applyChanges();
};

/**
 * set the lower limit for numbers, maxValue is unchanged
 * @method NumberButton#setLow
 * @param {integer} minValue
 */
NumberButton.prototype.setLow = function(minValue) {
    this.minValue = minValue;
    this.applyChanges();
};

/**
 * set the upper limit for numbers, minValue is unchanged
 * @method NumberButton#setHigh
 * @param {integer} maxValue
 */
NumberButton.prototype.setHigh = function(maxValue) {
    this.maxValue = maxValue;
    this.applyChanges();
};

/**
 * set that cyclic numbers are used (wraparound number range)
 * destroy min/max buttons as they make no sense
 * @method NumberButton#setCyclic
 */
NumberButton.prototype.setCyclic = function() {
    this.cyclic = true;
    this.applyChanges();
};

// correct position at left, particularly for negative numbers
NumberButton.prototype.correctCursorAtLeft = function(cursorPosition) {
    if (this.input.value.charAt(0) === "-") {
        cursorPosition = Math.max(1, cursorPosition);
    } else {
        cursorPosition = Math.max(0, cursorPosition);
    }
    return cursorPosition;
};

// get power (position of digit) corresponding to cursorposition
NumberButton.prototype.getPower = function(cursorPosition) {
    let pointPosition = this.input.value.indexOf(".");
    // beware of pure integers, decimal point is at the right beyond all digits
    if (pointPosition < 0) {
        pointPosition = this.input.value.length;
    }
    // going to the right increases index in string, decreases number power       
    let power = pointPosition - cursorPosition;
    // power < 0 means that we are at the right of the decimal point.
    if (power < 0) {
        power++; // correction of power: "skipping" the decimal point
    }
    return power;
};

// set cursorposition (selectionrange) according to power
NumberButton.prototype.setCursorPosition = function(power) {
    // determine cursor position relative to decimal point
    let pointPosition = this.input.value.indexOf(".");
    if (pointPosition < 0) {
        pointPosition = this.input.value.length;
    }
    let cursorPosition = this.correctCursorAtLeft(pointPosition - power);
    // acounting for the space of decimal point
    if (power < 0) {
        cursorPosition++;
    }
    this.input.setSelectionRange(cursorPosition, cursorPosition);
};

/**
 * change value depending on direction (>0 or <0) and cursor posion
 * @method NumberButton#changeDigit
 * @param {float} direction - makes plus or minus changes
 */
NumberButton.prototype.changeDigit = function(direction) {
    let cursorPosition = this.correctCursorAtLeft(this.input.selectionStart);
    // selectionStart=0: is in front, left of first char
    const power = this.getPower(cursorPosition);
    let change = Math.max(this.step, Math.pow(10, power));
    if (direction < 0) {
        change = -change;
    }
    this.updateValue(this.getValue() + change);
    this.setCursorPosition(power);
};

/**
 * create additional buttons that do something
 * @method NumberButton.createButton
 * @param {String} text - shown in the button
 * @param {htmlElement} parent
 * @param {function} action
 * @return the button
 */
NumberButton.prototype.createButton = function(text, parent, action) {
    const addButton = new Button(text, parent);
    const button = this;
    addButton.onInteraction = function() {
        button.onInteraction();
    };
    addButton.onClick = action;
    this.addButtons.push(addButton);
    return addButton;
};

/**
 * create a button that adds to the number
 * @method NumberButton#createAddButton
 * @param {String} text
 * @param {htmlelement} parent
 * @param {number} amount - can be negative too
 * @return the button
 */
NumberButton.prototype.createAddButton = function(text, parent, amount) {
    const button = this;
    return this.createButton(text, parent, function() {
        button.input.focus();
        let cursorPosition = button.correctCursorAtLeft(button.input.selectionStart);
        const power = button.getPower(cursorPosition);
        button.updateValue(button.lastValue + amount);
        button.setCursorPosition(power);
    });
};

/**
 * create a button that multiplies the number
 * @method NumberButton#createMulButton
 * @param {String} text
 * @param {htmlelement} parent
 * @param {number} factor - can be less than 1 too
 * @return the button
 */
NumberButton.prototype.createMulButton = function(text, parent, factor) {
    const button = this;
    return this.createButton(text, parent, function() {
        button.input.focus();
        button.updateValue(button.lastValue * factor);
        const cursorPosition = button.input.value.length;
        button.input.setSelectionRange(cursorPosition, cursorPosition);
    });
};

/**
 * create a button that sets the minimum value
 * @method NumberButton#createMiniButton
 * @param {htmlelement} parent
 * @return the button
 */
NumberButton.prototype.createMiniButton = function(parent) {
    const button = this;
    return this.createButton("min", parent, function() {
        button.input.focus();
        button.updateValue(button.minValue);
        const cursorPosition = button.input.value.length;
        button.input.setSelectionRange(cursorPosition, cursorPosition);
    });
};

/**
 * create a button that sets the maximum value
 * @method NumberButton#createMaxiButton
 * @param {htmlelement} parent
 * @return the button
 */
NumberButton.prototype.createMaxiButton = function(parent) {
    const button = this;
    return this.createButton("max", parent, function() {
        button.input.focus();
        if (button.cyclic) {
            button.updateValue(button.maxValue - button.step); // avoid irritating jump from right to left
        } else {
            button.updateValue(button.maxValue);
        }
        const cursorPosition = button.input.value.length;
        button.input.setSelectionRange(cursorPosition, cursorPosition);
    });
};

// ←↑→↓ ▲►▼◄

NumberButton.incText = "▲";
/**
 * create a button that increases the number at cursor position (like wheel)
 * @method NumberButton#createIncButton
 * @param {String} text
 * @param {htmlelement} parent
 * @return the button
 */
NumberButton.prototype.createIncButton = function(parent) {
    const button = this;
    return this.createButton(NumberButton.incText, parent, function() {
        button.input.focus();
        button.changeDigit(1);
    });
};

NumberButton.decText = "▼";
/**
 * create a button that decreases the number at cursor position (like wheel)
 * @method NumberButton#createDecButton
 * @param {String} text
 * @param {htmlelement} parent
 * @return the button
 */
NumberButton.prototype.createDecButton = function(parent) {
    const button = this;
    return this.createButton(NumberButton.decText, parent, function() {
        button.input.focus();
        button.changeDigit(-1);
    });
};

NumberButton.leftText = "◄";
/**
 * create a button that moves the cursor to the left
 * @method NumberButton#createLeftButton
 * @param {String} text
 * @param {htmlelement} parent
 * @return the button
 */
NumberButton.prototype.createLeftButton = function(parent) {
    const button = this;
    return this.createButton(NumberButton.leftText, parent, function() {
        button.input.focus();
        let cursorPosition = button.correctCursorAtLeft(button.input.selectionStart);
        let power = button.getPower(cursorPosition);
        power += 1;
        button.setCursorPosition(power);
    });
};

NumberButton.rightText = "►";
/**
 * create a button that moves the cursor to the right
 * @method NumberButton#createRightButton
 * @param {String} text
 * @param {htmlelement} parent
 * @return the button
 */
NumberButton.prototype.createRightButton = function(parent) {
    const button = this;
    return this.createButton(NumberButton.rightText, parent, function() {
        button.input.focus();
        let cursorPosition = button.correctCursorAtLeft(button.input.selectionStart);
        let power = button.getPower(cursorPosition);
        power -= 1;
        button.setCursorPosition(power);
    });
};

/**
 * create a button with a suggested value
 * @method NumberButton#createSuggestButton
 * @param {htmlelement} parent
 * @param {float} value
 */
NumberButton.prototype.createSuggestButton = function(parent, value) {
    const button = this;
    return this.createButton(value + "", parent, function() {
        button.input.focus();
        button.updateValue(value);
        const cursorPosition = button.input.value.length;
        button.input.setSelectionRange(cursorPosition, cursorPosition);
    });
};

/**
 * create a interacting range element
 * @method NumberButton#createRange
 * @param {htmlElement} parent
 * @return the range element
 */
NumberButton.prototype.createRange = function(parent) {
    if (this.range) {
        console.log("**** NumberButton#createRange: range already exists");
    } else {
        this.range = document.createElement("input");
        this.range.step = "any"; // quantization via update
        guiUtils.style(this.range)
            .attribute("type", "range")
            .cursor("pointer")
            .verticalAlign("middle")
            .parent(parent);
        // set the min,max and current value
        this.applyChanges();

        const button = this;

        // doing things continously
        this.range.oninput = function() {
            button.updateValue(parseFloat(button.range.value));
        };

        this.range.onchange = function() {
            button.updateValue(parseFloat(button.range.value));
        };

        this.range.onkeydown = function() {
            button.onInteraction();
        };
        this.range.onmousedown = function() {
            button.onInteraction();
        };
        this.range.onwheel = function() {
            button.onInteraction();
        };
    }
    return this.range;
};

/**
 * set width of the range, in px
 * @method NumberButton#setRangeWidth
 * @param {integer} width
 */
NumberButton.prototype.setRangeWidth = function(width) {
    this.range.style.width = width + "px";
};

/**
 * destroy the button, taking care of all references, deletes the associated html input element
 * maybe too careful
 * @method NumberButton#destroy
 */
NumberButton.prototype.destroy = function() {
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
    this.addButtons.forEach(button => button.destroy());
    this.addButtons.lenght = 0;
    if (this.range) {
        this.range.onchange = null;
        this.range.oninput = null;
        this.range.onkeydown = null;
        this.range.onmousedown = null;
        this.range.onwheel = null;
    }
};
