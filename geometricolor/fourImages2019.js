/* jshint esversion:6 */

/**
 * layout for a page with four still images and navigation buttons
 * @method Layout.oneImage
 * @param {String} prev - url of page to go back, "" for home page
 * @param {String} next - url of page to go to next, "" for home page
 */
Layout.fourImages = function(prev, next) {
    if (Layout.isLandscape()) {
        Layout.setup(prev, next);
        Layout.activateFontSizeChanges();
        Layout.setFontSizes();
        Layout.navigationAtRight();
        Layout.createTextDiv();
        DOM.create("canvas", "canvasId", "body");
        const canvas = document.getElementById("canvasId");
        canvas.width = window.innerHeight;
        canvas.height = window.innerHeight;
        const context = canvas.getContext("2d");
        const size2 = window.innerHeight / 2;
        const size = window.innerHeight;
        var image0, image1, image2, image3;

        Layout.drawImages = function(path0, path1, path2, path3) {
            image0 = Layout.loadImage(path0, function() {
                context.drawImage(image0, 0, 0, size2, size2);
            });
            image1 = Layout.loadImage(path1, function() {
                context.drawImage(image1, size2, 0, size2, size2);
            });
            image2 = Layout.loadImage(path2, function() {
                context.drawImage(image2, 0, size2, size2, size2);
            });
            image3 = Layout.loadImage(path3, function() {
                context.drawImage(image3, size2, size2, size2, size2);
            });
        };
        let showAll = true;

        canvas.onclick = function(event) {
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
    } else {
        Layout.drawImages = function() {};
    }
};

Layout.fourImages("", "setup.html");



Layout.drawImages("guard.jpg", "sodermalm.jpg", "GamlaStan.jpg", "pride.jpg");
