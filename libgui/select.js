/**
 * selecting a choice of names, use the corresponding index for further work
 * @constructor Select
 * @param {DOM element} parent, an html element, best "div"
 */

import {
    Button
} from "./modules.js";

export function Select(parent) {
    this.element = document.createElement("select");
    parent.appendChild(this.element);
    this.hover = false;
    this.colorStyleDefaults();
    this.updateStyle();
    this.element.style.cursor = "pointer";
    this.maxIndex = 0;

    var select = this;

    /**
     * action upon change, strategy pattern
     * @method Select#onChange
     */
    this.onChange = function() {
        console.log("onchange " + select.getIndex());
    };

    /**
     * action upon change
     */
    this.element.onchange = function() {
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
 * @method Select#updateStyle
 */
Select.prototype.updateStyle = function() {
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
 * @method Select#colorStyleDefaults
 */
Select.prototype.colorStyleDefaults = function() {
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
 * @method Select#setFontSize
 * @param {integer} size
 */
Select.prototype.setFontSize = function(size) {
    this.element.style.fontSize = size + "px";
};

/**
 * add an option
 */

/**
 * set names and values array
 * from a simple array with values for bpoth
 * or an object={name1: value1, name2: value2, ...}
 * @method Select#setNamesValues
 * @param {Array||Object} selections
 */
Select.prototype.setNamesValues = function(selections) {
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
 * @method Select#getIndex
 * @return integer, the selected index
 */
Select.prototype.getIndex = function() {
    const result = this.element.selectedIndex;
    return result;
};

/**
 * set the selected index, limited to the actual range
 * nothing happens if index does not change
 * option to call onChange
 * @method Select#setIndex
 * @param {int} index
 */
Select.prototype.setIndex = function(index, callOnChange = false) {
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
 * @method Select#changeIndex
 * @param {integer} delta
 */
Select.prototype.changeIndex = function(delta) {
    this.setIndex(this.getIndex() + delta, true);
};

/**
 * destroy the select thing, taking care of all references, deletes the associated html element
 * may be too careful
 * set reference to the select to null
 * @method NumberButton#destroy
 */
Select.prototype.destroy = function() {
    this.element.onchange = null;
    this.element.onmouseenter = null;
    this.element.onmouseleave = null;
    this.element.onwheel = null;
    this.element.remove();
    this.element = null;
    this.onChange = null;
};