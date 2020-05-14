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
        button.action(parseInt(button.input.value, 10));
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
 * @method Integer#setInputRange
 * @param {integer} n
 */
Integer.prototype.setInputRangeIndicator = function(n) {
    let text = n.toString(10);
    if (this.range) {
        this.range.value = text;
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
    let value = parseInt(this.input.value, 10);
    if (!guiUtils.isInteger(value)) {
        value = this.lastValue;
    }
    return this.quantizeClamp(value);
};

/**
 * set the value of the text, range and indicator elements
 * checks range and quantizes
 * sets lastValue to same number
 * @method Integer#setValue
 * @param {number} value 
 */
Integer.prototype.setValue = function(value) {
    if (guiUtils.isNumber(value)) {
        value = this.quantizeClamp(value);
        this.setInputRangeIndicator(value);
        this.lastValue = value;
    } else {
        console.error('Integer#setValue: argument is not a number, it is ' + value);
    }
};

/**
 * the value of the input element or the range element may have changed:
 *  if it is different to the last value then set text range and indicator, call onChange
 * else set text and indicator only
 * @method Integer#action
 * @param {number} value
 */
Integer.prototype.action = function(value) {
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
        console.error('Integer#action: argument is not a number, it is ' + value);
        this.setInputRangeIndicator(this.lastValue);
    }
};

/**
 * change value of digit at the left of the cursor in the input element
 * depending on direction argument (positive increases digit, negative decreases)
 * change at least by this.step, (else it is a larger power of ten)
 * @method Integer#changeDigit
 * @param {float} direction - makes plus or minus changes
 */
Integer.prototype.changeDigit = function(direction) {
    const inputLength = this.input.value.length;
    const value = this.getValue();
// if cursor is at (rightside) end of input value, then correct it to position before the end
    let cursorPosition = Math.min(this.input.selectionStart, this.input.value.length - 1);
 // for negative numbers the cursor position may not be smaller than 1 (at the right of the minus sign)
   if (value < 0) { // beware of the minus sign
        cursorPosition = Math.max(cursorPosition, 1);
    }
    // relevant power is zero if cursor is before end of input string
    const power = Math.max(this.input.value.length - 1 - cursorPosition, 0);
    const change = Math.max(this.step, Math.pow(10, power));
    if (direction > 0) { // again the minus sign
        this.action(value + change);
    } else {
        this.action(value - change);
    }
    cursorPosition = this.input.value.length - 1 - power;
    if (this.getValue() >= 0) {
        cursorPosition = Math.max(cursorPosition, 0);
    } else {
        cursorPosition = Math.max(cursorPosition, 1);
    }
    this.input.setSelectionRange(cursorPosition, cursorPosition);
};

// for all number controllers

/**
 * create additional buttons that do something
 * @method Integer.createButton
 * @param {String} text - shown in the button
 * @param {htmlElement} parentDOM
 * @param {function} action
 * @return the button
 */
Integer.prototype.createButton = function(text, parentDOM, action) {
    const addButton = new Button(text, parentDOM);
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
 * @method Integer#createAddButton
 * @param {String} text
 * @param {htmlelement} parentDOM
 * @param {number} amount - can be negative too
 * @return the button
 */
Integer.prototype.createAddButton = function(text, parentDOM, amount) {
    const button = this;
    return this.createButton(text, parentDOM, function() {
        button.input.focus();
        button.action(button.getValue() + amount);
    });
};

/**
 * create a button that multiplies the number
 * @method Integer#createMulButton
 * @param {String} text
 * @param {htmlelement} parentDOM
 * @param {number} factor - can be less than 1 too
 * @return the button
 */
Integer.prototype.createMulButton = function(text, parentDOM, factor) {
    const button = this;
    return this.createButton(text, parentDOM, function() {
        button.input.focus();
        button.action(button.getValue() * factor);
    });
};

/**
 * create a button that sets the minimum value
 * @method Integer#createMiniButton
 * @param {htmlelement} parentDOM
 * @return the button
 */
Integer.prototype.createMiniButton = function(parentDOM) {
    const button = this;
    return this.createButton("min", parentDOM, function() {
        button.input.focus();
        button.action(button.minValue);
    });
};

/**
 * create a button that sets the maximum value
 * @method Integer#createMaxiButton
 * @param {htmlelement} parentDOM
 * @return the button
 */
Integer.prototype.createMaxiButton = function(parentDOM) {
    const button = this;
    return this.createButton("max", parentDOM, function() {
        button.input.focus();
        if (button.cyclic) {
            button.action(button.maxValue - button.step); // avoid irritating jump from right to left
        } else {
            button.action(button.maxValue);
        }
    });
};

/**
 * create a button with a suggested value
 * @method Integer#createSuggestButton
 * @param {htmlelement} parentDOM
 * @param {float} value
 */
Integer.prototype.createSuggestButton = function(parentDOM, value) {
    const button = this;
    return this.createButton(value + "", parentDOM, function() {
        button.input.focus();
        if (button.getValue() !== value) {
            button.action(value);
        }
    });
};

/**
 * create a interacting range element
 * @method Integer#createRange
 * @param {htmlElement} parentDOM
 * @return the range element
 */
Integer.prototype.createRange = function(parentDOM) {
    if (this.range) {
        console.log("**** Integer#createRange: range already exists");
    } else {
        this.range = document.createElement("input");
        this.range.step = "any"; // quantization via update
        guiUtils.style(this.range)
            .attribute("type", "range")
            .cursor("pointer")
            .verticalAlign("middle")
            .parent(parentDOM);
        // set the min,max and current value
        this.range.min = this.minValue;
        this.range.max = this.maxValue;
        if (this.cyclic) {
            this.range.max = this.maxValue - this.step; // avoid irritating jump from right to left
        }
        this.range.value = this.getValue();
        const button = this;

        // doing things continously
        this.range.oninput = function() {
            button.action(parseFloat(button.range.value));
        };

        this.range.onchange = function() {
            button.action(parseFloat(button.range.value));
        };

        this.range.onkeydown = function() {
            if (this.active) {
                button.onInteraction();
            }
        };
        this.range.onmousedown = function() {
            if (this.active) {
                button.onInteraction();
            }
        };
        this.range.onwheel = function() {
            if (this.active) {
                button.onInteraction();
            }
        };
    }
    return this.range;
};

/**
 * set width of the range, in px
 * @method Integer#setRangeWidth
 * @param {integer} width
 */
Integer.prototype.setRangeWidth = function(width) {
    this.range.style.width = width + "px";
};

/**
 * destroy the button, taking care of all references, deletes the associated html input element
 * @method Integer#destroy
 */
Integer.prototype.destroy = function() {
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