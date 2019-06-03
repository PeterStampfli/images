/**
 * writing orbifold symbols
 * @namespace symbols
 */

/* jshint esversion:6 */

DOM.style("body", "fontFamily", "'Open Sans', Arial, sans-serif");

DOM.style("#symbolsInput", "width", "200px");


special = new SpecialInput("symbolsInput");

special.setText("whatever");
special.setFocus(true);




special.onEnter = function(value) {
    console.log(" do this: " + value);
};



special.createAddButton("specialChars", "x");
DOM.addSpace("specialChars");
special.createAddButton("specialChars", "o");
DOM.addSpace("specialChars");
special.createAddButton("specialChars", "*");
DOM.addSpace("specialChars");
special.createAddButton("specialChars", "(");
DOM.addSpace("specialChars");
special.createAddButton("specialChars", ")");


special.createAddButton("zeroToFour", "0");
DOM.addSpace("zeroToFour");
special.createAddButton("zeroToFour", "1");
DOM.addSpace("zeroToFour");
special.createAddButton("zeroToFour", "2");
DOM.addSpace("zeroToFour");
special.createAddButton("zeroToFour", "3");
DOM.addSpace("zeroToFour");
special.createAddButton("zeroToFour", "4");


special.createAddButton("fiveToNine", "5");
DOM.addSpace("fiveToNine");
special.createAddButton("fiveToNine", "6");
DOM.addSpace("fiveToNine");
special.createAddButton("fiveToNine", "7");
DOM.addSpace("fiveToNine");
special.createAddButton("fiveToNine", "8");
DOM.addSpace("fiveToNine");
special.createAddButton("fiveToNine", "9");


special.createStepLeftButton("controls", "<=");
DOM.addSpace("controls");
special.createStepRightButton("controls", "=>");
DOM.addSpace("controls");
special.createClearCharButton("controls", "C");
DOM.addSpace("controls");
special.createClearAllButton("controls", "CE");
DOM.addSpace("controls");
special.createEnterButton("controls", "enter");

special.createSetTextButton("examples", "2222");
DOM.addSpace("examples");
special.createSetTextButton("examples", "*732");

KeyboardEvents.addFunction(function() {
    console.log("enter");
    //   console.log(textInput.
    // DOM.style(


}, "Enter");
