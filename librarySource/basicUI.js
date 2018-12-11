/**
 * basic layout and user-interaction elements
 * @namespace basicUI
 */
/* jshint esversion:6 */


basicUI = {};

(function() {

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
        // weight of lines in the canvas
        const lineWidthToSize = 0.2;
        // size of null radius in pixels
        const nullRadiusToSize = 0.7;

        DOM.style("h1", "fontSize", relativeH1Fontsize * fontSize + px);
        DOM.style("p,button,input,table,select", "fontSize", fontSize + px);
        DOM.style("p,h1,table", "margin", textMarginToFontsize * fontSize + px);
        DOM.style("button,input", "borderWidth", borderWidthToFontsize * fontSize + px);
        DOM.style("input", "width", inputWidthToFontsize * fontSize + "px");

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
     * enable/disable mouse and touch on control image and arrow controller
     * @method basicUI.activateControls
     * @param {boolean} status - true to enable control image and mouse controller
     */
    basicUI.activateControls = function(status) {
        Make.controlImage.mouseEvents.isActive = status;
        Make.arrowController.mouseEvents.isActive = status;
        Make.controlImage.touchEvents.isActive = status;
        Make.arrowController.touchEvents.isActive = status;
    };

    /** update the 2nd nonlinear map that defines the geometry 
     * without reseting the 3rd mapping for the input image pixels
     * for changing the projection
     * @method basicUI.updateMapNoReset
     */
    basicUI.updateMapNoReset = function() {
        Make.allowResetInputMap = false;
        Make.updateNewMap();
        Make.allowResetInputMap = true;
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

}());
