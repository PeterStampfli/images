/* jshint esversion:6 */

// doing the layout in a private scope


(function() {
    "use strict";
    Make.imageQuality = "low";

    //element sizes related to window dimensions

    // max output width to  window width for small width to height ratio
    const outputImageMaxWidthFraction = 0.65;
    // max control width to window height ratio for large width to height
    const controlMaxWidthFraction = 0.7;
    // ratio between height of control image and window height
    const controlImageHeightFraction = 0.65;
    // for the size of the arrow controller to image height
    const arrowControlFraction = 0.25;
    // for the max height of the text area vs WindowHeight
    const textMaxHeightFraction = 0.75;

    // font size related
    // fontsize varies with image size
    const fontsizeToWindowHeight = 0.028;
    // h1 titel font size is larger 
    const relativeH1Fontsize = 1.0;
    // rekative size of margins
    const textMarginToFontsize = 0.5;
    // weight of button borders
    const borderWidthToFontsize = 0.15;
    // width of number input buttons
    const inputWidthToFontsize = 3.5;
    // backgroundcolor of everything
    const backgroundColor = "#888888";
    const textBackgroundColor = "#eeeeee";
    const px = "px";

    // create DOM elements before setting styles

    let helpButton = new Button("help");
    helpButton.onClick = function() {
        window.location = "help.html";
    };

    let homeButton = new Button("home");
    homeButton.onClick = function() {
        window.location = "index.html";
    };

    //symmetries
    let setKButton = NumberButton.create("k");
    setKButton.setRange(2, 10000);
    setKButton.setValue(5);
    setKButton.onChange = function(v) {
        Make.updateNewMap();
    };

    let setMButton = NumberButton.create("m");
    setMButton.setRange(2, 10000);
    setMButton.setValue(2);
    setMButton.onChange = function(v) {
        Make.updateNewMap();
    };

    let setNButton = NumberButton.create("n");
    setNButton.setRange(2, 10000);
    setNButton.setValue(4);
    setNButton.onChange = function(v) {
        Make.updateNewMap();
    };

    var tiling = "regular";

    // initializing things before calculating the map (uopdateKMN)
    Make.initializeMap = function() {
        let k = setKButton.getValue();
        let m = setMButton.getValue();
        let n = setNButton.getValue();
        if (tiling == "regular") {
            threeMirrorsKaleidoscope.setKMN(k, m, n);
        } else if (tiling == "semiRegular1") {
            cutCornersKaleidoscope.setKMN(k, m, n);
        } else if (tiling == "semiRegular2") {
            cutSidesKaleidoscope.setKMN(k, m, n);
        } else {
            console.log("nosuch tiling: " + tiling);
        }
    };
    // choose between structure and image

    let structureImageChoiceButtons = new Selection();

    let showStructureButton = structureImageChoiceButtons.createButton("showStructure");
    let showImageButton = structureImageChoiceButtons.createButton("showImage");

    function activateControls(status) {
        Make.controlImage.mouseEvents.isActive = status;
        Make.arrowController.mouseEvents.isActive = status;
    }

    showStructureButton.onPress = function() {
        Make.switchToShowingStructure();
        activateControls(false);
    };

    showImageButton.onPress = function() {
        if (!Make.inputImageExists) {
            imageInputButton.fileInput.click();
        } else {
            Make.switchToShowingImage();
        }
        DOM.style("#arrowController,#controlCanvas", "display", "initial");
        activateControls(true);
    };

    //in/output
    let imageInputButton = Make.createImageInput("openInputImage", "inputImageName");
    imageInputButton.onClick = function() {
        console.log("switch choice to imag");
        imageInputButton.fileInput.click();
        structureImageChoiceButtons.setPressed(showImageButton);
        DOM.style("#arrowController,#controlCanvas", "display", "initial");
        activateControls(true);
    };

    Make.createSaveImagePng("saveOutputImage", "kaleidoscope");

    // image imageQuality
    let sizeButton = Make.createSquareImageSizeButton("size");
    sizeButton.setValue(window.innerHeight);
    let qualityChoiceButtons = new Selection();
    let lowQualityButton = qualityChoiceButtons.createButton("lowQuality");
    let highQualityButton = qualityChoiceButtons.createButton("highQuality");
    let veryHighQualityButton = qualityChoiceButtons.createButton("veryHighQuality");

    function changeQuality(newQuality) {
        if (Make.imageQuality != newQuality) {
            Make.imageQuality = newQuality;
            Make.updateOutputImage();
        }
    }

    lowQualityButton.onPress = function() {
        changeQuality("low");
    };
    highQualityButton.onPress = function() {
        changeQuality("high");
    };
    veryHighQualityButton.onPress = function() {
        changeQuality("veryHigh");
    };

    let tilingChoiceButtons = new Selection();
    let regularTilingButton = tilingChoiceButtons.createButton("regular");
    let semireg1TilingButton = tilingChoiceButtons.createButton("semiRegular1");
    let semireg2TilingButton = tilingChoiceButtons.createButton("semiRegular2");

    function changeTiling(newTiling) {
        if (newTiling != tiling) {
            tiling = newTiling;
            Make.updateNewMap();
        }
    }

    regularTilingButton.onPress = function() {
        setNButton.setRange(2, 10000);
        changeTiling("regular");
    };
    semireg1TilingButton.onPress = function() {
        setNButton.setRange(3, 10000);
        changeTiling("semiRegular1");
    };
    semireg2TilingButton.onPress = function() {
        setNButton.setRange(3, 10000);
        changeTiling("semiRegular2");
    };

    DOM.style("body", "backgroundColor", backgroundColor);
    DOM.style("body", "fontFamily", "'Open Sans', Arial, sans-serif");

    let fontSize = fontsizeToWindowHeight * window.innerHeight;
    DOM.style("h1", "fontSize", relativeH1Fontsize * fontSize + px);
    DOM.style("p,button,input,table", "fontSize", fontSize + px);
    DOM.style("p,h1,table", "margin", textMarginToFontsize * fontSize + px);
    DOM.style("button,input", "borderWidth", borderWidthToFontsize * fontSize + px);
    DOM.style("input", "width", inputWidthToFontsize * fontSize + "px");

    let controlMaxWidth = controlMaxWidthFraction * window.innerHeight;
    var outputCanvasWidth;

    if (window.innerWidth > window.innerHeight + controlMaxWidth) {
        outputCanvasWidth = window.innerWidth - controlMaxWidth; // very wide window: increase output image width
    } else if (window.innerHeight < outputImageMaxWidthFraction * window.innerWidth) {
        outputCanvasWidth = window.innerHeight; // sufficiently wide
    } else {
        outputCanvasWidth = outputImageMaxWidthFraction * window.innerWidth;
    }

    let outputCanvasHeight = window.innerHeight;


    let controlWidth = window.innerWidth - outputCanvasWidth;
    let arrowControlSize = arrowControlFraction * window.innerHeight;
    let controlImageHeight = controlImageHeightFraction * window.innerHeight;
    let textMaxHeight = textMaxHeightFraction * window.innerHeight;

    Make.createOutputImage("outputCanvas", outputCanvasWidth, outputCanvasHeight);


    Make.createControlImage("controlCanvas", controlWidth, controlImageHeight, outputCanvasWidth, 0);
    Make.controlImage.centerVertical = false; // put controlcanvas to top
    DOM.style("#controlCanvas", "backgroundColor", textBackgroundColor);

    Make.createArrowController("arrowController", arrowControlSize, outputCanvasWidth + 0.5 * (controlWidth - arrowControlSize), controlImageHeight);
    DOM.style("#controlCanvas,#arrowController", "zIndex", "10");

    // custom colors possible
    Make.arrowController.backGroundColor = "#444444";
    Make.arrowController.arrowColor = "#ffffff";
    Make.arrowController.drawOrientation();

    DOM.style("#arrowController,#controlCanvas", "display", "none");
    activateControls(false);


    DOM.style("#text", "position", "fixed", "overflow", "auto");

    DOM.style("#text", "width", controlWidth + px, "maxHeight", textMaxHeight + px, "left", outputCanvasWidth + px, "bottom", 0 + px);


    DOM.style("#text", "backgroundColor", textBackgroundColor, "zIndex", "11");



    document.getElementById("text").onclick = function() {
        console.log("text");
        DOM.style("#text", "zIndex", "11");
    };

    Make.controlImage.mouseEvents.downAction = function() {
        console.log("contr");
        DOM.style("#text", "zIndex", "9");

    };



    Make.createMap();



    Make.setOutputSize(Math.min(outputCanvasWidth, outputCanvasHeight));

    Make.setInitialOutputImageSpace(-1, 1, -1);
    Make.resetOutputImageSpace();



}());



Make.showStructure = true;



Make.updateNewMap();






//Make.readImageWithFilePathAtSetup("blueYellow.jpg");
