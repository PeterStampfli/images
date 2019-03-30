/**
 * a simple  layout for the home and help page, 
 */

/* jshint esversion:6 */

function layout() {
    "use strict";

    // relation between sizes and basicFontSize
    // fontsize varies with image size
    const fontsizeToWindow = 0.015;
    // h1 titel font size is larger 
    const relativeH1Fontsize = 1.3;
    // rekative size of margins
    const textMarginToFontsize = 0.5;

    const vSpaceToFontSize = 0.2;

    const px = "px";
    let fontSize = Math.max(14, fontsizeToWindow * window.innerWidth);
    console.log(fontSize);

    // styling tags with javascript applies only to already existing
    DOM.style("body", "fontSize", fontSize + px);
    DOM.style("p,h1", "margin", textMarginToFontsize * fontSize + px);
    DOM.style("table", "marginLeft", 2 * textMarginToFontsize * fontSize + px);
    DOM.style("h1", "fontSize", relativeH1Fontsize * fontSize + px);
    DOM.style(".vSpace", "height", vSpaceToFontSize * fontSize + px);
}

window.onload = function() {
    layout();
};

window.onresize = function() {
    layout();
};
