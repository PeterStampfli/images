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
    presets.selectionController=gui.add({
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
    SelectValues.addObjectsButtonText = "add my own kaleidoscopes";
    presets.selectionController.acceptUserObjects();
// save preset
// Filename will be name of preset, file content is JSON of properties
    presets.saveButton = gui.add({
        type: "button",
        buttonText: "save kaleidoscope",
        minLabelWidth: 20,
        onClick: function() {
guiUtils.saveTextAsFile(basic.getJSON(),presets.saveName.getValue());
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
 * set the selected preset value from indexx to the presets.collection
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


// saving and recalling

// guiUtils.saveTextAsFile = function(text, filename) {


/*

const fileInput = document.querySelector('#file-input');
fileInput.onchange = function() {
    const files = fileInput.files;
    let currentFileNumber = 0;
    const fileReader = new FileReader();

    fileReader.onload = function() {
        const result = fileReader.result;
        makeCharStream(result);
        currentFileNumber += 1;
        if (currentFileNumber < files.length) {
            fileReader.readAsText(files[currentFileNumber]);
        }
    };

    fileReader.readAsText(files[0]);
};

ImageSelect.prototype.makeAddImageButton = function(parent) {
    const button = new Button(ImageSelect.addImageButtonText, parent);
    // this uses an invisible button.fileInput input element, clicking on this button here makes a click on the input
    button.asFileInput("image/*");  // '.txt'
    button.fileInput.setAttribute("multiple", "true");
    button.setFontSize(this.design.buttonFontSize);

    // adding events
    // maybe needs to be overwritten
    const imageSelect = this;

    button.onInteraction = function() {
        imageSelect.interaction();
    };

    // this is the callback to be called via the file input element after all files have been choosen by the user
    button.onFileInput = function(files) {
        // files is NOT an array
        let selectThis = true;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            imageSelect.addUserImage(file, selectThis);
            // select only the first good image file
            selectThis = selectThis && !guiUtils.isGoodImageFile(file.name);
        }
    };

    return button;
};

*/

// adding presets to the collection
//---------------------------------------------------

presets.collection.push({
    name: "*: lonely circle",
    value: {
        circles: [{
            radius: 1,
            centerX: 0,
            centerY: 0,
            canChange: true,
            isInsideOutMap: false,
            isMapping: true,
            color: "#ff0000",
            id: 0
        }],
        intersections: []
    }
});

presets.collection.push({
    name: "*5: two intersecting circles",
    value: {
        circles: [{
            radius: 1,
            centerX: -1.0360876288058687,
            centerY: 0,
            canChange: true,
            isInsideOutMap: false,
            color: '#ff0000',
            id: 0
        }, {
            radius: 1,
            centerX: 0.8660254037844386,
            centerY: 0,
            canChange: true,
            isInsideOutMap: false,
            color: '#00ff00',
            id: 1
        }],
        intersections: [{
            idCircle1: 0,
            idCircle2: 1,
            n: 5,
            color: '#ff0000'
        }]
    }
});

presets.collection.push({
    name: "*33: three circles, two intersections",
    value: {
        circles: [{
            radius: 0.6898979485566357,
            centerX: 0,
            centerY: 0,
            canChange: true,
            isInsideOutMap: false,
            color: '#ff0000',
            id: 0
        }, {
            radius: 0.4,
            centerX: -0.6,
            centerY: 0,
            canChange: true,
            isInsideOutMap: true,
            color: '#00ff00',
            id: 1
        }, {
            radius: 0.4,
            centerX: 0.6,
            centerY: 0,
            canChange: true,
            isInsideOutMap: true,
            color: '#ff00ff',
            id: 2
        }],
        intersections: [{
            idCircle1: 0,
            idCircle2: 1,
            n: 3,
            color: '#ff0000'
        }, {
            idCircle1: 0,
            idCircle2: 2,
            n: 3,
            color: '#00ff00'
        }]
    }
});

presets.collection.push({
    name: '*334: three circles, three intersections',
    value: {
        circles: [{
            radius: 1,
            centerX: 0.11957315586905015,
            centerY: 0.16910197872576277,
            canChange: true,
            isInsideOutMap: false,
            color: '#ff0000',
            id: 0
        }, {
            radius: 1,
            centerX: 0.8660254037844386,
            centerY: 5.551115123125783e-17,
            canChange: true,
            isInsideOutMap: true,
            color: '#00ff00',
            id: 1
        }, {
            radius: 1,
            centerX: -0.8660254037844386,
            centerY: 5.551115123125783e-16,
            canChange: true,
            isInsideOutMap: true,
            color: '#ff00ff',
            id: 2
        }],
        intersections: [{
            idCircle1: 0,
            idCircle2: 1,
            n: 4,
            color: '#ff0000'
        }, {
            idCircle1: 0,
            idCircle2: 2,
            n: 3,
            color: '#00ff00'
        }, {
            idCircle1: 1,
            idCircle2: 2,
            n: 3,
            color: '#ff00ff'
        }]
    }
});

presets.collection.push({
    name: "*??: four circles, 6 interssections, tetrahedron",
    value: {
        circles: [{
            radius: 0.2101245228749845,
            centerX: 0.13854167954197485,
            centerY: -0.20738527270744167,
            canChange: true,
            isInsideOutMap: true,
            color: '#ff0000',
            id: 0
        }, {
            radius: 0.36397025780577524,
            centerX: 0.6688861940332455,
            centerY: -0.14806320915239415,
            canChange: true,
            isInsideOutMap: true,
            color: '#00ff00',
            id: 1
        }, {
            radius: 0.5232793284999671,
            centerX: 0.5742606680165471,
            centerY: 0.15055680896431697,
            canChange: true,
            isInsideOutMap: false,
            color: '#ff00ff',
            id: 2
        }, {
            radius: 0.49999999999999983,
            centerX: 0.2000000000000004,
            centerY: 0.5000000000000002,
            canChange: true,
            isInsideOutMap: true,
            color: '#0000ff',
            id: 3
        }],
        intersections: [{
            idCircle1: 0,
            idCircle2: 1,
            n: 4,
            color: '#ff0000'
        }, {
            idCircle1: 0,
            idCircle2: 2,
            n: 2,
            color: '#00ff00'
        }, {
            idCircle1: 0,
            idCircle2: 3,
            n: 99,
            color: '#ff00ff'
        }, {
            idCircle1: 1,
            idCircle2: 2,
            n: 5,
            color: '#0000ff'
        }, {
            idCircle1: 1,
            idCircle2: 3,
            n: 4,
            color: '#000000'
        }, {
            idCircle1: 2,
            idCircle2: 3,
            n: 3,
            color: '#ff0000'
        }]
    }
});

presets.collection.push({
    name: '*??: four circles, 6 intersections, touching',
    value: {
        circles: [{
            radius: 10,
            centerX: 2.4,
            centerY: 9,
            canChange: true,
            isInsideOutMap: false,
            color: '#ff0000',
            id: 0
        }, {
            radius: 10,
            centerX: 2.4,
            centerY: -9.477590650225736,
            canChange: true,
            isInsideOutMap: false,
            color: '#00ff00',
            id: 1
        }, {
            radius: 1.2,
            centerX: 0.48444243810704357,
            centerY: 0.41031303190399804,
            canChange: true,
            isInsideOutMap: true,
            color: '#ff00ff',
            id: 2
        }, {
            radius: 0.6868901027080727,
            centerX: -0.4483298516240479,
            centerY: -0.6103504134628539,
            canChange: true,
            isInsideOutMap: true,
            color: '#0000ff',
            id: 3
        }],
        intersections: [{
            idCircle1: 0,
            idCircle2: 1,
            n: 4,
            color: '#ff0000'
        }, {
            idCircle1: 0,
            idCircle2: 2,
            n: 99,
            color: '#00ff00'
        }, {
            idCircle1: 1,
            idCircle2: 2,
            n: 2,
            color: '#ff00ff'
        }, {
            idCircle1: 0,
            idCircle2: 3,
            n: 2,
            color: '#0000ff'
        }, {
            idCircle1: 2,
            idCircle2: 3,
            n: 2,
            color: '#000000'
        }, {
            idCircle1: 1,
            idCircle2: 3,
            n: 99,
            color: '#ff0000'
        }]
    }
});

presets.setSelectedValue(initialPreset);
