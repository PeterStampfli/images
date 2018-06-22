/* jshint esversion:6 */

// doing the layout in a private scope


(function() {
    "use strict";
    Make.imageQuality = "low";

    // ratio between height of control image and window height
    const controlHeightFraction = 0.25;
    // fontsize varies with image size
    const fontsizeToWindowHeight = 0.03;
    // h1 titel font size is larger 
    const relativeH1Fontsize = 1.0;
    // rekative size of margins
    const textMarginToFontsize = 0.5;
    // weight of button borders
    const borderWidthToFontsize = 0.15;
    // width of number input buttons
    const inputWidthToFontsize = 3.5;
    // backgroundcolor of everything
    const backgroundColor = "#eeeeee";
    const px = "px";

    // create DOM elements before setting styles

    let helpButton = new Button("help");
    helpButton.onClick = function() {
        //window.location="";
        console.log("goHelp");

    };

    let homeButton = new Button("home");
    homeButton.onClick = function() {
        //window.location="";
        console.log("goHome");

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

    showStructureButton.onPress = function() {
        Make.switchToShowingStructure();
    };

    showImageButton.onPress = function() {
        if (!Make.inputImageExists) {
            imageInputButton.fileInput.click();
        } else {
            Make.switchToShowingImage();
        }
    };

    //in/output
    let imageInputButton = Make.createImageInput("openInputImage", "inputImageName");
    imageInputButton.onClick = function() {
        console.log("switch choice to imag");
        imageInputButton.fileInput.click();
        structureImageChoiceButtons.setPressed(showImageButton);
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
        setNButton.setRange(2, 10000);
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


    let outputCanvasWidth = Math.max(window.innerHeight, window.innerWidth - window.innerHeight);
    let outputCanvasHeight = window.innerHeight;

    Make.createOutputImage("outputCanvas", outputCanvasWidth, outputCanvasHeight);

    let controlWidth = window.innerWidth - outputCanvasWidth;
    let controlImageHeight = controlHeightFraction * window.innerHeight;

    Make.createControlImage("controlCanvas", controlWidth - controlImageHeight, controlImageHeight, outputCanvasWidth + controlImageHeight, 0);

    Make.createArrowController("arrowController", controlImageHeight, outputCanvasWidth, 0);



    let text = new BigDiv("text", controlWidth, window.innerHeight - controlImageHeight, outputCanvasWidth, controlImageHeight);


    Make.createMap();



    Make.setOutputSize(window.innerHeight);

    Make.setInitialOutputImageSpace(-1, 1, -1);
    Make.resetOutputImageSpace();



}());



Make.showStructure = true;



Make.updateNewMap();






//Make.readImageWithFilePathAtSetup("blueYellow.jpg");