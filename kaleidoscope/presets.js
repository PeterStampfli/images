/* jshint esversion: 6 */

/**
* using presets, including user defined ones
* @namespace presets
*/
export const presets={};



/**
 * make the gui and add some buttons
 * @method presets.makeGui
 * @param{Paramgui} parentGui
 * @param{Object} args - optional, modifying the gui
 */
presets.makeGui = function(parentGui, args = {}) {
    presets.gui = parentGui.addFolder('presets', args);

    
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