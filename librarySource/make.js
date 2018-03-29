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
    Make.createOutputImageNoColorSymmetry = function(idName, width, height) {
        Make.outputImage = new OutputImage(idName, width, height);
        Make.pixelFromMapData = Make.pixelFromMapDataNoColorSymmetry;
        Make.map = new VectorMap();
        Make.map.setSize(width, height);
        Make.map.outputImage = Make.outputImage;
        Make.outputImage.action = Make.shiftScaleMapInput;
    };


    /**
     * create the control image object
     * @method Make.createControlImage
     * @param {String} idName - html identifier
     * @param {integer} sizeLimit - the larger width or height
     */
    Make.createControlImage = function(idName, sizeLimit) {
        Make.controlImage = new ControlImage(idName, sizeLimit);
        Make.controlImage.action = Make.updateOutputImage;
    };

    /**
     * create the arrowController object
     * @method Make.createArrowController
     * @param {String} idName - html identifier
     * @param {integer} size - width and height
     */
    Make.createArrowController = function(idName, size) {
        Make.arrowController = new ArrowController(idName, size);
        Make.arrowController.action = Make.updateOutputImage;
    };

    /*
    mappings: 
    1) linear mapping from indices to map input coordinates
    2) nonlinear map creating the essential image structure
    3) linear mapping from map output to the input image
    */

    Make.mapping = null;
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
        Make.outputImage.setCoordinates(Make.xMin, Make.yMin, Make.xMax);
    };

    /*
     * put the center of the result of 2nd map to origin
     */
    var mapOutputCenter = new Vector2();

    /**
     * determine center of map output
     * @method Make.getMapOutputCenter
     */
    Make.getMapOutputCenter = function() {
        Make.map.getOutputCenter(mapOutputCenter);
    };

    /**
     * shift map to center output
     * @method Make.shiftMapToCenter
     */
    Make.shiftMapToCenter = function() {
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
     * reset the parameters of the 3rd mapping for a new input image 
     * or changed 2nd nonlinear mapping
     * sample max of input image
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

    // callback function to call after an image has been read
    // puts image on controlImage, show result if the 2nd nonlinear mapping exists
    function readImageAction() {
        Make.controlImage.loadInputImage(Make.inputImage);
        if (!Make.map.exists) {
            console.log("*** Make.readImage: map does not exist !");
            return;
        }
        Make.getMapOutputRange();
        Make.adjustInputImageSampling();
        Make.updateOutputImage();
    }

    /**
     * create an image input button, and link to output element
     * @method Make.createImageInput
     * @param {String} idButton - name (id) of the (button) html element
     * @param {String} idFileNameOutput - name (id) of the output html element for file name
     */
    //let imageInputButton=null;
    Make.createImageInput = function(idButton, idFileNameOutput) {
        let imageInputButton = new FileButton(idButton);
        let fileNameOutput = document.getElementById(idFileNameOutput);
        imageInputButton.onchange = function(file) {
            Make.inputImage.readImageFromFileBlob(file, readImageAction);
            fileNameOutput.innerHTML = file.name;
        };
    };

    /**
     * create a button to download the output image as a jpg
     * @method Make.createSaveImageJpg
     * @param {String} idButton
     * @param {String} fileName
     */
    Make.createSaveImageJpg = function(idButton, fileName) {
        Make.downloadButton = new Button(idButton);
        Make.downloadButton.onclick = function() {
            Make.outputImage.pixelCanvas.saveImageJpg(fileName);
        };
    };


    /**
     * create a button to download the output image as a png
     * @method Make.createSaveImagePng
     * @param {String} idButton
     * @param {String} fileName
     */
    Make.createSaveImagePng = function(idButton, fileName) {
        Make.downloadButton = new Button(idButton);
        Make.downloadButton.onclick = function() {
            Make.outputImage.pixelCanvas.saveImagePng(fileName);
        };
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
        if (Make.mapping === null) {
            console.log("*** Make.updateMap: there is no mapping function !");
            return;
        }
        Make.resetInputRange();
        Make.bareNonlinearMapping();
        Make.getMapOutputCenter();
        Make.shiftMapToCenter();
        Make.getMapOutputRange();
        if (Make.inputImage.width == 0) {
            console.log("*** Make.updateMap: there is no input image !");
            return;
        }
        Make.adjustInputImageSampling();
        Make.updateOutputImage();
    };

    /*
    the output size changes:
    (changes 1st map too, mapping from indices to map input should give same coordinate range if width/height ratio unchanged
    recalculate map, reuse previous map range, 3rd linear mapping remains unchanged
    do as for changes in the 1st mapping
    */
    /**
     * set the size of the output image
     * @method Make.setOutputSize
     * @param {integer} width
     * @param {integer} height
     */
    Make.setOutputSize = function(width, height) {
        Make.outputImage.setSize(width, height);
        Make.map.setSize(width, height);
        if (Make.mapping === null) {
            console.log("*** Make.setOutputSize: there is no mapping function !");
            return;
        }
        Make.bareNonlinearMapping();
        Make.getMapOutputCenter();
        Make.shiftMapToCenter();
        Make.getMapOutputRange();
        if (Make.inputImage.width == 0) {
            console.log("*** Make.setOutputSize: there is no input image !");
        } else {
            Make.adjustInputImageSampling();
            Make.updateOutputImage();
        }
    };

    /*
    change scale or shift for the 1st mapping:
    (the output canvas already changes the 1st input mapping)
    redo the mapping
    apply same shift as before to the mapping output(do not change the shift or the 3rd mapping)
    redraw as for changes in 3rd mapping
    */

    /**
     * shift or zoom the output image
     * @method Make.shiftScaleMapInput
     */
    Make.shiftScaleMapInput = function() {
        if (Make.mapping === null) {
            console.log("*** Make.shiftScaleMapInput: there is no mapping function !");
            return;
        }
        Make.bareNonlinearMapping();
        Make.shiftMapToCenter(); // with same data for center as before, and same settings for 3rd map 
        if (Make.inputImage.width == 0) {
            console.log("*** Make.shiftScaleMapInput: there is no input image !");
        } else {
            Make.updateOutputImage();
        }
    };

    /*
    change scale, rotation or shift parameters for the 3rd mapping, change image interpolation via chooseInterpolation, change smoothing:
    prepare scale and angle dependent parameters of this mapping. 
    clear control canvas.
    redraw using the map with the additional transformation, setting output pixels and control pixels
    show output pixels
    show control pixels
    */

    var shiftX, shiftY, cosAngleScale, sinAngleScale;
    var inputImage, controlImage;

    /**
     * creating pixel from map data for the map.draw method without color symmetry
     * @method Make.pixelFromMapDataNoColorSymmetry
     * @param {Vector2} mapOut - map position data
     * @param {Color} color - for the pixel
     */
    Make.pixelFromMapDataNoColorSymmetry = function(mapOut, color) {
        let h = cosAngleScale * mapOut.x - sinAngleScale * mapOut.y + shiftX;
        mapOut.y = sinAngleScale * mapOut.x + cosAngleScale * mapOut.y + shiftY;
        mapOut.x = h;
        inputImage.getInterpolated(color, mapOut);
        controlImage.setOpaque(mapOut);
    };

    /**
     * creating pixel from map data for the map.draw method
     * @method Make.pixelFromMapData
     * @param {Vector2} mapOut - map position data, additional data possible such as color
     * @param {Color} color - for the pixel
     */
    Make.pixelFromMapData = Make.pixelFromMapDataNoColorSymmetry;

    /**
     * do everything for changes in the 3rd mapping 
     * (or any change in output image) without color symmetry
     * @method Make.updateOutputImageNoColorSymmetry
     */
    Make.updateMapOutput = function() {
        if (!Make.map.exists) {
            console.log("*** Make.updateOutputImage: map does not exist !");
            return;
        }
        if (Make.inputImage.width == 0) {
            console.log("*** Make.updateOutputImage: input image not loaded !");
            return;
        }
        // get parameters
        shiftX = Make.controlImage.shiftX;
        shiftY = Make.controlImage.shiftY;
        var angle = Make.arrowController.angle;
        var scale = Make.controlImage.scale;
        cosAngleScale = scale * Fast.cos(angle);
        sinAngleScale = scale * Fast.sin(angle);
        // shortcuts
        inputImage = Make.inputImage;
        controlImage = Make.controlImage;
        Make.controlImage.semiTransparent();
        // generate image by looking up input colors at result of the nonlinear map, transformed by 3rd linear transform
        Make.map.draw(Make.pixelFromMapData);
        Make.outputImage.pixelCanvas.showPixel();
        Make.controlImage.pixelCanvas.showPixel();
    };

    /**
     * do everything for changes in the 3rd mapping 
     * (or any change in output image) depending on color symmetry for map output
     * additional drawing possible
     * @method Make.updateOutputImage
     */
    Make.updateOutputImage = Make.updateMapOutput; //default
}());
