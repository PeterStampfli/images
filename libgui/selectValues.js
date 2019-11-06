/**
 * representing an hTML selection for selecting values
 *
 * @constructor SelectValues
 * @param {DOM element} parent, an html element, best "div"
 */

import {
    Button
} from "./modules.js";

export function SelectValues(parent) {
    this.element = document.createElement("select");
    parent.appendChild(this.element);
    this.hover = false;
    this.colorStyleDefaults();
    this.updateStyle();
    this.element.style.cursor = "pointer";
    this.labels = null;
    this.values = null;
    this.value = false;

    var select = this;

    /**
     * action upon change, strategy pattern
     * @method SelectValues#onChange
     */
    this.onChange = function() {
        console.log("onchnage " + select.value);
    };

    /**
     * action upon change
     */
    this.element.onchange = function() {
        select.value = select.values[select.element.selectedIndex];
        select.onChange();
    };

    // hovering
    this.element.onmouseenter = function() {
        select.hover = true;
        select.updateStyle();
    };

    this.element.onmouseleave = function() {
        select.hover = false;
        select.updateStyle();
    };
}

/**
 * update the color style of the element depending on whether its pressed or hovered
 * always call if states change, use for other buttons too
 * @method SelectValues#updateStyle
 */
SelectValues.prototype.updateStyle = function() {
    if (this.hover) {
        this.element.style.color = this.colorUpHover;
        this.element.style.backgroundColor = this.backgroundColorUpHover;
    } else {
        this.element.style.color = this.colorUp;
        this.element.style.backgroundColor = this.backgroundColorUp;
    }
};

/**
 * setup the color styles defaults, use for other buttons too
 * @method SelectValues#colorStyleDefaults
 */
SelectValues.prototype.colorStyleDefaults = function() {
    // can customize colors, preset defaults
    this.colorUp = Button.colorUp;
    this.colorUpHover = Button.colorUpHover;
    this.colorDownHover = Button.colorDownHover;
    this.colorDown = Button.colorDown;
    this.backgroundColorUp = Button.backgroundColorUp;
    this.backgroundColorUpHover = Button.backgroundColorUpHover;
    this.backgroundColorDownHover = Button.backgroundColorDownHover;
    this.backgroundColorDown = Button.backgroundColorDown;
};

/**
 * set fontsize of the button, in px
 * @method SelectValues#setFontSize
 * @param {integer} size
 */
SelectValues.prototype.setFontSize = function(size) {
    this.element.style.fontSize = size + "px";
};

/**
 * set labels and values array
 * @method SelectValues#setLabelsValues
 * @param {Array||Object} selections
 */
SelectValues.prototype.setLabelsValues = function(selections) {
    if (Array.isArray(selections)) {
        // an array defines the selection values, key and value are identical
        this.labels = selections;
        this.values = selections;
    } else {
        // an object defines selection values as value[key] pair, key is shown as option
        this.labels = Object.keys(selections);
        this.values = [];
        for (let i = 0; i < this.labels.length; i++) {
            this.values.push(selections[this.labels[i]]);
        }
    }
    for (let i = 0; i < this.labels.length; i++) {
        const option = document.createElement("option");
        option.appendChild(document.createTextNode("" + this.labels[i]));
        this.element.appendChild(option);
    }
};


/**
 * set to one of the existing values, if not existing use first value
 * @method SelectValues#setValue
 * @param {whatever} value
 */
SelectValues.prototype.setValue = function(value) {
    let index = 0;
    for (let i = 0; i < this.values.length; i++) {
        if (value === this.values[i]) {
            index = i;
        }
    }
    this.element.selectedIndex = index;
    this.value = this.values[this.element.selectedIndex];
};

/**
 * get the value
 * @method SelectValues#getValue
 * @return whatever, the selected value
 */
SelectValues.prototype.getValue = function() {
    return this.value;
};

/**
 * destroy the select thing, taking care of all references, deletes the associated html element
 * may be too careful
 * set reference to the select to null
 * @method NumberButton#destroy
 */
SelectValues.prototype.destroy = function() {
    this.element.onchange = null;
    this.element.onmouseenter = null;
    this.element.onmouseleave = null;
    this.element.remove();
    this.element = null;
};
