/* jshint esversion: 6 */

// important parameters
//==================================================

// make it possible to use word pair transitions ?
const usePairs = true;

// char/word for end of text (multiple texts on a file)
const endOfText = '|';

// collection of whitespace characters
const whitespaces = ' \n';

// limit for the length of texts
const maxTextLength = 200;

// maximum for word index (maximum number of words/wordfragments)
const maxWordsLength = 100000;

// connection to the ui
//==================================================

const fileInput = document.querySelector('#file-input');

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

// data structures (see dataStructure.txt)
//===================================================

// words and characters
//--------------------------------------------

// an array of strings, 
// each string is a word of the text the words are nodes of a tree
// the collection of words has initially only an empty word (string) as root node
const words = [''];

// an array of integer arrays
// each text becomes an array of indices
// save texts to check if a result is a mere copy
// initially no text, empty array
const inputTexts = [];

// an array of strings, 
// each character of the strings characterizes a branch to a longer word
// the first word has no branches yet, thus the empty string
const wordsMoreChars = [''];

// an array of arrays of integers. 
// each integer is the index to the new word node reached by the branch.
// the first word has no branches yet. thus an array with an empty array as element
const wordsMoreWords = [
    []
];

// transitions from a single word to a new word
//--------------------------------------------------

// an array of arrays of integers, 
// each integer is the weight of the transition from a first word to a second one (corresponds to order of indices)
// the root word has not yet any transition, thus an array with an empty array element
const wordsTransitionWeights = [
    []
];

// an array of integers, 
// each integer is the sum of the transition weights to a second word
// plus the weight of the transition to the end of text
// no transition for the first word, the sum is thus zero
const wordsTransitionSums = [0];

// an array of integer arrays
// each integer is the index for the word reached by the transition
// this array defines all word pairs of the text
// the first word has not yet any transition, thus an array with an empty array element
const wordsTransitionTargets = [
    []
];

// pairs of words
//------------------------------------------------

// pairs of words (wordIndex, newWordIndex) result from 
// wordsTransitionTargets[wordindex] [transitionIndex(wordIndex,newWordIndex)] = newWordIndex

// an array of integers
// each integer defines a word pair
// it is the sum of maxWordsLength times the first word index plus the second word index
// this gives a safe integer, assuming that there are not more than maxWordsLength==100'000 words

// there is only a root word pair, made of two empty words of index 0
// thus an array with zero as only element
const pairs = [0];

// transition from pairs to single words 
//------------------------------------------------------
// (essentially the same as transitions from a single word to a new word)

// an array of arrays of integers, 
// each integer is the weight of the transition from a word pair to a new word (corresponds to order of indices)
// the root pair has not yet any transition, thus an array with an empty array element
const pairsTransitionWeights = [
    []
];

// an array of integers, 
// each integer is the sum of the transition weights to a new word
// plus the weight of the transition to the end of text
// no transition yet for the root pair, the sum is thus zero
const pairsTransitionSums = [0];

// an array of integer arrays
// each integer is the index for the word reached by the transition
// the root pair has not yet any transition
const pairsTransitionTargets = [
    []
];

// utilities
//========================================

function isDefined(thing) {
    return ((typeof thing) !== "undefined") && (thing !== null);
}

function isUndefined(thing) {
    return ((typeof thing) === "undefined") || (thing === null);
}

// setting up the file input
//======================================================

// reading multiple files, make a stream of chars

fileInput.onchange = function() {
    const files = fileInput.files;
    let currentFileNumber = 0;
    const fileReader = new FileReader();

    fileReader.onload = function() {
        const result = fileReader.result;
        for (i = 0; i < result.length; i++) {
            doChar(result.charAt(i));
        }
        // end of file is same as end of text
        doChar(endOfText);
        currentFileNumber += 1;
        if (currentFileNumber < files.length) {
            fileReader.readAsText(files[currentFileNumber]);
        } else {
            if (words.length === maxWordsLength) {
                console.log('too many words/wordfragments: words.length ' + words.length + ' limit is ' + maxWordsLength);
            }
            console.log('finished reading');
            console.log(words);
            console.log(wordsMoreChars);
            console.log(wordsTransitionSums);
            console.log(pairs);
        }
    };

    fileReader.readAsText(files[0]);
};


// working with the char stream
//============================================

let doingWhitespace = true;
let word = '';

// making a stream of words

function doChar(char) {
    if (char === endOfText) {
        // end of text as a special word
        if (!doingWhitespace) {
            // end of text directly after a word, use this word
            doWord(word);
            // doing whitespace in the beginning of next text
            doingWhitespace = true;
        }
        doWord(endOfText);
    } else if (doingWhitespace) {
        if (whitespaces.indexOf(char) < 0) {
            // end of whitespace, begin a new word
            doingWhitespace = false;
            word = char;
        }
        // else char is a whitespace, continue whitespace: do nothing with this char
    } else if (whitespaces.indexOf(char) >= 0) {
        // char is a first whitespace, end the word, begin whitespace
        doWord(word);
        doingWhitespace = true;
    } else {
        // no special chars, add to the current word
        word += char;
    }
}

// working with the word stream
//=========================================

// make a list of words, index the words, transform text into an array of integers

// using a hash table
// get a unique integer for each char
let chars = ''; // table for the charaacters, is initially empty

function integerOfChar(char) {
    result = chars.indexOf(char);
    if (result < 0) {
        result = chars.length;
        chars += char;
    }
    return result;
}

// the word hash table is an array of integer arrys, thus no problems with collision
// integers are indices to the words array
const wordHashTable = [];
// its length is about the number of words, a prime numer ?
wordHashTable.length = 10067;
// factor for combining the character integer values, about the number of different chars
// should not be a divisor of the hash table length
const hashFactor = 85;

function findIndexWithHash(word) {
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
    console.log(hashResult)
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
        wordsTransitionWeights.push([]);
        wordsTransitionTargets.push([]);
        wordsTransitionSums.push(0);
    }
    return result;
}

// find rapidly the index of a word from a tree, add word to list of words if not there, add a textNode
function findIndex(word) {
    let wordIndex = 0; // root
    let wordFragment = '';
    for (var i = 0; i < word.length; i++) {
        const char = word.charAt(i);
        wordFragment += char;
        let moreChars = wordsMoreChars[wordIndex];
        let moreWords = wordsMoreWords[wordIndex];
        let branchIndex = moreChars.indexOf(char);
        if (branchIndex < 0) {
            // add a new branch
            branchIndex = moreChars.length;
            moreChars += char; // makes a new string
            wordsMoreChars[wordIndex] = moreChars;
            moreWords.push(words.length);
            // add word with empty branch list
            words.push(wordFragment);
            wordsMoreChars.push('');
            wordsMoreWords.push([]);
            // add transition data, word to word
            wordsTransitionWeights.push([]);
            wordsTransitionTargets.push([]);
            wordsTransitionSums.push(0);
        }
        wordIndex = moreWords[branchIndex];
    }
    return wordIndex;
}

// put together words of one text into an array of word indices representing the text
//-------------------------------------------------------------------------------------

let inputText = [];

function doWord(word) {
    if (word === endOfText) {
        // text is complete, analyze
        inputTexts.push(inputText);
        doText(inputText);
    } else {
        const wordIndex = findIndex(word);
        console.log(wordIndex, word);
        inputText.push(wordIndex);
    }
}

// work with text as array of indices: make transition table
//==================================================================

// input is array of word indizes
function doText(inputText) {
    console.log(inputText);
    // only texts of at least two words (one transition from word to word)
    if (inputText.length >= 2) {
        // index to word table with transition from word to nextWord
        // the root word
        let wordIndex = 0;
        // index for the next word, that defines the transition
        let nextWordIndex = 0;
        // doing pairs, the root pair
        let pair = 0;


        for (var i = 0; i < inputText.length; i++) {
            nextWordIndex = inputText[i];
            // update the transition tables of the last word
            let transitionTargets = wordsTransitionTargets[wordIndex];
            let transitionWeights = wordsTransitionWeights[wordIndex];
            // now we have to find the index of transition to the new word
            let transitionIndex = transitionTargets.indexOf(nextWordIndex);
            if (transitionIndex < 0) {
                // it is missing, create new one
                transitionIndex = transitionTargets.length;
                transitionTargets.push(nextWordIndex);
                transitionWeights.push(0);
                if (usePairs) {
                    // we have a new pair, its index is equal to transitionIndex
                    pairs.push(wordIndex * maxWordsLength + nextWordIndex);
                }
            }
            transitionWeights[transitionIndex] += 1;
            wordsTransitionSums[wordIndex] += 1;
            wordIndex = nextWordIndex;
        }
        // for the end we increase the sum of transitions of the last word
        wordsTransitionSums[wordIndex] += 1;
    }
}

// creating a text
//=============================================================

// check if a text is a copy of an input text
// by comparing indices
function isCopyOfInput(textIndices) {
    const length = inputTexts.length;
    const textLength = textIndices.length;
    for (var textIndex = 0; textIndex < length; textIndex++) {
        const inputText = inputTexts[textIndex];
        if (textLength === inputText.length) {
            let isCopy = true;
            for (var wordIndex = 0; wordIndex < textLength; wordIndex++) {
                if (textIndices[wordIndex] !== inputText[wordIndex]) {
                    isCopy = false;
                    break;
                }
            }
            if (isCopy) {
                return true;
            }
        }
    }
    return false;
}

// decoding an array of integer indices to words
// as a string, insert spaces between words and add new line at end
function decode(textIndices) {
    text = '';
    const textLengthM1 = textIndices.length - 1;
    for (var wordIndex = 0; wordIndex < textLengthM1; wordIndex++) {
        text += words[textIndices[wordIndex]] + ' ';
    }
    text += words[textIndices[textLengthM1]] + '\n';
    return text;
}


// selecting one transition, random, depending on total sum and weights
// returns index to a transitionIndexTable if result>=0
// result=-1 means end of text
function randomTransitionIndex(sum, transitionWeights) {
    let selector = 1 + Math.floor(sum * Math.random());
    const length = transitionWeights.length;
    for (var i = 0; i < length; i++) {
        selector -= transitionWeights[i];
        if (selector <= 0) {
            return i;
        }
    }
    return -1;
}






// transitions between single words
//========================================

// returns text as an array of word indices

function createTextSingleWords() {
    if (wordsTransitionSums[0] === 0) {
        return 'First read something...';
    }
    let textIndices = [];
    // index to word table with transition from word to nextWord
    let wordIndex = 0;
    // index for the next word, that defines the transition
    let nextWordIndex = 0;
    // do transitions until there is no transition to a word => end of text
    while (true) {
        const sumOfWeights = wordsTransitionSums[wordIndex];
        const transitionWeights = wordsTransitionWeights[wordIndex];
        // make random transition to a new word
        // choose the transition
        const transitionIndex = randomTransitionIndex(sumOfWeights, transitionWeights);
        if (transitionIndex >= 0) {
            // transition to a new word, get its index from the tables
            const transitionTargets = wordsTransitionTargets[wordIndex];
            nextWordIndex = transitionTargets[transitionIndex];
            // and add to text
            textIndices.push(nextWordIndex);
        } else {
            return textIndices;
        }
        wordIndex = nextWordIndex;
    }
}

