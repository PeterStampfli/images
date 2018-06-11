/* jshint esversion:6 */

Layout.setup("titel.html", "rosette.html");
Layout.activateFontSizeChanges();
Layout.setFontSizes();

let sizeFraction = 0.333;
let windowWidth = window.innerWidth - 20;
let windowHeight = window.innerHeight;
let basicLength = Math.round(sizeFraction * windowWidth);
const px = "px";


Make.createOutputImageNoColorSymmetry("outputCanvas");
//Make.outputImage.stopZoom();
//Make.outputImage.stopShift();
controlCanvasSize = windowWidth * sizeFraction;

Make.createControlImage("controlCanvas", basicLength, 0.65 * windowHeight - 40, 2 * basicLength, 20);
let arrowControllerSize = Math.floor(windowHeight / 4);
DOM.style("#arrowController", "display", "initial"); // make visible with "initial"
DOM.style("#arrowController", "zIndex", "2");
DOM.style("#arrowController", "position", "fixed", "right", (0.5 * (controlCanvasSize - arrowControllerSize) + 20) + px, "bottom", "20px");


Make.createArrowController("arrowController", arrowControllerSize, 2 * basicLength + 0.5 * (controlCanvasSize - arrowControllerSize), windowHeight - 20);
Make.createMap();

Make.highImageQuality = true;


Layout.adjustDimensions();


Make.controlImage.showBorder();



DOM.style("#outputCanvas", "top", 3 * Layout.basicFontSize + px);
DOM.style("#text", "left", basicLength + px, "top", "0px");
DOM.style("#text", "width", (windowWidth - 2 * basicLength) + px); // avoid horizontal scrollbar
DOM.style("#topRight", "right", windowWidth - basicLength + 20 + px);

Make.setOutputSize(basicLength, basicLength);

Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

cutSidesKaleidoscope.setKMN(5, 4, 2);

Layout.createOpenImage();
console.log(document.getElementById("bla"));

Make.readImageWithFilePathAtSetup("blueYellow.jpg");
