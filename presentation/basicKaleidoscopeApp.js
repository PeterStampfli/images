/* jshint esversion:6 */

// create the UI elements and their interactions

function creation() {
    "use strict";
    // first do single touch debug with desktop browser
    TouchEvents.doubleTouchDebug = false;

    Make.imageQuality = "low";

    //  define general constants
    //=================================================================================
    const backgroundColor = "#888888";
    const textBackgroundColor = "#eeeeee";
    const px = "px";

    // some styling, body already exists 
    //===============================================================================
    DOM.style("body", "backgroundColor", backgroundColor);
    DOM.style("body", "fontFamily", "'Open Sans', Arial, sans-serif");




    //================================================================================
    // creating canvas and text elements and layout independent styles
    //==================================================================================

    Make.createOutputImage("outputCanvas");
    Make.createControlImage("controlCanvas");
    Make.createMap();

    Make.createArrowController("arrowController", true);
    Make.arrowController.backGroundColor = "#444444";
    Make.arrowController.arrowColor = "#ffffff";
    DOM.style("#controlCanvas", "backgroundColor", textBackgroundColor);
    DOM.style("#controlCanvas,#arrowController", "zIndex", "10");
    DOM.style("#arrowController,#controlCanvas", "display", "none");

    activateControls(false);

    DOM.style("#text", "position", "fixed", "overflow", "auto");


    DOM.style("#text", "backgroundColor", textBackgroundColor, "zIndex", "11");



    document.getElementById("text").onclick = function() {
        DOM.style("#text", "zIndex", "11");
    };

    Make.controlImage.mouseEvents.downAction = function() {
        DOM.style("#text", "zIndex", "9");
    };



    //=====================================================================================
    // functions for the UI elements
    //=================================================================================

    // enable/disable mouse and touch on control image and arrow controller
    function activateControls(status) {
        Make.controlImage.mouseEvents.isActive = status;
        Make.arrowController.mouseEvents.isActive = status;
        Make.controlImage.touchEvents.isActive = status;
        Make.arrowController.touchEvents.isActive = status;
    }

    // update the 2nd nonlinear map that defines the geometry without reseting the 3rd mapping for the input image pixels
    function updateMapNoReset() {
        Make.allowResetInputMap = false;
        Make.updateNewMap();
        Make.allowResetInputMap = true;
    }

    //==============================================================================================
    // create UI elements with their actions that are independent of the image geometry
    //===============================================================================================

    // navigation
    let helpButton = new Button("help");
    helpButton.onClick = function() {
        window.location = "help.html";
    };

    let homeButton = new Button("home");
    homeButton.onClick = function() {
        window.location = "index.html";
    };

    // image input and output
    let imageInputButton = Make.createImageInput("openInputImage", "inputImageName");
    imageInputButton.onClick = function() {
        console.log("switch choice to imag");
        imageInputButton.fileInput.click();
        structureImageChoiceButtons.setPressed(showImageButton);
        DOM.style("#arrowController,#controlCanvas", "display", "initial");
        activateControls(true);
    };

    Make.createSaveImagePng("saveOutputImage", "kaleidoscope");

    // choose between showing the structure or the image
    let structureImageChoiceButtons = new Selection();
    let showStructureButton = structureImageChoiceButtons.createButton("showStructure");
    let showImageButton = structureImageChoiceButtons.createButton("showImage");

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

    // image size, square format
    Make.sizeButton = Make.createSquareImageSizeButton("size");


    //  choosing image quality
    function changeQuality(newQuality) {
        if (Make.imageQuality != newQuality) {
            Make.imageQuality = newQuality;
            Make.updateOutputImage();
        }
    }


    let qualityChoiceButtons = new Selection();
    let lowQualityButton = qualityChoiceButtons.createButton("lowQuality");
    let highQualityButton = qualityChoiceButtons.createButton("highQuality");
    let veryHighQualityButton = qualityChoiceButtons.createButton("veryHighQuality");

    lowQualityButton.onPress = function() {
        changeQuality("low");
    };
    highQualityButton.onPress = function() {
        changeQuality("high");
    };
    veryHighQualityButton.onPress = function() {
        changeQuality("veryHigh");
    };

    //=====================================================================================================================================
    // UI elements depending on actual image and its symmetries
    //==============================================================================================================


    // initializing map parameters, choosing the map
    // this is called before calculating the second map in geometrical space, that defines the geometry
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

    // upon changing the tiling we have to recalculate it, without resetting the third map to input pixels
    function changeTiling(newTiling) {
        if (newTiling != tiling) {
            tiling = newTiling;
            Make.allowResetInputMap = false;
            Make.updateNewMap();
            Make.allowResetInputMap = true;
        }
    }

    // setting initial range of space coordinates for output image (1st linear transform)
    Make.setInitialOutputImageSpace(-1, 1, -1);


    //choosing the symmetries, and set initial values
    let setKButton = NumberButton.create("k");
    setKButton.setRange(2, 10000);
    setKButton.setValue(5);
    setKButton.onChange = updateMapNoReset;

    let setMButton = NumberButton.create("m");
    setMButton.setRange(2, 10000);
    setMButton.setValue(2);
    setMButton.onChange = updateMapNoReset;

    let setNButton = NumberButton.create("n");
    setNButton.setRange(2, 10000);
    setNButton.setValue(4);
    setNButton.onChange = updateMapNoReset;

    // choosing the tiling
    var tiling = "regular";

    let tilingChoiceButtons = new Selection();
    let regularTilingButton = tilingChoiceButtons.createButton("regular");
    let semireg1TilingButton = tilingChoiceButtons.createButton("semiRegular1");
    let semireg2TilingButton = tilingChoiceButtons.createButton("semiRegular2");

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

}

// adjust fontsize related dimesnions

// adjust fontsizes, margins, borders and so on
// call later, we first have to create DOM elements before setting their styles


function adjustFont(fontSize) {

    // define general relations between text elements and font size, independent of window dimensions
    //===============================================================================
    // h1 titel font size is larger 
    const relativeH1Fontsize = 1.0;
    // rekative size of margins
    const textMarginToFontsize = 0.5;
    // weight of button borders
    const borderWidthToFontsize = 0.15;
    // width of number input buttons
    const inputWidthToFontsize = 3.5;
    DOM.style("h1", "fontSize", relativeH1Fontsize * fontSize + px);
    DOM.style("p,button,input,table", "fontSize", fontSize + px);
    DOM.style("p,h1,table", "margin", textMarginToFontsize * fontSize + px);
    DOM.style("button,input", "borderWidth", borderWidthToFontsize * fontSize + px);
    DOM.style("input", "width", inputWidthToFontsize * fontSize + "px");
}


// make the layout for landscape orientation 

function landscapeFormat() {
    //  for landscape format 
    //================================================
    //element sizes related to window dimensions

    // control width to window height ratio for large width to height
    const controlTargetWidthFraction = 0.7;
    // ratio between height of control image and window height
    const controlImageHeightFraction = 0.65;
    // for the maximum size of the arrow controler to control width
    const arrowControlWidthLimitFraction = 0.75;
    // for the max height of the text area vs WindowHeight
    const textMaxHeightFraction = 0.75;
    // fontsize varies with image size
    const fontsizeToWindowHeight = 0.028;

    // set the font size, depending on the smaller window dimension
    let fontSize = fontsizeToWindowHeight * window.innerHeight;
    adjustFont();

    adjustFont(fontSize);

    // adjusting the maximum width for the output image
    var outputImageDivWidth;


    // the size of the controls at the left for sufficiently wide screens
    let controlWidth = controlTargetWidthFraction * window.innerHeight;

    // typical layout: width of output image div is equal to window height, control width is a fraction of window height
    // what happens if the sum of these widths is not equal to the window width?

    if (window.innerWidth > window.innerHeight + controlWidth) {
        // if the width is larger increase the width of the output image div
        outputImageDivWidth = window.innerWidth - controlWidth;
    } else {
        // the screen is not very wide: rescale the widths
        let rescale = window.innerWidth / (window.innerHeight + controlWidth);
        outputImageDivWidth = rescale * window.innerHeight;
        controlWidth *= rescale;
    }

    // always use the full height for the output image
    let outputImageDivHeight = window.innerHeight;
    Make.outputImage.setDivDimensions(outputImageDivWidth, outputImageDivHeight);

    // make up the control image dimensions
    let controlImageHeight = controlImageHeightFraction * window.innerHeight;
    // layout: control image at top close to space for output image
    Make.controlImage.setDimensions(controlWidth, controlImageHeight);
    Make.controlImage.setPosition(outputImageDivWidth, 0);
    Make.controlImage.centerVertical = false; // put controlimage to top  (should always be visible)

    // make the arrow controller as large as possible, using all space below the control image reserved area, 
    // smaller than a given fraction of conrol width
    let arrowControlSize = Math.floor(Math.min(window.innerHeight - controlImageHeight, arrowControlWidthLimitFraction * controlWidth));
    Make.arrowController.setPosition(outputImageDivWidth + 0.5 * (controlWidth - arrowControlSize), controlImageHeight);
    Make.arrowController.setSize(arrowControlSize);

    // the text UI control div

    let textMaxHeight = textMaxHeightFraction * window.innerHeight;
    DOM.style("#text", "width", controlWidth + px, "maxHeight", textMaxHeight + px, "left", outputImageDivWidth + px, "bottom", 0 + px);


}


// on loading: create everything and make an image (with structure, automatically)


window.onload = function() {
    console.log("onload");

    creation();
    landscapeFormat();
    // independent of layout
    Make.arrowController.drawOrientation();
    // fit output image into the surrounding div
    let outputSize = Math.floor(Math.min(Make.outputImage.divWidth, Make.outputImage.divHeight));

    Make.setOutputSize(outputSize);
    Make.sizeButton.setValue(outputSize);
    Make.resetOutputImageSpace();
    Make.showStructure = true;

    Make.updateNewMap();
};

window.onresize = function() {
    console.log("start resize");
    // get old sizes, see if they change -> need redraw
    const oldArrowControllerSize = Make.arrowController.size;
    const oldOutputImageWidth = Make.outputImage.pixelCanvas.width;
    const oldOutputImageHeight = Make.outputImage.pixelCanvas.height;
    const oldControlImageMaxWidth = Make.controlImage.maxWidth;
    const oldControlImageMaxHeight = Make.controlImage.maxHeight;
    // check if the output image is inside its div -> resize upon change to fill the div 
    const outputImageWasInside = (oldOutputImageWidth <= Make.outputImage.divWidth) && (oldOutputImageHeight <= Make.outputImage.divHeight);
    console.log("outputImage was inside");


    landscapeFormat();

    // redraw the arrowController if its size changes
    if (oldArrowControllerSize !== Make.arrowController.size) {
        console.log("redraw arrowcontroller");
        Make.arrowController.drawOrientation();
    }

    // do we have to reload the input image into the control image?
    // input image has to exist and the limits have changed
    const updateControlImage = Make.inputImageExists && ((oldControlImageMaxWidth !== Make.controlImage.maxWidth) || (oldControlImageMaxHeight !== Make.controlImage.maxHeight));
    console.log("update control " + updateControlImage);

    if (updateControlImage) {
        Make.controlImage.loadInputImage(Make.inputImage);
    }

    // determine the new output image size
    // the output image should always fill the div, minimal size
    let outputImageSizeMin = Math.floor(Math.min(Make.outputImage.divWidth, Make.outputImage.divHeight));
    // if the 

    /* size button on change 
     * Make.setOutputSize(size, size);
            Make.updateNewOutputImageSize();
            */

    /**
     * attach an input image PIXELCANVAS (call always after reading a new one), resizes, loads image
     * @method ControlImage#loadInputImage
     * @param {PixelCanvas} inputImage - the input image
     */

    //Make.arrowController.action = Make.updateOutputImageIfUsingInputImage;

    console.log("end resize");
};
