/* jshint esversion:6 */

Layout.setup("triangles.html", "circleInversion.html");

Make.createOutputImageNoMap("outputCanvas");
DOM.style("#outputCanvas", "cursor", "crosshair");

Layout.activateFontSizeChanges();
Layout.adjustDimensions();
Layout.setFontSizes();

Make.setInitialOutputImageSpace(-0.25, 1, -0.25);
Make.resetOutputImageSpace();

const mirrorCenterX = 0.6;
const mirrorRadius = 0.3;
let mirrorCenter = new Vector2(mirrorCenterX, mirrorCenterX);
let mirrorCircle = new Circle(mirrorRadius, mirrorCenter);
let centerCircle = new Circle(0, mirrorCenter);

const extraCenterX = 0.3;
const extraRadius = 0.3;
let extraCenter = new Vector2(extraCenterX, extraCenterX);
let extraCircle = new Circle(extraRadius, extraCenter);

const nullRadius = 0.015;

let mousePosition = new Vector2();
let mouseCircle = new Circle(0, mousePosition);
let imagePosition = new Vector2();
let imageCircle = new Circle(0, imagePosition);
let mapLine = new Line(mousePosition, imagePosition);

let background = new Color(255, 255, 240, 255);
let inside = new Color(255, 196, 128, 255);
let outside = new Color(128, 255, 128, 255);
let mouseColor = new Color(0, 0, 0, 255);

function drawScheme() {
    Make.outputImage.drawPixel(function(position, color) {
        if (!extraCircle.contains(position)) {
            color.set(background);
        } else if (mirrorCircle.contains(position)) {
            color.set(inside);
        } else {
            color.set(outside);
        }
    });

    extraCircle.setColor(Layout.lineColor);
    extraCircle.setLineWidth(Layout.lineWidth);
    extraCircle.draw(Make.outputImage);

    mirrorCircle.setColor(Layout.mirrorColor);
    mirrorCircle.setLineWidth(Layout.lineWidth);
    mirrorCircle.draw(Make.outputImage);

    centerCircle.setColor(Layout.mirrorColor);
    centerCircle.setRadius(nullRadius);
    centerCircle.fill(Make.outputImage);
}

drawScheme();

Make.outputImage.mouseEvents.downAction = function(mouseEvents) {
    Make.outputImage.mouseEvents.dragAction(mouseEvents);
};

Make.outputImage.mouseEvents.dragAction = function(mouseEvents) {
    drawScheme();
    mousePosition.setComponents(mouseEvents.x, mouseEvents.y);
    Make.outputImage.pixelToSpaceCoordinates(mousePosition);

    mouseCircle.setColor(mouseColor);
    mouseCircle.setRadius(nullRadius);
    mouseCircle.fill(Make.outputImage);

    imagePosition.set(mousePosition);
    mirrorCircle.invert(imagePosition);
    imageCircle.setRadius(nullRadius);
    imageCircle.setColor(mouseColor);
    imageCircle.fill(Make.outputImage);

    mapLine.update();
    mapLine.setColor(mouseColor);
    mapLine.setLineWidth(Layout.lineWidth);
    mapLine.draw(Make.outputImage);
};

Make.outputImage.mouseEvents.outAction = function(mouseEvents) {
    drawScheme();
};
