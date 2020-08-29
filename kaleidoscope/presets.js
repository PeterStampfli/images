/* jshint esversion: 6 */

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

/**
 * make the gui and add some buttons
 * @method presets.makeGui
 * @param{Paramgui} parentGui
 * @param{Object} args - optional, modifying the gui
 */
presets.makeGui = function(parentGui, args = {}) {
    presets.gui = parentGui.addFolder('presets', args);
    const gui = presets.gui;
    gui.add({
    	type:'selection',
    	params:presets,
    	property:'selectedValue',
labelText:'choice',
options:presets.collection
    })

};


/**
* set the selected preset value from indexx to the presets.collection
* @method presets.setSelectedValue
* @param {integer} index
*/
presets.setSelectedValue=function(index){
 presets.selectedValue=presets.collection[index].value;
};

/**
 * using the selected preset value
 * @method presets.useSelectedValue
 */
presets.useSelectedValue = function() {

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
    name: "* (lonely circle)",
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
    name: "*5 (two intersecting circles)",
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

presets.setSelectedValue(1);
