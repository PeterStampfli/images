/**
 * writing orbifold symbols
 * @namespace symbols
 */

/* jshint esversion:6 */

DOM.style("body", "fontFamily", "'Open Sans', Arial, sans-serif");



special = new SpecialInput("symbolsInput");

special.setWidth(200);

special.setText("*532");
special.setFocus(true);

DOM.style("#result", "color", "green");


special.onEnter = function() {
    document.getElementById("result").innerHTML = "Doing the symmetry of symbol: " + special.text;
};



special.createAddCharButton("specialChars", "x");
DOM.addSpace("specialChars");
special.createAddCharButton("specialChars", "o");
DOM.addSpace("specialChars");
special.createAddCharButton("specialChars", "*");
DOM.addSpace("specialChars");
special.createAddCharButton("specialChars", "(");
DOM.addSpace("specialChars");
special.createAddCharButton("specialChars", ")");


const button0 = special.createAddCharButton("zeroToFour", "0");
DOM.addSpace("zeroToFour");
special.createAddCharButton("zeroToFour", "1");
DOM.addSpace("zeroToFour");
special.createAddCharButton("zeroToFour", "2");
DOM.addSpace("zeroToFour");
special.createAddCharButton("zeroToFour", "3");
DOM.addSpace("zeroToFour");
special.createAddCharButton("zeroToFour", "4");


special.createAddCharButton("fiveToNine", "5");
DOM.addSpace("fiveToNine");
special.createAddCharButton("fiveToNine", "6");
DOM.addSpace("fiveToNine");
special.createAddCharButton("fiveToNine", "7");
DOM.addSpace("fiveToNine");
special.createAddCharButton("fiveToNine", "8");
DOM.addSpace("fiveToNine");
special.createAddCharButton("fiveToNine", "9");
DOM.addSpace("fiveToNine");
const inftyButton = special.createAddCharButton("fiveToNine", "∞");


special.createStepLeftButton("controls", "<=");
DOM.addSpace("controls");
special.createStepRightButton("controls", "=>");
DOM.addSpace("controls");
special.createClearCharButton("controls", "C");
DOM.addSpace("controls");
special.createClearAllButton("controls", "CE");
DOM.addSpace("controls");
special.createEnterButton("controls", "enter");
DOM.addSpace("controls");
special.createCopyButton("controls", "copy");

special.createSetTextButton("examples", "2222");
DOM.addSpace("examples");
special.createSetTextButton("examples", "*732");


console.log(inftyButton);
inftyButton.setActive(false);
button0.setActive(false);
//inftyButton.setActive(true);
