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
    document.getElementById("result").innerHTML = "Doing the symmetry of symbol: " + symbol.text;
    startParsing();
    console.log("numbers " + parseNumbers(true));
    console.log("pos " + symbol.parsePosition);
    console.log(failParsing);
};



symbol.createAddCharButton("symbolChars", "x");
DOM.addSpace("symbolChars");
symbol.createAddCharButton("symbolChars", "o");
DOM.addSpace("symbolChars");
symbol.createAddCharButton("symbolChars", "*");
DOM.addSpace("symbolChars");
symbol.createAddCharButton("symbolChars", "(");
DOM.addSpace("symbolChars");
symbol.createAddCharButton("symbolChars", ")");


const button0 = symbol.createAddCharButton("zeroToFour", "0");
DOM.addSpace("zeroToFour");
const button1 = symbol.createAddCharButton("zeroToFour", "1");
DOM.addSpace("zeroToFour");
symbol.createAddCharButton("zeroToFour", "2");
DOM.addSpace("zeroToFour");
symbol.createAddCharButton("zeroToFour", "3");
DOM.addSpace("zeroToFour");
symbol.createAddCharButton("zeroToFour", "4");


symbol.createAddCharButton("fiveToNine", "5");
DOM.addSpace("fiveToNine");
symbol.createAddCharButton("fiveToNine", "6");
DOM.addSpace("fiveToNine");
symbol.createAddCharButton("fiveToNine", "7");
DOM.addSpace("fiveToNine");
symbol.createAddCharButton("fiveToNine", "8");
DOM.addSpace("fiveToNine");
symbol.createAddCharButton("fiveToNine", "9");
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
 * single digit 1...9
 * option: infinity (gives 9999999)
 * left brace, single digit 1...9, repeating digit 0...9 right brace
 * 
 * return value of number >=0 if it is a number
 * return value may be 0 if there is an error
 * parsing position advance past end of number
 * return value -1 if not a number
 */

function parseNumber(withInfinity) {
    if (withInfinity) {
        //  infinity is accepted,check if there is an infinity symbol
        if (symbol.isCharParsing("∞")) {
            symbol.advanceParsing();
            return valueInfinity;
        }
    } else { // infinity is not accepted: skip infinities,mark error
        while (symbol.isCharParsing("∞")) {
            failure();
            symbol.advanceParsing();
        }
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
        console.log(numberString);
        return parseInt(numberString, 10);
    } else {
        return -1;
    }
}

/**
 * parse a series of numbers, put in array
 * return empty array if no numbers
 */

function parseNumbers(withInfinity) {
    const numbers = [];
    let number = parseNumber(withInfinity);
    while (number >= 0) {
        numbers.push(number);
        number = parseNumber(withInfinity);
    }
    return numbers;
}
