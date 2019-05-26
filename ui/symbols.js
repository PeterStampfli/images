/**
 * writing orbifold symbols
 * @namespace symbols
 */

/* jshint esversion:6 */

DOM.style("body", "fontFamily", "'Open Sans', Arial, sans-serif");



const theAButton = new Button("adButton");



const theInput = document.getElementById("in");

function add(more) {
    text = theInput.value;
    start = theInput.selectionStart;
    const before = text.slice(0, theInput.selectionStart);
    console.log(before);
    const after = text.slice(theInput.selectionEnd);
    console.log(after);
    theInput.value = before + more + after;
    console.log(more.length);
    theInput.focus();
    theInput.setSelectionRange(start + more.length, start + more.length);

}

theAButton.onClick = function() {
    add("abc");


};



theInput.onchange = function() {
    console.log("something changed " + theInput.value);
};




textInput = new TextButton("symbolsInput");

textInput.setValue("ui");
textInput.onChange = function(value) {
    console.log(" changes " + value);
};
