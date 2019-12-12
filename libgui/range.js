/**
 * a button to input numbers together with a slider
 * default is value between 0 and 1
 * @constructor Range 
 * @param {DOM element} parent, an html element, best "div"
 * @param {boolean} hasPlusMinus  (optional), increase/decrease value by 1
 */

import {
    Button
} from "./modules.js";

export function Range(parent, hasPlusMinus = false) {
    this.parent = parent;
    this.textElement = document.createElement("input");
    this.textElement.setAttribute("type", "text");
    this.textElement.style.textAlign = "right";
    this.textElement.style.verticalAlign = "middle";
    parent.appendChild(this.textElement);
    this.textHover = false;
    this.textPressed = false;
    this.addSpace();
    this.rangeElement = document.createElement("input");
    parent.appendChild(this.rangeElement);
    this.rangeElement.setAttribute("type", "range");
    this.rangeElement.style.cursor = "pointer";
    this.rangeElement.step = "any";
    this.rangeElement.style.verticalAlign = "middle"; // range is essentially an image, inline element
    const range = this;
    if ((arguments.length > 1) && hasPlusMinus) {
        this.addSpace();
        this.minusButton = new Button("-", parent);
        this.minusButton.onClick = function() {
            range.updateValue(range.lastValue - 1);
        };
        this.minusButton.onInteraction = function() {
            range.onInteraction();
        };
        this.addSpace();
        this.plusButton = new Button("+", parent);
        this.plusButton.onClick = function() {
            range.updateValue(range.lastValue + 1);
        };
        this.plusButton.onInteraction = function() {
            range.onInteraction();
        };
    } else {
        this.minusButton = null;
        this.plusButton = null;
    }
    this.cyclic = false;
    this.setStep(0.01);
    this.digits = 2;
    this.lastValue = 0.5;
    this.setRange(0, 1);
    this.colorStyleDefaults(); // the colors/backgroundcolors for different states
    this.updateTextStyle();

    // calling the onInteraction method
    function interaction() {
        range.onInteraction();
    }

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
    this.textElement.onmousedown = interaction;


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

    this.textElement.onwheel = function(event) {
        event.preventDefault();
        event.stopPropagation();
        interaction();
        if (range.textPressed) {
            range.changeDigit(-event.deltaY);
        }
        return false;
    };

    this.textElement.onkeydown = function(event) {
        if (range.textPressed) {
            let key = event.key;
            if (key === "ArrowDown") {
                range.changeDigit(-1);
                event.preventDefault();
                event.stopPropagation();
            } else if (key === "ArrowUp") {
                range.changeDigit(1);
                event.preventDefault();
                event.stopPropagation();
            }
        }
    };

    // doing things continously
    this.rangeElement.oninput = function() {
        range.updateValue(range.getValueRange());
    };

    this.rangeElement.onchange = function() {
        range.updateValue(range.getValueRange());
    };

    this.rangeElement.onkeydown = interaction;
    this.rangeElement.onmousedown = interaction;
    this.rangeElement.onwheel = interaction;

    this.rangeElement.onmouseenter = function() {
        range.rangeElement.focus();
    };

    /**
     * action upon change, strategy pattern
     * @method Range#onclick
     * @param {integer} value
     */
    this.onChange = function(value) {};

    /**
     * action upon mouse down, doing an interaction
     * @method Range#onInteraction
     */
    this.onInteraction = function() {
        console.log("range Interaction");
    };
}

// width for spaces in px
Range.spaceWidth = 5;

/**
 * setup the color styles defaults, use for other buttons too
 * @method Range#colorStyleDefaults
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
 * set fontsize, in px
 * @method Range#setFontSize
 * @param {integer} size
 */
Range.prototype.setFontSize = function(size) {
    this.textElement.style.fontSize = size + "px";
    if (this.plusButton !== null) {
        this.plusButton.setFontSize(size);
        this.minusButton.setFontSize(size);
    }
};


/**
 * set widths, in px
 * @method Rannge#setWidths
 * @param {integer} widthTextElement
 * @param {integer} widthRangeElement
 */
Range.prototype.setWidths = function(widthTextElement, widthRangeElement) {
    this.textElement.style.width = widthTextElement + "px";
    this.rangeElement.style.width = widthRangeElement + "px";
};

/**
 * add a span with a space to the parent element
 * use Range.spaceWidth as parameter !!!
 * @method Range#addSpace
 */
Range.prototype.addSpace = function() {
    const theSpan = document.createElement("span");
    theSpan.style.width = Range.spaceWidth + "px";
    theSpan.style.display = "inline-block";
    this.parent.appendChild(theSpan);
};

/**
 * set that cyclic numbers are used (wraparound number range)
 * destroy min/max buttons as they make no sense
 * @method Range#setCyclic
 */
Range.prototype.setCyclic = function() {
    this.cyclic = true;
    this.rangeElement.max = this.maxValue - this.step; // avoid irritating jump from right to left
    this.setValue(this.quantizeClamp(this.getValue()));
};

/**
 * quantize a number according to step and clamp to range
 * @method Range#quantizeClamp
 * @param {float} x
 * @return float, quantized and clamped x
 */
Range.prototype.quantizeClamp = function(x) {
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
    if (this.cyclic) {
        this.rangeElement.max = this.maxValue - this.step; // avoid irritating jump from right to left
    }
    // clamp value in range
    this.setValue(this.quantizeClamp(this.lastValue));
};

/**
 * set the step of the slider, used too for quantization of text input/output
 * @method Range#setStep
 * @param {float} step
 */
Range.prototype.setStep = function(step) {
    this.step = step;
    this.rangeElement.step = step;
    this.setValue(this.quantizeClamp(this.lastValue));
    this.digits = Math.max(0, -Math.floor(Math.log10(step) + 0.0001));
};

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
    number = this.quantizeClamp(number);
    this.lastValue = number;
    this.textElement.value = number.toString();
    this.rangeElement.value = number.toString();
    if (arguments.length < 2) {
        this.textElement.value = number.toFixed(this.digits);
    } else {
        this.textElement.value = text;
    }
};

/**
 * set the textInput and rangeInput according to a given number
 * check if it is a number and clamp it in the range, 
 * if number changes do this.onChange
 * thus we can use it for initialization
 * @method Range#updateValue
 * @param {float} number - the number value to show in the button
 */
Range.prototype.updateValue = function(number) {
    if (isNaN(number)) { // overwrite garbage, do nothing
        this.setValue(this.lastValue);
    } else {
        number = this.quantizeClamp(number);
        if (this.lastValue != number) { // does it really change??
            this.setValue(number); // update numbers before action
            this.onChange(number);
        } else { // it does not change, clean up garbage
            this.setValue(this.lastValue);
        }
    }
};

/**
 * change value depending on direction (>0 or <0) and cursor posion on the text element part
 * adjust cursor position
 * @method Range#changeDigit
 * @param {float} direction - makes plus or minus changes
 */
Range.prototype.changeDigit = function(direction) {
    const element = this.textElement;
    let cursorPosition = element.selectionStart;
    // selectionStart=0: in front, left of first char
    let pointPosition = element.value.indexOf(".");
    // beware of pure integers: if there is no decimal point then the index result is -1
    if (pointPosition < 0) {
        pointPosition = element.value.length;
    }
    // going to the right increases index in string, decreases number power       
    let power = pointPosition - cursorPosition;
    // compensation for the decimal point
    if (power < 0) {
        power++;
    }
    let change = Math.max(this.step, Math.pow(10, power));
    if (direction < 0) {
        change = -change;
    }
    this.updateValue(this.getValue() + change);
    pointPosition = element.value.indexOf(".");
    if (pointPosition < 0) {
        pointPosition = element.value.length;
    }
    cursorPosition = Math.max(0, pointPosition - power);
    // accounting for the decimal point
    if (power < 0) {
        cursorPosition++;
    }
    element.setSelectionRange(cursorPosition, cursorPosition);
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
    this.textElement.onmousedown = null;
    this.textElement.onwheel = null;
    this.textElement.onkeydown = null;
    this.textElement.remove();
    this.textElement = null;
    this.rangeElement.oninput = null;
    this.rangeElement.onchange = null;
    this.rangeElement.onkeydown = null;
    this.rangeElement.onmouseenter = null;
    this.rangeElement.onmousedown = null;
    this.rangeElement.onwheel = null;
    this.rangeElement.remove();
    this.rangeElement = null;
    if (this.plusButton !== null) {
        this.plusButton.destroy();
        this.plusButton = null;
        this.minusButton.destroy();
        this.minusButton = null;
    }
};