/* jshint esversion:6 */

Layout.setup("triangles.html", "circleInversion.html");

Make.createOutputImageNoMap("outputCanvas");
DOM.style("#outputCanvas", "cursor", "crosshair");
Draw.setOutputImage(Make.outputImage);

Layout.activateFontSizeChanges();
Layout.adjustDimensions();
Layout.setFontSizes();

Make.setInitialOutputImageSpace(0, 1, 0);
Make.resetOutputImageSpace();

const mirrorCenterX = 0.3;
const mirrorCenterY = 0.3;
const mirrorRadius = 0.25;
let mirrorCenter = new Vector2(mirrorCenterX, mirrorCenterY);
let mirrorCircle = new Circle(mirrorRadius, mirrorCenter);

const extraCenterX = 0.6;
const extraCenterY = 0.5;
let d2 = (mirrorCenterX - extraCenterX) * (mirrorCenterX - extraCenterX) + (mirrorCenterY - extraCenterY) * (mirrorCenterY - extraCenterY);
let extraRadius = Math.sqrt(d2 - mirrorRadius * mirrorRadius);
let extraCenter = new Vector2(extraCenterX, extraCenterY);
let extraCircle = new Circle(extraRadius, extraCenter);

const nullRadius = 0.015;

let mousePosition = new Vector2();
let imagePosition = new Vector2();

let background = new Color(255, 255, 240, 255);
let inside = new Color(255, 196, 128, 255);
let outside = new Color(128, 255, 128, 255);

let mouseColor = "#000000ff";

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
    Draw.setLineWidth(Layout.lineWidth);
    Draw.setColor(Layout.lineColor);
    extraCircle.draw();
    Draw.setColor(Layout.mirrorColor);
    mirrorCircle.draw();
    Draw.setColor(Layout.mirrorColor);
    Draw.disc(nullRadius, mirrorCenter);
}

drawScheme();

Make.outputImage.mouseEvents.downAction = function(mouseEvents) {
    Make.outputImage.mouseEvents.dragAction(mouseEvents);
};

Make.outputImage.mouseEvents.dragAction = function(mouseEvents) {
    drawScheme();
    mousePosition.setComponents(mouseEvents.x, mouseEvents.y);
    Make.outputImage.pixelToSpaceCoordinates(mousePosition);
    imagePosition.set(mousePosition);
    mirrorCircle.invert(imagePosition);
    Draw.setColor(mouseColor);
    Draw.disc(nullRadius, mousePosition);
    Draw.disc(nullRadius, imagePosition);
    Draw.line(mousePosition, imagePosition);
};

Make.outputImage.mouseEvents.outAction = function(mouseEvents) {
    drawScheme();
};
