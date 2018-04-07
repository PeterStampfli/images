/**
 * making images, different steps
 * @namespace Make
 */

/*
 * how it puts everything together
 */

/*
 *                        output pixel to space        structure mapping
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
 *                                      space to input pixel
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

    // creating the interaction elements
    //____________________________________________________________________________________________

    /*
      the input image object is always a pixelCanvas and does not depend on page layout
      do we need access from outside ??? (for development)
    */
    Make.inputImage = new PixelCanvas();

    // check wether to show structure or input image
    Make.showStructure = true;

    /*
    the other elements depend on page layout and need an identifier
    create them here
    /*
         
    /**
    * create on-screen canvas with a vectormap and mouse events to change the map,
    * no color symmetry
    * @method Make.createOutputImageNoColorSymmetry
    * @param {String} idName - html identifier
    */
    Make.createOutputImageNoColorSymmetry = function(idName) {
        Make.outputImage = new OutputImage(idName);
        Make.pixelFromInputImage = Make.pixelFromInputImageNoColorSymmetry;
        Make.map = new VectorMap();
        Make.map.outputImage = Make.outputImage;
        Make.outputImage.action = Make.shiftScaleOutputImage;
    };

    /*
    the output size changes:
    (changes output pixel to space map too, mapping from indices to map input should give same coordinate range if width/height ratio unchanged
    recalculate structure map, reuse previous map range, space to input image pixel mapping remains unchanged
    */
    /**
     * set the size of the output image, call Make.updateMap to see effect
     * @method Make.setOutputSize
     * @param {integer} width
     * @param {integer} height
     */
    Make.setOutputSize = function(width, height) {
        Make.outputImage.setSize(width, height);
        Make.map.setSize(width, height);
    };


    /**
     * create a button to download the output image as a jpg
     * @method Make.createSaveImageJpg
     * @param {String} idButton
     * @param {String} fileName
     */
    Make.createSaveImageJpg = function(idButton, fileName) {
        Make.downloadButton = new Button(idButton);
        Make.downloadButton.onClick = function() {
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
        Make.downloadButton.onClick = function() {
            Make.outputImage.pixelCanvas.saveImagePng(fileName);
        };
    };

    /**
     * create the control image object
     * @method Make.createControlImage
     * @param {String} idName - html identifier
     * @param {integer} sizeLimit - the larger width or height
     */
    Make.createControlImage = function(idName, sizeLimit) {
        Make.controlImage = new ControlImage(idName, sizeLimit);
        Make.controlImage.action = Make.updateOutputImageIfUsingInputImage;
    };

    /**
     * create the arrowController object
     * @method Make.createArrowController
     * @param {String} idName - html identifier
     * @param {integer} size - width and height
     */
    Make.createArrowController = function(idName, size) {
        Make.arrowController = new ArrowController(idName, size);
        Make.arrowController.action = Make.updateOutputImageIfUsingInputImage;
    };

    // structure mapping (space to space)
    //_____________________________________________________________________________________________

    // the mapping for using an input image
    Make.mappingInputImage = null;

    // the mapping to show the structure
    Make.mappingStructure = null;

    /**
     * set range for the output pixel to space mapping, call before setting the mapping 
     * @method Make.setInitialOutputImageSpace
     * @param {float} xMin - lowest x coordinate
     * @param {float} xMax - highest x coordinate
     * @param {float} yMin - lowest y coordinate, highest will be determined from x coordinate range and height/width ratio
     */
    Make.setInitialOutputImageSpace = function(xMin, xMax, yMin) {
        Make.xMin = xMin;
        Make.xMax = xMax;
        Make.yMin = yMin;
    };

    /**
     * reset output range of the output pixel to space mapping to given initial values
     * call after change of mapping function or its parameters
     * @method Make.resetOutputImageSpace
     */
    Make.resetOutputImageSpace = function() {
        Make.outputImage.setCoordinates(Make.xMin, Make.yMin, Make.xMax);
    };

    /**
     * set the mapping functions for the structure map, 
     *  maybe reset the output pixel to space transform
     * 
     * @method Make.setMapping
     * @param {function} mappingInputImage - function(mapIn -> mapOut) for an input image
     * @param {function} mappingStructure - function(mapIn -> mapOut.x) parity
     */
    Make.setMapping = function(mappingInputImage, mappingStructure) {
        Make.mappingInputImage = mappingInputImage;
        Make.mappingStructure = mappingStructure;
    };

    /*
     * put the center of the result of the structure map (space to space) to origin
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




    //  reading an input image and adjust mappingStructure
    //_____________________________________________________

    /*
     * the space to input pixelmapping determines how we sample the input image
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
     * reset the parameters of the space to input pixel mapping for a new input image 
     * sample given part of input image
     * @method Make.adjustSpaceToInputPixelMapping
     */
    Make.adjustSpaceToInputPixelMapping = function() {
        Make.arrowController.angle = 0;
        Make.controlImage.adjustScaleShift(Make.lowerLeft, Make.upperRight, Make.fillFaktor, Make.inputImage);
    };

    /*
     * open a new input image (the mapping has to be defined):
     * if no image has yet been read: make mapping
     * put it in controlImage, set parameters of the space to input image mapping
     * to give a good sampling range (fillfactor ?)
     * redraw as for changes in 3rd mapping
     */

    // callback function to call after an image has been read
    // puts image on controlImage, show result if the 2nd nonlinear mapping exists
    function readImageAction() {
        if (Make.showStructure) {
            Make.showStructure = false; // and create the map!! (everything from zero)
            if (Make.mappingInputImage == null) {
                console.log("*** (Make)readImageAction: there is no mapping function !");
                return;
            }
            console.log("-------------->readImageAction:update map");
            Make.map.make(Make.mappingInputImage);
            Make.getMapOutputCenter();
            Make.shiftMapToCenter();
        }
        Make.controlImage.loadInputImage(Make.inputImage);
        if (!Make.map.exists) {
            console.log("*** Make.readImage: map does not exist !");
            return;
        }
        Make.getMapOutputRange();
        Make.adjustSpaceToInputPixelMapping();
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
     * read an image with given file path and show result
     * @method Make.readImageWithFilePath
     * @param {String} filePath - relative file path of image
     */
    Make.readImageWithFilePath = function(filePath) {
        Make.inputImage.readImageWithFilePath(filePath, readImageAction);
    };



    /*
    change the structure mapping (new motif or new parameters, or first time mapping). need to do everything:
    reset output pixel to space mapping parameters to given ranges
    calculate the structure map
    if an input image exists (inputImage.width>0):
    -determine shift (to set center of gravity at origin, for other smaller changes shift remains)
    -shift the map
    -determine map range
    - do not change parameters of space to input pixel mapping  to use approx. same part of input image
    - redraw output image
    - do as for changes in the space to input image mapping
    else
        redraw output image
    */
    /**
     * show result of a new structure mapping, call after changing the mapping functions and initial output range (if required?)
     * @method Make.updateNewMap
     */
    Make.updateNewMap = function() {
        console.log("updatemap");
        if (Make.mappingInputImage == null) {
            console.log("*** Make.updateMap: there is no mapping function !");
            return;
        }
        if (Make.showStructure) {
            Make.map.make(Make.mappingStructure);
        } else {
            Make.map.make(Make.mappingInputImage);
            Make.getMapOutputCenter();
            Make.shiftMapToCenter();
        }
        Make.updateOutputImage();
    };

    /*
    change scale or shift for the output image in the output canvas:
    changes the output pixel to space mapping:
    redo the mapping
    apply same shift as before to the mapping output(do not change the shift or the 3rd mapping)
    redraw output image
    */

    /**
     * shift or zoom the output image
     * @method Make.shiftScaleOutputImage
     */
    Make.shiftScaleOutputImage = function() {
        if (Make.mappingInputImage == null) {
            console.log("*** Make.shiftScaleOutputImage: there is no mapping function !");
            return;
        }
        if (Make.showStructure) {
            console.log("shiftscaleoi:showstructure");
            console.log(Make.mappingStructure);
            Make.map.make(Make.mappingStructure);
        } else {
            Make.map.make(Make.mappingInputImage);
            Make.shiftMapToCenter(); // with same data for center as before, and same settings for space to input image map 
        }
        Make.updateOutputImage();
    };

    // drawing the output image from updated maps:
    //___________________________________________________________________________

    Make.colorParityNull = new Color(255, 255, 0); //default yellow
    Make.colorParityOdd = new Color(0, 255, 255); // default cyan
    Make.colorParityEven = new Color(128, 128, 0); // default: brown
    /**
     * create pixel from map data, 
     * x-component of vector has parity data
     * show different solid colors for original sector, odd or even number of reflections
     * @method Make.pixelFromParity
     * @param {Vector2} mapOut - map position data
     * @param {Color} color - for the pixel
     */
    Make.pixelFromParity = function(mapOut, color) {
        let parity = mapOut.x;
        if (parity == 0) {
            color.set(Make.colorParityNull);
        } else if (parity & 1) {
            color.set(Make.colorParityOdd);
        } else {
            color.set(Make.colorParityEven);
        }
    };

    /**
     * creating pixel showing structure using map data for the map.draw method
     * mapVector.x contains the (parity) data
     * @method Make.pixelFromStructure
     * @param {Vector2} mapOut - map position data, additional data possible such as color
     * @param {Color} color - for the pixel
     */
    Make.pixelFromStructure = Make.pixelFromParity;

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
     * creating pixel from map data and input image for the map.draw method without color symmetry
     * @method Make.pixelFromInputImageNoColorSymmetry
     * @param {Vector2} mapOut - map position data
     * @param {Color} color - for the pixel
     */
    Make.pixelFromInputImageNoColorSymmetry = function(mapOut, color) {
        let h = cosAngleScale * mapOut.x - sinAngleScale * mapOut.y + shiftX;
        mapOut.y = sinAngleScale * mapOut.x + cosAngleScale * mapOut.y + shiftY;
        mapOut.x = h;
        inputImage.getInterpolated(color, mapOut);
        controlImage.setOpaque(mapOut);
    };

    /**
     * creating pixel from input image using map data for the map.draw method
     * @method Make.pixelFromInputImage
     * @param {Vector2} mapOut - map position data, additional data possible such as color
     * @param {Color} color - for the pixel
     */
    Make.pixelFromInputImage = Make.pixelFromInputImageNoColorSymmetry;


    /**
     * redraw output only if showing input image
     * @method Make.updateOutputImageIfUsingInputImage
     */
    Make.updateOutputImageIfUsingInputImage = function() {
        if (!Make.showStructure) {
            Make.updateOutputImage();
        } else {
            console.log("no update");
        }
    };

    /**
     * redraw output:
     * if showInputImage
     * do everything for changes in the space to input image mapping 
     * (or any change in output image) without color symmetry
     * else
     * simply redraw
     * @method Make.updateOutputImageNoColorSymmetry
     */
    Make.updateMapOutput = function() {
        if (!Make.map.exists) {
            console.log("*** Make.updateOutputImage: map does not exist !");
            return;
        }
        if (Make.showStructure) { // no input image: show structure
            console.log("updatemapout:show structure");
            Make.map.draw(Make.pixelFromStructure);
            Make.outputImage.pixelCanvas.showPixel();
        } else {
            if (Make.inputImage.width == 0) {
                console.log("*** Make.updateOutputImage: input image not loaded !");
                return;
            }
            console.log("updateMapOutput");
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
            // generate image by looking up input colors at result of the nonlinear map, transformed by space to input image transform and possibly color symmetry
            Make.map.draw(Make.pixelFromInputImage);
            Make.outputImage.pixelCanvas.showPixel();
            Make.controlImage.pixelCanvas.showPixel();
        }
    };

    /**
     * do everything for changes in the 3rd mapping 
     * (or any change in output image) depending on color symmetry for map output
     * additional drawing possible
     * @method Make.updateOutputImage
     */
    Make.updateOutputImage = Make.updateMapOutput; //default, if needed add some lines ...
}());
