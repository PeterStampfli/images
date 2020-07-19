/* jshint esversion: 6 */

// important parameters
//==================================================

// make it possible to use word pair transitions ?
const usePairs = true;

// char/word for end of text (multiple texts on a file)
const endOfTextChar = '|';

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

// files can have multiple text parts, their ends end are marked by the endOfTextChar
// the end of a file is an end of text too and has this marker

function makeCharStream(text) {
    for (var i = 0; i < text.length; i++) {
        makeWordStream(text.charAt(i));
    }
    // end of file is same as end of text
    makeWordStream(endOfTextChar);
}

// transform char stream into a word stream
// skip whitespace, group characters together to make a stream of words
//====================================================================

// end of text is a special word (of the endOfTextChar mark)

let doingWhitespace = true;
let word = '';

function makeWordStream(char) {
    console.log(char);
    if (char === endOfTextChar) {
        // end of text as a special word
        if (!doingWhitespace) {
            // end of text directly after a word, use this word
            doWord(word);
            // doing whitespace in the beginning of next text
            doingWhitespace = true;
        }
        makeTextStream(endOfTextChar);
    } else if (doingWhitespace) {
        if (whitespaces.indexOf(char) < 0) {
            // end of whitespace, begin a new word
            doingWhitespace = false;
            word = char;
        }
        // else char is a whitespace, continue whitespace: do nothing with this char
    } else if (whitespaces.indexOf(char) >= 0) {
        // char is a first whitespace, end the word, begin whitespace
        makeTextStream(word);
        doingWhitespace = true;
    } else {
        // no special chars, add to the current word
        word += char;
    }
}

// transform word stream into a stream of texts
// each word is transformed into an index to a table of words
// a text is an array of these indices
//=========================================

// an array of strings, contains each word of the texts
const words = [];

// an array of integers, indices to the words array
const inputText = [];

// get a unique integer for each char
let chars = ''; // table for the characters, is initially empty

function integerOfChar(char) {
    result = chars.indexOf(char);
    if (result < 0) {
        result = chars.length;
        chars += char;
    }
    return result;
}

// the word hash table is an array of integer arrays, 
// each array has indices to the words array for words with with the same hash code
// thus no problems with collision, may not be the most efficient solution
const wordHashTable = [];
// its length is about the number of words, a prime numer ?
wordHashTable.length = 10067;
// factor for combining the character integer values, about the number of different chars
// should not be a divisor of the hash table length
const hashFactor = 85;

function findIndex(word) {
    var result, i;
    const hashTableLength = wordHashTable.length;
    let index = 0;
    for (i = 0; i < word.length; i++) {
        index = (index * hashFactor + integerOfChar(word.charAt(i))) % hashTableLength;
    }
    if (isUndefined(wordHashTable[index])) {
        wordHashTable[index] = [];
    }
    const hashResult = wordHashTable[index];
    console.log(hashResult);
    // hash result has only indices  to the words, not the words themselves, thus cannot use indexOf()
    result = -1;
    for (i = 0; i < hashResult.length; i++) {
        if (words[hashResult[i]] === word) {
            result = hashResult[i];
            break;
        }
    }
    if (result < 0) {
        result = words.length;
        hashResult.push(result);
        words.push(word);
        // add transition data, word to word
        //    wordsTransitionWeights.push([]);
        //   wordsTransitionTargets.push([]);
        //   wordsTransitionSums.push(0);
    }
    return result;
}

function makeTextStream(word) {
    console.log(word);
    if (word === endOfTextChar) {
        // text is complete, analyze, update transition tables
        inputText.length = 0;
    } else {
        const wordIndex = findIndex(word);
        console.log(wordIndex, word);
        inputText.push(wordIndex);
    }
}