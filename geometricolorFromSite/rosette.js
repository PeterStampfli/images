/* jshint esversion:6 */

if (window.innerHeight > window.innerWidth) {
    document.querySelector("body").innerHTML = "<div id='warn'><h1>Please change to <strong>landscape orientation</strong> and RELOAD the page</h1></div>";
    console.log("high");

    DOM.style("#warn", "zIndex", "20", "position", "fixed", "top", "0px", "left", "0px", "backgroundColor", "yellow");
} else {

    Layout.setup("setup.html", "triangles.html");




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


    Layout.activateFontSizeChanges();

    Make.createOutputImage("outputCanvas");
    Make.outputImage.setDivDimensions(window.innerHeight, window.innerHeight);
    Make.outputImage.setDivPosition(0, 0);
    Make.outputImage.stopZoom();
    Make.outputImage.stopShift();
    DOM.style("#outputCanvas", "cursor", "crosshair");
    Draw.setOutputImage(Make.outputImage);

    Make.createControlImage("controlCanvas", false);
    Make.controlImage.setDimensions(200, 200);
    Make.controlImage.setPosition(0, 0);
    Make.createArrowController("arrowController", false);
    Make.arrowController.setSize(100);
    Make.arrowController.setPosition(0, 0);
    Make.createMap();

    Make.setOutputSize(window.innerHeight);



    text = new BigDiv("text");
    text.setDimensions(window.innerWidth - window.innerHeight, window.innerHeight);
    text.setPosition(window.innerHeight, 0);


    Make.setInitialOutputImageSpace(-1, 1, -1);
    Make.resetOutputImageSpace();

    dihedral = new Dihedral();

    basicKaleidoscope.geometry = basicKaleidoscope.euclidic;
    Make.setMapping(dihedral.mapping);

    let setKButton = Layout.createNumberButton("n");
    setKButton.setRange(2, 10000);

    setKButton.setValue(5);
    setKButton.onChange = function() {
        Make.updateNewMap();
    };

    Layout.setFontSizes();



    Make.initializeMap = function() {
        dihedral.setOrder(setKButton.getValue());
    };
    Make.initializeMap();

    const lineWidthToUnit = 0.02;


    Make.updateOutputImage = function() {
        Make.updateMapOutput();
        Draw.setLineWidth(lineWidthToUnit);
        Draw.setColor(Layout.addMirrorColor);
        dihedral.drawAddMirrors();
        Draw.setColor(Layout.mirrorColor);
        dihedral.drawMirrors();
    };

    let mousePosition = new Vector2();
    let imagePosition = new Vector2();
    let zero = new Vector2(0, 0);

    Make.outputImage.mouseEvents.downAction = function(mouseEvents) {
        Make.outputImage.mouseEvents.dragAction(mouseEvents);
    };

    Make.outputImage.move = function(mouseEvents) {
        let nullRadius = Make.outputImage.scale * Layout.nullRadius;
        Make.updateOutputImage();
        mousePosition.setComponents(mouseEvents.x, mouseEvents.y);
        Make.outputImage.pixelToSpaceCoordinates(mousePosition);
        Draw.setColor(Layout.pointColor);
        Draw.setLineWidth(lineWidthToUnit);
        Draw.circle(nullRadius, mousePosition);
        imagePosition.set(mousePosition);
        Draw.setColor(Layout.trajectoryColor);
        dihedral.drawMap(imagePosition);
        Draw.setColor(Layout.pointColor);
        Draw.circle(nullRadius, imagePosition);

    };

    Make.outputImage.mouseEvents.outAction = function(mouseEvents) {
        Make.updateOutputImage();
    };

    Layout.createOpenImage();


    Make.readImageWithFilePathAtSetup("guard.jpg");

}
