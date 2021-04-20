/* jshint esversion:6 */

// create the UI elements and their interactions
var parameters = {};
parameters.initialN=3;

function creation() {
    "use strict";

    //=====================================================================================================================================
    // UI elements depending on actual image and its symmetries
    //==============================================================================================================

    // navigation
    // the help page depends on the things we are generating
    Button.createGoToLocation("help", "sphericalKaleidoscopeHelp.html");
    // where is the home ??
    Button.createGoToLocation("home", "home.html");

    // setting initial range of space coordinates for output image (1st linear transform)
    Make.setInitialOutputImageSpace(-1, 1, -1);

    // initializing map parameters, choosing the map in the method     Make.initializeMap
    // this is called before calculating the second map in geometrical space, this map  defines the geometry

    // set the mapping  functions via:
    //         Make.setMapping(mapInputImageMethod, mapStructureMethod);
    // where
    //  mapInputImageMethod(position) maps the Vector2 object position, 
    //  returns the lyapunov coefficient>0 if mapping successful, returns value<0 if mapping not successful
    // mapStructureMethod is similar, except that returned position.x is number of reflections
    //  (Note that position.x=0 gets special color (no mapping...), colors defined in vectorMap.js

    // setting a disc radius for the output image:
    // Make.map.discRadius=???,  value >0 for output image clipped to circle, <0 for no clipping
    //==========================================================================================================================

    // if we need some special drawing over the image, modify:
    //   Make.updateOutputImage = Make.updateMapOutput; //default, if needed add some lines ...
    // where Make.updateMapOutput is the method to draw the image according to the map

    // choosing the tiling
    var tiling = "regular";
    // show the sum of angles
    let sum = document.getElementById("sum");

    // check if the image will be elliptic
    function isElliptic() {
        return (1 / setKButton.getValue() + 1 / setMButton.getValue() + 1 / setNButton.getValue() > 1.0001);
    }


    Make.initializeMap = function() {
        let k = setKButton.getValue();
        let m = setMButton.getValue();
        let n = setNButton.getValue();
        sum.innerHTML = "" + Math.round(180 * (1 / k + 1 / m + 1 / n)) + "<sup>o</sup>";
        switch (tiling) {
            case "regular":
                threeMirrorsKaleidoscope.setKMN(k, m, n);
                break;
            case "uniformTruncated":
                cutCornersKaleidoscope.setKMN(k, m, n);
                break;
            case "rectified":
                cutSidesKaleidoscope.setKMN(k, m, n);
                break;
            default:
                console.log("nosuch tiling: " + tiling);
        }

        // the choosers for projection
        DOM.style("#ellipticDiv,#euclidicDiv,#hyperbolicDiv", "display", "none");
        switch (basicKaleidoscope.geometry) {
            case basicKaleidoscope.elliptic:
                sum.innerHTML += ", elliptic geometry";
                DOM.style("#ellipticDiv", "display", "initial");
                break;
            case basicKaleidoscope.euclidic:
                sum.innerHTML += ", Euklidic geometry";
                DOM.style("#euclidicDiv", "display", "initial");
                break;
            case basicKaleidoscope.hyperbolic:
                sum.innerHTML += ", hyperbolic geometry";
                DOM.style("#hyperbolicDiv", "display", "initial");
                break;
        }
    };

    //choosing the symmetries, and set initial values
    let setKButton = NumberButton.create("k");
    parameters.setKButton = setKButton;
    setKButton.setRange(2, 10000);
    setKButton.setValue(5);
    setKButton.onChange = Make.updateNewMap;

    let setMButton = NumberButton.createInfinity("m");
    parameters.setMButton = setMButton;
    setMButton.setRange(2, 10000);
    setMButton.setValue(2);
    setMButton.onChange = Make.updateNewMap;

    let setNButton = NumberButton.createInfinity("n");
    parameters.setNButton = setNButton;
    setNButton.setRange(2, 10000);
    setNButton.setValue(parameters.initialN);
    setNButton.onChange = Make.updateNewMap;

    // the different tilings

    parameters.tiling = 'regular';
    // upon changing the tiling we have to recalculate it, without resetting the third map to input pixels
    function changeTiling(newTiling) {
        if (newTiling != tiling) {
            tiling = newTiling;
            parameters.tiling = tiling;
            Make.updateNewMap();
        }
    }

    let tilingSelect = new Select("tiling");

    tilingSelect.addOption("regular",
        function() {
            setNButton.setRange(2, 10000);
            setKButton.setRange(2, 10000);
            changeTiling("regular");
        });

    tilingSelect.addOption("uniform truncated",
        function() {
            setNButton.setRange(3, 10000);
            setKButton.setRange(2, 10000);
            changeTiling("uniformTruncated");
        });

    tilingSelect.addOption("rectified",
        function() {
            setNButton.setRange(3, 10000);
             setKButton.setRange(3, 10000);
           changeTiling("rectified");
        });

    // the projections (depending on space geometry)

    // for elliptic geometry

    let ellipticProjectionSelect = new Select("selectEllipticProjection");
    parameters.ellipticProjectionSelect = ellipticProjectionSelect;
    ellipticProjectionSelect.addOption("orthographic", projection.ellipticNormal);
    ellipticProjectionSelect.addOption("stereographic", projection.ellipticStereographic);
    ellipticProjectionSelect.addOption("gonomic", projection.ellipticGonomic);
    ellipticProjectionSelect.addOption("quincuncial tiled", projection.ellipticQuincuncial);
    ellipticProjectionSelect.addOption("quincuncial single", projection.ellipticQuincuncialSingle);
    ellipticProjectionSelect.addOption("Mercator", projection.ellipticMercator);
    ellipticProjectionSelect.addOption("gonomic cylindric", projection.ellipticGonomicCylinder);
    ellipticProjectionSelect.addOption("ortho/stereographic", projection.ellipticNormalStereo);
    ellipticProjectionSelect.addOption("stereographic with equator", projection.ellipticStereographicEquator);

    // for euklidic geometry
    let euclidicProjectionSelect = new Select("selectEuclidicProjection");
    parameters.euclidicProjectionSelect = euclidicProjectionSelect;
    euclidicProjectionSelect.addOption("direct", projection.euclidicNormal);
    euclidicProjectionSelect.addOption("inverted", projection.euclidicInverted);
    euclidicProjectionSelect.addOption("single spiral", projection.euclidicSingleSpiral);
    euclidicProjectionSelect.addOption("double spiral", projection.euclidicDoubleSpiral);
    euclidicProjectionSelect.addOption("disc", projection.euclidicDisc);


    // for hyperbolic geometry
    let hyperbolicProjectionSelect = new Select("selectHyperbolicProjection");
    parameters.hyperbolicProjectionSelect = hyperbolicProjectionSelect;
    hyperbolicProjectionSelect.addOption("Poincaré disc", projection.hyperbolicPoincareDisc);
    hyperbolicProjectionSelect.addOption("Beltrami-Klein disc", projection.hyperbolicKleinDisc);
    hyperbolicProjectionSelect.addOption("Poincaré plane", projection.hyperbolicPoincarePlane);
    hyperbolicProjectionSelect.addOption("Bulatov band", projection.hyperbolicBulatovBand);
    hyperbolicProjectionSelect.addOption("Gans model", projection.hyperbolicGans);
    hyperbolicProjectionSelect.addOption("Mercator", projection.hyperbolicMercator);
}

/**
 * get the range of the nonlinear mapping, compare with calculated 
 * (if the mapping or its parameters change, not after scale or shift in 1st map)
 * @method Make.getMapOutputRange
 */
Make.getMapOutputRange = function() {
    Make.map.getOutputRange(Make.lowerLeft, Make.upperRight);
    if (basicKaleidoscope.geometry === basicKaleidoscope.hyperbolic) {
        console.log('hyperbolic');
        console.log('sampled range min', Make.lowerLeft.x, Make.lowerLeft.y);
        console.log('sampled range max', Make.upperRight.x, Make.upperRight.y);
        console.log('calc max', basicKaleidoscope.xMax, basicKaleidoscope.yMax);
    } else if (basicKaleidoscope.geometry === basicKaleidoscope.elliptic) {
        console.log('elliptic');
        console.log('sampled range min', Make.lowerLeft.x, Make.lowerLeft.y);
        console.log('sampled range max', Make.upperRight.x, Make.upperRight.y);
        console.log('calc max', basicKaleidoscope.xMax, basicKaleidoscope.yMax);
    } else if (basicKaleidoscope.geometry === basicKaleidoscope.euclidic) {
        console.log('euklidic');
    }
};

// saving the map data
if (DOM.idExists("saveMapData")) {
    Make.saveMapButton = new Button('saveMapData');
    Make.saveMapButton.onClick = function() {
        const precision = Make.saveMapPrecision.getValue();
        const height = Make.map.height;
        const width = Make.map.width;
        const lowerLeft = {};
        const upperRight = {};
        Make.map.getOutputRange(lowerLeft, upperRight);
        if (basicKaleidoscope.geometry === basicKaleidoscope.hyperbolic) {
            console.log('hyperbolic');
            console.log('sampled range', lowerLeft, upperRight);
        }
        const shiftX = -lowerLeft.x;
        const shiftY = -lowerLeft.y;
        const factor = Math.pow(10, precision) / (Math.max(upperRight.x - lowerLeft.x, upperRight.y - lowerLeft.y));
        const xArray = Make.map.xArray;
        const yArray = Make.map.yArray;
        const lyapunovArray = Make.map.lyapunovArray;
        let mapData = '%%MatrixMarket matrix array complex general\r\n';
        mapData += '\r\n';
        mapData += '% generated by sphericalKaleidoscopeApp.html\r\n';
        mapData += '% symmetry center: ' + parameters.setKButton.getValue() + '\r\n';
        mapData += '% symmetry left: ' + parameters.setMButton.getValue() + '\r\n';
        mapData += '% symmetry right: ' + parameters.setNButton.getValue() + '\r\n';
        switch (basicKaleidoscope.geometry) {
            case basicKaleidoscope.elliptic:
                mapData += "% elliptic geometry\r\n";
                mapData += '% view: ' + projection.ellipticView + '\r\n';
                break;
            case basicKaleidoscope.euclidic:
                mapData += "% Euklidic geometry\r\n";
                mapData += '% view: ' + projection.euclidicView + '\r\n';
                break;
            case basicKaleidoscope.hyperbolic:
                mapData += "% hyperbolic geometry\r\n";
                mapData += '% view: ' + projection.hyperbolicView + '\r\n';
                break;
        }
        mapData += '% tiling: ' + parameters.tiling + '\r\n';
        mapData += '% map width: ' + width + '\r\n';
        mapData += '% map height: ' + height + '\r\n';
        mapData += '% an array of the results of the kaleidoscope mapping\r\n';
        mapData += '% for each pixel a pair of (x,y) coordinates\r\n';
        mapData += '% the x-coordinate is the real part, the y-coordinate the imaginary part\r\n';
        mapData += '% coordinate values are between 0 and 1\r\n';
        mapData += '% to save space "0." is not written\r\n';
        mapData += '% precision: ' + precision + ' digits\r\n';
        mapData += '% thus 0.123456 appears as ' + Math.round(Math.pow(10, precision) * 0.123456) + '\r\n';
        mapData += '% so divide numbers by ' + Math.pow(10, precision) + '\r\n';
        mapData += '% pixels with a x-coordinate of -1 have no valid map result and should be transparent\r\n';
        mapData += '\r\n';
        mapData += height + ' ' + width + '\r\n';
        mapData += '\r\n';
        for (var i = 0; i < width; i++) {
            for (var j = 0; j < height; j++) {
                const index = i + j * width;
                if (lyapunovArray[index] < 0) {
                    mapData += '-1 0\r\n';
                } else mapData += Math.round(factor * (xArray[index] + shiftX)) + ' ' + Math.round(factor * (yArray[index] + shiftY)) + '\r\n';
            }
        }
        const blob = new Blob([mapData], {
            type: 'text/plain'
        });
        const filename = 'mapData.txt';
        const objURL = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        document.body.appendChild(a);
        a.href = objURL;
        a.download = filename;
        a.click();
        a.remove();
        URL.revokeObjectURL(objURL);
    };
    Make.saveMapPrecision = new NumberButton('precision');
    Make.saveMapPrecision.setRange(2, 6);
    Make.saveMapPrecision.setValue(4);
}

window.onload = function() {
    "use strict";
    basicUI.squareImage = true;
    creation();
    basicUI.onload();
};

window.onresize = function() {
    "use strict";
    basicUI.onresize();
};