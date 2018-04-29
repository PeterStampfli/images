/* jshint esversion:6 */

Layout.setup("triangles.html", "circleInversion.html");

Make.createOutputImageNoColorSymmetry("outputCanvas");
Make.outputImage.stopZoom();
Make.outputImage.stopShift();
DOM.style("#outputCanvas", "cursor", "crosshair");
Draw.setOutputImage(Make.outputImage);

Make.createControlImage("controlCanvas", 200);
Make.createArrowController("arrowController", 200);

Layout.activateFontSizeChanges();
Layout.adjustDimensions();

Layout.setFontSizes();

Make.setInitialOutputImageSpace(0, 1, 0);
Make.resetOutputImageSpace();

const mirrorCenterX = 0.9;
const mirrorCenterY = 0.15;
const mirrorRadius = 0.4;
let mirrorCenter = new Vector2(mirrorCenterX, mirrorCenterY);
let mirrorCircle = new Circle(mirrorRadius, mirrorCenter);

const extraCenterX = 0.42;
const extraCenterY = 0.45;
let d2 = (mirrorCenterX - extraCenterX) * (mirrorCenterX - extraCenterX) + (mirrorCenterY - extraCenterY) * (mirrorCenterY - extraCenterY);
let extraRadius = Math.sqrt(d2 - mirrorRadius * mirrorRadius);
let extraCenter = new Vector2(extraCenterX, extraCenterY);
let extraCircle = new Circle(extraRadius, extraCenter);

const nullRadius = 0.01;

let mousePosition = new Vector2();
let imagePosition = new Vector2();

let background = new Color(255, 255, 240, 255);
let inside = new Color(255, 196, 128, 255);
let outside = new Color(128, 255, 128, 255);

let mouseColor = "#ff8800ff";
let limitRadius = 0.02; // very small circles without a line


Make.inputImage.setOffColor(background);
Make.map.setOffColor(background);

// the mapping for using an input image
Make.mappingInputImage = function(mapIn, mapOut) {
    mapOut.set(mapIn);
    if (extraCircle.contains(mapOut)) {
        mirrorCircle.invertInsideOut(mapOut);
        return 1;
    }
    return -1;
};

Make.updateOutputImage = function() {
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

Make.outputImage.mouseEvents.dragAction = function(mouseEvents) {
    Make.updateOutputImage();
    mousePosition.setComponents(mouseEvents.x, mouseEvents.y);
    Make.outputImage.pixelToSpaceCoordinates(mousePosition);
    imagePosition.set(mousePosition);
    Draw.setLineWidth(0.7 * Layout.lineWidth);

    Draw.setColor(mouseColor);
    let factor = mirrorCircle.drawInvert(imagePosition);
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

Make.readImageWithFilePathAtSetup("dreamingofspring.jpg");
