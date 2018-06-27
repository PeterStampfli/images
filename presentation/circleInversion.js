/* jshint esversion:6 */

Layout.setup("triangles.html", "kaleidoscope.html");
Layout.activateFontSizeChanges();

Make.createOutputImage("outputCanvas", window.innerHeight);
Make.outputImage.stopZoom();
Make.outputImage.stopShift();
DOM.style("#outputCanvas", "cursor", "crosshair");
Draw.setOutputImage(Make.outputImage);

Make.createControlImage("controlCanvas", 200);
Make.createArrowController("arrowController", 200);
Make.createMap();
Make.setOutputSize(window.innerHeight);

text = new BigDiv("text", window.innerWidth - window.innerHeight, window.innerHeight, window.innerHeight);
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
Make.mappingInputImage = function(position) {
    if (extraCircle.contains(position)) {
        mirrorCircle.invertInsideOut(position);
        return 1;
    }
    return -1;
};

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

Make.outputImage.mouseEvents.dragAction = function(mouseEvents) {
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
