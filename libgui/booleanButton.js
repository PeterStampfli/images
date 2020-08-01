/* jshint esversion: 6 */

/**
 * representing a switch button with on/off True/false states and adding actions, can use any html element
 *
 * @constructor BooleanButton
 * @param {DOM element} parent, an html element, best "div"
 */

import {
    guiUtils,
    Button
} from "./modules.js";

export function BooleanButton(parent) {
    this.element = document.createElement("button");
    guiUtils.style(this.element)
        .borderRadius("1000px")
        .outline("none")
        .cursor("pointer")
        .verticalAlign("middle")
        .parent(parent);
    this.value = false;
    this.mouseDown = false;
    this.hover = false;
    this.active = true;
    this.setTexts("ON", "OFF");
    this.colorStyleDefaults();
    this.updateStyle();

    /**
     * action upon value change
     * @method BooleanButton#onChange
     */
    this.onChange = function() {
        console.log("change");
    };

    /**
     * action upon mouse down, doing an interaction
     * @method BooleanButton#onInteraction
     */
    this.onInteraction = function() {
        console.log("booleanButton Interaction");
    };

    // a list of actions....

    var button = this;

    this.element.onmousedown = function() {
        if (button.active) {
            button.value = !button.value;
            button.mouseDown = true;
            button.onInteraction();
            button.updateStyle();
        }
    };

    this.element.onmouseup = function() {
        if (button.active) {
            if (button.mouseDown) {
                button.mouseDown = false;
                button.onChange();
            }
            button.element.blur();
            button.updateStyle();
        }
    };

    // hovering
    this.element.onmouseenter = function() {
        if (button.active) {
            button.hover = true;
            button.updateStyle();
        }
    };

    this.element.onmouseleave = function() {
        if (button.active) {
            button.hover = false;
            button.element.onmouseup();
        }
    };
}

// default colors
// for active button, depending on hoovering and if its value is true or false
BooleanButton.colorOn = Button.colorDown;
BooleanButton.colorOnHover = Button.colorDownHover;
BooleanButton.colorOffHover = Button.colorUpHover;
BooleanButton.colorOff = Button.colorUp;

// for switched off
BooleanButton.colorInactive = Button.colorInactive;
BooleanButton.backgroundColorInactive = Button.backgroundColorInactive;

/**
 * use the basic button background colors
 * @method BooleanButton.whiteBackground
 */
BooleanButton.whiteBackground = function() {
    BooleanButton.backgroundColorOn = Button.backgroundColorUp;
    BooleanButton.backgroundColorOnHover = Button.backgroundColorUpHover;
    BooleanButton.backgroundColorOffHover = Button.backgroundColorUpHover;
    BooleanButton.backgroundColorOff = Button.backgroundColorUp;
};

/**
 * use the green and red button background colors
 * @method BooleanButton.greenRedBackground
 */
BooleanButton.greenRedBackground = function() {
    BooleanButton.backgroundColorOn = "#88ff88";
    BooleanButton.backgroundColorOnHover = "#00ff00";
    BooleanButton.backgroundColorOffHover = "#ff0000";
    BooleanButton.backgroundColorOff = "#ff8888";
};

BooleanButton.whiteBackground();

/**
 * setup the color styles defaults
 * @method BooleanButton#colorStyleDefaults
 */
BooleanButton.prototype.colorStyleDefaults = function() {
    // can customize colors, preset defaults
    this.colorOn = BooleanButton.colorOn;
    this.colorOnHover = BooleanButton.colorOnHover;
    this.colorOffHover = BooleanButton.colorOffHover;
    this.colorOff = BooleanButton.colorOff;
    this.colorInactive = BooleanButton.colorInactive;

    this.backgroundColorOn = BooleanButton.backgroundColorOn;
    this.backgroundColorOnHover = BooleanButton.backgroundColorOnHover;
    this.backgroundColorOffHover = BooleanButton.backgroundColorOffHover;
    this.backgroundColorOff = BooleanButton.backgroundColorOff;
    this.backgroundColorInactive = BooleanButton.backgroundColorInactive;
};

/**
 * update the color style of the element depending on whether its pressed or hovered
 * always call if states change, use for other buttons too
 * @method BooleanButton#updateStyle
 */
BooleanButton.prototype.updateStyle = function() {
    if (this.value) {
        this.element.textContent = this.textOn;
    } else {
        this.element.textContent = this.textOff;
    }
    if (this.active) {
        if (this.value) {
            if (this.hover) {
                guiUtils.style(this.element)
                    .color(this.colorOnHover)
                    .backgroundColor(this.backgroundColorOnHover);
            } else {
                guiUtils.style(this.element)
                    .color(this.colorOn)
                    .backgroundColor(this.backgroundColorOn);
            }
        } else {
            if (this.hover) {
                guiUtils.style(this.element)
                    .color(this.colorOffHover)
                    .backgroundColor(this.backgroundColorOffHover);
            } else {
                guiUtils.style(this.element)
                    .color(this.colorOff)
                    .backgroundColor(this.backgroundColorOff);
            }
        }
    } else {
        guiUtils.style(this.element)
            .color(this.colorInactive)
            .backgroundColor(this.backgroundColorInactive);
    }
};

/**
 * set fontsize of the button, in px
 * @method BooleanButton#setFontSize
 * @param {integer} size
 */
BooleanButton.prototype.setFontSize = function(size) {
    this.element.style.fontSize = size + "px";
};

/**
 * set width of the button, in px
 * @method BooleanButton#setFontSize
 * @param {integer} width
 */
BooleanButton.prototype.setWidth = function(width) {
    this.element.style.width = width + "px";
};

/**
 * set if button is active
 * @method BooleanButton#setActive
 * @param {boolean} on
 */
BooleanButton.prototype.setActive = Button.prototype.setActive;

/**
 * get value of booleanButton
 * @method BooleanButton#getValue
 * @return boolean, if on/off
 */
BooleanButton.prototype.getValue = function() {
    return this.value;
};

/**
 * set value of booleanButton
 * @method BooleanButton#setValue
 * @param {boolean} value
 */
BooleanButton.prototype.setValue = function(value) {
    if (guiUtils.isBoolean(value)) {
        this.value = value;
        this.updateStyle();
    } else {
        console.error("Boolean controller, setValue: argument is not boolean:");
        console.log('its value is ' + value + ' of type "' + (typeof value) + '"');
    }
};

/**
 * set alternative text for on/off states
 * @method BooleanButton#setTexts
 * @param {String} on
 * @param {String} off 
 */
BooleanButton.prototype.setTexts = function(on, off) {
    this.textOn = on;
    this.textOff = off;
    this.updateStyle();
};

/**
 * destroy the booleanButton
 * @method BooleanButton#destroy
 */
BooleanButton.prototype.destroy = function() {
    this.onChange = null;
    this.element.onchange = null;
    this.element.onmousedown = null;
    this.element.onmouseup = null;
    this.element.onmouseenter = null;
    this.element.onmouseleave = null;
    this.element.remove();
    this.element = null;
};