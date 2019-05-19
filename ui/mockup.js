/* jshint esversion:6 */

const layout = {};

// defaults
layout.controlBackgroundColor = "#eeeeee";

// fontsize as a fraction of smaller window dimension
layout.fontsizeToWindow = 0.025;

// width of control panel as multiple of font size
layout.controlWidthToFontsize = 30;

// h1 titel font size is larger 
layout.relativeH1Fontsize = 1.0;
// relative size of margins
layout.marginToFontsize = 0.5;
// weight of button borders
layout.borderWidthToFontsize = 0.15;

layout.makeControl = function() {
    "use strict";
    const px = "px";

    DOM.style("body", "fontFamily", "'Open Sans', Arial, sans-serif");

    // "control" is the collection of text-based control elements

    // setting up the control div with a hide controls button
    DOM.style("#control", "position", "fixed", "overflow", "auto");
    DOM.style("#control", "right", 0 + px, "top", 0 + px);
    DOM.style("#control", "backgroundColor", layout.controlBackgroundColor, "zIndex", "11");
    // the hide controls button, centered in its div
    DOM.create("div", "hideControlsDivId", "body");
    DOM.style("#hideControlsDivId", "textAlign", "center");
    DOM.create("button", "hideControlsButtonId", "#hideControlsDivId", "hide controls");
    control.insertBefore(document.getElementById("hideControlsDivId"), document.getElementById("control").firstChild);
    // adding functionality
    const hideControlsButton = new Button("hideControlsButtonId");
    hideControlsButton.onClick = function() {
        DOM.style("#control", "display", "none");
        DOM.style("#showControlsDivId", "display", "initial");
    };

    // setting up a div with a show controls button
    DOM.create("div", "showControlsDivId", "body");
    DOM.style("#showControlsDivId", "position", "fixed", "right", 0 + px, "top", 0 + px);
    DOM.style("#showControlsDivId", "backgroundColor", layout.controlBackgroundColor, "zIndex", "11");

    DOM.style("#showControlsDivId", "textAlign", "center", "display", "none");
    DOM.create("button", "showControlsButtonId", "#showControlsDivId", "show controls");

    const showControlsButton = new Button("showControlsButtonId");
    showControlsButton.onClick = function() {
        DOM.style("#control", "display", "initial");
        DOM.style("#showControlsDivId", "display", "none");
    };
};

// setting dimensions, call in startup and resize

layout.setDimensions = function() {
    "use strict";
    // set the font size, depending on the smaller window dimension
    const fontSize = layout.fontsizeToWindow * Math.min(window.innerWidth, window.innerHeight);
    const controlWidth = Math.min(layout.controlWidthToFontsize * fontSize, window.innerWidth);
    DOM.style("h1", "fontSize", layout.relativeH1Fontsize * fontSize + px);
    DOM.style("p,button,input,table,select", "fontSize", fontSize + px);
    DOM.style("p,h1,table,#hideControlsButtonId,#showControlsButtonId", "margin", layout.marginToFontsize * fontSize + px);
    DOM.style("button,input", "borderWidth", layout.borderWidthToFontsize * fontSize + px);
    DOM.style("#control,#showControlsDivId", "width", controlWidth + px);
    DOM.style("#hideControlsButtonId,#showControlsButtonId", "width", 0.75 * controlWidth + px);
};
