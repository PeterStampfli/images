/** 
 * transforms for creating different projections
 * @namespace projection
 */

/* jshint esversion:6 */

projection = {};

(function() {
    "use strict";

    // depending on the projection we have a mapping and a cutoff disc radius
    // they have to be selected for each of elliptic, euclidic or hyperbolic case

    // these are used depending on the geometry

    // the projection maps
    //   function(p), transforms p, returns -1 for invalid points, +1 for valid points

    /**
     * identity "map", default, for stereographic (elliptic and hyperbolic) and straight (Euclidic)
     * @method projection.identityMap 
     * @param {Vector2} position - the vector to map 
     * @return  +1, all points are valid (-1 for invalid points)
     */
    projection.identityMap = function(p) {
        return 1;
    };

    // set the projection depending on the geometry. In basicKaleidoscope.setKMN

    /**
     * setup for elliptic geometry
     * @method projection.elliptic
     */
    projection.elliptic = function() {
        projection.map = projection.ellipticMap;
        Make.map.discRadius = projection.ellipticDiscRadius;
    };

    /**
     * setup for euclidic geometry
     * @method projection.euclidic
     */
    projection.euclidic = function() {
        projection.map = projection.euclidicMap;
        Make.map.discRadius = projection.euclidicDiscRadius;
    };

    /**
     * setup for hyperbolic geometry
     * @method projection.hyperbolic
     */
    projection.hyperbolic = function() {
        projection.map = projection.hyperbolicMap;
        Make.map.discRadius = projection.hyperbolicDiscRadius;
    };

    function updateMap() {
        Make.allowResetInputMap = false;
        Make.updateNewMap();
        Make.allowResetInputMap = true;
    }

    // making the projections
    // elliptic
    projection.ellipticStereographic = function() {
        projection.ellipticMap = projection.identityMap;
        projection.ellipticDiscRadius = -1;
        updateMap();
    };

    let iEllipticWorldradius2 = 1 / (basicKaleidoscope.worldRadiusElliptic * basicKaleidoscope.worldRadiusElliptic);
    let ellipticWorldradius2 = basicKaleidoscope.worldRadiusElliptic * basicKaleidoscope.worldRadiusElliptic;

    projection.ellipticNormalMap = function(position) {
        let r2worldRadius2 = (position.x * position.x + position.y * position.y) * iEllipticWorldradius2;
        let rt = (1 - r2worldRadius2);
        if (rt > 0.00001) {
            let mapFactor = 1 / (1 + Math.sqrt(rt));
            position.x *= mapFactor;
            position.y *= mapFactor;
            return 1;
        } else {
            return -1;
        }
    };

    projection.ellipticNormal = function() {
        projection.ellipticDiscRadius = basicKaleidoscope.worldRadiusElliptic;
        projection.ellipticMap = projection.ellipticNormalMap;
        updateMap();
    };

    projection.ellipticGonomic = function() {
        let iEllipticWorldradius2 = 1 / (basicKaleidoscope.worldRadiusElliptic * basicKaleidoscope.worldRadiusElliptic);
        projection.ellipticDiscRadius = -1;
        projection.ellipticMap = function(position) {
            let r2worldRadius2 = Math.hypot(position.x, position.y) * iEllipticWorldradius2;
            let mapFactor = 1 / (1 + Math.sqrt(1 + (position.x * position.x + position.y * position.y) * iEllipticWorldradius2));
            position.x *= mapFactor;
            position.y *= mapFactor;
            return 1;
        };
        updateMap();
    };

    projection.ellipticMercator = function() {
        projection.ellipticDiscRadius = -1;
        projection.ellipticMap = function(position) {
            Fast.cosSin(position.x);
            let r = Fast.exp(-position.y);
            position.x = r * Fast.cosResult;
            position.y = r * Fast.sinResult;
            return 1;
        };
        updateMap();
    };

    projection.ellipticGonomicCylinder = function() {
        projection.ellipticDiscRadius = -1;
        projection.ellipticMap = function(position) {
            Fast.cosSin(position.x);
            let r = ellipticWorldradius2 / (position.y + Math.hypot(position.y, basicKaleidoscope.worldRadiusElliptic));
            position.x = r * Fast.cosResult;
            position.y = r * Fast.sinResult;
            return 1;
        };
        updateMap();
    };

    // euclidic
    // the usual straight view

    projection.euclidicNormal = function() {
        projection.euclidicMap = projection.identityMap;
        projection.euclidicDiscRadius = -1;
        updateMap();
    };

    // spiral view
    let spiralNumber1 = 0;
    let spiralNumber2 = 1;
    let spiralVector1 = new Vector2();
    let spiralVector2 = new Vector2();
    let spiralVector = new Vector2();
    let rt3 = Math.sqrt(3);

    // called at each basicKaleidoscope.setKMN call, every time Make.initializMap is called
    projection.makeSpiralVector = function(k, m, n) {
        console.log("make spiralvector");
        console.log("length scale " + basicKaleidoscope.intersectionMirrorXAxis);
        // setting up the two spiralvectors, reduced units 
        // length scale = basicKaleidoscope.intersectionMirrorXAxis
        switch (k) {
            case 2:
                console.log("k 2");
                switch (m) {
                    case 3:
                        console.log("236");
                        spiralVector1.setComponents(3, rt3);
                        spiralVector2.setComponents(0, 2 * rt3);
                        break;
                    case 4:
                        console.log("244");
                        spiralVector1.setComponents(2, 0);
                        spiralVector2.setComponents(0, 2);
                        break;
                    case 6:
                        console.log("263");
                        spiralVector1.setComponents(1, rt3);
                        spiralVector2.setComponents(2, 0);
                        break;
                }
                break;
            case 3:
                console.log("k 3");
                switch (m) {
                    case 2:
                        console.log("326");
                        spiralVector1.setComponents(0, 2 * rt3);
                        spiralVector2.setComponents(3, rt3);
                        break;
                    case 3:
                        console.log("333");
                        spiralVector1.setComponents(1, 0);
                        spiralVector2.setComponents(0.5, 0.5 * rt3);
                        break;
                    case 6:
                        console.log("362");
                        spiralVector1.setComponents(0, rt3);
                        spiralVector2.setComponents(1.5, 0.5 * rt3);
                        break;
                }
                break;
            case 4:
                console.log("k 4");
                switch (m) {
                    case 2:
                        console.log("424");
                        spiralVector1.setComponents(2, 0);
                        spiralVector2.setComponents(0, 2);
                        break;
                    case 4:
                        console.log("442");
                        spiralVector1.setComponents(1, 1);
                        spiralVector2.setComponents(1, -1);
                        break;
                }
                break;
            case 6:
                console.log("k 6");
                switch (m) {
                    case 2:
                        console.log("623");
                        spiralVector1.setComponents(2, 0);
                        spiralVector2.setComponents(1, rt3);
                        break;
                    case 3:
                        console.log("632");
                        spiralVector1.setComponents(0, rt3);
                        spiralVector2.setComponents(1.5, rt3 * 0.5);
                        break;
                }
                break;
        }
        spiralVector1.log("one");
        spiralVector2.log("two");

        spiralVector1.scale(spiralNumber1);
        spiralVector2.scale(spiralNumber2);
        spiralVector.set(spiralVector1).add(spiralVector2);
        spiralVector.log("total");

    };


    //hyperbolic

    projection.hyperbolicPoincareDisc = function() {
        projection.hyperbolicMap = projection.identityMap;
        projection.hyperbolicDiscRadius = basicKaleidoscope.worldRadiusHyperbolic;
        updateMap();
    };

    let iHyperbolicWorldradius2 = 1 / (basicKaleidoscope.worldRadiusHyperbolic * basicKaleidoscope.worldRadiusHyperbolic);

    // go from klein disc to poincare disc, return 1
    function kleinPoincare(position) {
        let r2worldRadius2 = (position.x * position.x + position.y * position.y) * iHyperbolicWorldradius2;

        let mapFactor = 1 / (1 + Math.sqrt(1.00001 - r2worldRadius2));
        position.x *= mapFactor;
        position.y *= mapFactor;
        return 1;
    }

    projection.hyperbolicKleinDisc = function() {
        projection.hyperbolicMap = kleinPoincare;
        projection.hyperbolicDiscRadius = basicKaleidoscope.worldRadiusHyperbolic;
        updateMap();
    };

    // go from halfplane y>hyperbolic world radius to disc with hyperbolic worldRadius 
    function halfplaneDisc(position) {
        position.y += basicKaleidoscope.worldRadiusHyperbolic;
        if (position.y > 0) {
            let r2 = position.x * position.x + position.y * position.y;
            let base = basicKaleidoscope.worldRadiusHyperbolic / (r2 + 2 * position.y + 1);
            position.y = -2 * position.x * base;
            position.x = (r2 - 1) * base;
            return 1;
        } else {
            return -1;
        }
    }

    projection.hyperbolicPoincarePlane = function() {
        projection.hyperbolicDiscRadius = -1;
        projection.hyperbolicMap = halfplaneDisc;
        updateMap();
    };

    // go from band model (hyperbolicWorldradius>abs(y) to disc with hyperbolic world radius

    let bandScale = Math.PI * 0.5 / basicKaleidoscope.worldRadiusHyperbolic;

    function bandDisc(position) {
        if (Math.abs(position.y) < basicKaleidoscope.worldRadiusHyperbolic) {
            position.scale(bandScale);
            let exp2u = Fast.exp(position.x);
            let expm2u = 1 / exp2u;
            Fast.cosSin(position.y);
            let base = basicKaleidoscope.worldRadiusHyperbolic / (exp2u + expm2u + 2 * Fast.cosResult);
            position.x = (exp2u - expm2u) * base;
            position.y = 2 * Fast.sinResult * base;
            return 1;
        } else {
            return -1;
        }
    }

    projection.hyperbolicBulatovBand = function() {
        projection.hyperbolicDiscRadius = -1;
        projection.hyperbolicMap = bandDisc;
        updateMap();
    };



    // for switching betwwen geometries (remembering the projection)

    projection.ellipticMap = projection.ellipticNormal;
    projection.euclidicMap = projection.identityMap;
    projection.hyperbolicMap = projection.identityMap;

    // the cutoff radius for map making
    //           Make.map.discRadius = -1; if there is no cutoff    (default)
    //  Make.map.discRadius=value of the projection disc

    projection.ellipticDiscRadius = basicKaleidoscope.ellipticDiscRadius;
    projection.euclidicDiscRadius = -1;
    projection.hyperbolicDiscRadius = basicKaleidoscope.worldRadiusHyperbolic;


}());
