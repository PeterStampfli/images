/**
 * a simple two-panel layout
 * @namespace Layout
 */

/* jshint esversion:6 */

var Layout = {};


(function() {
    "use strict";

    // defaults
    // text margin as fraction of text size
    Layout.textMarginToSize = 0.50;
    // width of input buttons
    Layout.inputWidthToSize = 4;
    //weight of borders (buttons)
    Layout.borderWidthToSize = 0.15;
    // size of h1 text
    Layout.h1ToSize = 1.4;

    Layout.backgroundColor = "#eeeeee";

    // basic font size is on local storage
    Layout.basicFontSize = localStorage.getItem("fontSize") || Math.round(window.innerHeight * 0.06);

    console.log("fontSize " + Layout.basicFontSize);

    /**
     * save the basicFontSize
     * @method Layout.saveBasicFontSize
     */
    Layout.saveBasicFontSize = function() {
        localStorage.setItem("fontSize", Layout.basicFontSize);
    };

    /**
     * set the font sizes, depending on basicFontSize
     * @method Layout.setFontSizes
     */
    Layout.setFontSizes = function() {
        Layout.setStyleFor("p,button,input", "fontSize", Layout.basicFontSize + "px");
        Layout.setStyleFor("h1", "fontSize", (Layout.h1ToSize * Layout.basicFontSize) + "px");
        Layout.setStyleFor("p,h1", "margin", (Layout.textMarginToSize * Layout.basicFontSize) + "px");
        Layout.setStyleFor("button,input", "borderWidth", Layout.borderWidthToSize * Layout.basicFontSize + "px");

        Layout.setStyleFor("input", "width", Layout.inputWidthToSize * Layout.basicFontSize + "px");

        Layout.setStyleFor(".round", "borderRadius", Layout.basicFontSize + "px");

    };

    /**
     * make font size changes possible, key "F" increases, key "f" decreases
     * @method Layout.activateFontSizeChanges
     */
    Layout.activateFontSizeChanges = function() {
        KeyboardEvents.addFunction(function() {
            Layout.basicFontSize++;
            Layout.saveBasicFontSize();
            Layout.setFontSizes();
        }, "F");
        KeyboardEvents.addFunction(function() {
            Layout.basicFontSize--;
            Layout.saveBasicFontSize();
            Layout.setFontSizes();
        }, "f");
    };

    /**
     * set a style attribute of all elements with given tag
     * @method Layout.setStyleFor
     * @param {String} selectors - comma separated list (tag,tag.class,.class,#id)
     * @param {String} attribute
     * @param {String} value
     */
    Layout.setStyleFor = function(selectors, attribute, value) {
        let elms = document.querySelectorAll(selectors);
        elms.forEach(function(elm) {
            elm.style[attribute] = value;
        });
    };

    /**
     * get the text-div and the graphics-canvas elements, and set standard styles
     * @method Layout.getElements
     * @param {String} idGraphics
     * @param {String} idText
     */
    Layout.getElements = function(idGraphics, idText) {
        Layout.graphics = document.getElementById(idGraphics);
        Layout.text = document.getElementById(idText);
        Layout.graphics.style.position = "fixed";
        Layout.graphics.style.top = "0px";
        Layout.graphics.style.left = "0px";
        Layout.text.style.position = "absolute";
        Layout.text.style.top = "0px";
    };


    /**
     * set body and p style
     * @method Layout.setStyles
     */
    Layout.setStyles = function() {
        Layout.setStyleFor("body", "backgroundColor", Layout.backgroundColor);
        Layout.setStyleFor("body", "margin", "0px");
        Layout.setStyleFor("body", "fontFamily", "'Open Sans', Arial, sans-serif");
        Layout.setStyleFor("button,input", "fontWeight", "bold");
    };

    /**
     * adjust dimensions of graphics and text field depending on window dimensions
     * font size is adjusted separately
     * @method Layout.adjustDimensions
     */
    Layout.adjustDimensions = function() {
        console.log("adjust");
        let windowHeight = window.innerHeight;
        let windowWidth = window.innerWidth;
        Layout.graphics.style.width = windowHeight + "px";
        Layout.graphics.style.height = windowHeight + "px";
        Layout.text.style.left = windowHeight + "px";
        Layout.text.style.width = (windowWidth - windowHeight - 20) + "px"; // avoid horizontal scrollbar
        Layout.graphics.style.height = windowHeight + "px";
        Layout.setFontSizes();
    };

    /**
     * typical setup, hide controls
     * @method Layout.setup
     */
    Layout.setup = function() {

        Layout.getElements("outputCanvas", "text");
        document.getElementById("controlCanvas").style.display = "none";
        document.getElementById("arrowController").style.display = "none";
        Layout.setStyles();
        Layout.adjustDimensions();
        Layout.activateFontSizeChanges();
        window.onresize = Layout.adjustDimensions;
    };


}());
