/* jshint esversion:6 */

// create the UI elements and their interactions

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
    setKButton.setRange(2, 10000);
    setKButton.setValue(5);
    setKButton.onChange = Make.updateNewMap;

    let setMButton = NumberButton.createInfinity("m");
    setMButton.setFloat(0.01);
    setMButton.setRange(2, 10000);
    setMButton.setValue(2);
    setMButton.onChange = Make.updateNewMap;

    let setNButton = NumberButton.createInfinity("n");
    setNButton.setFloat(0.01);
    setNButton.setRange(2, 10000);
    setNButton.setValue(3);
    setNButton.onChange = Make.updateNewMap;

    // the different tilings

    // upon changing the tiling we have to recalculate it, without resetting the third map to input pixels
    function changeTiling(newTiling) {
        if (newTiling != tiling) {
            tiling = newTiling;
            Make.updateNewMap();
        }
    }

    let tilingSelect = new Select("tiling");

    tilingSelect.addOption("regular",
        function() {
            setNButton.setRange(2, 10000);
            changeTiling("regular");
        });

    tilingSelect.addOption("uniform truncated",
        function() {
            setNButton.setRange(3, 10000);
            changeTiling("uniformTruncated");
        });

    tilingSelect.addOption("rectified",
        function() {
            setNButton.setRange(3, 10000);
            changeTiling("rectified");
        });

    // the projections (depending on space geometry)

    // for elliptic geometry

    let ellipticProjectionSelect = new Select("selectEllipticProjection");
    ellipticProjectionSelect.addOption("orthographic", projection.ellipticNormal);
    ellipticProjectionSelect.addOption("stereographic", projection.ellipticStereographic);
    ellipticProjectionSelect.addOption("gonomic", projection.ellipticGonomic);
    ellipticProjectionSelect.addOption("quincuncial tiled", projection.ellipticQuincuncial);
    ellipticProjectionSelect.addOption("quincuncial single", projection.ellipticQuincuncialSingle);
    ellipticProjectionSelect.addOption("Mercator", projection.ellipticMercator);
    ellipticProjectionSelect.addOption("gonomic cylindric", projection.ellipticGonomicCylinder);

    // for euklidic geometry
    let euclidicProjectionSelect = new Select("selectEuclidicProjection");
    euclidicProjectionSelect.addOption("direct", projection.euclidicNormal);
    euclidicProjectionSelect.addOption("single spiral", projection.euclidicSingleSpiral);
    euclidicProjectionSelect.addOption("double spiral", projection.euclidicDoubleSpiral);
    euclidicProjectionSelect.addOption("disc", projection.euclidicDisc);


    // for hyperbolic geometry
    let hyperbolicProjectionSelect = new Select("selectHyperbolicProjection");
    hyperbolicProjectionSelect.addOption("Poincaré disc", projection.hyperbolicPoincareDisc);
    hyperbolicProjectionSelect.addOption("Beltrami-Klein disc", projection.hyperbolicKleinDisc);
    hyperbolicProjectionSelect.addOption("Poincaré plane", projection.hyperbolicPoincarePlane);
    hyperbolicProjectionSelect.addOption("Bulatov band", projection.hyperbolicBulatovBand);
    hyperbolicProjectionSelect.addOption("Gans model", projection.hyperbolicGans);
    hyperbolicProjectionSelect.addOption("Mercator", projection.hyperbolicMercator);

}



window.onload = function() {
    "use strict";
    creation();
    basicUI.onload();
};

window.onresize = function() {
    "use strict";
    basicUI.onresize();
};
