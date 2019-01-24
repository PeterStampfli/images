/**
 * basic layout and user-interaction elements
 * @namespace basicUI
 */
/* jshint esversion:6 */


basicUI = {};

(function() {

    // do single touch debug with desktop browser, to enable double touch debug with mouse set to true
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

    // styling the body that already exists 
    //===============================================================================
    DOM.style("body", "backgroundColor", backgroundColor);
    DOM.style("body", "fontFamily", "'Open Sans', Arial, sans-serif");


    /**
     * enable/disable mouse and touch on control image and arrow controller
     *  does not make them visible
     * @method basicUI.activateControls
     * @param {boolean} status - true to enable control image and mouse controller
     */
    basicUI.activateControls = function(status) {
        Make.controlImage.mouseEvents.isActive = status;
        Make.arrowController.mouseEvents.isActive = status;
        Make.controlImage.touchEvents.isActive = status;
        Make.arrowController.touchEvents.isActive = status;
    };

    // create canvas, text and controll elements (style, without action)
    //=========================================================
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
    basicUI.activateControls(false);

    // "text" is the collection of text-based control elements
    const text = document.getElementById("text");
    DOM.style("#text", "position", "fixed", "overflow", "auto");
    DOM.style("#text", "right", 0 + px, "bottom", 0 + px);
    DOM.style("#text", "backgroundColor", textBackgroundColor, "zIndex", "11");

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
    Make.arrowController.downAction = function() {
        DOM.style("#text", "zIndex", "9");
    };

    Make.arrowController.outAction = function() { // special: clicking outside the disc switches back to the text controls
        text.click();
    };




    // special layout dependent method for placing arrowController
    // called in controlimage.place/controlimage.loadImage/Make.readImageAction
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

    //  create the elements in the text control panel that are independent of particular image/symmetry


    // create image input button if "openInputImage" exists
    var imageInputButton;
    if (DOM.idExists("openInputImage")) {
        imageInputButton = Make.createImageInput("openInputImage", "inputImageName");
        imageInputButton.onClick = function() {
            if (!Make.showingInputImage) { // switch to showing image view selection if image is not somehow shown
                showSelect.setIndex(1);
            }
            basicUI.activateControls(true);

            imageInputButton.fileInput.click();
        };
    }

    Make.createSaveImagePng("saveOutputImage", "kaleidoscope");

    // choose between showing the structure or the image, if id "show" exists
    // note that only things happen if option is changed!
    if (DOM.idExists("show")) {
        var showSelect = new Select("show");

        showSelect.addOption("structure",
            function() {
                console.log("structure");
                Make.showingInputImage = false;
                Make.clearControlImage();
                basicUI.activateControls(false);
                Make.draw = function() {
                    Make.map.drawStructure();
                };
                Make.updateOutputImage();
            });

        showSelect.addOption("image",
            function() {
                Make.showingInputImage = true;
                Make.draw = function() {
                    Make.drawImage();
                };
                basicUI.activateControls(true);
                if (!Make.inputImageExists) {
                    imageInputButton.fileInput.click();
                } else {
                    Make.updateOutputImage();
                }
            });

        /**
         * add more options to the showSelect button
         * @method basicUI.showSelectAdd
         */
        basicUI.showSelectAdd = function() {
            showSelect.addOption("convergence",
                function() {
                    Make.showingInputImage = false;
                    Make.clearControlImage();
                    basicUI.activateControls(false);
                    Make.draw = function() {
                        Make.map.drawIterations();
                    };
                    Make.updateOutputImage();
                });

            showSelect.addOption("convergence/structure",
                function() {
                    Make.showingInputImage = false;
                    Make.clearControlImage();
                    basicUI.activateControls(false);
                    Make.draw = function() {
                        Make.map.drawIterationsStructure();
                    };
                    Make.updateOutputImage();
                });

            showSelect.addOption("convergence/image",
                function() {
                    console.log("opt convimage");
                    Make.showingInputImage = true;
                    basicUI.activateControls(true);
                    Make.draw = function() {
                        Make.controlImage.semiTransparent();
                        Make.map.drawIterationsImage();
                    };
                    if (!Make.inputImageExists) {
                        imageInputButton.fileInput.click();
                    } else {
                        Make.updateOutputImage();
                    }
                });
        };
    }

    // image size, square format
    Make.sizeButton = Make.createSquareImageSizeButton("size");

    //  choosing image quality
    function changeQuality(newQuality) {
        if (Make.imageQuality != newQuality) {
            Make.imageQuality = newQuality;
            Make.updateOutputImage();
        }
    }

    // make selection for quality if id "quality" exists
    // else choose high quality
    if (DOM.idExists("quality")) {
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
    } else {
        Make.imageQuality = "high";
    }


    /** adjust fontsizes, margins, borders and so on
     * line widths and nullradius
     *  we first have to create DOM elements before setting their styles
     * @method basicUI.adjustFont
     * @param {float} fontSize
     */
    basicUI.adjustFont = function(fontSize) {
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
        // width of range input elements
        const rangeWidthToFontSize = 10;
        // weight of lines in the canvas
        const lineWidthToSize = 0.2;
        // size of null radius in pixels
        const nullRadiusToSize = 0.7;

        DOM.style("h1", "fontSize", relativeH1Fontsize * fontSize + px);
        DOM.style("p,button,input,table,select", "fontSize", fontSize + px);
        DOM.style("p,h1,table", "margin", textMarginToFontsize * fontSize + px);
        DOM.style("button,input", "borderWidth", borderWidthToFontsize * fontSize + px);
        DOM.style("input", "width", inputWidthToFontsize * fontSize + "px");
        DOM.style("input.range", "width", rangeWidthToFontSize * fontSize + "px");

        basicUI.lineWidth = lineWidthToSize * fontSize;
        basicUI.nullRadius = nullRadiusToSize * fontSize;
    };

    /**
     * make the layout for landscape orientation
     * @method basiUI.landscapeFormat
     */

    basicUI.landscapeFormat = function() {
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
    };

    /**
     * make the layout for portrait orientation
     * @method basiUI.portraitFormat
     */
    basicUI.portraitFormat = function() {
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
    };

    /**
     * layout depending on landscape or pportrait orientation
     * @method basicUI.layout
     */
    basicUI.layout = function() {
        // fontsize varies with window
        const fontsizeToWindow = 0.028;

        // set the font size, depending on the smaller window dimension
        let fontSize = fontsizeToWindow * Math.min(window.innerWidth, window.innerHeight);
        basicUI.adjustFont(fontSize);
        if (window.innerHeight >= window.innerWidth) {
            basicUI.portraitFormat();
        } else {
            basicUI.landscapeFormat();
        }
    };

    /**
     * onload make the layout and create elements that do not depend on the actual image
     * @method basicUI.onload
     */
    basicUI.onload = function() {
        basicUI.layout();
        // independent of layout
        Make.arrowController.drawOrientation();
        // fit output image into the surrounding div
        let outputSize = Math.floor(Math.min(Make.outputImage.divWidth, Make.outputImage.divHeight));
        Make.setOutputSize(outputSize);
        Make.sizeButton.setValue(outputSize);
        Make.resetOutputImageSpace();
        Make.updateNewMap();
    };

    /**
     * on resize changes size of elements, redraws if needed
     * @method basicUI.onresize
     */
    basicUI.onresize = function() {
        // get old sizes, see if they change -> need redraw
        // we have square images
        const oldOutputImageSize = Make.outputImage.pixelCanvas.width;
        const oldControlImageMaxWidth = Make.controlImage.maxWidth;
        const oldControlImageMaxHeight = Make.controlImage.maxHeight;
        // check if the output image is inside its div -> resize upon change to fill the div 
        const outputImageWasInside = (oldOutputImageSize <= Make.outputImage.divWidth) && (oldOutputImageSize <= Make.outputImage.divHeight);
        basicUI.layout();
        // the control image might need update
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
        var newOutputImageSize;
        if (outputImageWasInside) {
            // if the ouput image was completely inside its div, then it should again fill it
            newOutputImageSize = outputImageSizeMin;
        } else {
            // if the output image has been larger and still is larger than the div it does not change
            // if it does not fill the div then increase size
            newOutputImageSize = Math.max(outputImageSizeMin, oldOutputImageSize);
        }
        // do we need to redraw the output image 
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



}());
