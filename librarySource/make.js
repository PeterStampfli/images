/**
 * making images, different steps
 * @namespace Make
 */

/*
 * how it puts everything together
 */

/*
 *                              1st linear mapping         2nd structure/symmetry dependent 
 *                                                             nonlinear mapping
 * 
 * outputImage.map.make: pixel index (i,j) --> mapIn: coordinates (x,y) --> mapOut: (x,y) as function of mapIn (x,y)
 * 
 *                                         ^
 *                                         |
 * 
 *      outputImage.mouseEvents -> shift, scale (at mouse position as center)
 * 
 * 
 *                                            3rd linear mapping
 * 
 * outputImage.map.draw:              mapOut(x,y) --> image coordinates  --> inputImage
 * 
 *                                               ^    ^
 * arrowController.mouseEvents:                  |    |
 *           angle --> rotation around center of map  |
 * controlImage.mouseEvents: -> shift, scale (at origin (0,0) of map, 
 */


/* jshint esversion:6 */

var Make = {};

(function() {
    "use strict";

    /*
    attach the (user) interaction elements
    */
    /*
      the input image object is always a pixelCanvas and does not depend on page layout
      do we need access from outside ??? (for development)
    */
    Make.inputImage = new PixelCanvas();

    /*
    the other elements depend on page layout and need an identifier
    /*
     
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

    /*
    mappings: 
    1) linear mapping from indices to map input coordinates
    2) nonlinear map creating the essential image structure
    3) linear mapping from map output to the input image
    */

    /**
     * set the mapping function for the 2nd nonlinear map
     * @method Make.setMapping
     * @param {function} mapping - function(mapIn -> mapOut)
     */
    Make.setMapping = function(mapping) {
        Make.mapping = mapping;
    };

    /**
     * set lowest and highest initial x-coordinates, lowest y-coordinate to use for input to the 2nd nonlinear map
     * @method Make.setInitialInputRange
     * @param {float} xMin
     * @param {float} xMax
     * @param {float} yMin
     */
    Make.setInitialInputRange = function(xMin, xMax, yMin) {
        Make.xMin = xMin;
        Make.xMax = xMax;
        Make.yMin = yMin;
    };

    /**
     * do the bare nonlinear mapping (access for trouble shooting)
     * @method Make.bareNonlinearMapping
     */
    Make.bareNonlinearMapping = function() {
        Make.map.make(Make.mapping);
    };

    /**
     * reset input range for the 2nd mapping to given initial values, call after change of mapping 
     * function or its parameters
     * @method.resetInputRange
     */
    Make.resetInputRange = function() {
        Make.map.setXRange(Make.xMin, Make.xMax);
        Make.map.setYmin(Make.yMin);
    };

    /*
     * the 3rd map determines how we sample the input image
     */

    /* 
     * how much of the input image do we sample initially ? 
     */
    Make.fillFaktor = 0.7;

    // the extend of the output of the nonlinear mapping
    Make.lowerLeft = new Vector2();
    Make.upperRight = new Vector2();

    /**
     * get the range of the nonlinear mapping 
     * (if the mapping or its parameters change, not after scale or shift in 1st map)
     * @method Make.getMapOutputRange
     */
    Make.getMapOutputRange = function() {
        Make.map.getOutputRange(lowerLeft, upperRight);
    };

    /**
     * reset the parameters of the 3rd mapping for a new input image or changed 2nd nonlinear mapping
     * @method Make.adjustInputImageSampling
     */
    Make.adjustInputImageSampling = function() {
        Make.arrowController.angle = 0;
        Make.controlImage.adjustScaleShift(Make.lowerLeft, Make.upperRight, Make.fillFaktor, Make.inputImage);
    };

    /*
     * read a new input image (the mapping has to be defined):
     * put it in controlImage, set parameters of 3rd mapping to give a good sampling range (fillfactor ?)
     * redraw as for changes in 3rd mapping
     */

    /**
     * reading an input image, show result if the 2nd nonlinear mapping exists
     * @method Make.readImage
     * @param {Button} imageInputButton
     */
    //  imageInputButton is a Button object
    //  imageInputButton.onChange(function(){ Make.readImage(imageInputButton); }
    Make.readImage = function(imageInputButton) {
        inputImage.readImage(imageInputButton.button.files[0], function() {
            controlImage.loadInputImage(inputCanvas);


            Make.getMapOutputRange();
            Make.adjustInputImageSampling();
            Make.updateOutputImage();
        });
    };

    /*
    change the 2nd nonlinear mapping (new motif or new parameters, or first time mapping). need to do everything
    reset 1st mapping parameters to given ranges
    redo the mapping
    determine shift (to set center of gravity at origin, for other smaller changes shift remains)
    shift the map
    determine map range
    if an input image exists (inputImage.width>0):
    - set parameters of 3rd mapping depending on input image and map range
    - do as for changes in the 3rd mapping
    */
    Make.updateMap = function() {
        Make.resetInputRange();
        Make.bareNonlinearMapping();
        Make.map.shiftOutputCenterToOrigin();



    };

    /*
    the output size changes:
    (changes 1st map too, mapping from indices to map input should give same coordinate range if width/height ratio unchanged
    recalculate map, reuse previous map range, 3rd linear mapping remains unchanged
    do as for changes in the 1st mapping
    */
    Make.setOutputSize = function(width, height) {};

    /*
    change scale or shift for the 1st mapping:
    redo the mapping
    apply shift to the mapping (do not change shift or 3rd mapping)
    redraw as for changes in 3rd mapping
    */

    Make.shiftScaleMapInput = function() {};

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
        // generate image by looking up input colors at result of the nonlinear map, transformed by 3rd linear transform
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
