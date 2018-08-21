/**
 * a simple  layout for the home and help page, with nav bar
 */

/* jshint esversion:6 */

var Layout = {};


(function() {
    "use strict";

    // relation between sizes and basicFontSize
    // fontsize varies with image size
    const fontsizeToWindow = 0.035;
    // h1 titel font size is larger 
    const relativeH1Fontsize = 1.3;
    // rekative size of margins
    const textMarginToFontsize = 0.5;

    const vSpaceToFontSize = 0.2;

    const px = "px";
    let fontSize = fontsizeToWindow * Math.min(window.innerHeight, window.innerWidth);

    // first create new elements before setting styles

    console.log(fontSize);

    DOM.create("a", "homeButton", "#navigation", "Home");
    DOM.attribute("#homeButton", "href", "home.html");
    DOM.create("a", "kaleidoscopeButton", "#navigation", "Kaleidoscope");
    DOM.attribute("#kaleidoscopeButton", "href", "sphericalKaleidoscopeApp.html");
    DOM.create("a", "bridgesButton", "#navigation", "Bridges 2018");
    DOM.attribute("#bridgesButton", "href", "titel.html");

    DOM.class("#homeButton,#kaleidoscopeButton,#bridgesButton", "navButton");
    DOM.style(".navButton", "margin", textMarginToFontsize * fontSize + px);


    // styling tags with javascript applies only to already existing
    DOM.style("body,a,#navigation,.navButton", "fontSize", fontSize + px);
    DOM.style("p,h1", "margin", textMarginToFontsize * fontSize + px);
    DOM.style("table", "marginLeft", 2 * textMarginToFontsize * fontSize + px);
    DOM.style("h1", "fontSize", relativeH1Fontsize * fontSize + px);
    DOM.style(".vSpace", "height", vSpaceToFontSize * fontSize + px);

}());
