/* jshint esversion:6 */



if (window.innerHeight > window.innerWidth) {
    document.querySelector("body").innerHTML = "<div id='warn'><h1>Please change to <strong>landscape orientation</strong> and RELOAD the page</h1></div>";
    console.log("high");

    DOM.style("#warn", "zIndex", "20", "position", "fixed", "top", "0px", "left", "0px", "backgroundColor", "yellow");
} else {

    Layout.setup("circleInversion.html", "kaleidoscopeLens.html");


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
    Make.outputImage.stopShift();

    DOM.style("#outputCanvas", "cursor", "crosshair");
    DOM.style("#outputCanvas", "backgroundColor", "#bbbbbb");

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

    let setKButton = Layout.createNumberButton("k");
    setKButton.setRange(2, 10000);
    setKButton.setValue(7);
    setKButton.onChange = function(v) {
        Make.updateNewMap();
    };

    let setMButton = Layout.createNumberButton("m");
    setMButton.setRange(2, 10000);
    setMButton.setValue(3);
    setMButton.onChange = function(v) {
        Make.updateNewMap();
    };

    let setNButton = Layout.createNumberButton("n");
    setNButton.setRange(2, 10000);
    setNButton.setValue(2);
    setNButton.onChange = function(v) {
        Make.updateNewMap();
    };

    let sum = document.getElementById("sum");

    Layout.setFontSizes();

    // initializing things before calculating the map (uopdateKMN)
    Make.initializeMap = function() {
        let k = setKButton.getValue();
        let m = setMButton.getValue();
        let n = setNButton.getValue();
        threeMirrorsKaleidoscope.setKMN(k, m, n);
        let angleSum = basicKaleidoscope.angleSum;
        angleSum = Math.round(180 * angleSum);
        sum.innerHTML = "" + angleSum;
    };

    Make.initializeMap();
    // drawing the image with decos (updatekmn...)
    
            const lineWidthToUnit=0.03;

    Make.updateOutputImage = function() {
        Make.updateMapOutput();
    Draw.setLineWidth(0.5*lineWidthToUnit);
        Draw.setColor(Layout.addMirrorColor);
        basicKaleidoscope.drawPolygon();
        // basicKaleidoscope.dihedral.drawAddMirrors();
    Draw.setLineWidth(lineWidthToUnit);
        Draw.setColor(Layout.mirrorColor);
        basicKaleidoscope.drawTriangle();
    };

    let zoomCenter = new Vector2();
    let mousePosition = new Vector2();
    let zero = new Vector2(0, 0);

    Make.outputImage.mouseEvents.downAction = function(mouseEvents) {
        Make.outputImage.mouseEvents.dragAction(mouseEvents);
    };

    Make.outputImage.move = function(mouseEvents) {
        let nullRadius = Make.outputImage.scale * Layout.nullRadius;
        Make.updateOutputImage();
        mousePosition.setComponents(mouseEvents.x, mouseEvents.y);
        Make.outputImage.pixelToSpaceCoordinates(mousePosition);
    Draw.setLineWidth(0.7*lineWidthToUnit);
        Draw.setColor(Layout.trajectoryColor);
        threeMirrorsKaleidoscope.drawTrajectory(mousePosition, nullRadius, Layout.pointColor);
        if (basicKaleidoscope.geometry == basicKaleidoscope.hyperbolic) {
            let circle = basicKaleidoscope.circles[basicKaleidoscope.dihedral.getSectorIndex(mousePosition)];
            if (circle.contains(mousePosition)) {
                Draw.setColor("white");
                Draw.line(zero, mousePosition);
                circle.draw();
            }
        }
    };

    Make.outputImage.mouseEvents.outAction = function(mouseEvents) {
        Make.updateOutputImage();
    };

    // zoom at border of hyperbolic

    Make.outputImage.mouseEvents.wheelAction = function(mouseEvents) {
        zoomCenter.setComponents(basicKaleidoscope.worldRadiusHyperbolic, 0);
        Make.outputImage.spaceToPixelCoordinates(zoomCenter);
        if (mouseEvents.wheelDelta > 0) {
            Make.outputImage.zoom(Make.outputImage.zoomFactor, zoomCenter.x, zoomCenter.y);
        } else {
            Make.outputImage.zoom(1 / Make.outputImage.zoomFactor, zoomCenter.x, zoomCenter.y);
        }
        Make.shiftScaleOutputImage();
    };

    Make.outputImage.touchEvents.moveAction = function(touchEvents) {
        if (touchEvents.touches.length === 1) {
            Make.outputImage.move(touchEvents);
        } else if (touchEvents.touches.length === 2) {
            zoomCenter.setComponents(basicKaleidoscope.worldRadiusHyperbolic, 0);
            Make.outputImage.spaceToPixelCoordinates(zoomCenter);
            Make.outputImage.zoom(touchEvents.lastDistance / touchEvents.distance, zoomCenter.x, zoomCenter.y);
            Make.outputImage.shift(touchEvents.dx, touchEvents.dy);
            Make.outputImage.adjustCanvasTransform();
            Make.outputImage.action();
        }
    };

    // use another image ???
    Layout.createOpenImage();

    Make.readImageWithFilePathAtSetup("Drottningholm.jpg");
}
