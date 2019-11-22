/**
 * representing an HTML selection for selecting values as selection name/value pairs
 * choices are either a simple array that determines names of selections and their values
 * or an object={name1:value1, name2:value2, ... }
 * @constructor SelectValues
 * @param {DOM element} parent, an html element, best "div"
 */

import {
    Select
} from "./modules.js";

export function SelectValues(parent) {
    this.select = new Select(parent);
    this.values = [];

    var selectValues = this;

    /**
     * action upon change, strategy pattern
     * @method SelectValues#onChange
     */
    this.onChange = function() {
        console.log("onchange " + selectValues.getValue());
        console.log(selectValues.getIndex());
    };

    this.select.onChange = function() {
        selectValues.value = selectValues.values[selectValues.select.getIndex()];
        selectValues.onChange();
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
 * clear all options, leaving empty select
 * @method SelectValues#clear
 */
SelectValues.prototype.clear = function() {
    this.values = [];
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
    if (Array.isArray(options)) {
        options.forEach(option => this.addOption(option, option));
    } else {
        // an object defines selection values as value[key] pair, key is shown as name of a selection (option)
        const names = Object.keys(options);
        names.forEach(name => this.addOption(name, options[name]));
    }
};

/**
 * get the index
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
 * set the value
 * does not call the onChange callback
 * @method SelectValues#setValue
 * @param {whatever} value
 */
SelectValues.prototype.setValue = function(value) {
    const index = this.values.indexOf(value);
    this.setIndex(index);
};
