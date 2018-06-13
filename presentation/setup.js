/* jshint esversion:6 */

Layout.setup("titel.html", "rosette.html");
Layout.activateFontSizeChanges();
Layout.setFontSizes();

let sizeFraction = 0.333;
let windowWidth = window.innerWidth - 20;
let windowHeight = window.innerHeight;
let basicLength = Math.round(sizeFraction * window.innerWidth);


Make.createOutputImage("outputCanvas");

controlCanvasSize = windowWidth * sizeFraction;
Make.createControlImage("controlCanvas", basicLength, 0.65 * windowHeight - 40, 2 * basicLength, 20);

let arrowControllerSize = Math.floor(windowHeight / 4);

Make.createArrowController("arrowController", arrowControllerSize, 2 * basicLength + 0.5 * (controlCanvasSize - arrowControllerSize), windowHeight - 20 - arrowControllerSize);

DOM.style("#outputCanvas,#controlCanvas,#arrowController", "cursor", "pointer");

Make.createMap();

Make.highImageQuality = true;


Layout.adjustDimensions();



DOM.style("#outputCanvas", "top", 3 * Layout.basicFontSize + px);
DOM.style("#text", "left", basicLength + px, "top", "0px");
DOM.style("#text", "width", (windowWidth - 2 * basicLength) + px); // avoid horizontal scrollbar


DOM.style("#text", "height", window.innerHeight + px, "overflow", "auto");
DOM.style("#topRight", "right", windowWidth - basicLength + 20 + px);

Make.setOutputSize(basicLength, basicLength);


Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

cutSidesKaleidoscope.setKMN(5, 4, 2);

Layout.createOpenImage();

Make.readImageWithFilePathAtSetup("blueYellow.jpg");
