/* jshint esversion:6 */

if (Layout.isLandscape()) {
    Layout.setup("", "setup.html");
    Layout.activateFontSizeChanges();
    Layout.activateFontSizeChangesButtons();


    DOM.style("#outputCanvas", "cursor", "default");


    text = new BigDiv("text");
    text.setDimensions(window.innerWidth - window.innerHeight, window.innerHeight);
    text.setPosition(window.innerHeight, 0);
    Layout.setFontSizes();





    const outputCanvas = new PixelCanvas("outputCanvas");

    outputCanvas.setSize(window.innerHeight, window.innerHeight);
    outputCanvas.fillScreen("#ffffffff");
    outputCanvas.drawImageWithFilePath("guard.jpg");
}
