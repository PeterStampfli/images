/**
 * writing orbifold symbols
 * @namespace symbols
 */

/* jshint esversion:6 */

DOM.style("body", "fontFamily", "'Open Sans', Arial, sans-serif");


DOM.style("#result", "color", "green");
DOM.style("#image", "color", "green", "fontSize", "32px");

symbol = new SpecialInput("symbolsInput");


var equivalent = "";

function parseAndAnalyze() {
    var i, j;
    symbol.colorBlack();
    let result = "";
    parse();
    if (wonders > 0) {
        result += "<br>wonders: " + wonders;
    }
    if (gyrations.length > 0) {
        result += "<br>gyrations: " + gyrations;
    }
    if (miracles > 0) {
        result += "<br>miracles: " + miracles;
    }
    if (kaleidoscopes.length > 0) {
        for (i = 0; i < kaleidoscopes.length; i++) {
            result += "<br>kaleidoscope: " + kaleidoscopes[i];
        }
    }

    equivalent = "";
    for (i = 0; i < wonders; i++) {
        equivalent += "o";
    }
    for (i = 0; i < gyrations.length; i++) {
        if (gyrations[i] === "∞") {
            equivalent += "∞";
        } else if (gyrations[i] > 9) {
            equivalent += "(" + gyrations[i] + ")";
        } else {
            equivalent += gyrations[i];
        }
    }
    for (i = 0; i < miracles; i++) {
        equivalent += "x";
    }
    for (i = 0; i < kaleidoscopes.length; i++) {
        equivalent += "*";
        const reflections = kaleidoscopes[i];

        if ((reflections.length > 1) || (reflections[0] !== 1)) {
            for (j = 0; j < reflections.length; j++) {
                if (reflections[j] === "∞") {
                    equivalent += "∞";
                } else if (reflections[j] > 9) {
                    equivalent += "(" + reflections[j] + ")";
                } else {
                    equivalent += reflections[j];
                }
            }

        }

    }


    result += "<br>equivalent symbol: " + equivalent;

    document.getElementById("result").innerHTML = result;
    console.log("textchange )button " + rightBraceButton.hoover);

}



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


symbol.createStepLeftButton("controls", "◄");
DOM.addSpace("controls");
symbol.createStepRightButton("controls", "►");
DOM.addSpace("controls");
symbol.createClearCharButton("controls", "del");
DOM.addSpace("controls");
symbol.createClearAllButton("controls", "clear");
DOM.addSpace("controls");
symbol.createEnterButton("controls", "make it!");
DOM.addSpace("controls");
symbol.createCopyButton("controls", "copy");

symbol.createSetTextButton("examples", "2222");
DOM.addSpace("examples");
symbol.createSetTextButton("examples", "*732");


// create a button to use equivalent symbol

const useEquivalentButtonId = DOM.createButton("useEquivalent", "use the equivalent symbol");
DOM.style("#" + useEquivalentButtonId, "borderRadius", 1000 + px);
const button = Button.createAction(useEquivalentButtonId, function() {
    symbol.setText(equivalent);
    symbol.setFocus(true);
    symbol.keepFocus = true;
});

/*
 * activate all buttons
 */
function enableAllButtons() {
    Button.enable(button0, button1, button2, button3, button4);
    Button.enable(button5, button6, button7, button8, button9);
    Button.enable(inftyButton, leftBraceButton, rightBraceButton);
    Button.enable(miracleButton, wonderButton, kaleidoscopeButton);
}


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
        if (symbol.beforeCursorParsing()) {
            enableAllButtons();
            Button.disable(leftBraceButton, rightBraceButton, button0, inftyButton);
            Button.disable(wonderButton, miracleButton, kaleidoscopeButton);
        }

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
        if (symbol.beforeCursorParsing()) {
            enableAllButtons();
            Button.disable(leftBraceButton, inftyButton, wonderButton, miracleButton, kaleidoscopeButton);
        }
        let numberString = "";
        while (symbol.isCharParsing("0123456789")) {
            numberString += symbol.getCharParsing();
            symbol.advanceParsing();
        }
        if (symbol.isCharParsing(")")) {
            // the finishing right brace is ok
            symbol.advanceParsing();
            if (symbol.beforeCursorParsing()) {
                enableAllButtons();
                Button.disable(rightBraceButton, button0);
            }
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
    if (symbol.beforeCursorParsing()) {
        enableAllButtons();
        Button.disable(rightBraceButton, button0);
    }

    while (symbol.getCharParsing().length > 0) {

        if (symbol.isCharParsing("o")) {
            console.log("a wonder");
            wonders++;
            symbol.advanceParsing();
        } else if (symbol.isCharParsing("∞1234556789(")) {
            const newGyrations = parseNumbers();
            if (newGyrations.length > 0) {
                console.log("gyrations " + newGyrations);
                gyrations = gyrations.concat(newGyrations);
            }
        } else if (symbol.isCharParsing("x")) {
            console.log("a miracle");
            miracles++;
            symbol.advanceParsing();
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


// setting up symbol


symbol.setWidth(200);
symbol.onTextChange = parseAndAnalyze;
symbol.onEnter = function() {
    document.getElementById("image").innerHTML = "The image of symbol " + symbol.text;
};

symbol.setText("*532");
symbol.setFocus(true);
