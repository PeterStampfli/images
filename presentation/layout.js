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
    Layout.inputWidthToSize = 3.5;
    //weight of borders (buttons)
    Layout.borderWidthToSize = 0.15;
    // size of h1 text
    Layout.h1ToSize = 1.4;

    Layout.backgroundColor = "#eeeeee";

    //helpful constants
    const px = "px";

    console.log(localStorage.getItem("fontSize"));
    // basic font size is on local storage
    if (localStorage.getItem("fontSize")) {

        Layout.basicFontSize = parseInt(localStorage.getItem("fontSize"), 10);
    } else {
        Layout.basicFontSize = Math.round(window.innerHeight * 0.06);
        console.log("defaultsize");
    }

    console.log(Layout.basicFontSize);

    /**
     * adjust font sizes and other dimensions depending on basicFontSize
     * @method Layout.setFontSizes
     */
    Layout.setFontSizes = function() {
        DOM.style("p,button,input", "fontSize", Layout.basicFontSize + px);
        DOM.style("h1", "fontSize", (Layout.h1ToSize * Layout.basicFontSize) + px);
        DOM.style("p,h1,.topButton", "margin", (Layout.textMarginToSize * Layout.basicFontSize) + px);
        DOM.style(".topButton", "marginBottom", "0px");
        DOM.style("button,input", "borderWidth", Layout.borderWidthToSize * Layout.basicFontSize + px);
        DOM.style("input,.topButton", "width", Layout.inputWidthToSize * Layout.basicFontSize + "px");
        DOM.style(".round", "borderRadius", Layout.basicFontSize + "px");
    };

    /**
     * change the font size, adjust display and save size on localstorage
     * @method Layout.changeFontSize
     * @param {integer} amount
     */

    Layout.changeFontSize = function(amount) {
        Layout.basicFontSize += amount;
        console.log("ch " + Layout.basicFontSize);
        Layout.setFontSizes();
        localStorage.setItem("fontSize", Layout.basicFontSize);
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
        DOM.create("button", "fontPlusButton", "#topRight", "font+");
        DOM.attribute("#fontMinusButton,#fontPlusButton", "class", "topButton");
        Layout.adjustDimensions();
        Layout.setFontSizes();
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
        DOM.create("input", idSpan + "input", "#" + idSpan);
        DOM.attribute("#" + idSpan + "input", "type", "text", "maxlength", "4");
        DOM.create("span", idSpan + "extraspace1", "#" + idSpan, " ");
        DOM.create("button", idSpan + "up", "#" + idSpan, "up");
        DOM.create("span", idSpan + "extraspace2", "#" + idSpan, " ");
        DOM.create("button", idSpan + "dn", "#" + idSpan, "dn");
        DOM.attribute("#" + idSpan + "up" + ",#" + idSpan + "dn", "class", "round");

        Layout.adjustDimensions();
        Layout.setFontSizes();

        let numberButton = new NumberButton(idSpan + "input", idSpan + "up", idSpan + "dn");
        return numberButton;
    };


    /**
     * adjust dimensions of graphics and text field depending on window dimensions only
     * @method Layout.adjustDimensions
     */
    Layout.adjustDimensions = function() {
        let windowHeight = window.innerHeight;
        let windowWidth = window.innerWidth;

        DOM.style("#outputCanvas", "width", windowHeight + px, "height", windowHeight + px);

        Layout.outputSize = windowHeight;

        DOM.style("#text", "left", windowHeight + px, "top", "0px");
        DOM.style("#text", "width", (windowWidth - windowHeight - 20) + px); // avoid horizontal scrollbar
        DOM.style("#topRight", "right", (windowWidth - windowHeight) + px);

    };

    /**
     * typical setup, hide control canvas. Layout.outputSize will have dimensions of output image.
     * @method Layout.setup
     * @param {String} prevPage
     * @param {String} nextPage
     */
    Layout.setup = function(prevPage, nextPage) {

        DOM.create("canvas", "outputCanvas", "body");
        DOM.create("canvas", "controlCanvas", "body");
        DOM.create("canvas", "arrowController", "body");

        DOM.style("#controlCanvas,#arrowController", "display", "none");
        DOM.style("#outputCanvas,#text", "zIndex", "1");

        //DOM.create("button","minusButton","#topLeft","text-");

        DOM.style("body", "backgroundColor", Layout.backgroundColor);
        DOM.style("body,div", "margin", "0px");
        DOM.style("body", "fontFamily", "'Open Sans', Arial, sans-serif");
        DOM.style("button,input", "fontWeight", "bold");

        DOM.style("#outputCanvas", "position", "fixed", "left", "0px", "top", "0px");
        DOM.style("#text", "position", "absolute", "top", "0px");
        KeyboardEvents.setPreviousNext(prevPage, nextPage);

        DOM.create("div", "topLeft", "body");
        DOM.create("div", "topRight", "body");
        DOM.create("button", "prevButton", "#topLeft", "prev");
        DOM.create("button", "nextButton", "#topRight", "next");

        DOM.style("#topLeft,#topRight", "position", "absolute", "top", "0px", "zIndex", "2");
        DOM.style("#topLeft", "left", "0px");
        DOM.attribute("#prevButton,#nextButton", "class", "topButton");
        DOM.style(".topButton", "display", "block", "fontWeight", "normal");

        let prevButton = new Button("prevButton");
        prevButton.onClick = function() {
            window.location = prevPage;
        };

        let nextButton = new Button("nextButton");
        nextButton.onClick = function() {
            window.location = nextPage;
        };



        Layout.adjustDimensions();

        Layout.setFontSizes();

    };


    // on resize: adjust new dimensions and redraw output image
    window.onresize = function() {
        Layout.adjustDimensions();
        //   Layout.setFontSizes();
    };


}());
