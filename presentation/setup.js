/* jshint esversion:6 */

Layout.setup("titel.html", "rosette.html");
Layout.activateFontSizeChanges();
Layout.setFontSizes();

let sizeFraction = 0.3;
let windowWidth = window.innerWidth - 20;
let basicLenght = Math.round(sizeFraction * window.innerWidth);
const px = "px";


Make.createOutputImageNoColorSymmetry("outputCanvas");
//Make.outputImage.stopZoom();
//Make.outputImage.stopShift();

Make.createControlImage("controlCanvas", windowWidth * sizeFraction);
Make.createArrowController("arrowController", 200);
Make.createMap();

Make.highImageQuality = true;


Layout.adjustDimensions();

DOM.style("#controlCanvas", "display", "initial"); // make visible with "initial"
DOM.style("#controlCanvas", "zIndex", "1");
DOM.style("#controlCanvas", "position", "absolute", "right", "20px");
DOM.style("#outputCanvas,#controlCanvas", "top", 3 * Layout.basicFontSize + px);
DOM.style("#text", "left", basicLenght + px, "top", "0px");
DOM.style("#text", "width", (windowWidth - basicLenght) + px); // avoid horizontal scrollbar
DOM.style("#topRight", "right", "0px");

Make.setOutputSize(basicLenght, basicLenght);

Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

cutSidesKaleidoscope.setKMN(5, 4, 2);

Layout.createOpenImage();

Make.readImageWithFilePathAtSetup("passage.jpg");
