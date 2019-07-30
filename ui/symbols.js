/**
 * writing orbifold symbols
 * @namespace symbols
 */

/* jshint esversion:6 */

DOM.style("body", "fontFamily", "'Open Sans', Arial, sans-serif");



symbol = new SpecialInput("symbolsInput");

symbol.setWidth(200);

symbol.setText("*532");
symbol.setFocus(true);

DOM.style("#result", "color", "green");


symbol.onEnter = function() {
    symbol.colorBlack();
    let result = "Doing the symmetry of symbol: " + symbol.text;
    parse();
    if (wonders > 0) {
        result += "<br>wonders: " + wonders;
    }
    if (miracles > 0) {
        result += "<br>miracles: " + miracles;
    }
    if (gyrations.length > 0) {
        result += "<br>gyrations: " + gyrations;
    }
    if (kaleidoscopes.length > 0) {
        for (var i = 0; i < kaleidoscopes.length; i++) {
            result += "<br>kaleidoscope: " + kaleidoscopes[i];
        }
    }


    document.getElementById("result").innerHTML = result;
};



const miracleButton = symbol.createAddCharButton("symbolChars", "x");
DOM.addSpace("symbolChars");
const wonderButton = symbol.createAddCharButton("symbolChars", "o");
DOM.addSpace("symbolChars");
const kaleidoscopeButton = symbol.createAddCharButton("symbolChars", "*");
DOM.addSpace("symbolChars");
const leftBraceButton = symbol.createAddCharButton("symbolChars", "(");
DOM.addSpace("symbolChars");
const rightBraceButton = symbol.createAddCharButton("symbolChars", ")");


const button0 = symbol.createAddCharButton("zeroToFour", "0");
DOM.addSpace("zeroToFour");
const button1 = symbol.createAddCharButton("zeroToFour", "1");
DOM.addSpace("zeroToFour");
const button2 = symbol.createAddCharButton("zeroToFour", "2");
DOM.addSpace("zeroToFour");
const button3 = symbol.createAddCharButton("zeroToFour", "3");
DOM.addSpace("zeroToFour");
const button4 = symbol.createAddCharButton("zeroToFour", "4");


const button5 = symbol.createAddCharButton("fiveToNine", "5");
DOM.addSpace("fiveToNine");
const button6 = symbol.createAddCharButton("fiveToNine", "6");
DOM.addSpace("fiveToNine");
const button7 = symbol.createAddCharButton("fiveToNine", "7");
DOM.addSpace("fiveToNine");
const button8 = symbol.createAddCharButton("fiveToNine", "8");
DOM.addSpace("fiveToNine");
const button9 = symbol.createAddCharButton("fiveToNine", "9");
DOM.addSpace("fiveToNine");
const inftyButton = symbol.createAddCharButton("fiveToNine", "∞");


symbol.createStepLeftButton("controls", "<=");
DOM.addSpace("controls");
symbol.createStepRightButton("controls", "=>");
DOM.addSpace("controls");
symbol.createClearCharButton("controls", "C");
DOM.addSpace("controls");
symbol.createClearAllButton("controls", "CE");
DOM.addSpace("controls");
symbol.createEnterButton("controls", "enter");
DOM.addSpace("controls");
symbol.createCopyButton("controls", "copy");

symbol.createSetTextButton("examples", "2222");
DOM.addSpace("examples");
symbol.createSetTextButton("examples", "*732");

//inftyButton.setActive(false);
//button0.setActive(false);
//inftyButton.setActive(true);


// parsing, yet without button switching ...

/*
 * for signaling fail to calling routines
 */
let failParsing = false;
const valueInfinity = 9999999;

/*
 * start parsing
 */
function startParsing() {
    symbol.startParsing();
    failParsing = false;
}

/*
 * mark error in parsing, only first occurence
 */
function failure() {
    if (!failParsing) {
        symbol.markErrorParsing();
        failParsing = true;
    }
}

/*
 * parse a number (fault tolerant)
 * single digit 1...9 returns number
 *  "∞" returns string "∞"
 * left brace, single digit 1...9, repeating digit 0...9 right brace, returns number
 * 
 * return value of number >=0 if it is a number, or the string "∞"
 * return value may be 0  as a number
 * return -1 if error
 * parsing position is advanced past end of number
 */

function parseNumber() {
    //  infinity is accepted,check if there is an infinity symbol
    if (symbol.isCharParsing("∞")) {
        symbol.advanceParsing();
        return "∞";
    }
    if (symbol.isCharParsing("123456789")) {
        // good single digit number
        const value = parseInt(symbol.getCharParsing(), 10);
        symbol.advanceParsing();
        return value;
    } else if (symbol.isCharParsing("0")) {
        // error: single zero, mark error, return 0 as number (diagnostic later)
        failure();
        symbol.advanceParsing();
        return 0;
    } else if (symbol.isCharParsing("(")) {
        // multi digit number in braces
        symbol.advanceParsing();
        if (symbol.isCharParsing("∞")) {
            failure();
            symbol.advanceParsing();
            return valueInfinity;
        }
        if (!symbol.isCharParsing("0123456789")) {
            // not a digit, thus not a number, mark error
            failure();
            return -1;
        }
        if (symbol.isCharParsing("0")) {
            // first digit is zero: mark error, continue
            failure();
        }
        let numberString = "";
        while (symbol.isCharParsing("0123456789")) {
            numberString += symbol.getCharParsing();
            symbol.advanceParsing();
        }
        if (symbol.isCharParsing(")")) {
            // the finishing right brace is ok
            symbol.advanceParsing();
        } else {
            // missing right brace: mark error, continue
            failure();
        }
        return parseInt(numberString, 10);
    } else {
        return -1;
    }
}

/**
 * parse a series of numbers, put in array, ignore 0 as number but continue
 * return empty array if no numbers
 */

function parseNumbers() {
    const numbers = [];
    let number = parseNumber();
    while (number !== -1) {
        if (number !== 0) {
            numbers.push(number);
        }
        number = parseNumber();
    }
    return numbers;
}

/*
 * parse the symbol and set up data structure
 */

let wonders = 0;
let miracles = 0;
let gyrations = [];
let kaleidoscopes = [];

function parse() {
    startParsing();

    wonders = 0;
    miracles = 0;
    gyrations = [];
    kaleidoscopes = [];
    console.log("parsing");
    while (symbol.getCharParsing().length > 0) {
        if (symbol.isCharParsing("o")) {
            console.log("a wonder");
            wonders++;
            symbol.advanceParsing();
        } else if (symbol.isCharParsing("x")) {
            console.log("a miracle");
            miracles++;
            symbol.advanceParsing();
        } else if (symbol.isCharParsing("∞1234556789(")) {
            const newGyrations = parseNumbers();
            if (newGyrations.length > 0) {
                console.log("gyrations " + newGyrations);
                gyrations = gyrations.concat(newGyrations);
            }
        } else if (symbol.isCharParsing("*")) {
            symbol.advanceParsing();
            let reflections = parseNumbers();
            if (reflections.length === 0) {
                reflections = [1];
            }
            kaleidoscopes.push(reflections);
            console.log("kaleidoscope " + reflections);

        } else {
            failure();
            symbol.advanceParsing();
        }


    }
}
