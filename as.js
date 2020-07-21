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
            makeTextStream(word);
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
// empty string is for begin of text
const words = [''];

// for each word an array of indices to next words
// defines word pairs too
const wordsToNextWordIndices = [
    []
];

// for each word an array of transition frequencies to next words
const wordsToNextWordsFrequencies = [
    []
];

// for each word a sum of the transition frequencies, including transition to end of text
const wordsSumOfTransitionFrequencies = [0];

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
// its length is about the number of words, a power of two ?
wordHashTable.length = Math.pow(2, 14);
console.log(wordHashTable.length);
// factor for combining the character integer values, about the number of different chars
// should not be a divisor of the hash table length
const hashFactor = 85;
// in case of collision: hop by this distance
const collisionDistance = 123;

function findIndex(word) {
    const hashTableLength = wordHashTable.length;
    let index = 0;
    if (words.length === hashTableLength) {
        console.error('hash table is full, length: ' + hashTableLength);
        return 0;
    }
    for (var i = 0; i < word.length; i++) {
        index = (index * hashFactor + integerOfChar(word.charAt(i))) % hashTableLength;
    }
    // search for the word as long as we find hash table entries
    while (isDefined(wordHashTable[index])) {
        const result = wordHashTable[index];
        // check if hash table entry is index to given word
        if (words[result] === word) {
            return result;
        }
        index += collisionDistance;
        if (index >= hashTableLength) {
            index -= hashTableLength;
        }
    }
    // not found, make new entry
    const result = words.length;
    words.push(word);
    // add initialized data for transitions
    wordsToNextWordIndices.push([]);
    wordsToNextWordsFrequencies.push([]);
    wordsSumOfTransitionFrequencies.push(0);
    wordHashTable[index] = result;
    return result;
}

function makeTextStream(word) {
    console.log(word);
    if (word === endOfTextChar) {
        // text is complete, analyze, update transition tables
        analyzeText(inputText);
        inputText.length = 0;
    } else {
        const wordIndex = findIndex(word);
        console.log(wordIndex, word);
        inputText.push(wordIndex);
    }
}

// analyze the text, make transition table
//==========================================

function analyzeText(text){
    console.log(text);
    const textLength = text.length;

    if (textLength >= 2) {
        // index of current word to word table and to transition table
        let currentWordIndex = 0; // begin of text
        for (var i = 0; i < textLength; i++) {
            const nextWordIndex = text[i];
            // tables for the transitions of the current word
            const toNextWordIndices = wordsToNextWordIndices[currentWordIndex];
            const toNextWordsFrequencies = wordsToNextWordsFrequencies[currentWordIndex];
            // see if there is already data for the transition to the next word
            // and get the index
            let transitionIndex = toNextWordIndices.indexOf(nextWordIndex);
            if (transitionIndex < 0) {
                // transition not found, add initialized data
                transitionIndex = toNextWordIndices.length;
                toNextWordIndices.push(nextWordIndex);
                toNextWordsFrequencies.push(0);
            }
            // increase the transition frequencies
            toNextWordsFrequencies[nextWordIndex] += 1;
            wordsSumOfTransitionFrequencies[currentWordIndex] += 1;


            currentWordIndex = nextWordIndex;
        }

        // for the end of text we increase the sum of transitions
        // default for transitions is end of text
        wordsSumOfTransitionFrequencies[currentWordIndex] += 1;
    }
}