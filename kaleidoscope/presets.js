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
        labelText: '',
        options: presets.collection,
        onChange: function() {
            presets.useSelectedValue();
        }
    }).addHelp('Choose from this list of predefined circle and intersection configurations. You can add your own saved *.txt files with JSON definitions to this list. Use the "add saved" button or drag and drop preset files on the window');
    // load presets
    SelectValues.addObjectsButtonText = "add saved";
    presets.selectionController.acceptUserObjects();
    presets.selectionController.addDragAndDropWindow();
    // save preset
    // Filename will be name of preset, file content is JSON of properties
    presets.saveButton = gui.add({
        type: "button",
        buttonText: "save",
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
    presets.saveName.addHelp('Save the current configuration of circles and intersections as JSON in a *.txt file. The file name will be used as its name.');
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

presets.add('single circle','{"circles":[{"radius":1,"centerX":0,"centerY":0,"canChange":true,"mapType":"outside -> in","color":"#ff0000","id":0}],"intersections":[]}');

presets.add('two intersecting circles','{"circles":[{"radius":1,"centerX":-1.0360876288058687,"centerY":0,"canChange":true,"mapType":"outside -> in","color":"#ff0000","id":0},{"radius":1,"centerX":0.8660254037844384,"centerY":0,"canChange":true,"mapType":"outside -> in","color":"#00ff00","id":1}],"intersections":[{"idCircle1":0,"idCircle2":1,"n":5}]}');

presets.add('three intersecting circles','{"circles":[{"radius":1,"centerX":1.942890293094024e-16,"centerY":0.9020508075688771,"canChange":true,"mapType":"outside -> in","color":"#ff0000","id":0},{"radius":1,"centerX":0.043417148460516225,"centerY":-0.8294557477809884,"canChange":true,"mapType":"outside -> in","color":"#ee0000","id":1},{"radius":0.17425941432052647,"centerX":-0.1052460480689232,"centerY":0.04337044933599854,"canChange":true,"mapType":"inside -> out","color":"#0000ff","id":2}],"intersections":[{"idCircle1":0,"idCircle2":1,"n":3},{"idCircle1":2,"idCircle2":0,"n":5},{"idCircle1":1,"idCircle2":2,"n":4}]}');

presets.add('four circles gasket','{"circles":[{"radius":1,"centerX":-1.0706713293728853e-14,"centerY":0.9020508075688782,"canChange":true,"mapType":"outside -> in","color":"#ff0000","id":0},{"radius":1.3740135895694425,"centerX":-0.20253941803400688,"centerY":-1.15243324397141,"canChange":true,"mapType":"outside -> in","color":"#ee0000","id":1},{"radius":0.154681140944993,"centerX":-0.10249897729895652,"centerY":0.06287640142680494,"canChange":true,"mapType":"inside -> out","color":"#0000ff","id":2},{"radius":0.12636490983098633,"centerX":0.1565787086706525,"centerY":0.042487768857719765,"canChange":true,"mapType":"inside -> out","color":"#ee0000","id":4}],"intersections":[{"idCircle1":0,"idCircle2":1,"n":3},{"idCircle1":2,"idCircle2":0,"n":99},{"idCircle1":1,"idCircle2":2,"n":99},{"idCircle1":4,"idCircle2":1,"n":99},{"idCircle1":0,"idCircle2":4,"n":99},{"idCircle1":2,"idCircle2":4,"n":4}]}');

presets.add('four circles fractal','{"circles":[{"radius":9.999999999999874,"centerX":2.3999999999999506,"centerY":8.999999999999883,"canChange":true,"mapType":"outside -> in","color":"#ff0000","id":0},{"radius":10,"centerX":2.3999999999999964,"centerY":-9.477590650225736,"canChange":true,"mapType":"outside -> in","color":"#00ff00","id":1},{"radius":1.2,"centerX":0.48444243810704357,"centerY":0.41031303190399804,"canChange":true,"mapType":"inside -> out","color":"#ff00ff","id":2},{"radius":0.6868901027080776,"centerX":-0.44832985162404215,"centerY":-0.6103504134628561,"canChange":true,"mapType":"inside -> out","color":"#0000ff","id":3}],"intersections":[{"idCircle1":0,"idCircle2":1,"n":4},{"idCircle1":0,"idCircle2":2,"n":99},{"idCircle1":1,"idCircle2":2,"n":2},{"idCircle1":0,"idCircle2":3,"n":2},{"idCircle1":2,"idCircle2":3,"n":2},{"idCircle1":1,"idCircle2":3,"n":99}]}');

presets.setSelectedValue(initialPreset);