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
    this.values = null;

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
 * clears all previous options, set options and values
 * from a simple array with values for both
 * or an object={name1: value1, name2: value2, ...}
 * @method SelectValues#setOptions
 * @param {Array||Object} options
 */
SelectValues.prototype.setOptions = function(options) {
    this.select.clear();
    if (Array.isArray(options)) {
        this.select.addOptions(options);
        this.values = options.slice(0); // array copy for simple values (shallow)
    } else {
        // an object defines selection values as value[key] pair, key is shown as name of a selection (option)
        const names = Object.keys(options);
        this.select.addOptions(names);
        this.values = [];
        names.forEach(name => this.values.push(options[name]));
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
 * get the value
 * @method SelectValues#getValue
 * @return integer, the selected index
 */
SelectValues.prototype.getValue = function() {
    const result = this.values[this.select.getIndex()];
    return result;
};