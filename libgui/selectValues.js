/**
 * representing an HTML selection for selecting values as selection name/value pairs
 * choices are either a simple array that determines names of selections and their values
 * or an object={name1:value1, name2:value2, ... }
 * @constructor SelectValues
 * @param {DOM element} parent, an html element, best "div"
 */

import {
    Select,
    guiUtils
} from "./modules.js";

export function SelectValues(parent) {
    this.select = new Select(parent);
    this.values = [];
    this.names = [];

    var selectValues = this;

    /**
     * action upon change, strategy pattern
     * @method SelectValues#onChange
     */
    this.onChange = function() {
        console.log("onchange " + selectValues.getValue());
        console.log(selectValues.getIndex());
    };

    /**
     * action upon mouse down, doing an interaction
     * @method SelectValues#onInteraction
     */
    this.onInteraction = function() {
        console.log("value select Interaction");
    };

    this.select.onChange = function() {
        selectValues.value = selectValues.values[selectValues.select.getIndex()];
        selectValues.onChange();
    };

    this.select.onInteraction = function() {
        selectValues.onInteraction();
    };
}

/**
 * set fontsize of the select, in px
 * @method SelectValues#setFontSize
 * @param {integer} size
 */
SelectValues.prototype.setFontSize = function(size) {
    this.select.setFontSize(size);
};

/**
 * set if button is active
 * @method SelectValues#setActive
 * @param {boolean} isActive
 */
SelectValues.prototype.setActive = function(isActive){
    this.select.setActive(isActive);
};

/**
 * clear all options, leaving empty select
 * @method SelectValues#clear
 */
SelectValues.prototype.clear = function() {
    this.values.length = 0;
    this.names.length = 0;
    this.select.clear();
};

/**
 * add an option with a name and a value
 * @method SelectValues#addOption
 * @param {String|number} name
 * @param {whatever} value
 */
SelectValues.prototype.addOption = function(name, value) {
    this.select.addOptions(name);
    this.names.push(name);
    this.values.push(value);
};

/**
 * add options and values
 * from a simple array with values for both
 * or an object={name1: value1, name2: value2, ...}
 * @method SelectValues#addOptions
 * @param {Array||Object} options
 */
SelectValues.prototype.addOptions = function(options) {
    if (guiUtils.isArray(options)) {
        options.forEach(option => this.addOption(option, option));
    } else if (guiUtils.isObject(options)) {
        // an object defines selection values as value[key] pair, key is shown as name of a selection (option)
        const names = Object.keys(options);
        names.forEach(name => this.addOption(name, options[name]));
    } else {
        console.error("SelectValues#addOptions: argument is not an array and not an object");
        console.log('its value is ' + options + ' of type "' + (typeof options) + '"');
    }
};

/**
 * get the selected index
 * @method SelectValues#getIndex
 * @return integer, the selected index
 */
SelectValues.prototype.getIndex = function() {
    const result = this.select.getIndex();
    return result;
};

/**
 * set the index
 * does not call the onChange callback
 * @method SelectValues#setIndex
 * @param {integer} index
 */
SelectValues.prototype.setIndex = function(index) {
    this.select.setIndex(index);
};

/**
 * get the value
 * @method SelectValues#getValue
 * @return integer, the selected index
 */
SelectValues.prototype.getValue = function() {
    const result = this.values[this.select.getIndex()];
    return result;
};

/**
 * find the index for a given value
 * searches first the selection values, then the labels
 * @method SelectValues#findIndex
 * @param {whatever} value
 * @return number, the fitting index >=0, -1 if not found
 */
SelectValues.prototype.findIndex = function(value) {
    let index = this.values.indexOf(value);
    if (index < 0) {
        index = this.names.indexOf(value);
    }
    return index;
};

/**
 * set the choice, 
 * searches the values and then the labels, if not found makes error message
 * does not call the onChange callback
 * @method SelectValues#setValue
 * @param {whatever} value
 */
SelectValues.prototype.setValue = function(value) {
    const index = this.findIndex(value); // searches both
    if (index >= 0) {
        this.setIndex(index);
    } else {
        console.error("Selection controller, setValue: argument not found in options");
        console.log('argument value is ' + value + ' of type "' + (typeof value) + '"');
    }
};

/**
 * destroy the SelectValue
 * @method SelectValue#destroy
 */
SelectValues.prototype.destroy = function() {
    this.onChange = null;
    this.onInteraction = null;
    this.select.destroy();
};
