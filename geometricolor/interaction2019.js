/* jshint esversion:6 */

/**
 * layout for a page with interactive image and navigation buttons
 * @method Layout.interactive
 * @param {String} prev - url of page to go back, "" for home page
 * @param {String} next - url of page to go to next, "" for home page
 * @return true if landscape
 */
Layout.interactive = function(prev, next) {
    if (Layout.isLandscape()) {

        Layout.setup(prev, next);

        Layout.createOpenImage();
        Layout.navigationAtRight();


        // setting up the images
        // output image
        Make.createOutputImage("outputCanvas");
        Make.outputImage.setDivDimensions(window.innerHeight, window.innerHeight);
        Make.outputImage.setDivPosition(0, 0);
        //  Make.outputImage.stopZoom();
        //  Make.outputImage.stopShift();
        Draw.setOutputImage(Make.outputImage);
        // hidden control images
        Make.createControlImage("controlCanvas", false);
        Make.createArrowController("arrowController", false);
        Make.createMap(); // needs the images
        Make.setOutputSize(window.innerHeight);
        Layout.createTextDiv();

        if (DOM.idExists("show")) {

            // choose between showing the structure or the image
            let showSelect = new Select("show");

            showSelect.addOption("image",
                function() {
                    Make.showingInputImage = true;
                    Make.draw = function() {
                        Make.drawImage();
                    };
                    Make.updateOutputImage();
                });

            showSelect.addOption("structure",
                function() {
                    console.log("structure");
                    Make.showingInputImage = false;
                    Make.clearControlImage();
                    Make.draw = function() {
                        Make.map.drawStructure();
                    };
                    Make.updateOutputImage();
                });
        }
        return true;
    } else {
        return false;
    }
};


if (Layout.interactive("setup.html", "triangles.html")) {

    let setKButton = Layout.createNumberButton("n");
    setKButton.setRange(2, 10000);
    setKButton.setValue(5);
    setKButton.onChange = function() {
        Make.updateNewMap();
    };

    Layout.setFontSizes(); // after all button things are created
    DOM.style("#outputCanvas", "cursor", "crosshair");

    Make.setInitialOutputImageSpace(-10, 10, -10);
    Make.resetOutputImageSpace();

    circleScope.maxIterations = 200;
    multiCircles.setMapping();
    multiCircles.setupMouseForTrajectory();

    Make.initializeMap = function() {
        //  multiCircles.finishMap = multiCircles.limitMap;
        multiCircles.setInversionCircle(7, 2.5, 0);
        const circle = multiCircles.addCircleOutsideIn(6, -3.5, 0);
    };

    const lineWidthToUnit = 0.015;
    basicUI.nullRadius = 10;

    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        let lineWidth = lineWidthToUnit / Make.outputImage.scale;
        Draw.setLineWidth(lineWidth);
        Draw.setColor("grey");
        //  equator.draw();
        Draw.setColor("#bbbbff");
        multiCircles.draw();

    };

    Make.initializeMap();

    Make.readImageWithFilePathAtSetup("guard.jpg");

}