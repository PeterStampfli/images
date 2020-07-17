/* jshint esversion: 6 */

// important parameters
//==================================================

// make it possible to use word pair transitions ?
const usePairs = true;

// char/word for end of text (multiple texts on a file)
const endOfText = '|';

// collection of whitespace characters (space and new line)
const whitespaces = ' \n';

// limit for the length of output texts, in chars
const maxTextLength = 200;

// utilities
//========================================

function isDefined(thing) {
    return ((typeof thing) !== "undefined") && (thing !== null);
}

function isUndefined(thing) {
    return ((typeof thing) === "undefined") || (thing === null);
}

// connection to the ui
//==================================================

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

const generateSingles = document.querySelector('#generate-singles');
generateSingles.onclick = function() {
    console.log('generate singles');
    let text = '';
    while ((text.length === 0) || (text.length > maxTextLength)) {
        text = createTextSingleWords();
        console.log(isCopyOfInput(text));
    }
    textOutput.textContent = decode(text);
};

const generatePairs = document.querySelector('#generate-pairs');
if (!usePairs) {
    generatePairs.style.display = 'none';
}

const textOutput = document.querySelector('#text-output');

const copyButton = document.querySelector('#copy-button');
copyButton.onclick = function() {
    textOutput.select();
    document.execCommand("copy");
};

// reading a file and making a character stream
//===================================================

// files can have multiple text parts, their ends end are marked by endOfText-character
// the end of a file is an end of text too and has this marker

function makeCharStream(text) {
    for (var i = 0; i < text.length; i++) {
        makeWordStream(text.charAt(i));
    }
    // end of file is same as end of text
    doChar(endOfText);
}

// skip whitespace, group characters together to make a stream of words
//====================================================================

// end of text is a special word (of the endOfText marking character)

function makeWordStream(ch) {
    console.log(ch);
}
