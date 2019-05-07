/**
 * a simple layout
 * @namespace Layout
 */

/* jshint esversion:6 */

var Layout = {};

// patching
basicUI = {};
basicUI.layout = function() {};


(function() {
    "use strict";

    // disable the context menu

    const body = document.getElementsByTagName("body")[0];
    body.oncontextmenu = function() {
        return false;
    };


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
        DOM.style("p,button,input,table,select", "fontSize", Layout.basicFontSize + px);
        DOM.style("h1", "fontSize", (Layout.h1ToSize * Layout.basicFontSize) + px);
        Layout.marginSize = Layout.textMarginToSize * Layout.basicFontSize;
        DOM.style("p,h1,.topButton,table", "margin", Layout.marginSize + px);
        DOM.style(".topButton", "marginBottom", "0px");
        Layout.borderWidth = Layout.borderWidthToSize * Layout.basicFontSize;
        DOM.style("button,input", "borderWidth", Layout.borderWidth + px);
        Layout.buttonWidth = Layout.inputWidthToSize * Layout.basicFontSize;
        Layout.totalButtonWidth = Layout.buttonWidth + 2 * Layout.marginSize + 2 * Layout.borderWidth;
        Layout.totalButtonHeight = Layout.basicFontSize + 2 * Layout.marginSize + 2 * Layout.borderWidth;

        DOM.style("input,.topButton", "width", Layout.buttonWidth + "px");
        DOM.style(".buttonspace", "height", Layout.totalButtonHeight + px);
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
        if (!!Make.outputImage) {
            Make.updateOutputImage();
        }
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
     * @param {String} idSpan - id of the span containing the number button
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
     * create open image command with key "i"
     * @method Layout.createOpenImage
     */
    Layout.createOpenImage = function() {
        Make.createOpenImageKey("i");
    };

    /**
     * test if landscape format
     * error message if not 
     * @method Layout.isLandscape
     * @return true if it is landscape
     */
    Layout.isLandscape = function() {
        const result = window.innerHeight < window.innerWidth;
        if (!result) {
            document.querySelector("body").innerHTML = "<div id='warn'><h1>Please change to <strong>landscape orientation</strong> and RELOAD the page</h1></div>";
            DOM.style("#warn", "zIndex", "20", "position", "fixed", "top", "0px", "left", "0px", "backgroundColor", "yellow");
        }
        return result;
    };

    /**
     * create a canvas and draw an image
     * @method Layout.drawImage
     * @param {String} filePath - of image file 
     */
    Layout.drawImage = function(filePath) {
        const outputCanvas = new PixelCanvas("outputCanvas");
        outputCanvas.setSize(window.innerHeight, window.innerHeight);
        outputCanvas.drawImageWithFilePath(filePath);
    };

    /**
     * put navigation buttons to the right
     * @method Layout.navigationAtRight
     */
    Layout.navigationAtRight = function() {
        DOM.style("#topLeft", "left", window.innerHeight + px);
        DOM.style("#topRight", "right", 0 + px);
    };

    /**
     * create text div
     * @method Layout.createTextDiv
     */
    Layout.createTextDiv = function() {
        text = new BigDiv("text");
        text.setDimensions(window.innerWidth - window.innerHeight, window.innerHeight);
        text.setPosition(window.innerHeight, 0);
    };

    /**
     * load an image, return image for referencing, execute some action after loading
     * @method Layout.loadImage
     * @param {String} filePath - relative
     * @param {function} action - callback
     * @return image 
     */
    Layout.loadImage = function(filePath, action) {
        var image = new Image();
        image.onload = action;
        image.onerror = function() {
            console.log("**** loadImage: File " + filePath + " not found");
        };
        image.src = filePath;
        return image;
    };

    /**
     * layout for a page with one still image and navigation buttons
     * @method Layout.oneImage
     * @param {String} prev - url of page to go back, "" for home page
     * @param {String} next - url of page to go to next, "" for home page
     */
    Layout.oneImage = function(prev, next) {
        if (Layout.isLandscape()) {
            Layout.setup(prev, next);
            Layout.activateFontSizeChanges();
            Layout.setFontSizes();
            Layout.navigationAtRight();
            Layout.createTextDiv();
            DOM.create("canvas", "canvasId", "body");
            const canvas = document.getElementById("canvasId");
            canvas.width = window.innerHeight;
            canvas.height = window.innerHeight;
            const context = canvas.getContext("2d");

            Layout.drawImage = function(filePath) {
                const image = Layout.loadImage(filePath, function() {
                    context.drawImage(image, 0, 0, window.innerHeight, window.innerHeight);
                });
            };
        } else {
            Layout.drawImage = function() {};
        }
    };

}());
