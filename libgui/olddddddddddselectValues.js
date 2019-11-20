/**
 * representing an HTML selection for selecting values as selection name/value pairs
 * choices are either a simple array that determines names of selections and their values
 * or an object={name1:value1, name2:value2, ... }
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
    this.names = null;
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
            select.changeIndex(1);
        } else {
            select.changeIndex(-1);
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
* add a name value pair
*/

/**
 * set names and values array
 * from a simple array with values for bpoth
 * or an object={name1: value1, name2: value2, ...}
 * @method SelectValues#setNamesValues
 * @param {Array||Object} selections
 */
SelectValues.prototype.setNamesValues = function(selections) {
    if (Array.isArray(selections)) {
        // an array defines the selection values, key and value are identical
        this.names = selections;
        this.values = selections;
    } else {
        // an object defines selection values as value[key] pair, key is shown as name of a selection (option)
        this.names = Object.keys(selections);
        this.values = [];
        for (let i = 0; i < this.names.length; i++) {
            this.values.push(selections[this.names[i]]);
        }
    }
    for (let i = 0; i < this.names.length; i++) {
        const option = document.createElement("option");
        option.appendChild(document.createTextNode("" + this.names[i]));
        this.element.appendChild(option);
    }
};

/**
 * get the index
 * @method SelectValues#getIndex
 * @return integer, the selected index
 */
SelectValues.prototype.getIndex = function() {
    const result = this.element.selectedIndex;
    return result;
};

/**
 * set the selected index, limited to the actual range
 * nothing happens if index does not change
 * option to call onChange
 * @method SelectValues#setIndex
 * @param {int} index
 */
SelectValues.prototype.setIndex = function(index, callOnChange = false) {
    index = Math.max(0, Math.min(this.names.length - 1, index));
    if (index !== this.element.selectedIndex) {
        this.element.selectedIndex = index;
        this.value = this.values[index];
        if (callOnChange) {
            this.onChange();
        }
    }
};

/**
 * change the (selected) index, restricted to lenght of this.names
 * call onChange only if changes
 * @method SelectValues#changeIndex
 * @param {integer} delta
 */
SelectValues.prototype.changeIndex = function(delta) {
    this.setIndex(this.getIndex() + delta, true);
};

/**
 * get the value
 * @method SelectValues#getValue
 * @return whatever, the selected value
 */
SelectValues.prototype.getValue = function() {
    return this.values[this.getIndex()];
};

/**
 * set selection to one of the existing values, if not existing use first value
 * sets corresponding name
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
 * get the name
 * @method SelectValues#getname
 * @return {string}, the selected name
 */
SelectValues.prototype.getValue = function() {
    return this.names[this.getIndex()];
};

/**
 * set to one of the existing names, if not existing use first value
 * sets corresponding value
 * option to call onChange (callback)
 * @method SelectValues#setName
 * @param {string} name
 * @param {boolean} callOnChange - optional, default false
 */
SelectValues.prototype.setName = function(name, callOnChange = false) {
    const index = this.names.indexOf(name);
    this.setIndex(index, callOnChange);
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