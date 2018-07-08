/* jshint esversion:6 */

Layout.setup("titel.html", "rosette.html");
Layout.activateFontSizeChanges();


let sizeFraction = 0.333;
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;
let basicLength = Math.round(sizeFraction * window.innerWidth);
let outputSize = Math.min(basicLength, windowHeight - 3 * Layout.basicFontSize);

Make.createOutputImage("outputCanvas", outputSize, outputSize, 200+0.5*(basiclength-outputSize), 3 * Layout.basicFontSize);

DOM.style("#outputCanvas", "backgroundColor", "#bbbbbb");


controlCanvasSize = windowWidth * sizeFraction;
let controlImageTop = 3 * Layout.basicFontSize;
let controlImageHeight = 0.65 * windowHeight - controlImageTop;
Make.createControlImage("controlCanvas", basicLength, controlImageHeight, windowWidth - basicLength, controlImageTop);

let arrowControllerSize = Math.floor(windowHeight / 4);

Make.createArrowController("arrowController", arrowControllerSize, windowWidth - 0.5 * (controlCanvasSize + arrowControllerSize), 0.5 * (windowHeight + controlImageTop + controlImageHeight - arrowControllerSize));

DOM.style("#outputCanvas", "cursor", "pointer");


Make.createMap();

Make.imageQuality = "high";


text = new BigDiv("text", windowWidth - 2 * basicLength, window.innerHeight, basicLength);

DOM.style("#topRight", "right", 0 + px);

Layout.setFontSizes();

Make.setOutputSize(outputSize, outputSize);


Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

cutSidesKaleidoscope.setKMN(5, 4, 2);

Layout.createOpenImage();

Make.readImageWithFilePathAtSetup("blueYellow.jpg");
