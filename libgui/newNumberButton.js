/**
 * a button to input numbers,
 *
 * default is for integer numbers, can be changed to float with given step size (rounding) 
 * constructor builds only the basic number input text field
 * 
 * @constructor NewNumberButton 
 * @param {DOM input} parent, an html input, best "div" or "span"
 */


import {
    Button,
    guiUtils
} from "../libgui/modules.js";

export function NewNumberButton(parent) {
    this.input = document.createElement("input");
    guiUtils.style(this.input)
        .attribute("type", "text")
        .textAlign("right")
        .verticalAlign("middle")
        .parent(parent);

    this.hover = false;
    this.pressed = false;
    this.active = true;
    // limiting the number range: defaults, minimum is zero, maximum is very large
    this.minValue = 0;
    this.maxValue = NewNumberButton.maxValue;
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
     * @method NumberButton#onclick
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
NewNumberButton.maxValue = 1000;


/**
 * update the color style of the input depending on whether its pressed or hovered
 * always call if states change, use for other buttons too
 * @method NewNumberButton#updateStyle
 */
NewNumberButton.prototype.updateStyle = function() {
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
NewNumberButton.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;


/**
 * set fontsize of the number button, in px
 * @method NewNumberButton#setFontSize
 * @param {integer} size
 */
NewNumberButton.prototype.setFontSize = function(size) {
    this.input.style.fontSize = size + "px";
    if (this.plusButton) {
        this.plusButton.setFontSize(size);
        this.minusButton.setFontSize(size);
    }
    if (this.minButton) {
        this.minButton.setFontSize(size);
        this.maxButton.setFontSize(size);
    }
};

/**
 * set width of the button, in px
 * @method NewNumberButton#setWidth
 * @param {integer} width
 */
NewNumberButton.prototype.setWidth = function(width) {
    this.input.style.width = width + "px";
};


/**
 * quantize a number according to step and clamp to range
 * @method NewNumberButton#quantizeClamp
 * @param {float} x
 * @return float, quantized x
 */
NewNumberButton.prototype.quantizeClamp = function(x) {
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
 * @method NewNumberButton#getValue
 * @returns {integer} value resulting from parsing the button text
 */
NewNumberButton.prototype.getValue = function() {
    return this.quantizeClamp(parseFloat(this.input.value));
};

/**
 * set the text of a button of type="text" according to a given number
 * sets lastValue to same number
 * does nothing else, use it for initialization
 * @method NewNumberButton#setValue
 * @param {integer} number - the number value to show in the button, verified number !!
 */
NewNumberButton.prototype.setValue = function(number) {
    number = this.quantizeClamp(number);
    this.lastValue = number;
    this.input.value = number.toFixed(this.digits);
};


/**
 * set the text of a button of type="text" according to a given number
 * check if it is a number and quantize it and clamp it in the range, if number changes do this.onchange
 * thus we can use it for initialization
 * @method NewNumberButton#updateValue
 * @param {integer} number - the number value to show in the button
 */
NewNumberButton.prototype.updateValue = function(number) {
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
 * a power of ten
 * @method NumberButton#setStep
 * @param {float} step - the step size (rounding)
 */
NewNumberButton.prototype.setStep = function(step) {
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

    this.setValue(this.quantizeClamp(this.getValue()));
};


/**
 * set the allowed range of numbers, correct value if out of range
 * @method NewNumberButton#setRange
 * @param {integer} minValue
 * @param {integer} maxValue
 */
NewNumberButton.prototype.setRange = function(minValue, maxValue) {
    this.minValue = minValue;
    this.maxValue = maxValue;
    // clamp value in range
    this.setValue(this.quantizeClamp(this.getValue()));
};

/**
 * set the lower limit for numbers, upper value is default max valuecorrect value if out of range
 * @method NewNumberButton#setLow
 * @param {integer} minValue
 */
NewNumberButton.prototype.setLow = function(minValue) {
    this.setRange(minValue, NewNumberButton.maxValue);
};

/**
 * set that cyclic numbers are used (wraparound number range)
 * destroy min/max buttons as they make no sense
 * @method NewNumberButton#setCyclic
 */
NewNumberButton.prototype.setCyclic = function() {
    this.cyclic = true;
    this.setValue(this.quantizeClamp(this.getValue()));
};



/**
 * change value depending on direction (>0 or <0) and curcor posion
 * @method NewNumberButton#changeDigit
 * @param {float} direction - makes plus or minus changes
 */
NewNumberButton.prototype.changeDigit = function(direction) {
    let cursorPosition = this.input.selectionStart;
    // selectionStart=0: in front, left of first char
    let pointPosition = this.input.value.indexOf(".");
    // beware of pure integers
    if (pointPosition < 0) {
        pointPosition = this.input.value.length;
    }
    // going to the right increases index in string, decreases number power       
    let power = pointPosition - cursorPosition;
    if (power < 0) {
        power++;
    }
    let change = Math.max(this.step, Math.pow(10, power));
    if (direction < 0) {
        change = -change;
    }
    this.updateValue(this.getValue() + change);
    // determine cursor position relative to decimal point
    pointPosition = this.input.value.indexOf(".");
    if (pointPosition < 0) {
        pointPosition = this.input.value.length;
    }
    cursorPosition = Math.max(0, pointPosition - power);
    // acounting for the space of decimal point
    if (power < 0) {
        cursorPosition++;
    }
    this.input.setSelectionRange(cursorPosition, cursorPosition);
};


/**
 * destroy the button, taking care of all references, deletes the associated html input element
 * maybe too careful
 * @method NewNumberButton#destroy
 */
NewNumberButton.prototype.destroy = function() {
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
    if (this.plusButton) {
        this.plusButton.destroy();
        this.plusButton = null;
    }
};
