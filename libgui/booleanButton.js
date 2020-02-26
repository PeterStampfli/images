/**
 * representing a switch button with on/off True/false states and adding actions, can use any html element
 *
 * @constructor BooleanButton
 * @param {DOM element} parent, an html element, best "div"
 */

import {
    guiUtils
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
        console.log("range Interaction");
    };

    // a list of actions....

    var button = this;

    this.element.onchange = function() {
        button.onChange();
    };

    this.element.onmousedown = function() {
        button.value = !button.value;
        button.mouseDown = true;
        button.onInteraction();
        button.updateStyle();
    };

    this.element.onmouseup = function() {
        if (button.mouseDown) {
            button.mouseDown = false;
            button.onChange();
        }
        button.element.blur();
        button.updateStyle();
    };

    // hovering
    this.element.onmouseenter = function() {
        button.hover = true;
        button.updateStyle();
    };

    this.element.onmouseleave = function() {
        button.hover = false;
        button.element.onmouseup();
    };
}

// default colors
// for active button, depending on hoovering and if it is pressed
BooleanButton.colorOn = "#444444";
BooleanButton.colorOnHover = "black";
BooleanButton.colorOffHover = "black";
BooleanButton.colorOff = "#444444";
BooleanButton.backgroundColorOn = "#88ff88";
BooleanButton.backgroundColorOnHover = "#00ff00";
BooleanButton.backgroundColorOffHover = "#ff0000";
BooleanButton.backgroundColorOff = "#ff8888";
// for switched off
BooleanButton.colorInactive = "black";
BooleanButton.backgroundColorInactive = "#aaaaaa";

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
    if (this.active) {
        if (this.value) {
            this.element.textContent = this.textOn;
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
            this.element.textContent = this.textOff;
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
        this.element.textContent = "-";
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
 * @param {boolean} onOff
 */
BooleanButton.prototype.setValue = function(onOff) {
    if (!guiUtils.isBoolean(onOff)) {
        console.error("BooleanButton#setValue: argument is not boolean:");
        console.log('its value is ' + onOff + ' of type "' + (typeof onOff) + '"');
    }
    this.value = onOff;
    this.updateStyle();
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
