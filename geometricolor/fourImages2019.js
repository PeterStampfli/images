/* jshint esversion:6 */

if (Layout.isLandscape()) {
    Layout.setup("", "setup.html");
    Layout.activateFontSizeChanges();
    Layout.activateFontSizeChangesButtons();
    Layout.setFontSizes();

    Layout.navigationAtRight();


    Layout.createTextDiv();


    DOM.create("canvas", "canvas1", "body");

    const canvas = document.getElementById("canvas1");
    canvas.width = window.innerHeight;
    canvas.height = window.innerHeight;

    const context = canvas.getContext("2d");

    const size2 = window.innerHeight / 2;
    const size = window.innerHeight;

    const image0Path = "guard.jpg";
    const image1Path = "sodermalm.jpg";
    const image2Path = "GamlaStan.jpg";
    const image3Path = "pride.jpg";


    const image0 = Layout.loadImage(image0Path, function() {
        context.drawImage(image0, 0, 0, size2, size2);
    });
    const image1 = Layout.loadImage(image1Path, function() {
        context.drawImage(image1, size2, 0, size2, size2);
    });
    const image2 = Layout.loadImage(image2Path, function() {
        context.drawImage(image2, 0, size2, size2, size2);
    });
    const image3 = Layout.loadImage(image3Path, function() {
        context.drawImage(image3, size2, size2, size2, size2);
    });



    let showAll = true;
    canvas1.onclick = function(event) {

        event.preventDefault();
        event.stopPropagation();
        const x = Math.floor(2 * event.pageX / window.innerHeight);
        const y = Math.floor(2 * event.pageY / window.innerHeight);
        const i = x + 2 * y;
        if (!showAll) {
            context.drawImage(image0, 0, 0, size2, size2);
            context.drawImage(image1, size2, 0, size2, size2);
            context.drawImage(image2, 0, size2, size2, size2);
            context.drawImage(image3, size2, size2, size2, size2);
            showAll = true;
        } else if (i === 0) {
            context.drawImage(image0, 0, 0, size, size);
            showAll = false;
        } else if (i === 1) {
            context.drawImage(image1, 0, 0, size, size);
            showAll = false;
        } else if (i === 2) {
            context.drawImage(image2, 0, 0, size, size);
            showAll = false;
        } else if (i === 3) {
            context.drawImage(image3, 0, 0, size, size);
            showAll = false;
        }

    };

}
