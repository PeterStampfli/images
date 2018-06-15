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

    // switching between sampling methods

    Make.highImageQuality = false;

    // creating the interaction elements
    //____________________________________________________________________________________________

    /*
      the input image object is always a pixelCanvas and does not depend on page layout
      do we need access from outside ??? (for development)
    */
    Make.inputImage = new PixelCanvas();

    /*
     * linear transform for input
     */
    Make.inputTransform = new LinearTransform();

    // check wether to show structure or input image
    // only if input image exists
    Make.inputImageExists = false;
    // show structure even if input image exists (for presentation)
    Make.showStructure = false;

    /*
    the other elements depend on page layout and need an identifier
    create them here
    /*
         
    /**
    * create on-screen output image canvas 
    * @method Make.createOutputImage
    * @param {String} idName - html identifier  
 * @param {float} left -  left side, default 0
 * @param {float} top - top side, default 0
 */
    Make.createOutputImage = function(idName, left = 0, top = 0) {
        Make.outputImage = new OutputImage(idName, left, top);
        Make.outputImage.pixelCanvas.blueScreenColor = Layout.backgroundColor;
        Make.pixelFromInputImage = Make.pixelFromInputImageNoColorSymmetry;
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
     * @param {integer} height - default=width
     */
    Make.setOutputSize = function(width, height = width) {
        Make.outputImage.setSize(width, height);
        if (Make.map != null) {
            Make.map.setSize(width, height);
        }
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
     * It has a limited space given as maxWidth and maxHeight and limitLeft and limitTop (for fixed position)
     * negative limitLeft for no fixed position (scrolling canvas or invisible)
     * @method Make.createControlImage
     * @param {String} idName - html identifier
     * @param {float} maxWidth - maximum width
     * @param {float} maxHeight - maximum height, default is maxWidth
     * @param {float} limitLeft - limit for the left side, default -1000
     * @param {float} limitTop - limit for the top side, default -1000
     */
    Make.createControlImage = function(idName, maxWidth, maxHeight = maxWidth, limitLeft = -1000, limitTop = -1000) {
        Make.controlImage = new ControlImage(idName, maxWidth, maxHeight, limitLeft, limitTop);
        Make.controlImage.action = Make.updateOutputImageIfUsingInputImage;
    };

    /**
     * create the arrowController object
     * @method Make.createArrowController
     * @param {String} idName - html identifier
     * @param {float} size - width and height
     * @param {float} left - left side, default -1000 for invisible
     * @param {float} top - top side, default -1000 for invisible    */
    Make.createArrowController = function(idName, size, left = -1000, top = -1000) {
        Make.arrowController = new ArrowController(idName, size, left, top);
        Make.arrowController.action = Make.updateOutputImageIfUsingInputImage;
    };

    /**
     * create the map with connection to outputImage,controlImage and arrowController
     * @method Make.createMap 
     */
    Make.createMap = function() {
        Make.map = new VectorMap(Make.outputImage, Make.inputImage, Make.controlImage);
    };

    // structure mapping (space to space)
    //_____________________________________________________________________________________________


    // symmetry dependent mapping routines (Vector2->Vector2)
    // the mapping for using an input image
    // returning the lyapunov coefficient
    Make.mappingInputImage = function(position) {
        return 1;
    };

    // the mapping to show the structure
    Make.mappingStructure = function(position) {
        return 1;
    };

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
     * call after change of mapping function (?) or its parameters
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
        //console.log("set "+mappingInputImage);
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


    // starting with a new map or changing the space map 
    //_________________________________________________________________________________

    /*
    change the structure mapping (new motif or new parameters, or first time mapping). need to do everything:
    reset output pixel to space mapping parameters to given ranges
    calculate the structure map
    if an input image exists (inputImage.width>0):
    -determine shift (to set center of gravity at origin, for other smaller changes shift remains)
    -shift the map
    - change the region of the output image explicitel before and only if needed
    - do not change parameters of space to input pixel mapping  to use approx. same part of input image
    - redraw output image
    - do as for changes in the space to input image mapping
    else
        redraw output image
    */

    /**
     * create a button to change map parameter values
     * @method Make.createMapParameterButton
     * @param {String} idBase
     * @param {String} idPlus
     * @param {String} idMinus
     * @return the button
     */
    Make.createMapParameterButton = function(idBase, idPlus, idMinus) {
        let button = new NumberButton(idBase);
        button.onChange = function() {
            Make.updateNewMap();
        };
        button.createPlusMinusButtons(idPlus, idMinus);
        return button;
    };


    /**
     * update the structure mapping, depending on the parameters
     * @method Make.initializeMap
     */
    Make.initializeMap = function() {};

    /*
     * need to know if we have a new map and have to adjust mapping to the input image
     */
    Make.newMapRequiresInputImageAdjustment = false;

    /**
     * show result of a new structure mapping, call after changing the mapping functions and initial output range (if required?)
     * calls Make.initializeMap: has to get parameters and to call Make.setMapping
     * to fix Make.mappingStructure and Make.mappingInputImage
     * @method Make.updateNewMap
     */
    Make.updateNewMap = function() {
        Make.initializeMap();
        if (Make.mappingInputImage == null) {
            console.log("*** Make.updateMap: there is no mapping function !");
            return;
        }
        if (Make.showStructure || !Make.inputImageExists) {
            Make.map.make(Make.mappingStructure);
            Make.newMapRequiresInputImageAdjustment = true;
        } else {
            Make.map.make(Make.mappingInputImage);
            Make.getMapOutputCenter();
            Make.shiftMapToCenter();
            Make.getMapOutputRange();
            Make.adjustSpaceToInputPixelMapping();
        }
        Make.updateOutputImage();
    };

    /**
     * switch between showing structure and image
     * @method Make.switchStructureImage
     */
    Make.switchStructureImage = function() {
        Make.showStructure = !Make.showStructure;
        if (Make.showStructure || !Make.inputImageExists) {
            Make.map.make(Make.mappingStructure);
        } else {
            Make.map.make(Make.mappingInputImage);
            Make.shiftMapToCenter();
            if (Make.newMapRequiresInputImageAdjustment) {
                Make.newMapRequiresInputImageAdjustment = false;
                Make.getMapOutputRange();
                Make.adjustSpaceToInputPixelMapping();
            }
        }
        Make.updateOutputImage();
    };

    /*
     * initialization typically:
     * twoMirrors
    Make.setOutputSize(300,300)
    Make.setInitialOutputImageSpace(-1,1,-1);
    Make.resetOutputImageSpace();
    Make.setMapping(twoMirrors.vectorMapping,twoMirrors.reflectionsMapping);
    Make.updateNewMap();
    */
    //  changing the output size: avoid any side effects, only magnification
    //___________________________________________________________________________
    /**
     * create a button to change the size of the output image, width=height=size
     * @method Make.createSquareImageSizeButton
     * @param {String} idName - of the html element
     * @return the button (a numberbutton)
     */
    Make.createSquareImageSizeButton = function(idName) {
        let sizeButton = new NumberButton(idName);
        sizeButton.onChange = function(size) {
            Make.setOutputSize(size, size);
            Make.updateNewOutputImageSize();
        };
        return sizeButton;
    };

    /**
     * show result of a new output size or new map, does not recalculate anything to avoid side effects
     * @method Make.updateNewOutputImageSize
     */
    Make.updateNewOutputImageSize = function() {
        if (Make.mappingInputImage == null) {
            console.log("*** Make.updateMap: there is no mapping function !");
            return;
        }
        if (Make.showStructure || !Make.inputImageExists) {
            Make.map.make(Make.mappingStructure);
        } else {
            Make.map.make(Make.mappingInputImage);
            Make.shiftMapToCenter();
        }
        Make.updateOutputImage();
    };

    //  reading an input image and adjust mappingStructure
    //_____________________________________________________

    /*
     * the space to input pixelmapping determines how we sample the input image
     * it has to be redone for loading a new image
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

    /** callback function to call after an image has been read
     *  puts image on controlImage, show result 
     * @method Make.readImageAction
     */
    Make.readImageAction = function() {
        if (Make.showStructure || !Make.inputImageExists) {
            Make.inputImageExists = true;
            Make.showStructure = false; // and create the map!! (everything from zero)
            if (Make.mappingInputImage == null) {
                console.log("*** (Make)readImageAction: there is no mapping function !");
                return;
            }
            Make.map.make(Make.mappingInputImage);
            Make.getMapOutputCenter();
            Make.shiftMapToCenter();
        }
        /////////////////////////////////////////////////////////////////////////////////////////////
        Make.inputImage.createIntegralColorTables();
        Make.controlImage.loadInputImage(Make.inputImage);
        if (!Make.map.exists) {
            console.log("*** Make.readImage: map does not exist !");
            return;
        }
        Make.getMapOutputRange();
        Make.adjustSpaceToInputPixelMapping();
        Make.updateOutputImage();
    };

    /**
     * create an image input button, and link to output element
     * @method Make.createImageInput
     * @param {String} idButton - name (id) of the (button) html element
     * @param {String} idFileNameOutput - optional, name (id) of the output html element for file name
     */
    Make.createImageInput = function(idButton, idFileNameOutput) {
        let imageInputButton = new Button(idButton);
        imageInputButton.asFileInput();
        if (arguments.length > 1) {
            let fileNameOutput = document.getElementById(idFileNameOutput);
            imageInputButton.onFileInput = function(file) {
                Make.inputImage.readImageFromFileBlob(file, Make.readImageAction);
                fileNameOutput.innerHTML = file.name;
            };
        } else {
            imageInputButton.onFileInput = function(file) {
                Make.inputImage.readImageFromFileBlob(file, Make.readImageAction);
            };

        }
    };

    /**
     * read an image with given file path and show result at setup, generating map, 
     * take care to iniialize map
     * @method Make.readImageWithFilePath
     * @param {String} filePath - relative file path of image
     */
    Make.readImageWithFilePathAtSetup = function(filePath) {
        Make.inputImage.readImageWithFilePath(filePath, Make.readImageAction);
    };

    //        shifting and scaling the output image
    //___________________________________________________________________________

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
        if (Make.showStructure || !Make.inputImageExists) {
            Make.map.make(Make.mappingStructure);
        } else {
            Make.map.make(Make.mappingInputImage);
            Make.shiftMapToCenter(); // with same data for center as before, and same settings for space to input image map 
        }
        Make.updateOutputImage();
    };

    // drawing the output image 
    //___________________________________________________________________________

    /*
     * initializing, making the control image semitransparent
     * setting values of the inputTransform
     */
    function initializeImageOutput() {
        Make.inputTransform.setShift(Make.controlImage.shiftX, Make.controlImage.shiftY);
        Make.inputTransform.setAngleScale(Make.arrowController.angle, Make.controlImage.scale);
        Make.controlImage.semiTransparent();
    }

    /**
     * redraw output only if showing input image
     * @method Make.updateOutputImageIfUsingInputImage
     */
    Make.updateOutputImageIfUsingInputImage = function() {
        if (!Make.showStructure && Make.inputImageExists) {
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
        if (Make.showStructure || !Make.inputImageExists) { // show structure
            Make.map.drawStructure();
        } else {
            if (Make.inputImage.width == 0) {
                console.log("*** Make.updateOutputImage: input image not loaded !");
                return;
            }
            initializeImageOutput();


            // generate image by looking up input colors at result of the nonlinear map, transformed by space to input image transform and possibly color symmetry
            if (Make.highImageQuality) {
                Make.map.draw();
            } else {
                // Make.map.draw(VectorMap.createInputImageColorLowQuality);
                Make.map.drawFast();
            }
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
