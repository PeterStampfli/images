/* jshint esversion: 6 */

// important parameters
//==================================================

// char/word for end of text (multiple texts on a file)
const endOfText = '|';

// connection to the ui
//==================================================

const openInputFile = document.querySelector('#openInput-file');
const inputText = document.querySelector('#input-text');
const addButton = document.querySelector('#add-button');
const openCollectionFile = document.querySelector('#openCollection-file');
const clearCollectionButton = document.querySelector('#clearCollection-button');
const collectionText = document.querySelector('#collection-text');
const saveButton = document.querySelector('#save-button');
const filenameInput = document.querySelector('#filename-input');

// reading files
//================================================

// reading files and putting text in a textarea
function readFiles(textarea,files){
        textarea.value = '';
        let currentFileNumber = 0;
        const fileReader = new FileReader();

        fileReader.onload = function() {
        	console.log('load')
            textarea.value +=fileReader.result;
            currentFileNumber += 1;
            if (currentFileNumber < files.length) {
                textarea.value += '\n';
                fileReader.readAsText(files[currentFileNumber]);
            }
        };
        fileReader.readAsText(files[0]);
}

// adding drag and drop to a textarea
function addDragAndDrop(textarea) {
    // we need dragover to prevent default loading of image, even if dragover does nothing else
    textarea.ondragover = function(event) {
        event.preventDefault();
    };
    textarea.ondrop = function(event) {
        event.preventDefault();
        const files = event.dataTransfer.files;
        readFiles(textarea,files);
    };
}

addDragAndDrop(inputText);
addDragAndDrop(collectionText);

// the open file buttons
openInputFile.onchange=function(){
	const files = openInputFile.files;
readFiles(inputText,files);
};

openCollectionFile.onchange=function(){
	const files = openCollectionFile.files;
readFiles(collectionText,files);
};

// other changes to the collection
//=======================================

addButton.onclick=function(){
collectionText.value+=inputText.value;
if (inputText.value.charAt(inputText.value.length-1)!=='\n'){
	collectionText.value+='\n';
}
collectionText.value+=endOfText+'\n';
inputText.value='';
};

clearCollectionButton.onclick=function(){
	collectionText.value='';
}

// saving the collection
//========================================

filenameInput.value='someText';

saveButton.onclick = function() {
    console.log('save');
    const text=collectionText.value;
    console.log(text);
    const blob=new Blob([text],{type: 'text/plain'})

    const filename=filenameInput.value+'.txt';

      const objURL = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    document.body.appendChild(a);
    a.href = objURL;
    a.download = filename;
    a.click();
    a.remove();
    URL.revokeObjectURL(objURL);

};
