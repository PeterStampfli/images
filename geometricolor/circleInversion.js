/* jshint esversion:6 */

if (window.innerHeight > window.innerWidth) {
    document.querySelector("body").innerHTML = "<div id='warn'><h1>Please change to <strong>landscape orientation</strong> and RELOAD the page</h1></div>";
    console.log("high");

    DOM.style("#warn", "zIndex", "20", "position", "fixed", "top", "0px", "left", "0px", "backgroundColor", "yellow");
} else {

    Layout.setup("triangles.html", "kaleidoscope.html");
    Layout.activateFontSizeChanges();

    Make.createOutputImage("outputCanvas");
    Make.outputImage.setDivDimensions(window.innerHeight, window.innerHeight);
    Make.outputImage.setDivPosition(0, 0);
    Make.outputImage.stopZoom();
    Make.outputImage.stopShift();
    DOM.style("#outputCanvas", "cursor", "crosshair");
    Draw.setOutputImage(Make.outputImage);

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


    Make.setInitialOutputImageSpace(0, 1, 0);
    Make.resetOutputImageSpace();

    const mirrorCenterX = 0.95;
    const mirrorCenterY = 0.6;
    const mirrorRadius = 0.38;
    let mirrorCenter = new Vector2(mirrorCenterX, mirrorCenterY);
    let mirrorCircle = new Circle(mirrorRadius, mirrorCenter);

    const extraCenterX = 0.43;
    const extraCenterY = 0.44;
    let d2 = (mirrorCenterX - extraCenterX) * (mirrorCenterX - extraCenterX) + (mirrorCenterY - extraCenterY) * (mirrorCenterY - extraCenterY);
    let extraRadius = Math.sqrt(d2 - mirrorRadius * mirrorRadius);
    let extraCenter = new Vector2(extraCenterX, extraCenterY);
    let extraCircle = new Circle(extraRadius, extraCenter);

    let mousePosition = new Vector2();
    let imagePosition = new Vector2();

    // the mapping for using an input image, only points inside the circle
    inversionMap = function(position, furtherResults) {
        if (extraCircle.contains(position)) {
            mirrorCircle.invertInsideOut(position);
            furtherResults.lyapunov = 1;
        } else {
            furtherResults.lyapunov = -1;
        }
    };

    Make.setMapping(inversionMap);

    Make.updateOutputImage = function() {
        let nullRadius = Make.outputImage.scale * Layout.nullRadius;
        Make.updateMapOutput();
        Draw.setLineWidth(Layout.lineWidth);
        Draw.setColor(Layout.lineColor);
        extraCircle.draw();
        Draw.setColor(Layout.mirrorColor);
        mirrorCircle.draw();
        Draw.setColor(Layout.mirrorColor);
        Draw.disc(nullRadius, mirrorCenter);
    };

    Make.outputImage.mouseEvents.downAction = function(mouseEvents) {
        Make.outputImage.mouseEvents.dragAction(mouseEvents);
    };

    Make.outputImage.move = function(mouseEvents) {
        let nullRadius = Make.outputImage.scale * Layout.nullRadius;
        Make.updateOutputImage();
        mousePosition.setComponents(mouseEvents.x, mouseEvents.y);
        Make.outputImage.pixelToSpaceCoordinates(mousePosition);
        imagePosition.set(mousePosition);
        Draw.setLineWidth(0.7 * Layout.lineWidth);
        Draw.setColor(Layout.trajectoryColor);
        let factor = mirrorCircle.drawInvert(imagePosition);
        Draw.setColor(Layout.pointColor);
        if (factor > 1) {
            let startRadius = factor * nullRadius;
            Draw.circle(startRadius, imagePosition);
            Draw.circle(nullRadius, mousePosition);
        } else {
            Draw.circle(nullRadius, imagePosition);
            let endRadius = nullRadius / factor;
            Draw.circle(endRadius, mousePosition);
        }
    };

    Make.outputImage.mouseEvents.outAction = function(mouseEvents) {
        Make.updateOutputImage();
    };

    Layout.createOpenImage();


    Make.readImageWithFilePathAtSetup("sodermalm.jpg");
}
