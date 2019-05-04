/* jshint esversion:6 */

if (Layout.isLandscape()) {
    Layout.setup("", "setup.html");
    Layout.setFontSizes();

    DOM.style("#topLeft", "left", 0 + px);
    DOM.style("#topRight", "right", 0 + px);




    text1 = new BigDiv("text");
    text1.setDimensions(window.innerWidth - 2 * Layout.totalButtonWidth, Layout.totalButtonHeight);
    text1.setPosition(Layout.totalButtonWidth, Layout.borderWidth);


    const imageSize = Math.min((window.innerWidth - Layout.marginSize) / 2, window.innerHeight - Layout.totalButtonHeight - Layout.marginSize);

    const outputCanvas1 = new PixelCanvas("outputCanvas1");
    outputCanvas1.setSize(imageSize, imageSize);
    outputCanvas1.setPosition(window.innerWidth / 2 - 0.5 * Layout.marginSize - imageSize, Layout.totalButtonHeight + Layout.marginSize);
    outputCanvas1.drawImageWithFilePath("GamlaStan.jpg");


    const outputCanvas2 = new PixelCanvas("outputCanvas2");
    outputCanvas2.setSize(imageSize, imageSize);
    outputCanvas2.setPosition(window.innerWidth / 2 + 0.5 * Layout.marginSize, Layout.totalButtonHeight + Layout.marginSize);
    outputCanvas2.drawImageWithFilePath("nixda.jpg");

    console.log(window.innerHeight);
    console.log(imageSize);

}
