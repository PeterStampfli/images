/* jshint esversion:6 */

if (window.innerHeight > window.innerWidth) {
    document.querySelector("body").innerHTML = "<div id='warn'><h1>Please change to <strong>landscape orientation</strong> and RELOAD the page</h1></div>";
    console.log("high");

    DOM.style("#warn", "zIndex", "20", "position", "fixed", "top", "0px", "left", "0px", "backgroundColor", "yellow");
} else {

    Layout.setup("titel.html", "rosette.html");
    Layout.activateFontSizeChanges();


    let sizeFraction = 0.333;
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let basicLength = Math.round(sizeFraction * window.innerWidth);
    let outputSize = Math.min(basicLength, windowHeight - 3 * Layout.basicFontSize);

    Make.createOutputImage("outputCanvas");
    Make.outputImage.setDivDimensions(outputSize, outputSize); // 0.5 * (basicLength - outputSize));
    Make.outputImage.setDivPosition(0, 3 * Layout.basicFontSize);

    DOM.style("#outputCanvas", "backgroundColor", "#bbbbbb");


    controlCanvasSize = windowWidth * sizeFraction;
    let controlImageTop = 3 * Layout.basicFontSize;
    let controlImageHeight = 0.65 * windowHeight - controlImageTop;
    Make.createControlImage("controlCanvas");
    Make.controlImage.setDimensions(basicLength, controlImageHeight);
    Make.controlImage.setPosition(windowWidth - basicLength, controlImageTop);

    let arrowControllerSize = Math.floor(windowHeight / 4);

    Make.createArrowController("arrowController", true);
    Make.arrowController.setPosition(windowWidth - 0.5 * (controlCanvasSize + arrowControllerSize), 0.5 * (windowHeight + controlImageTop + controlImageHeight - arrowControllerSize));
    Make.arrowController.setSize(arrowControllerSize);
    Make.arrowController.drawOrientation();

    DOM.style("#outputCanvas", "cursor", "pointer");


    Make.createMap();

    Make.imageQuality = "high";


    text = new BigDiv("text");
    text.setDimensions(windowWidth - 2 * basicLength, window.innerHeight);
    text.setPosition(basicLength, 0);

    DOM.style("#topRight", "right", (window.innerWidth - outputSize) + px);

    Layout.setFontSizes();

    Make.setOutputSize(outputSize, outputSize);


    Make.setInitialOutputImageSpace(-1, 1, -1);
    Make.resetOutputImageSpace();

    cutSidesKaleidoscope.setKMN(5, 4, 2);

    Layout.createOpenImage();

    Make.readImageWithFilePathAtSetup("blueYellow.jpg");
}
