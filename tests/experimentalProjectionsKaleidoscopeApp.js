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

    // setting initial range of space coordinates for output image (1st linear transform)
    Make.setInitialOutputImageSpace(-1, 1, -1);

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

    // choosing the tiling
    var tiling = "regular";
    // show the sum of angles
    let sum = document.getElementById("sum");

    // check if the image will be elliptic
    function isElliptic() {
        return (1 / setKButton.getValue() + 1 / setMButton.getValue() + 1 / setNButton.getValue() > 1.0001);
    }


    Make.initializeMap = function() {
        let k = setKButton.getValue();
        let m = setMButton.getValue();
        let n = setNButton.getValue();
        sum.innerHTML = "" + Math.round(180 * (1 / k + 1 / m + 1 / n)) + "<sup>o</sup>";
        switch (tiling) {
            case "regular":
                threeMirrorsKaleidoscope.setKMN(k, m, n);
                break;
            case "uniformTruncated":
                cutCornersKaleidoscope.setKMN(k, m, n);
                break;
            case "rectified":
                cutSidesKaleidoscope.setKMN(k, m, n);
                break;
            default:
                console.log("nosuch tiling: " + tiling);
        }

        // the choosers for projection
        DOM.style("#ellipticDiv,#euclidicDiv,#hyperbolicDiv", "display", "none");
        switch (basicKaleidoscope.geometry) {
            case basicKaleidoscope.elliptic:
                sum.innerHTML += ", elliptic geometry";
                DOM.style("#ellipticDiv", "display", "initial");
                break;
            case basicKaleidoscope.euclidic:
                sum.innerHTML += ", Euklidic geometry";
                DOM.style("#euclidicDiv", "display", "initial");
                break;
            case basicKaleidoscope.hyperbolic:
                sum.innerHTML += ", hyperbolic geometry";
                DOM.style("#hyperbolicDiv", "display", "initial");
                break;
        }
    };

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
    setNButton.setValue(3);
    setNButton.onChange = updateMapNoReset;

    // the different tilings

    // upon changing the tiling we have to recalculate it, without resetting the third map to input pixels
    function changeTiling(newTiling) {
        if (newTiling != tiling) {
            tiling = newTiling;
            Make.allowResetInputMap = false;
            Make.updateNewMap();
            Make.allowResetInputMap = true;
        }
    }

    let tilingSelect = new Select("tiling");

    tilingSelect.addOption("regular",
        function() {
            setNButton.setRange(2, 10000);
            changeTiling("regular");
        });

    tilingSelect.addOption("uniform truncated",
        function() {
            setNButton.setRange(3, 10000);
            changeTiling("uniformTruncated");
        });

    tilingSelect.addOption("rectified",
        function() {
            setNButton.setRange(3, 10000);
            changeTiling("rectified");
        });

    // the projections (depending on space geometry)

    // for elliptic geometry

    let ellipticProjectionSelect = new Select("selectEllipticProjection");
    ellipticProjectionSelect.addOption("orthographic", projection.ellipticNormal);
    ellipticProjectionSelect.addOption("gonomic", projection.ellipticGonomic);
    ellipticProjectionSelect.addOption("stereographic", projection.ellipticStereographic);
    ellipticProjectionSelect.addOption("mercator", projection.ellipticMercator);

    // for euklidic geometry
    let euclidicProjectionSelect = new Select("selectEuclidicProjection");
    euclidicProjectionSelect.addOption("direct", projection.euclidicNormal);
    euclidicProjectionSelect.addOption("single spiral", projection.euclidicSingleSpiral);
    euclidicProjectionSelect.addOption("double spiral", projection.euclidicDoubleSpiral);
    //euclidicProjectionSelect.addOption("disc", projection.euclidicDisc);
    // euclidicProjectionSelect.addOption("triple spiral", projection.euclidicTripleSpiral);
    // euclidicProjectionSelect.addOption("spiralTest", projection.euclidicSpiralTest);


    // for hyperbolic geometry
    let hyperbolicProjectionSelect = new Select("selectHyperbolicProjection");
    hyperbolicProjectionSelect.addOption("Poincaré disc", projection.hyperbolicPoincareDisc);
    hyperbolicProjectionSelect.addOption("Beltrami-Klein disc", projection.hyperbolicKleinDisc);
    hyperbolicProjectionSelect.addOption("Poincaré plane", projection.hyperbolicPoincarePlane);
    hyperbolicProjectionSelect.addOption("Bulatov band", projection.hyperbolicBulatovBand);
    hyperbolicProjectionSelect.addOption("pseudo gonomic", projection.hyperbolicGonomic);
    hyperbolicProjectionSelect.addOption("pseudo normal", projection.hyperbolicNormal);
    hyperbolicProjectionSelect.addOption("pseudo mercator", projection.hyperbolicMercator);

}

// adjust fontsize related dimesnions

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
