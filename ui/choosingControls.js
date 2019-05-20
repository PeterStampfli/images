/**
 * layout/managing multiple control  divs in the html main page
 * 
 * @namespace controlDivs
 */

/* jshint esversion:6 */

const controlDivs = {};

(function() {
    "use strict";

    // design parameters with default values
    // you can change the values, best at startup in window.onload (?)

    controlDivs.backgroundColor = "#eeeeee";
    // fontsize as a fraction of smaller window dimension
    controlDivs.fontsizeToWindow = 0.025;
    // width of basic control panel as multiple of font size
    controlDivs.controlWidthToFontsize = 20;
    // width of the top navigation button as a multiple of basic control panel size
    controlDivs.navButtonWidthToControlWidth = 0.75;
    // h1 titel font size is larger 
    controlDivs.relativeH1Fontsize = 1.0;
    // relative size of margins
    controlDivs.marginToFontsize = 0.5;
    // weight of button borders
    controlDivs.borderWidthToFontsize = 0.15;

    // private things
    const px = "px";
    // collection of divs with controls
    // list of id names (Strings)
    const ids = [];
    // list of relative widths
    const widths = [];

    // initialization, always the same
    const selectorId = "controlDivsSelectorID"; // should be unique html-identifier    
    // create the navigation selector
    DOM.create("select", selectorId, "body");
    DOM.style("#" + selectorId, "float", "right");
    const selector = new Select(selectorId);

    // create an empty div for hiding all
    const emptyId = "controlDivsEmptyId";
    DOM.create("div", emptyId, "body");

    // setting dimensions, call in startup and resize

    controlDivs.setDimensions = function() {
        // set the font size, depending on the window height 
        // trying to fit controls to window without vertical scrolling
        const fontsize = controlDivs.fontsizeToWindow * window.innerHeight;
        // beware of too narrow portrait format
        // the lines in controls should be short
        // prevents horizontal scrolling
        // worst case might cause vertical scrolling
        const controlWidth = Math.min(controlDivs.controlWidthToFontsize * fontsize, window.innerWidth);
        DOM.style("h1", "fontSize", controlDivs.relativeH1Fontsize * fontsize + px);
        DOM.style("p,button,input,table,select", "fontSize", fontsize + px);
        DOM.style("p,h1,table", "margin", controlDivs.marginToFontsize * fontsize + px);
        DOM.style("#" + selectorId, "margin", controlDivs.marginToFontsize * fontsize + px);
        DOM.style("button,input", "borderWidth", controlDivs.borderWidthToFontsize * fontsize + px);

        for (var i = 0; i < ids.length; i++) {
            if (widths[i] > 0) {
                DOM.style("#" + ids[i], "width", Math.min(widths[i] * controlWidth, window.innerWidth) + px);
            }
        }
    };

    /**
     * make all control divs disappear and then show given control (or nothing)
     * set the selector to correct item
     * 
     */
    controlDivs.show = function(id) {
        for (var i = 0; i < ids.length; i++) {
            DOM.style("#" + ids[i], "display", "none");
        }
        DOM.style("#" + id, "display", "block");
        const element = document.getElementById(id);
        element.insertBefore(document.getElementById(selectorId), element.firstChild);
        for (i = 0; i < ids.length; i++) {
            if (ids[i] == id) {
                selector.setIndex(i);
            }
        }
    };



    /**
     * create a secondary control
     */
    controlDivs.create = function(id, text, width = 1) {
        ids.push(id);
        widths.push(width);
        DOM.style("#" + id, "maxHeight", window.innerHeight + px);
        DOM.style("#" + id, "overflow", "auto");
        DOM.topRight(id);
        DOM.style("#" + id, "backgroundColor", controlDivs.backgroundColor, "zIndex", "11");

        selector.addOption(text,
            function() {
                controlDivs.show(id);
            });
    };

    controlDivs.create(emptyId, "hide all", -1);
    controlDivs.show(emptyId);

}());
