/* jshint esversion:6 */

function drawImage(context, filePath) {
    image = Layout.loadImage(filePath, function() {
        context.drawImage(image, 0, 0, window.innerHeight, window.innerHeight);
    });
}

if (Layout.isLandscape()) {
    Layout.setup("", "setup.html");
    Layout.activateFontSizeChanges();
    Layout.activateFontSizeChangesButtons();
    Layout.setFontSizes();

    Layout.navigationAtRight();


    Layout.createTextDiv();


    DOM.create("canvas", "canvas1", "body");

    const canvas1 = document.getElementById("canvas1");
    canvas1.width = window.innerHeight;
    canvas1.height = window.innerHeight;

    const canvasContext1 = canvas1.getContext("2d");


    drawImage(canvasContext1, "guard.jpg");

}
