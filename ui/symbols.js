/**
 * writing orbifold symbols
 * @namespace symbols
 */

/* jshint esversion:6 */

DOM.style("body", "fontFamily", "'Open Sans', Arial, sans-serif");






textInput = new TextButton("symbolsInput");

textInput.setValue("ui");
textInput.onChange = function(value) {
    console.log(" changes " + value);
};

textInput.setValue("dasda");

//textInput.stepLeft();

//textInput.add("more");

console.log(DOM.createId());
console.log(DOM.createId());
console.log(DOM.createId());
console.log(DOM.createId());
console.log(DOM.createId());
