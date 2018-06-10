/* jshint esversion:6 */

Layout.setup("titel.html", "rosette.html");
Layout.activateFontSizeChanges();
Layout.setFontSizes();

let sizeFraction = 0.3;
let windowWidth = window.innerWidth - 20;
let windowHeight = window.innerHeight;
let basicLenght = Math.round(sizeFraction * window.innerWidth);
const px = "px";


Make.createOutputImageNoColorSymmetry("outputCanvas");
//Make.outputImage.stopZoom();
//Make.outputImage.stopShift();
controlCanvasSize = windowWidth * sizeFraction;
Make.createControlImage("controlCanvas", controlCanvasSize);
let arrowControllerSize = Math.floor(windowHeight / 4);
Make.createArrowController("arrowController", arrowControllerSize);
Make.createMap();

Make.highImageQuality = true;


Layout.adjustDimensions();

DOM.style("#controlCanvas", "display", "initial"); // make visible with "initial"
DOM.style("#controlCanvas", "zIndex", "1");
DOM.style("#controlCanvas", "position", "fixed", "right", "20px", "top", "20px");


DOM.style("#arrowController", "display", "initial"); // make visible with "initial"
DOM.style("#arrowController", "zIndex", "2");
DOM.style("#arrowController", "position", "fixed", "right", (0.5 * (controlCanvasSize - arrowControllerSize) + 20) + px, "bottom", "20px");

DOM.style("#outputCanvas", "top", 3 * Layout.basicFontSize + px);
DOM.style("#text", "left", basicLenght + px, "top", "0px");
DOM.style("#text", "width", (windowWidth - 2 * basicLenght) + px); // avoid horizontal scrollbar
DOM.style("#topRight", "right", windowWidth - basicLenght + 20 + px);

Make.setOutputSize(basicLenght, basicLenght);

Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

cutSidesKaleidoscope.setKMN(5, 4, 2);

Layout.createOpenImage();

Make.readImageWithFilePathAtSetup("blueYellow.jpg");
