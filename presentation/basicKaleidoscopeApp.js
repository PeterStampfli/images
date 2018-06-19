/* jshint esversion:6 */

// doing the layout in a private scope

(function() {
    "use strict";
    // ratio between height of control image and window height
    const controlHeightFraction = 0.25;
    // fontsize varies with image size
    const fontsizeToWindowHeight = 0.04;
    // h1 titel font size is larger 
    const relativeH1Fontsize = 1.5;
    // rekative size of margins
    const textMarginToFontsize = 0.5;
    // weight of button borders
    const borderWidthToFontsize = 0.15;
    // width of number input buttons
    const inputWidthToFontsize = 3.5;
    // backgroundcolor of everything
    const backgroundColor = "#eeeeee";
    const px = "px";

    DOM.style("body", "backgroundColor", backgroundColor);
    DOM.style("body", "fontFamily", "'Open Sans', Arial, sans-serif");

    let fontSize = fontsizeToWindowHeight * window.innerHeight;
    DOM.style("h1", "fontSize", relativeH1Fontsize * fontSize + px);
    DOM.style("p,button,input", "fontSize", fontSize + px);
    DOM.style("p,h1", "margin", textMarginToFontsize * fontSize + px);
    DOM.style("button,input", "borderWidth", borderWidthToFontsize * fontSize + px);
    DOM.style("input", "width", inputWidthToFontsize * fontSize + "px");


    let outputCanvasWidth = Math.max(window.innerHeight, window.innerWidth - window.innerHeight);
    let outputCanvasHeight = window.innerHeight;

    Make.createOutputImage("outputCanvas", outputCanvasWidth, outputCanvasHeight);
    Make.outputImage.showArea();

    let controlWidth = window.innerWidth - outputCanvasWidth;
    let controlImageHeight = controlHeightFraction * window.innerHeight;

    Make.createArrowController("arrowController", controlImageHeight, outputCanvasWidth, 0);
    Make.arrowController.showArea();


    Make.createControlImage("controlCanvas", controlWidth - controlImageHeight, controlImageHeight, outputCanvasWidth + controlImageHeight, 0);
    Make.controlImage.showArea();

    let text = new BigDiv("text", controlWidth, window.innerHeight - controlImageHeight, outputCanvasWidth, controlImageHeight);

}());

Make.createMap();

Make.imageQuality = "low";




Make.controlImage.showArea();


Make.outputImage.showArea();
Make.setOutputSize(basicLength);


Make.setOutputSize(200, 200);



DOM.style("#topRight", "right", windowWidth - basicLength + 20 + px);


Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

cutSidesKaleidoscope.setKMN(5, 4, 2);

Layout.createOpenImage();


Make.readImageWithFilePathAtSetup("blueYellow.jpg");
