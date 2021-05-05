/* jshint esversion: 6 */

/**
 * representing an HTML selection for selecting values as selection name/value pairs
 * choices are either a simple array that determines names of selections and their values
 * or an object={name1:value1, name2:value2, ... }
 * @constructor SelectValues
 * @param {DOM element} parent, an html element, best "div"
 */

import {
    Select,
    guiUtils,
    Button
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
 * @param {boolean} on
 */
SelectValues.prototype.setActive = function(on) {
    this.select.setActive(on);
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
 * @param {whatever} value - optional, default value is name
 */
SelectValues.prototype.addOption = function(name, value = name) {
    this.select.addOptions(name);
    this.names.push(name);
    this.values.push(value);
};

/**
 * add options and values
 * from an array of simple values (number or string), each value is both name and value
 * from an array of objects with name and value fields
 * or an object={name1: value1, name2: value2, ...}
 * @method SelectValues#addOptions
 * @param {Array||Object} options
 */
SelectValues.prototype.addOptions = function(options) {
    if (guiUtils.isArray(options)) {
        if (guiUtils.isObject(options[0])) {
            options.forEach(option => this.addOption(option.name, option.value)); // array elements as objects with name and value fields 
        } else {
            options.forEach(option => this.addOption(option, option)); // simple array elements are name and value
        }
    } else if (guiUtils.isObject(options)) {
        // an object defines selection values as value[key] pair, key is shown as name of a selection (option)
        const names = Object.keys(options);
        names.forEach(name => this.addOption(name, options[name]));
    } else {
        console.error("SelectValues#addOptions: argument is not an array and not an object");
        console.log('its value is ' + options + ' of type "' + (typeof options) + '"');
    }
};

// text for the button for loading user defined objects (presets)
SelectValues.addObjectsButtonText = "add";
const fileReader = new FileReader();

/**
 * read and parse JSON *.txt files that define objects
 * @method SelectValues#readJSONFiles
 * @param {object} files
 */
SelectValues.prototype.readJSONFiles = function(files) {
    let currentFileNumber = -1; // loadNextFile() first advances file number
    let selectionChoiceUpdated = false; // for selecting the first preset in files
    const selectValues = this;

    // load next file only if it is a *.txt file and not yet in the options
    // if in options and selection not updated, then set selected value
    function loadNextFile() {
        var file;
        currentFileNumber += 1; // advance to next file
        while (currentFileNumber < files.length) {
            file = files[currentFileNumber];
            const fileNameParts = file.name.split('.');
            // use only *.txt files (for window drag and drop)
            if (fileNameParts[1] === 'txt') {
                const name = fileNameParts[0]; // filename without extension, use as name of selection 
                // load only once 
                if (selectValues.findIndex(name) < 0) {
                    fileReader.readAsText(file);
                    return;
                } else if (!selectionChoiceUpdated) {
                    // set selection to the first previously loaded preset
                    selectValues.setValue(name);
                    selectValues.onChange();
                    selectionChoiceUpdated = true;
                }
            }
            // nothing loaded, look at next file
            currentFileNumber += 1;
        }
    }

    fileReader.onload = function() {
        // we know that the file is a *.txt file and that the name is not yet in the options
        const file = files[currentFileNumber];
        const fileNameParts = file.name.split('.');
        const name = fileNameParts[0]; // filename without extension, use as name of selection  
        const result = fileReader.result;
        try {
            const value = JSON.parse(result); // recover object from JSON, catch syntax errors
            selectValues.addOption(name, value);
            if (!selectionChoiceUpdated) {
                // set selection to the first loaded preset
                selectValues.setValue(name);
                selectValues.onChange();
                selectionChoiceUpdated = true;
            }
        } catch (err) {
            alert('JSON syntax error in: ' + file.name);
        }
        loadNextFile();
    };

    fileReader.onerror = function() {
        loadNextFile();
    };

    loadNextFile();
};

/**
 * make an add values button for opening user defined objects (presets)
 * stored as JSON in text files
 * make that first loaded preset will be selected
 * @method ImageSelect#makeAddObjectsButton
 * @param {htmlElement} parent
 * @return Button, set fontsize later
 */
SelectValues.prototype.makeAddObjectsButton = function(parent) {
    const button = new Button(SelectValues.addObjectsButtonText, parent);
    // this uses an invisible button.fileInput input element, clicking on this button here makes a click on the input
    button.asFileInput(".txt");
    button.fileInput.setAttribute("multiple", "true");

    // adding events
    // maybe needs to be overwritten
    const selectValues = this;

    // this is the callback to be called via the file input element after all files have been choosen by the user
    button.onFileInput = function(files) {
        selectValues.readJSONFiles(files);
    };

    return button;
};

/**
 * add drag and drop to the window (for adding JSON objects)
 * @method SelectValues#addDragAndDropWindow
 */
SelectValues.prototype.addDragAndDropWindow = function() {
    const selectValues = this;
    window.ondragover = function(event) {
        event.preventDefault();
    };
    window.addEventListener('drop', function(event) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        selectValues.readJSONFiles(files);
    }, false);
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
 * @return whatever, the selected value
 */
SelectValues.prototype.getValue = function() {
    const result = this.values[this.select.getIndex()];
    return result;
};

/**
 * get the name
 * @method SelectValues#getName
 * @return string, the name of the actualselection
 */
SelectValues.prototype.getName = function() {
    const result = this.names[this.select.getIndex()];
    return result;
};

/**
 * find the index for a given value, only for basic values, does not compare objects
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