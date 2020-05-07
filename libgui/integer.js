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
    this.input.value = 'unknown';
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

// quantize with respect to offset
function quantize(x) {
    x -= this.offset;
    x = Math.round(x / step) * step;
    return x + this.offset;
}

/**
 * wraparound if cyclic
 * clamp to range
 * quantize a number according to step, with offset as basis 
 * @method Integer#quantizeClamp
 * @param {int} x
 * @return int, quantized x
 */
Integer.prototype.quantizeClamp = function(x) {
    if (this.cyclic) {
        // wraparound, between minValue (inclusive) and maxValue (exclusive)
        // min=0,max=6 results in possible values of 0,1,2,3,4,5
        x -= this.minValue;
        const d = this.maxValue - this.minValue;
        x = x - d * Math.floor(x / d);
        x += this.minValue;
        x = quantize(x);
        // it may now be outside the limits, but not by more than one step
        if (x < this.minValue) {
            x += step;
        }
        if (x >= this.maxValue) {
            x -= step;
        }
    } else {
        // keep in limits
        x = Math.min(this.maxValue, Math.max(this.minValue, x));
        x = quantize(x);
        // it may now be outside the limits, but not by more than one step
        if (x < this.minValue) {
            x += step;
        }
        if (x > this.maxValue) {
            x -= step;
        }
    }
    return x;
};