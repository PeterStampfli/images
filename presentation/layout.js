/**
 * a simple layout
 * @namespace Layout
 */

/* jshint esversion:6 */

var Layout = {};


(function() {
    "use strict";


    // defaults
    // relation between sizes and basicFontSize
    // text margin as fraction of text size
    Layout.textMarginToSize = 0.50;
    // width of input buttons
    Layout.inputWidthToSize = 3.7;
    //weight of borders (buttons)
    Layout.borderWidthToSize = 0.15;
    // weight of lines in the canvas
    Layout.lineWidthToSize = 0.2;
    // size of h1 text
    Layout.h1ToSize = 1.4;
    // size of null radius in pixels
    Layout.nullRadiusToSize = 0.3;

    // colors
    Layout.backgroundColor = "#eeeeee";
    Layout.mirrorColor = "red";
    Layout.addMirrorColor = "#ff88aa";
    Layout.lineColor = "blue";
    Layout.trajectoryColor = "#ffaa00ff";
    Layout.pointColor = "#ffff00ff";


    //helpful constants
    const px = "px";

    // basic font size is on local storage
    if (localStorage.getItem("fontSize")) {
        Layout.basicFontSize = parseInt(localStorage.getItem("fontSize"), 10);
    } else {
        Layout.basicFontSize = Math.round(window.innerHeight * 0.06);
        console.log("defaultsize");
    }

    /**
     * adjust font sizes and other dimensions depending on basicFontSize
     * @method Layout.setFontSizes
     */
    Layout.setFontSizes = function() {
        DOM.style("p,button,input,table", "fontSize", Layout.basicFontSize + px);
        DOM.style("h1", "fontSize", (Layout.h1ToSize * Layout.basicFontSize) + px);
        DOM.style("p,h1,.topButton,table", "margin", (Layout.textMarginToSize * Layout.basicFontSize) + px);
        DOM.style(".topButton", "marginBottom", "0px");
        DOM.style("button,input", "borderWidth", Layout.borderWidthToSize * Layout.basicFontSize + px);
        DOM.style("input,.topButton", "width", Layout.inputWidthToSize * Layout.basicFontSize + "px");
        Layout.lineWidth = Layout.lineWidthToSize * Layout.basicFontSize;
        Layout.nullRadius = Layout.nullRadiusToSize * Layout.basicFontSize;
    };

    /**
     * change the font size, adjust display and save size on localstorage
     * @method Layout.changeFontSize
     * @param {integer} amount
     */
    Layout.changeFontSize = function(amount) {
        Layout.basicFontSize += amount;
        Layout.setFontSizes();
        localStorage.setItem("fontSize", Layout.basicFontSize);
        Make.updateOutputImage();
    };

    /**
     * make font size changes possible, key "F" increases, key "f" decreases
     * @method Layout.activateFontSizeChanges
     */
    Layout.activateFontSizeChanges = function() {
        KeyboardEvents.addFunction(function() {
            Layout.changeFontSize(1);
        }, "F");
        KeyboardEvents.addFunction(function() {
            Layout.changeFontSize(-1);
        }, "f");
    };

    /**
     * make font size changes with buttons
     * @method Layout.activateFontSizeChangesButtons
     */
    Layout.activateFontSizeChangesButtons = function() {
        DOM.create("button", "fontMinusButton", "#topLeft", "font-");
        DOM.create("button", "fontPlusButton", "#topLeft", "font+");
        DOM.attribute("#fontMinusButton,#fontPlusButton", "class", "topButton");
        let fontMinusButton = new Button("fontMinusButton");
        fontMinusButton.onClick = function() {
            Layout.changeFontSize(-1);
        };
        let fontPlusButton = new Button("fontPlusButton");
        fontPlusButton.onClick = function() {
            Layout.changeFontSize(1);
        };
    };

    /**
     * create an number button with up and down buttons
     * @method Layout.createNumberButton
     * @param {String} idSpan - id of the span conatining the number button
     * @return createNumberButton
     */
    Layout.createNumberButton = function(idSpan) {

        return NumberButton.create(idSpan);
    };


    /**
     * typical setup, hide control canvas and arrow controller. Layout.outputSize will have dimensions of output image.
     * @method Layout.setup
     * @param {String} prevPage - url of previous page or empty string
     * @param {String} nextPage - url of next page or empty string
     */
    Layout.setup = function(prevPage, nextPage) {
        KeyboardEvents.addUrl(prevPage, "N");
        KeyboardEvents.addUrl(nextPage, "n");

        DOM.style("body", "backgroundColor", Layout.backgroundColor);
        DOM.style("body,div", "margin", "0px");
        DOM.style("body", "fontFamily", "'Open Sans', Arial, sans-serif");


        DOM.create("div", "topLeft", "body");
        DOM.create("div", "topRight", "body");
        DOM.style("#topLeft,#topRight", "position", "fixed", "top", "0px", "zIndex", "10");
        DOM.style("#topLeft", "left", "0px");
        DOM.style("#topRight", "right", (window.innerWidth - window.innerHeight) + px);

        if (prevPage != "") {
            DOM.create("button", "prevButton", "#topLeft", "prev");
            DOM.attribute("#prevButton", "class", "topButton");
            let prevButton = new Button("prevButton");
            prevButton.onClick = function() {
                window.location = prevPage;
            };
        } else {
            DOM.create("button", "prevButton", "#topLeft", "home");
            DOM.attribute("#prevButton", "class", "topButton");
            let prevButton = new Button("prevButton");
            prevButton.onClick = function() {
                window.location = "home.html";
            };
        }

        if (nextPage != "") {
            DOM.create("button", "nextButton", "#topRight", "next");
            DOM.attribute("#nextButton", "class", "topButton");
            let nextButton = new Button("nextButton");
            nextButton.onClick = function() {
                window.location = nextPage;
            };
        } else {
            DOM.create("button", "nextButton", "#topRight", "Home");
            DOM.attribute("#nextButton", "class", "topButton");
            let nextButton = new Button("nextButton");
            nextButton.onClick = function() {
                window.location = "index.html";
            };
        }
        DOM.style(".topButton", "display", "block", "fontWeight", "normal", "textAlign", "center");
        DOM.style(".beforeInput", "display", "inline-block");
    };


    /**
     * create a button to change between structure and image
     * @method Layout.createStructureImageButton
     * @param {String} id - of the span for the button
     */
    Layout.createStructureImageButton = function(id) {
        Make.createStructureImageButton(id);
    };

    /**
     * create open image command with key "i"
     * @method Layout.createOpenImage
     */
    Layout.createOpenImage = function() {
        Make.createOpenImageKey("i");
    };



}());
