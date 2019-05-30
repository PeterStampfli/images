/**
 * writing orbifold symbols
 * @namespace symbols
 */

/* jshint esversion:6 */

DOM.style("body", "fontFamily", "'Open Sans', Arial, sans-serif");






textInput = new TextButton("symbolsInput");

textInput.onChange = function(value) {
    console.log(" do this " + value);
};



textInput.createAddButton("specialChars", "x");
DOM.addSpace("specialChars");
textInput.createAddButton("specialChars", "o");
DOM.addSpace("specialChars");
textInput.createAddButton("specialChars", "*");
DOM.addSpace("specialChars");
textInput.createAddButton("specialChars", "(");
DOM.addSpace("specialChars");
textInput.createAddButton("specialChars", ")");


textInput.createAddButton("zeroToFour", "0");
DOM.addSpace("zeroToFour");
textInput.createAddButton("zeroToFour", "1");
DOM.addSpace("zeroToFour");
textInput.createAddButton("zeroToFour", "2");
DOM.addSpace("zeroToFour");
textInput.createAddButton("zeroToFour", "3");
DOM.addSpace("zeroToFour");
textInput.createAddButton("zeroToFour", "4");


textInput.createAddButton("fiveToNine", "5");
DOM.addSpace("fiveToNine");
textInput.createAddButton("fiveToNine", "6");
DOM.addSpace("fiveToNine");
textInput.createAddButton("fiveToNine", "7");
DOM.addSpace("fiveToNine");
textInput.createAddButton("fiveToNine", "8");
DOM.addSpace("fiveToNine");
textInput.createAddButton("fiveToNine", "9");


textInput.createStepLeftButton("controls", "<=");
DOM.addSpace("controls");
textInput.createStepRightButton("controls", "=>");
DOM.addSpace("controls");


KeyboardEvents.addFunction(function() {
    console.log("enter");
    //   console.log(textInput.
    // DOM.style(


}, "Enter");

q = document.getElementById("quark");
DOM.style("#quark", "width", "200px");


special = new SpecialInput("quark");

special.setText("wasauchimmer");
special.add("aaa");
special.createStepLeftButton("ex", "<=");
special.createAddButton("ex", "0");
