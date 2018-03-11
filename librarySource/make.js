/**
 * making images, different steps
 * @namespace Make
 */

/* jshint esversion:6 */

var Make = {};

(function() {
    "use strict";

    /**
     * set the input image object
     * @method Make.setInputImage
     * @param {PixelCanvas} inputImage
     */
    Make.setInputImage = function(inputImage) {
        Make.inputImage = inputImage;
    };

    /**
     * set the output image object
     * @method Make.setOutputImage
     * @param {OutputImage} outputImage
     */
    Make.setOutputImage = function(outputImage) {
        Make.outputImage = outputImage;
        Make.map = Make.outputImage.map;
    };

    /**
     * set the control image object
     * @method Make.setControlImage
     * @param {ControlImage} controlImage
     */
    Make.setControlImage = function(controlImage) {
        Make.controlImage = controlImage;
    };

    /**
     * set the arrowController object
     * @method Make.setArrowController
     * @param {ArrowController} arrowController
     */
    Make.setArrowController = function(arrowController) {
        Make.arrowController = arrowController;
    };

    /**
     * set the mapping function for the 2nd nonlinear map
     * @method Make.setMapping
     * @param {function} mapping - function(mapIn -> mapOut)
     */
    Make.setMapping = function(mapping) {
        Make.mapping = mapping;
    };

    /**
     * do the bare nonlinear mapping
     * @method Make.bareNonlinearMapping
     */
    Make.bareNonlinearMapping = function() {
        Make.map.make(Make.mapping);
    };

    /**
     * set lowest and highest initial x-coordinates, lowest y-coordinate
     * @method Make.setInputRange
     * @param {float} xMin
     * @param {float} xMax
     * @param {float} yMin
     */
    Make.setInputRange = function(xMin, xMax, yMin) {
        Make.xMin = xMin;
        Make.xMax = xMax;
        Make.yMin = yMin;
    };



    /*
    mappings: 
    1) linear mapping from indices to map input coordinates
    2) nonlinear map creating the essential image structure
    3) linear mapping from map output to the input image
    */

    /*
    change the 2nd nonlinear mapping (new motif or new parameters, or first time mapping). need to do everything
    reset 1st mapping parameters to given ranges
    redo the mapping
    determine shift (to set center of gravity at origin, for other smaller changes shift remains)
    shift the map
    get map range and set parameters of 3rd mapping
    do as for changes in the 3rd mapping
    */

    /*
    change scale or shift for the 1st mapping:
    redo the mapping
    apply shift to the mapping (do not change shift or 3rd mapping)
    redraw as for changes in 3rd mapping
    */

    /*
    the output size changes:
    (changes 1st map too, mapping from indices to map input should give same coordinate range if width/height ratio unchanged
    do as for changes in the 1st mapping
    */

    /*
    change scale, rotation or shift parameters for the 3rd mapping, change image interpolation via chooseInterpolation, change smoothing:
    prepare scale and angle dependent parameters of this mapping. 
    clear control canvas.
    redraw using the map with the additional transformation, setting output pixels and control pixels
    show output pixels
    show control pixels
    */

    /**
     * do everything for changes in the 3rd mapping (or any change in output image)
     * @method Make.updateOutputImage
     */
    Make.updateOutputImage = function() {
        // get parameters
        var shiftX = Make.controlImage.shiftX;
        var shiftY = Make.controlImage.shiftY;
        var angle = Make.arrowController.angle;
        var scale = Make.controlImage.scale;
        var cosAngleScale = scale * Fast.cos(angle);
        var sinAngleScale = scale * Fast.sin(angle);
        // shortcuts
        var inputImage = Make.inputImage;
        var controlImage = Make.controlImage;
        controlImage.semiTransparent();
        // generate image by looking up input colors at result of nonlinear map transformed by 3rd linear transform
        Make.map.draw(function(mapOut, color) {
            let h = cosAngleScale * mapOut.x - sinAngleScale * mapOut.y + shiftX;
            mapOut.y = sinAngleScale * mapOut.x + cosAngleScale * mapOut.y + shiftY;
            mapOut.x = h;
            inputImage.getInterpolated(mapOut, color);
            controlImage.setOpaque(mapOut);
        });
        Make.outputImage.pixelCanvas.showPixel();
        controlImage.pixelCanvas.showPixel();
    };


}());
