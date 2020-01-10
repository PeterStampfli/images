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
} from "../libgui/modules.js";

export function NumberButton(parent) {
    this.input = document.createElement("input");
    guiUtils.style(this.input)
        .attribute("type", "text")
        .textAlign("right")
        .verticalAlign("middle")
        .parent(parent);
    this.addButtons = [];
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

    const button = this;

    /**
     * action upon change, strategy pattern
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

    this.input.onchange = function() {
        button.updateValue(button.getValue());
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
 * quantize a number according to step and clamp to range
 * @method NumberButton#quantizeClamp
 * @param {float} x
 * @return float, quantized x
 */
NumberButton.prototype.quantizeClamp = function(x) {
    if (this.cyclic) {
        // wraparound
        x -= this.minValue;
        const d = this.maxValue - this.minValue;
        x = x - d * Math.floor(x / d);
        x += this.minValue;
    }
    // quantize and clamp
    x = Math.max(this.minValue, Math.min(this.step * Math.round(x / this.step), this.maxValue));
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
 * does nothing else, use it for initialization
 * @method NumberButton#setValue
 * @param {integer} number - the number value to show in the button, verified number !!
 */
NumberButton.prototype.setValue = function(number) {
    number = this.quantizeClamp(number);
    this.lastValue = number;
    this.input.value = number.toFixed(this.digits);
    if (this.range) {
        this.range.value = number.toString();
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
        }
    }
};

/**
 * change step to number smaller than 1 to get float
 * will be a power of ten
 * @method NumberButton#setStep
 * @param {float} step - the step size (rounding)
 */
NumberButton.prototype.setStep = function(step) {
    if (step >= 1) {
        this.digits = 0;
        this.step = 1;
        step = (step + 1) / 10;
        while (this.step <= step) {
            this.step *= 10;
        }
    } else {
        this.step = 1;
        this.digits = 0;
        step *= 1.1;
        while (this.step >= step) {
            this.step *= 0.1;
            this.digits++;
        }
    }
    if (this.range) {
     //   this.range.step = this.step;
    }
    this.setValue(this.getValue());
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
    if (this.range) {
        this.range.min = minValue;
        this.range.max = maxValue;
        if (this.cyclic) {
            this.range.max = this.maxValue - this.step; // avoid irritating jump from right to left
        }
    }
    // clamp value in range
    this.setValue(this.getValue());
};

/**
 * set the lower limit for numbers, upper value is default max valuecorrect value if out of range
 * @method NumberButton#setLow
 * @param {integer} minValue
 */
NumberButton.prototype.setLow = function(minValue) {
    this.setRange(minValue, NumberButton.maxValue);
};

/**
 * set that cyclic numbers are used (wraparound number range)
 * destroy min/max buttons as they make no sense
 * @method NumberButton#setCyclic
 */
NumberButton.prototype.setCyclic = function() {
    this.cyclic = true;
    this.setValue(this.quantizeClamp(this.getValue()));
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
 * @param {String} text
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
 * @param {String} text
 * @param {htmlelement} parent
 * @return the button
 */
NumberButton.prototype.createMaxiButton = function(parent) {
    const button = this;
    return this.createButton("max", parent, function() {
        button.input.focus();
        button.updateValue(button.maxValue);
        const cursorPosition = button.input.value.length;
        button.input.setSelectionRange(cursorPosition, cursorPosition);
    });
};

// ←↑→↓

NumberButton.incText = "inc";
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

NumberButton.decText = "dec";
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

NumberButton.leftText = "left";
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

NumberButton.rightText = "right";
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
 * create a interacting range element
 * @method NumberButton#createRange
 * @param {htmlElement} parent
 * @return the range element
 */
NumberButton.prototype.createRange = function(parent) {
    this.range = document.createElement("input");
    this.range.step = "any";    // quantization via update
    guiUtils.style(this.range)
        .attribute("type", "range")
        .cursor("pointer")
        .verticalAlign("middle")
        .parent(parent);
    // set the min,max and current value
    this.setRange(this.minValue, this.maxValue);

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
    this.input.onChange = null;
    this.input.onfocus = null;
    this.input.onblur = null;
    this.input.onmouseenter = null;
    this.input.onmouseleave = null;
    this.input.onwheel = null;
    this.input.onkeydown = null;
    this.input.remove();
    this.input = null;
    this.addButtons.forEach(button => button.destroy());
    this.addButtons.lenght = 0;
};
