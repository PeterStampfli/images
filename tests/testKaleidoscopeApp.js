/* jshint esversion:6 */




function creation() {
    "use strict";



    //==============================================================================================
    // create UI elements with their actions that are independent of the actual image structure/symmetry
    //===============================================================================================



    // image input and output
    let imageInputButton = Make.createImageInput("openInputImage", "inputImageName");
    imageInputButton.onClick = function() {
        imageInputButton.fileInput.click();
        showSelect.setIndex(1);
        basicUI.activateControls(true);
    };

    Make.createSaveImagePng("saveOutputImage", "kaleidoscope");

    // choose between showing the structure or the image
    let showSelect = new Select("show");


    showSelect.addOption("structure",
        function() {
            Make.switchToShowingStructure();
            basicUI.activateControls(false);
        });


    showSelect.addOption("image",
        function() {
            if (!Make.inputImageExists) {
                imageInputButton.fileInput.click();
            } else {
                Make.switchToShowingImage();
            }
            basicUI.activateControls(true);
        });

    // as function
    showSelect.addOption("convergence",
        function() {
            Make.switchToShowingIterations();
            basicUI.activateControls(false);
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

    // navigation
    // the help page depends on the things we are generating
    Button.createGoToLocation("help", "help.html");
    // where is the home ??
    Button.createGoToLocation("home", "home.html");

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

        Draw.setLineWidth(basicUI.lineWidth);

        Draw.setColor("red");


        circleScope.draw();
        //  multiCircles.draw();


    };






    //  Make.map.makeColorCollection(5, 0, 1, 40);


    Make.map.noColorSymmetry();


    //   Make.map.hueShiftInversionColorSymmetry(4);


    circleScope.setMapping();
    circleScope.setDihedral(5);
    circleScope.setupMouseForTrajectory();

    //    circleScope.circle2=circleScope.circleInsideOut(0.33,0.44,0);
    // circleScope.circle1=circleScope.lineLeftRight(0.43,0,0.4,1);
    //  circleScope.triangleCentralCircle(5, 2, 4, 3000, 5, 5);
    //  multiCircles.setMapping();
    //   apollinius.start(0, 6);

    //  circleScope.hyperbolicQuadranglek222(3,0.6);
    //circleScope.hyperbolicKite(3, 8, 2);

    circleScope.hyperbolicQuadrangle(2, 3, 3, 3, 0.3);


}





window.onload = function() {
    "use strict";
    creation();
    basicUI.onload();
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

    basicUI.layout();


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
