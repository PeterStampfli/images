/* jshint esversion: 6 */

import {
    guiUtils,
    SelectValues
}
from "../libgui/modules.js";

import {
    basic
} from './modules.js';

/**
 * using presets, including user defined ones
 * @namespace presets
 */
export const presets = {};

// presets in the collection have a name (shown in the selection
// and a JSON string that defines the kaleidoscope
// provide initial presets in an array
// elements are objects:
// field name is a string 
// field kaleidoscope is the property object

presets.collection = [];

// index to initial preset
const initialPreset = 2;

/**
 * make the gui and add some buttons
 * @method presets.makeGui
 * @param{Paramgui} parentGui
 * @param{Object} args - optional, modifying the gui
 */
presets.makeGui = function(parentGui, args = {}) {
    presets.gui = parentGui.addFolder('presets', args);
    const gui = presets.gui;
    presets.selectionController = gui.add({
        type: 'selection',
        params: presets,
        property: 'selectedValue',
        labelText: 'choices',
        options: presets.collection,
        onChange: function() {
            presets.useSelectedValue();
        }
    });
    // load presets
    SelectValues.addObjectsButtonText = "add presets (*.txt-files)";
    presets.selectionController.acceptUserObjects();
    // save preset
    // Filename will be name of preset, file content is JSON of properties
    presets.saveButton = gui.add({
        type: "button",
        buttonText: "save kaleidoscope",
        minLabelWidth: 20,
        onClick: function() {
            guiUtils.saveTextAsFile(basic.getJSON(), presets.saveName.getValue());
        }
    });
    presets.saveName = presets.saveButton.add({
        type: "text",
        initialValue: "preset",
        labelText: "as",
        textInputWidth: 150,
        minLabelWidth: 20
    });
    presets.saveName.addSpan('.txt');
};


/**
 * set the selected preset value from index to the presets.collection
 * @method presets.setSelectedValue
 * @param {integer} index
 */
presets.setSelectedValue = function(index) {
    presets.selectedValue = presets.collection[index].value;
};

/**
 * using the selected preset value
 * @method presets.useSelectedValue
 */
presets.useSelectedValue = function() {
    basic.setProperties(presets.selectedValue);
    basic.drawMapChanged();
};

// adding presets to the collection
//---------------------------------------------------

/**
 * adding a preset: name as string, value is JSON string (use'')
 * @method presets.add
 * @param {string} presetName
 * @param {string} JSONValue
 */
presets.add = function(presetName, JSONValue) {
    presets.collection.push({
        name: presetName,
        value: JSON.parse(JSONValue)
    });
};

presets.add('single circle','{"circles":[{"radius":1,"centerX":0,"centerY":0,"canChange":true,"isInsideOutMap":false,"isMapping":true,"color":"#ff0000","id":0}],"intersections":[]}');

presets.add('two intersecting circles','{"circles":[{"radius":1,"centerX":-1.0360876288058687,"centerY":0,"canChange":true,"isInsideOutMap":false,"isMapping":true,"color":"#ff0000","id":0},{"radius":1,"centerX":0.8660254037844384,"centerY":0,"canChange":true,"isInsideOutMap":false,"isMapping":true,"color":"#00ff00","id":1}],"intersections":[{"idCircle1":0,"idCircle2":1,"n":5}]}');

presets.add('three intersecting circles','{"circles":[{"radius":1,"centerX":0,"centerY":0.9020508075688771,"canChange":true,"isInsideOutMap":false,"isMapping":true,"color":"#ff0000","id":0},{"radius":1,"centerX":0.04341714846051642,"centerY":-0.8294557477809884,"canChange":true,"isInsideOutMap":false,"isMapping":true,"color":"#ee0000","id":1},{"radius":0.17425941432052647,"centerX":-0.1052460480689232,"centerY":0.04337044933599854,"canChange":true,"isInsideOutMap":true,"isMapping":true,"color":"#0000ff","id":2}],"intersections":[{"idCircle1":0,"idCircle2":1,"n":3},{"idCircle1":2,"idCircle2":0,"n":5},{"idCircle1":1,"idCircle2":2,"n":4}]}');

presets.add('four circles gasket','{"circles":[{"radius":1,"centerX":1.942890293094024e-16,"centerY":0.9020508075688771,"canChange":true,"isInsideOutMap":false,"isMapping":true,"color":"#ff0000","id":0},{"radius":1.3740135895694454,"centerX":-0.20253941803400638,"centerY":-1.1524332439714127,"canChange":true,"isInsideOutMap":false,"isMapping":true,"color":"#ee0000","id":1},{"radius":0.154681140944993,"centerX":-0.10249897729895652,"centerY":0.06287640142680494,"canChange":true,"isInsideOutMap":true,"isMapping":true,"color":"#0000ff","id":2},{"radius":0.12636490983098742,"centerX":0.1565787086706391,"centerY":0.04248776885771971,"canChange":true,"isInsideOutMap":true,"isMapping":true,"color":"#ee0000","id":4}],"intersections":[{"idCircle1":0,"idCircle2":1,"n":3},{"idCircle1":2,"idCircle2":0,"n":99},{"idCircle1":1,"idCircle2":2,"n":99},{"idCircle1":4,"idCircle2":1,"n":99},{"idCircle1":0,"idCircle2":4,"n":99},{"idCircle1":2,"idCircle2":4,"n":4}]}');

presets.add('four circles fractal','{"circles":[{"radius":10.00000000000004,"centerX":2.4000000000000137,"centerY":9.000000000000037,"canChange":true,"isInsideOutMap":false,"isMapping":true,"color":"#ff0000","id":0},{"radius":10,"centerX":2.399999999999985,"centerY":-9.477590650225736,"canChange":true,"isInsideOutMap":false,"isMapping":true,"color":"#00ff00","id":1},{"radius":1.2,"centerX":0.48444243810704357,"centerY":0.41031303190399804,"canChange":true,"isInsideOutMap":true,"isMapping":true,"color":"#ff00ff","id":2},{"radius":0.6868901027080808,"centerX":-0.4483298516240455,"centerY":-0.6103504134628567,"canChange":true,"isInsideOutMap":true,"isMapping":true,"color":"#0000ff","id":3}],"intersections":[{"idCircle1":0,"idCircle2":1,"n":4},{"idCircle1":0,"idCircle2":2,"n":99},{"idCircle1":1,"idCircle2":2,"n":2},{"idCircle1":0,"idCircle2":3,"n":2},{"idCircle1":2,"idCircle2":3,"n":2},{"idCircle1":1,"idCircle2":3,"n":99}]}');

presets.setSelectedValue(initialPreset);