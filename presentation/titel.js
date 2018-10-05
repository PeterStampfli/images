/* jshint esversion:6 */

if (window.innerHeight > window.innerWidth) {
    document.querySelector("body").innerHTML = "<div id='warn'><h1>Please change to <strong>landscape orientation</strong> and RELOAD the page</h1></div>";
    DOM.style("#warn", "zIndex", "20", "position", "fixed", "top", "0px", "left", "0px", "backgroundColor", "yellow");
} else {
    Layout.setup("", "setup.html");
    Layout.activateFontSizeChanges();
    Layout.activateFontSizeChangesButtons();

    Make.createOutputImage("outputCanvas");
    Make.outputImage.setDivPosition(0, 0);
    Make.outputImage.setDivDimensions(window.innerHeight, window.innerHeight);
    Make.outputImage.stopZoom();
    Make.outputImage.stopShift();
    DOM.style("#outputCanvas", "cursor", "default");


    text = new BigDiv("text");
    text.setDimensions(window.innerWidth - window.innerHeight, window.innerHeight);
    text.setPosition(window.innerHeight, 0);
    Make.createControlImage("controlCanvas", false);
    Make.controlImage.setDimensions(200, 200);
    Make.createArrowController("arrowController", false);
    Layout.setFontSizes();

    Make.createMap();

    Make.setOutputSize(window.innerHeight);

    Make.imageQuality = "high";


    Make.setInitialOutputImageSpace(-1, 1, -1);
    Make.resetOutputImageSpace();

    basicKaleidoscope.worldRadiusElliptic = 0.5;
    cutCornersKaleidoscope.setKMN(3, 5, 2);

    Layout.createOpenImage();



    Make.readImageWithFilePathAtSetup("GamlaStan.jpg");
}
