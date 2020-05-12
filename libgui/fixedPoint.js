/* jshint esversion: 6 */

/**
 * input for fixed point numbers
 * given constant number of digits after decimal point (at least one)
 * @constructor FixedPoint
 * @param {DOM element} parentDOM - html element, 'div' or 'span'
 */

import {
    Button,
    guiUtils,
    Integer
} from "./modules.js";

export function FixedPoint(parentDOM) {
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
    this.minValue = -1e10;
    this.maxValue = 1e10;
    this.step = 0.001;
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

FixedPoint.prototype.colorStyleDefaults = Button.prototype.colorStyleDefaults;
FixedPoint.prototype.updateStyle = Integer.prototype.updateStyle;
FixedPoint.prototype.setIndicatorColors = Integer.prototype.setIndicatorColors;
FixedPoint.prototype.setFontSize = Integer.prototype.setFontSize;
FixedPoint.prototype.setInputWidth =Integer.prototype.setInputWidth ;
FixedPoint.prototype.setActive =Integer.prototype.setActive ;
FixedPoint.prototype.setInputRangeIndicator=Integer.prototype.setInputRangeIndicator;
FixedPoint.prototype.setRangeLimits =Integer.prototype.setRangeLimits ;
FixedPoint.prototype.quantizeClamp=Integer.prototype.quantizeClamp;
FixedPoint.prototype.setCyclic=Integer.prototype.setCyclic;

FixedPoint.prototype.createButton=Integer.prototype.createButton;

FixedPoint.prototype.createRange=Integer.prototype.createRange;
FixedPoint.prototype.setRangeWidth=Integer.prototype.setRangeWidth;
FixedPoint.prototype.destroy=Integer.prototype.destroy;

// setting parameters, now float values and not integers

// special for fixedPoint
// quantize, no offset, step size as 1/integer 
FixedPoint.prototype.quantize=function(x){
	const invStep=Math.round(1/this.step);
	return Math.round(invStep*x)/invStep;
}

// number of digits depend on step: rounding up