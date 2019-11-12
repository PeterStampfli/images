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
        console.log("onchange " + select.value);
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
        select.element.focus();
        select.updateStyle();
    };

    this.element.onmouseleave = function() {
        select.hover = false;
        //select.element.blur();
        select.updateStyle();
    };

    this.element.onwheel = function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.deltaY > 0) {
            select.changeSelectedIndex(1);
        } else {
            select.changeSelectedIndex(-1);
        }
        return false;
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
 * set the index, limited to the actual range
 * set the corresponding value
 * option to call onChange
 * @method SelectValues#setIndex
 * @param {int} index
 */
SelectValues.prototype.setIndex = function(index, callOnChange = false) {
    index = Math.max(0, Math.min(this.labels.length - 1, index));
    this.element.selectedIndex = index;
    this.value = this.values[index];
    if (callOnChange) {
        this.onChange();
    }
};

/**
 * change the selected index, restricted to lenght of this.labels
 * call onChange only if changes
 * @method SelectValues#changeSelectedIndex
 * @param {integer} delta
 */
SelectValues.prototype.changeSelectedIndex = function(delta) {
    let index = this.element.selectedIndex + delta;
    index = Math.max(0, Math.min(this.labels.length - 1, index));
    if (index !== this.element.selectedIndex) {
        this.setIndex(index, true);
    }
};

/**
 * set to one of the existing values, if not existing use first value
 * sets corresponding label
 * option to call onChange (callback)
 * @method SelectValues#setValue
 * @param {whatever} value
 * @param {boolean} callOnChange - optional, default false
 */
SelectValues.prototype.setValue = function(value, callOnChange = false) {
    const index = this.values.indexOf(value);
    this.setIndex(index, callOnChange);
};

/**
 * set to one of the existing labels, if not existing use first value
 * sets corresponding value
 * option to call onChange (callback)
 * @method SelectValues#setLabel
 * @param {string} label
 * @param {boolean} callOnChange - optional, default false
 */
SelectValues.prototype.setLabel = function(label, callOnChange = false) {
    const index = this.labels.indexOf(label);
    this.setIndex(index, callOnChange);
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
    this.element.onwheel = null;
    this.element.remove();
    this.element = null;
    this.onChange = null;
};
