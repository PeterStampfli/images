/* jshint esversion:6 */

Layout.setup("titel.html", "rosette.html");
Layout.activateFontSizeChanges();
Layout.setFontSizes();

let sizeFraction = 0.333;
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;
let basicLength = Math.round(sizeFraction * window.innerWidth);


Make.createOutputImage("outputCanvas", basicLength, basicLength, 0, 3 * Layout.basicFontSize);

controlCanvasSize = windowWidth * sizeFraction;
Make.createControlImage("controlCanvas", basicLength, 0.65 * windowHeight - 40, windowWidth - basicLength, 20);

let arrowControllerSize = Math.floor(windowHeight / 4);

Make.createArrowController("arrowController", arrowControllerSize, windowWidth - 0.5 * (controlCanvasSize + arrowControllerSize), windowHeight - 20 - arrowControllerSize);

DOM.style("#outputCanvas,#controlCanvas,#arrowController", "cursor", "pointer");

Make.createMap();

Make.highImageQuality = true;


Layout.adjustDimensions();



DOM.style("#text", "left", basicLength + px, "top", "0px");
DOM.style("#text", "width", (windowWidth - 2 * basicLength) + px);


DOM.style("#text", "height", window.innerHeight + px, "overflow", "auto");

text = new BigDiv("text", windowWidth - 2 * basicLength, window.innerHeight, basicLength);

DOM.style("#topRight", "right", windowWidth - basicLength + 20 + px);

Make.setOutputSize(basicLength, basicLength);


Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

cutSidesKaleidoscope.setKMN(5, 4, 2);

Layout.createOpenImage();

Make.readImageWithFilePathAtSetup("blueYellow.jpg");
