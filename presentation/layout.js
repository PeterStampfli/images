/**
 * a simple two-panel layout
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
    Layout.inputWidthToSize = 3.5;
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
    Layout.canvasBackgroundColor = "#ddddff";
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
        DOM.style("p,button,input", "fontSize", Layout.basicFontSize + px);
        DOM.style("h1", "fontSize", (Layout.h1ToSize * Layout.basicFontSize) + px);
        DOM.style("p,h1,.topButton", "margin", (Layout.textMarginToSize * Layout.basicFontSize) + px);
        DOM.style(".topButton", "marginBottom", "0px");
        DOM.style("button,input", "borderWidth", Layout.borderWidthToSize * Layout.basicFontSize + px);
        DOM.style("input,.topButton", "width", Layout.inputWidthToSize * Layout.basicFontSize + "px");
        //  DOM.style(".round", "borderRadius", Layout.basicFontSize + "px");
        DOM.style(".round", "borderRadius", 1000 + "px");
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
        DOM.create("input", idSpan + "input", "#" + idSpan);
        DOM.attribute("#" + idSpan + "input", "type", "text", "maxlength", "4");
        DOM.create("span", idSpan + "extraspace1", "#" + idSpan, " ");
        DOM.create("button", idSpan + "up", "#" + idSpan, "up");
        DOM.create("span", idSpan + "extraspace2", "#" + idSpan, " ");
        DOM.create("button", idSpan + "dn", "#" + idSpan, "dn");
        DOM.attribute("#" + idSpan + "up" + ",#" + idSpan + "dn", "class", "round");
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
        Make.setOutputSize(windowHeight, windowHeight);
        DOM.style("#text", "left", windowHeight + px, "top", "0px");
        DOM.style("#text", "width", (windowWidth - windowHeight - 20) + px); // avoid horizontal scrollbar
        DOM.style("#topRight", "right", (windowWidth - windowHeight) + px);
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

        DOM.create("canvas", "outputCanvas", "body");


        DOM.style("#outputCanvas,#text", "zIndex", "1");
        DOM.style("body", "backgroundColor", Layout.backgroundColor);
        DOM.style("body,div", "margin", "0px");
        DOM.style("body", "fontFamily", "'Open Sans', Arial, sans-serif");

        DOM.style("#outputCanvas", "position", "fixed", "left", "0px", "top", "0px");
        DOM.style("#text", "position", "absolute", "top", "0px");

        DOM.create("div", "topLeft", "body");
        DOM.create("div", "topRight", "body");
        DOM.create("button", "prevButton", "#topLeft", "prev");
        DOM.create("button", "nextButton", "#topRight", "next");

        DOM.style("#topLeft,#topRight", "position", "fixed", "top", "0px", "zIndex", "2");
        DOM.style("#topLeft", "left", "0px");
        DOM.attribute("#prevButton,#nextButton", "class", "topButton");
        DOM.style(".topButton", "display", "block", "fontWeight", "normal");

        DOM.style(".beforeInput", "display", "inline-block", "width", "50px");

        let prevButton = new Button("prevButton");
        if (prevPage != "") {
            prevButton.onClick = function() {
                window.location = prevPage;
            };
        } else {
            DOM.style("#prevButton", "display", "none");
        }

        let nextButton = new Button("nextButton");
        if (nextPage != "") {
            nextButton.onClick = function() {
                window.location = nextPage;
            };
        } else {
            DOM.style("#nextButton", "display", "none");
        }
    };

    /**
     * create a button to change between structure and image
     * @method Layout.createStructureImageButton
     * @param {String} id - of the span for the button
     */
    Layout.createStructureImageButton = function(id) {
        let buttonElement = DOM.create("button", "structureImageButton", "#" + id, "structure/image");
        Layout.setFontSizes();
        let button = new Button("structureImageButton");
        button.onClick = function() {
            Make.switchStructureImage();
        };
    };

    /**
     * create open image command with key "i"
     * @method Layout.createOpenImage
     */
    Layout.createOpenImage = function() {
        var hiddenImageInput = Button.createFileInput(function(file) {
            console.log(file.name);
            Make.inputImage.readImageFromFileBlob(file, Make.readImageAction);
        });
        KeyboardEvents.addFunction(function() {
            console.log("open");
            hiddenImageInput.click();
        }, "i");
    };

    // on resize: adjust new dimensions and redraw output image
    window.onresize = function() {
        //Layout.adjustDimensions();
        //   Layout.setFontSizes();
        //document.querySelector("body").innerHTML="<h1>Please reload this page!</h1>";
    };

}());
