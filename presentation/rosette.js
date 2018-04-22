/* jshint esversion:6 */

Layout.setup("titel.html", "triangles.html");
Make.createOutputImageNoColorSymmetry("outputCanvas");
Make.outputImage.stopZoom();
Make.outputImage.stopShift();
DOM.style("#outputCanvas", "cursor", "crosshair");

Make.createControlImage("controlCanvas", 200);
Make.createArrowController("arrowController", 200);

Layout.activateFontSizeChanges();
//Layout.activateFontSizeChangesButtons();

Layout.adjustDimensions();

Layout.setFontSizes();

Make.setInitialOutputImageSpace(-1, 1, -1);
Make.resetOutputImageSpace();

let twoMirrors = new TwoMirrors();
let setKButton = Layout.createNumberButton("n");
setKButton.setRange(2, 10000);

setKButton.setValue(5);
setKButton.onChange = function() {
    Make.updateNewMap();
};

Make.initializeMap = function() {
    twoMirrors.setK(setKButton.getValue());
};

Make.setMapping(twoMirrors.vectorMapping, twoMirrors.reflectionsMapping);

Make.updateOutputImage = function() {
    Make.updateMapOutput();
    twoMirrors.drawLines(Layout.mirrorColor, Layout.lineWidth, Make.outputImage);
};

const nullRadius = 0.025;

let mousePosition = new Vector2();
let mouseCircle = new Circle(0, mousePosition);
let imagePosition = new Vector2();
let imageCircle = new Circle(0, imagePosition);
let mouseColor = new Color(0, 0, 0, 255);

Make.outputImage.mouseEvents.downAction = function(mouseEvents) {
    Make.outputImage.mouseEvents.dragAction(mouseEvents);
};

Make.outputImage.mouseEvents.dragAction = function(mouseEvents) {
    console.log("drag");
    Make.updateOutputImage();

    mousePosition.setComponents(mouseEvents.x, mouseEvents.y);
    Make.outputImage.pixelToSpaceCoordinates(mousePosition);

    mouseCircle.setColor(mouseColor);
    mouseCircle.setRadius(nullRadius);
    mouseCircle.fill(Make.outputImage);

    imagePosition.set(mousePosition);
    if (twoMirrors.map(imagePosition) != 0) {
        imageCircle.setRadius(nullRadius);
        imageCircle.setColor(mouseColor);
        imageCircle.fill(Make.outputImage);

        let mouseAngle = mousePosition.angle();
        let imageAngle = imagePosition.angle();
        if (mouseAngle < 0) {
            mouseAngle += 2 * Math.PI;
        }
        let context = Make.outputImage.pixelCanvas.canvasContext;
        let radius = mousePosition.length();
        context.lineCap = 'butt';
        context.strokeStyle = mouseColor.toString();
        context.lineWidth = Layout.lineWidth * Make.outputImage.scale;
        context.beginPath();
        if (mouseAngle - imageAngle < Math.PI) {
            context.moveTo(imagePosition.x, imagePosition.y);
            context.arc(0, 0, radius, imageAngle, mouseAngle);
        } else {
            context.moveTo(mousePosition.x, mousePosition.y);
            context.arc(0, 0, radius, mouseAngle, imageAngle);
        }
        context.stroke();
    }
};

Make.outputImage.mouseEvents.outAction = function(mouseEvents) {
    Make.updateOutputImage();
};

Layout.createStructureImageButton("change");

Make.readImageWithFilePathAtSetup("dreamingofspring.jpg");
