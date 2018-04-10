/**
 * a simple two-panel layout
 * @namespace Layout
 */

/* jshint esversion:6 */

var Layout = {};


(function() {
    "use strict";

    // defaults
    // text margin as fraction iof window height
    Layout.textMarginFraction = 0.020;
    Layout.backgroundColor = "#eeeeee";

    // basic font size is on local storage
    Layout.basicFontSize = localStorage.getItem("fontSize") || Math.round(window.innerHeight * 0.06);

    console.log("fontSize " + Layout.basicFontSize);

    /**
     * save the basicFontSize
     * @method Layout.saveBasicFontSize
     */
    Layout.saveBasicFontSize = function() {
        localStorage.setItem("fontSize", basicFontSize);
    };

    /**
     * set the font sizes, depending on basicFontSize
     * @method Layout.setFontSizes
     */
    Layout.setFontSizes = function() {
        Layout.setStyleFor("p", "fontSize", Layout.basicFontSize + "px");
        Layout.setStyleFor("h1", "fontSize", Math.round(1.4 * Layout.basicFontSize) + "px");


    };


    /**
     * set a style attribute of all elements with given tag
     * @method Layout.setStyleFor
     * @param {String} tag
     * @param {String} attribute
     * @param {String} value
     */
    Layout.setStyleFor = function(tag, attribute, value) {
        console.log(value);
        let elms = document.querySelectorAll(tag);
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
        Layout.setStyleFor("p", "margin", Math.round(Layout.textMarginFraction * windowHeight) + "px");
        Layout.setStyleFor("h1", "margin", Math.round(Layout.textMarginFraction * windowHeight) + "px");
        Layout.setFontSizes();

    };




}());
