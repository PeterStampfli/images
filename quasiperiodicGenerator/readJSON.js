/* jshint esversion: 6 */

// https://jsonchecker.com/

export const readJSON = {};

readJSON.result = {};
readJSON.name='';
var theAction = function() {};

const fileReader = new FileReader();
var file;

fileReader.onload = function() {
    const result = fileReader.result;
    try {
        readJSON.result = JSON.parse(result);
    } catch (err) {
        alert('JSON syntax error in: ' + file.name+'\n\ncheck with https://jsonchecker.com/');
return;
    }
    readJSON.name=file.name.split('.')[0];
        theAction();
};

readJSON.makeButton = function(gui, action) {
	theAction=action;
    const controller = gui.add({
        type: 'button',
        buttonText: 'open file with structure data'
    });
    controller.uiElement.asFileInput('.txt');
    controller.uiElement.onFileInput = function(files) {
        file = files[0];
        fileReader.readAsText(file);
    };
};