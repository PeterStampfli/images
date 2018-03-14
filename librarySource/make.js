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
    create them here
    /*
         
    /**
    * create on-screen canvas with a vectormap and mouse events to change the map,
    * no color symmetry
    * @method Make.createOutputImageNoColorSymmetry
    * @param {String} idName - html identifier
    * @param {integer} width - initial width
    * @param {integer} height - initial height
    */
    Make.createOutputImageNoColorSymmetry=function(idName,width,height){
        Make.map=new VectorMap();
        Make.outputImage=new OutputImage(idName,Make.map,width,height);
        Make.updateOutputImage=Make.updateOutputImageNoColorSymmetry;        
    };
    
    /**
     * create the control image object
     * @method Make.createControlImage
     * @param {String} idName - html identifier
     * @param {integer} sizeLimit - the larger width or height
     */
    Make.createControlImage = function(idName,sizeLimit) {
        Make.controlImage = new ControlImage(idName,sizeLimit);
    };

    /**
     * create the arrowController object
     * @method Make.createArrowController
     * @param {String} idName - html identifier
     * @param {integer} size - width and height
     */
    Make.createArrowController = function(idName, size) {
        Make.arrowController = new ArrowController(idName, size);
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
     * put the center of the result of 2nd map to origin
     */
    var mapOutputCenter=new Vector2();
    
    /**
     * determine center of map output
     * @method Make.getMapOutputCenter
     */
    Make.getMapOutputCenter=function(){
        Make.map.getOutputCenter(mapOutputCenter);
    };
    
    /**
     * shift map to center output
     * @method Make.shiftMapToCenter
     */
    Make.shiftMapToCenter=function(){
        Make.map.shiftOutput(mapOutputCenter);
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
        Make.map.getOutputRange(Make.lowerLeft, Make.upperRight);
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
     Make.readImage = function(imageInputButton) {
            Make.inputImage.readImage(imageInputButton.button.files[0], function() {
            Make.controlImage.loadInputImage(Make.inputImage);
            if (!Make.map.exists){
                console.log("*** Make.readImage: map does not exist !");
            }
            else {
                Make.getMapOutputRange();         
                Make.adjustInputImageSampling();
                Make.updateOutputImage();
            }
        });
    };
    
    /**
     * create an image input button
     * @method Make.createImageInputButton
     * @param {String} idName name (id) of the button in the HTML page
     */
    Make.createImageInputButton=function(idName){
        let button=new Button(idName);
        button.onChange(function(){
            Make.readImage(button);
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
        Make.getMapOutputCenter();
        Make.shiftMapToCenter();
        Make.getMapOutputRange();         
        if (Make.inputImage.width==0){
            console.log("*** Make.updateMap: there is no input image !");
        }
        else {
            Make.adjustInputImageSampling();
            Make.updateOutputImage();
        }
    };

    /*
    the output size changes:
    (changes 1st map too, mapping from indices to map input should give same coordinate range if width/height ratio unchanged
    recalculate map, reuse previous map range, 3rd linear mapping remains unchanged
    do as for changes in the 1st mapping
    */
    Make.setOutputSize = function(width, height) {
        Make.outputImage.setSize(width,height);
        console.log(Make.outputImage.pixelCanvas.width);
        Make.updateMap();
    };

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
     * do everything for changes in the 3rd mapping 
     * (or any change in output image) without color symmetry
     * @method Make.updateOutputImageNoColorSymmetry
     */
    Make.updateOutputImageNoColorSymmetry = function() {
        if (!Make.map.exists){
            console.log("*** Make.updateOutputImage: map does not exist !");
            return;
        }
        if (Make.inputImage.width==0){
            console.log("*** Make.updateOutputImage: input image not loaded !");
            return;
        }
        // get parameters
        var shiftX = Make.controlImage.shiftX;
        var shiftY = Make.controlImage.shiftY;
        var angle = Make.arrowController.angle;
        var scale = Make.controlImage.scale;
        console.log(angle);
        console.log(scale);
        console.log(shiftX);
        console.log(shiftY);
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
            inputImage.getInterpolated(color,mapOut);
            controlImage.setOpaque(mapOut);
        });
        Make.outputImage.pixelCanvas.showPixel();
        controlImage.pixelCanvas.showPixel();
    };

    /**
     * do everything for changes in the 3rd mapping 
     * (or any change in output image) depending on color symmetry
     * @method Make.updateOutputImage
     */
    Make.updateOutputImage=Make.updateOutputImageNoColorSymmetry;

}());
