/* jshint esversion:6 */

if (window.innerHeight > window.innerWidth) {
    document.querySelector("body").innerHTML = "<div id='warn'><h1>Please change to <strong>landscape orientation</strong> and RELOAD the page</h1></div>";
    console.log("high");

    DOM.style("#warn", "zIndex", "20", "position", "fixed", "top", "0px", "left", "0px", "backgroundColor", "yellow");
} else {

    Layout.setup("interpolation.html", "");
    Layout.activateFontSizeChanges();

    Make.createOutputImage("outputCanvas");
    Make.outputImage.setDivDimensions(window.innerHeight, window.innerHeight);
    Make.outputImage.setDivPosition(0, 0);
    DOM.style("#outputCanvas", "backgroundColor", "#bbbbbb");


    Make.createControlImage("controlCanvas", 200);
    Make.createControlImage("controlCanvas", false);
    Make.controlImage.setDimensions(200, 200);
    Make.controlImage.setPosition(0, 0);
    Make.createArrowController("arrowController", false);
    Make.arrowController.setSize(100);
    Make.arrowController.setPosition(0, 0);
    Make.createMap();
    Make.setOutputSize(window.innerHeight);


    Make.imageQuality = "high";

    text = new BigDiv("text");
    text.setDimensions(window.innerWidth - window.innerHeight, window.innerHeight);
    text.setPosition(window.innerHeight, 0);

    Layout.setFontSizes();

    Make.setInitialOutputImageSpace(-1, 1, -1);
    Make.resetOutputImageSpace();

    basicKaleidoscope.worldRadiusElliptic = 0.65;
    cutCornersKaleidoscope.setKMN(4, 5, 2);

    Layout.createOpenImage();



    Make.readImageWithFilePathAtSetup("pride.jpg");
}
