/* jshint esversion:6 */

// create the UI elements and their interactions


function creation() {
    "use strict";
    // first do single touch debug with desktop browser
    TouchEvents.doubleTouchDebug = false;
    //----------------------------------------------------------------------------------

    Make.imageQuality = "low";

    //  define general constants
    //=================================================================================
    const backgroundColor = "#888888";
    const textBackgroundColor = "#eeeeee";
    const outputImageBackgroundColor = "#666666";
    const controlImageBackgroundColor = "white";
    const px = "px";

    // some styling, body already exists 
    //===============================================================================
    DOM.style("body", "backgroundColor", backgroundColor);
    DOM.style("body", "fontFamily", "'Open Sans', Arial, sans-serif");

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

    //================================================================================
    // creating canvas and text elements and layout independent styles
    //==================================================================================

    Make.createOutputImage("outputCanvas");
    Draw.setOutputImage(Make.outputImage);



    Make.createControlImage("controlCanvas");
    Make.createMap();
    Make.createArrowController("arrowController", true);
    Make.arrowController.backGroundColor = "#444444";
    Make.arrowController.arrowColor = "#ffffff";
    DOM.style("#outputCanvas", "backgroundColor", outputImageBackgroundColor);
    DOM.style("#controlCanvas", "backgroundColor", controlImageBackgroundColor);
    DOM.style("#controlCanvas,#arrowController", "zIndex", "10");

    // disable mouse and touch for control image and arrow controller as long as no input image
    activateControls(false);

    // "text" is the collection of text-based control elements
    DOM.style("#text", "position", "fixed", "overflow", "auto");
    DOM.style("#text", "right", 0 + px, "bottom", 0 + px);
    DOM.style("#text", "backgroundColor", textBackgroundColor, "zIndex", "11");

    const text = document.getElementById("text");

    // switching (foreground/background) between controlimage/arrowcontroller and text based control elements
    text.onclick = function() {
        DOM.style("#text", "zIndex", "11");
    };
    Make.controlImage.mouseEvents.downAction = function() {
        DOM.style("#text", "zIndex", "9");
    };
    Make.controlImage.touchEvents.startAction = function() {
        DOM.style("#text", "zIndex", "9");
    };

    Make.arrowController.outAction = function() {
        text.click();
    };
    Make.arrowController.downAction = function() {
        DOM.style("#text", "zIndex", "9");
    };

    // special layout dependent method for placing arrowController
    Make.arrowController.place = function() {
        if (window.innerWidth > window.innerHeight) {
            let controlImageHeight = Make.controlImage.pixelCanvas.height;
            let arrowControlSize = Math.floor(Math.min(window.innerHeight - controlImageHeight, Make.controlImage.maxWidth)) - 1;
            Make.arrowController.setSize(arrowControlSize);
            Make.controlImage.arrowController.setPosition(Make.controlImage.limitLeft + 0.5 * (Make.controlImage.maxWidth - arrowControlSize), controlImageHeight);
        } else {
            let controlImageWidth = Make.controlImage.pixelCanvas.width;
            let arrowControlSize = Math.floor(Math.min(window.innerWidth - controlImageWidth, Make.controlImage.maxHeight)) - 1;
            Make.arrowController.setSize(arrowControlSize);
            Make.controlImage.arrowController.setPosition(controlImageWidth, Make.controlImage.limitTop + 0.5 * (Make.controlImage.maxHeight - arrowControlSize));
        }
    };


    //==============================================================================================
    // create UI elements with their actions that are independent of the actual image structure/symmetry
    //===============================================================================================

    // navigation
    let helpButton = new Button("help");
    helpButton.onClick = function() {
        window.location = "help.html";
    };

    let homeButton = new Button("home");
    homeButton.onClick = function() {
        window.location = "home.html";
    };

    // image input and output
    let imageInputButton = Make.createImageInput("openInputImage", "inputImageName");
    imageInputButton.onClick = function() {
        imageInputButton.fileInput.click();
        showSelect.setIndex(1);
        activateControls(true);
    };

    Make.createSaveImagePng("saveOutputImage", "kaleidoscope");

    // choose between showing the structure or the image
    let showSelect = new Select("show");

    showSelect.addOption("structure",
        function() {
            Make.switchToShowingStructure();
            activateControls(false);
        });

    showSelect.addOption("image",
        function() {
            if (!Make.inputImageExists) {
                imageInputButton.fileInput.click();
            } else {
                Make.switchToShowingImage();
            }
            activateControls(true);
        });

    // image size, square format
    Make.sizeButton = Make.createSquareImageSizeButton("size");

    //  choosing image quality
    function changeQuality(newQuality) {
        if (Make.imageQuality != newQuality) {
            Make.imageQuality = newQuality;
            Make.updateOutputImage();
        }
    }

    let qualitySelect = new Select("quality");

    qualitySelect.addOption("low",
        function() {
            changeQuality("low");
        });

    qualitySelect.addOption("high",
        function() {
            changeQuality("high");
        });

    qualitySelect.addOption("very high",
        function() {
            changeQuality("veryHigh");
        });

    //=====================================================================================================================================
    // UI elements depending on actual image and its symmetries
    //==============================================================================================================

    // what has to be done


    // initializing map parameters, choosing the map in the method     Make.initializeMap
    // this is called before calculating the second map in geometrical space, this map  defines the geometry

    // set the mapping  functions via:
    //         Make.setMapping(mapInputImageMethod, mapStructureMethod);
    // where
    //  mapInputImageMethod(position) maps the Vector2 object position, 
    //  returns the lyapunov coefficient>0 if mapping successful, returns value<0 if mapping not successful
    // mapStructureMethod is similar, except that returned position.x is number of reflections
    //  (Note that position.x=0 gets special color (no mapping...), colors defined in vectorMap.js

    // setting a disc radius for the output image:
    // Make.map.discRadius=???,  value >0 for output image clipped to circle, <0 for no clipping
    //==========================================================================================================================

    // if we need some special drawing over the image, modify:
    //   Make.updateOutputImage = Make.updateMapOutput; //default, if needed add some lines ...
    // where Make.updateMapOutput is the method to draw the image according to the map

    // setting initial range of space coordinates for output image (1st linear transform)
    Make.setInitialOutputImageSpace(-10, 10, -10);
    imageTiles.dimensions(-10, 10, -10, 10, 0.5);

    imageTiles.allSymmetric = false;

    imageTiles.setMapping();

    Make.initializeMap = function() {

    };

    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        // Make.outputImage.adjustCanvasTransform();
        //Make.outputImage.pixelCanvas.fillScreen("white");
        Draw.setLineWidth(3);
        Draw.setColor("red");
        //   iterateTiling.drawStructure(0);
        //  distortedSquares.drawStructure();

        //  Draw.setLineWidth(1);
        //  Draw.setColor("blue");
        //   iterateTiling.drawStructure(1);
        circleScope.draw();

    };



    ambe.twoColorImage();
    ambe.straightSingleColorImage();
    //  ambe.shearedSingleColorImage();

    // select decoration for each one
    penroseRhombs.slimWithStraightDeco = true;
    penroseRhombs.fatWithStraightDeco = false;

    // iterateTiling.initialPolygons = penrose.start;
    //  iterateTiling.initialPolygons = ambe.start;
    //   iterateTiling.initialPolygons = small12.start;
    // iterateTiling.initialPolygons = stampfli.start;
    //  iterateTiling.initialPolygons = octagon.start;
    //   iterateTiling.initialPolygons = penroseRhombs.start;
    iterateTiling.initialPolygons = kite8.start;
    iterateTiling.initialPolygons = triangles12.start;

    //  Polygon.mapWithShiftRotateMirror();
    //  Polygon.mapWithShiftRotateMirrorScaleShear();
    //   Polygon.mapWithShiftRotateMirrorShear();

    iterateTiling.setMaxIterations(1);
    //  iterateTiling.generateStructure();


    distortedSquares.distortion = function(position) {
        let factor = Math.hypot(position.x, position.y) / distortedSquares.size;
        factor *= 1.5;
        factor = Math.min(factor, 0.9);
        position.x += (Math.random() - 0.5) * distortedSquares.side * factor;
        position.y += (Math.random() - 0.5) * distortedSquares.side * factor;
    };


    distortedSquares.generate();



    circleScope.setDihedral(4);
    circleScope.circle1.setRadiusCenterXY(6, 6, 6);
    circleScope.discRadius = 6;
    circleScope.setMapping();

}

// adjust fontsize related dimensions

// adjust fontsizes, margins, borders and so on
// call later, we first have to create DOM elements before setting their styles


function adjustFont(fontSize) {
    "use strict";


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
    DOM.style("p,button,input,table,select", "fontSize", fontSize + px);
    DOM.style("p,h1,table", "margin", textMarginToFontsize * fontSize + px);
    DOM.style("button,input", "borderWidth", borderWidthToFontsize * fontSize + px);
    DOM.style("input", "width", inputWidthToFontsize * fontSize + "px");
}


// make the layout for landscape orientation 

function landscapeFormat() {
    "use strict";

    //element sizes related to window dimensions

    // control width to window height ratio for large width to height
    const controlTargetWidthFraction = 0.7;
    // ratio between height of control image and window height
    const controlImageHeightFraction = 0.65;
    // for the maximum size of the arrow controler to control width
    const arrowControlWidthLimitFraction = 0.75;
    // for the max height of the text area vs WindowHeight
    const textMaxHeightFraction = 0.75;

    // typical layout: width of output image div is equal to window height, control width is a fraction of window height
    // what happens if the sum of these widths is not equal to the window width?

    // the size of the controls at the left for sufficiently wide screens
    let controlWidth = controlTargetWidthFraction * window.innerHeight;


    // adjusting the maximum width for the output image
    var outputImageDivWidth = window.innerHeight;

    if (window.innerWidth > outputImageDivWidth + controlWidth) {
        // if the width is larger increase the width of the output image div
        outputImageDivWidth = window.innerWidth - controlWidth;
    } else {
        // the screen is not very wide: rescale the widths
        let rescale = window.innerWidth / (outputImageDivWidth + controlWidth);
        outputImageDivWidth *= rescale;
        controlWidth *= rescale;
    }

    // always use the full height for the output image
    let outputImageDivHeight = window.innerHeight;
    Make.outputImage.setDivDimensions(outputImageDivWidth, outputImageDivHeight);

    // make up the control image dimensions
    let controlImageHeight = controlImageHeightFraction * window.innerHeight;
    // layout: control image at top close to space for output image
    Make.controlImage.setDimensions(controlWidth, controlImageHeight);
    Make.controlImage.setPosition(outputImageDivWidth, 0); // limits
    Make.controlImage.centerVertical = false; // put controlimage to top  (should always be visible)
    Make.controlImage.centerHorizontal = true;



    // the text UI control div

    let textMaxHeight = textMaxHeightFraction * window.innerHeight;
    DOM.style("#text", "maxWidth", "initial", "width", controlWidth + px);
    DOM.style("#text", "maxHeight", textMaxHeight + px, "height", "initial");

}


// make the layout for portrait orientation 

function portraitFormat() {
    "use strict";

    //element sizes related to window dimensions

    // control height to window width ratio for large height to width
    const controlTargetHeightFraction = 0.8;
    // ratio between width of control image and window width
    const controlImageWidthFraction = 0.65;

    // for the max width of the text area vs Window width
    const textMaxWidthFraction = 0.75;


    // typical layout: height of output image div is equal to window width, control height is a fraction of window width
    // what happens if the sum of these heights is not equal to the window height?

    // the size of the controls at the bottom for sufficiently high screens
    let controlImageHeight = controlTargetHeightFraction * window.innerWidth;

    // adjusting the maximum height for the output image
    let outputImageDivHeight = window.innerWidth;

    if (window.innerHeight > outputImageDivHeight + controlImageHeight) {
        // if the height is larger increase the height of the output image div
        outputImageDivHeight = window.innerHeight - controlImageHeight;
    } else {
        // the screen is not very high: rescale the heights
        let rescale = window.innerHeight / (outputImageDivHeight + controlImageHeight);
        outputImageDivHeight *= rescale;
        controlImageHeight *= rescale;
    }

    // always use the full width for the output image
    let outputImageDivWidth = window.innerWidth;
    Make.outputImage.setDivDimensions(outputImageDivWidth, outputImageDivHeight);

    // make up the control image dimensions
    let controlImageWidth = controlImageWidthFraction * window.innerWidth;
    // layout: control image at top close to space for output image
    Make.controlImage.setDimensions(controlImageWidth, controlImageHeight);
    Make.controlImage.setPosition(0, outputImageDivHeight);
    Make.controlImage.centerHorizontal = false; // put controlimage to left  (should always be visible)
    Make.controlImage.centerVertical = true;



    // the text UI control div

    let textMaxWidth = textMaxWidthFraction * window.innerWidth;
    DOM.style("#text", "maxWidth", textMaxWidth + px, "width", "initial");
    DOM.style("#text", "maxHeight", "initial", "height", controlImageHeight + px);

}

// make layout depending on orientation

function layout() {
    // fontsize varies with window
    const fontsizeToWindow = 0.028;

    // set the font size, depending on the smaller window dimension
    let fontSize = fontsizeToWindow * Math.min(window.innerWidth, window.innerHeight);
    adjustFont(fontSize);
    if (window.innerHeight >= window.innerWidth) {
        portraitFormat();
    } else {
        landscapeFormat();
    }
}


// on loading: create everything and make an image (with structure, automatically)


window.onload = function() {
    "use strict";

    creation();
    layout();
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
    "use strict";
    // get old sizes, see if they change -> need redraw
    // we have square images
    const oldOutputImageSize = Make.outputImage.pixelCanvas.width;
    const oldControlImageMaxWidth = Make.controlImage.maxWidth;
    const oldControlImageMaxHeight = Make.controlImage.maxHeight;
    // check if the output image is inside its div -> resize upon change to fill the div 
    const outputImageWasInside = (oldOutputImageSize <= Make.outputImage.divWidth) && (oldOutputImageSize <= Make.outputImage.divHeight);

    layout();


    if (Make.inputImageExists) {
        // do we have to reload the input image into the control image?
        // input image has to exist and the limits have changed
        // else we only need to place it in its new position
        const updateControlImage = ((oldControlImageMaxWidth !== Make.controlImage.maxWidth) || (oldControlImageMaxHeight !== Make.controlImage.maxHeight));

        if (updateControlImage) {
            Make.controlImage.loadInputImage(Make.inputImage); // places the image too
        } else {
            Make.controlImage.place();
        }
    }

    // determine the new output image size
    // the output image should always fill the div, minimal size
    let outputImageSizeMin = Math.floor(Math.min(Make.outputImage.divWidth, Make.outputImage.divHeight));
    // if the output image is smaller, then its size should increase
    let newOutputImageSize = Math.max(outputImageSizeMin, oldOutputImageSize);
    // if the ouput image was completely inside its div, then it should have the new minimum size, can reduce output image size
    // if the output image has been larger, it does not change, except that it has been too small for the new layout, that's already done
    if (outputImageWasInside) {
        newOutputImageSize = outputImageSizeMin;
    }

    if (newOutputImageSize !== oldOutputImageSize) {
        // if the size of the output image has changed, then we have to redo everything
        Make.setOutputSize(newOutputImageSize, newOutputImageSize);
        Make.sizeButton.setValue(newOutputImageSize);
        Make.updateNewOutputImageSize();

    } else {
        // else we have to place the output image in its div and if the controlimage has been updated 
        //then we have to redo the input pixel mapping to correctly indicate sampled pixels
        Make.outputImage.place();
        Make.updateOutputImageIfUsingInputImage();
    }

};
