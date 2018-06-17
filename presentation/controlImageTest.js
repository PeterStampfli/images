/* jshint esversion:6 */

Layout.setup("titel.html", "rosette.html");
Layout.activateFontSizeChanges();
Layout.setFontSizes();

let sizeFraction = 0.333;
let windowWidth = window.innerWidth - 20;
let windowHeight = window.innerHeight;
let basicLength = Math.round(sizeFraction * windowWidth);


Make.createOutputImage("outputCanvas", basicLength, basicLength, 0, 3 * Layout.basicFontSize);


//Make.outputImage.stopZoom();
//Make.outputImage.stopShift();
controlCanvasSize = windowWidth * sizeFraction;

Make.createControlImage("controlCanvas", basicLength, 0.65 * windowHeight - 40, 2 * basicLength, 20);
let arrowControllerSize = Math.floor(windowHeight / 4);



Make.createArrowController("arrowController", arrowControllerSize, 2 * basicLength + 0.5 * (controlCanvasSize - arrowControllerSize), windowHeight - 20 - arrowControllerSize);
Make.createMap();

Make.highImageQuality = true;


Layout.adjustDimensions();


Make.controlImage.showArea();

Make.arrowController.showArea();

//Make.outputImage.showArea();
Make.setOutputSize(basicLength);


//Make.setOutputSize(1000,1000);



DOM.style("#text", "left", basicLength + px, "top", "0px");
DOM.style("#text", "width", (windowWidth - 2 * basicLength) + px); // avoid horizontal scrollbar


DOM.style("#text", "height", window.innerHeight + px, "overflow", "auto");
DOM.style("#topRight", "right", windowWidth - basicLength + 20 + px);


Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

cutSidesKaleidoscope.setKMN(5, 4, 2);

Layout.createOpenImage();


Make.readImageWithFilePathAtSetup("blueYellow.jpg");
