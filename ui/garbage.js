/**
 * layout/managing multiple control  divs in the html main page
 * 
 * @namespace controlDivs
 */

/* jshint esversion:6 */

const controlDivs = {};

// default design parameters
controlDivs.backgroundColor = "#eeeeee";
// fontsize as a fraction of smaller window dimension
controlDivs.fontsizeToWindow = 0.025;
// width of basic control panel as multiple of font size
controlDivs.controlWidthToFontsize = 30;
// width of the top navigation button as a multiple of basic control panel size
controlDivs.navButtonWidthToControlWidth = 0.75;
// h1 titel font size is larger 
controlDivs.relativeH1Fontsize = 1.0;
// relative size of margins
controlDivs.marginToFontsize = 0.5;
// weight of button borders
controlDivs.borderWidthToFontsize = 0.15;

// collection of panels, required for resizing and for hiding all
// list of id names (Strings)
controlDivs.ids = [];
// list of relative widths
controlDivs.widths = [];

const px = "px";


/**
 * make all controls disappear and then show given control (or nothing
 * 
 */
controlDivs.show = function(id) {
    for (var i = 0; i < controlDivs.ids.length; i++) {
        DOM.style("#" + controlDivs.ids[i], "display", "none");
    }
    if (arguments.length > 0) {
        DOM.style("#" + id, "display", "initial");
        for (i = 0; i < controlDivs.ids.length; i++) {
            if (controlDivs.ids[i] == id) {
                console.log("found " + i);
            }
        }
    }
};
// initialization

controlDivs.init = function() {
    controlDivs.mainId = "controlDivsMainId";
    controlDivs.navId = "controlDivsNavId";
    // create the div container and place it
    DOM.create("div", controlDivs.mainId, "body");
    DOM.style("#" + controlDivs.mainId, "position", "fixed", "right", 0 + px, "top", 0 + px);
    DOM.style("#" + controlDivs.mainId, "backgroundColor", controlDivs.backgroundColor, "zIndex", "11");
    // create the navigation selector
    DOM.create("select", controlDivs.navId, "#" + controlDivs.mainId);
    controlDivs.select = new Select(controlDivs.navId);
    controlDivs.select.addOption("hide all",
        function() {
            controlDivs.show();
        });

    DOM.style("#" + controlDivs.navId, "float", "right");

};



// setting dimensions, call in startup and resize

controlDivs.setDimensions = function() {
    "use strict";
    // set the font size, depending on the smaller window dimension
    const fontsize = controlDivs.fontsizeToWindow * Math.min(window.innerWidth, window.innerHeight);
    controlDivs.fontsize = fontsize;
    const controlWidth = Math.min(controlDivs.controlWidthToFontsize * fontsize, window.innerWidth);
    DOM.style("h1", "fontSize", controlDivs.relativeH1Fontsize * fontsize + px);
    DOM.style("p,button,input,table,select", "fontSize", fontsize + px);
    DOM.style("p,h1,table", "margin", controlDivs.marginToFontsize * fontsize + px);
    DOM.style("#" + controlDivs.navId, "margin", controlDivs.marginToFontsize * fontsize + px);
    DOM.style("button,input", "borderWidth", controlDivs.borderWidthToFontsize * fontsize + px);

    for (var i = 0; i < controlDivs.ids.length; i++) {
        const id = controlDivs.ids[i];
        console.log(id);
        //  DOM.style("#" + id, "width",  200+ px,"backgroundColor","red");  //controlDivs.widths[i] * controlWidth
    }

};


/**
 * create a secondary control
 */
controlDivs.create = function(id, text, width = 1) {
    // controlDivs.ids.push(id);
    //   controlDivs.widths.push(width);
    // DOM.style("#" + id, "backgroundColor", "red", "zIndex", "11");
    // document.getElementById(controlDivs.mainId).insertBefore(document.getElementById(id),null);

    controlDivs.select.addOption(text,
        function() {
            controlDivs.show(id);
        });

    console.log(controlDivs.ids);
    console.log(controlDivs.widths);
};
