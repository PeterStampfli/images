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
        Draw.setLineWidth(2);
        Draw.setColor("red");
        iterateTiling.drawStructure(0);
        Draw.setColor("blue");
        // iterateTiling.structure[1].draw();
        // imageTiles.polygons.draw();

    };



    ambe.twoColorImage();
    //ambe.straightSingleColorImage();
    ambe.shearedSingleColorImage();


    // iterateTiling.initialPolygons = penrose.start;
    iterateTiling.initialPolygons = ambe.start;
    //iterateTiling.initialPolygons = small12.start;
    iterateTiling.initialPolygons = stampfli.start;
    //  iterateTiling.initialPolygons = octagon.start;

    //  Polygon.mapWithShiftRotateMirror();
    //  Polygon.mapWithShiftRotateMirrorScaleShear();
    //   Polygon.mapWithShiftRotateMirrorShear();


    iterateTiling.setMaxIterations(1);
    iterateTiling.generateStructure();

    const a = new Vector2(-4, 0);
    const b = new Vector2(0, -4);

    const c = new Vector2(4, 0);
    const d = new Vector2(-2, 4);
    const center = new Vector2(0, 0);

    const gamma = new Vector2(0.1, 1);
    Polygon.setGamma(gamma);
    Polygon.setCenter(c);

    //  iterateTiling.structure[0].addPolygon(a, b, c);
    /*
        const imagePolygon = imageTiles.polygons.addPolygon(a, b, c);
        imagePolygon.addTriangleMapping(a, b, true);
    */

    // determine and set gamma for an array of polygons, typically triangles, with given center, and baseline
    // resulting from the dissection  of a polygon
    // gamma does not depend on orientation and size of polygon. Only on shape and dissection (center)

    let centerToGamma = new Vector2();

    function setGamma(triangles) {
        let sumX = 0;
        let sumY = 0;
        let nTriangles = triangles.length;
        for (var i = 0; i < nTriangles; i++) {
            centerToGamma.set(Polygons.center);
            triangles[i].applyBaseline(centerToGamma);
            sumX += centerToGamma.x;
            sumY += centerToGamma.y;
        }
        Polygons.gamma.setComponents(sumX / nTriangles, sumY / nTriangles);
    }

    function adjustTriangleMapping(triangles) {
        let nTriangles = triangles.length;
        for (var i = 0; i < nTriangles; i++) {
            triangles[i].adjustScaleShearTriangleMapping();
        }
    }

    let triangles = [];
    /*
        function twoColorHalfQuad(a, b, c, center, aMapsToZero) {
            Polygon.setCenter(center);
            triangles.length=0;
            triangles.push(imageTiles.polygons.addPolygon(a, b, center).addBaseline(a, b, aMapsToZero));
            triangles.push(imageTiles.polygons.addPolygon(b, c, center).addBaseline(b, c, !aMapsToZero));
            adjustTriangleMapping(triangles);
        }

        function twoColorQuad(a, b, c, d, center, aMapsToZero) {
            twoColorHalfQuad(a, b, c, center, aMapsToZero);
            twoColorHalfQuad(c, d, a, center, aMapsToZero);
        }

        function singleColorHalfQuad(a, b, c, center) {
            Polygon.setCenter(center);
            const ab = Vector2.center(a, b);
            const bc = Vector2.center(b, c);
            imageTiles.polygons.addPolygon(a, ab, center).addTriangleMapping(a, ab);
            imageTiles.polygons.addPolygon(b, center, ab).addTriangleMapping(b, ab);
            imageTiles.polygons.addPolygon(b, bc, center).addTriangleMapping(b, bc);
            imageTiles.polygons.addPolygon(c, center, bc).addTriangleMapping(c, bc);
        }

        function singleColorQuad(a, b, c, d, center) {
            singleColorHalfQuad(a, b, c, center);
            singleColorHalfQuad(c, d, a, center);
        }



        // singleColorQuad(new Vector2(-6, 0), new Vector2(0, -6), new Vector2(7, 2), new Vector2(-2, 10), new Vector2(1.5, 0), true);
     //    twoColorQuad(new Vector2(-6,0),new Vector2(0,-6),new Vector2(7,2),new Vector2(1.5,0),true);
         twoColorHalfQuad(new Vector2(-6,0),new Vector2(0,-6),new Vector2(7,2),new Vector2(1.5,0),true);
    */
    /*
        imageTiles.twoColorQuadDecomposition(triangles, a, b, c, d, center, true);

        imageTiles.calculateGamma(gamma, center, triangles);
        gamma.log("gamma");

        Polygon.center = center;
        Polygon.gamma = gamma;

        imageTiles.adjustTriangleMapping(triangles);

        imageTiles.addTriangles(triangles);

        imageTiles.bins.addObjects(imageTiles.polygons);

        Fast.logArrayOfObjects(triangles);
        Fast.logArrayOfObjects(imageTiles.polygons);

    */
}

// adjust fontsize related dimensions

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
