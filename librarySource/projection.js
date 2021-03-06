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
        projection.worldradius = basicKaleidoscope.worldRadiusElliptic;
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
        projection.worldradius = basicKaleidoscope.worldRadiusHyperbolic;
        projection.map = projection.hyperbolicMap;
        Make.map.discRadius = projection.hyperbolicDiscRadius;
        // Make.map.discRadius = -1;
    };

    // making the projections
    // elliptic
    projection.ellipticStereographic = function() {
        projection.ellipticView = 'stereographic';
        projection.ellipticMap = projection.identityMap;
        projection.ellipticDiscRadius = -1;
        Make.updateNewMap();
    };

    const v = new Vector2();
    let ellipticWorldradius2 = basicKaleidoscope.worldRadiusElliptic * basicKaleidoscope.worldRadiusElliptic;
    let iEllipticWorldradius2 = 1 / ellipticWorldradius2;

    projection.ellipticView = 'orthographic';
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
        projection.ellipticView = 'orthographic';
        projection.ellipticDiscRadius = basicKaleidoscope.worldRadiusElliptic;
        projection.ellipticMap = projection.ellipticNormalMap;
        Make.updateNewMap();
    };

    const border = 0.03;
    projection.ellipticNormalStereoMap = function(position) {
        let r2worldRadius2 = (position.x * position.x + position.y * position.y) * iEllipticWorldradius2;
        let rt = (1 - r2worldRadius2);
        if (rt > border) {
            let mapFactor = 1 / (1 + Math.sqrt(rt));
            position.x *= mapFactor;
            position.y *= mapFactor;
            return 1;
        } else if (rt < -border) {
            position.scale(1 / r2worldRadius2);
            return 1;
        }
        return -1;
    };

    projection.ellipticNormalStereo = function() {
        projection.ellipticView = 'ortho/stereographic';
        projection.ellipticDiscRadius = -1;
        projection.ellipticMap = projection.ellipticNormalStereoMap;
        Make.updateNewMap();
    };

    projection.ellipticStereographicEquatorMap = function(position) {
        let r2worldRadius2 = (position.x * position.x + position.y * position.y) * iEllipticWorldradius2;
        let rt = (1 - r2worldRadius2);
        if (rt > border) {
            position.scale(1 / r2worldRadius2);
            return 1;
        } else if (rt < -border) {
            position.scale(1 / r2worldRadius2);
            return 1;
        }
        return -1;
    };

    projection.ellipticStereographicEquator = function() {
        projection.ellipticView = 'stereographic with equator';
        projection.ellipticDiscRadius = -1;
        projection.ellipticMap = projection.ellipticStereographicEquatorMap;
        Make.updateNewMap();
    };

    projection.ellipticGonomic = function() {
        projection.ellipticView = 'gonomic';
        projection.ellipticDiscRadius = -1;
        projection.ellipticMap = function(position) {
            let r2worldRadius2 = Math.hypot(position.x, position.y) * iEllipticWorldradius2;
            let mapFactor = 1 / (1 + Math.sqrt(1 + (position.x * position.x + position.y * position.y) * iEllipticWorldradius2));
            position.x *= mapFactor;
            position.y *= mapFactor;
            return 1;
        };
        Make.updateNewMap();
    };

    projection.ellipticMercator = function() {
        projection.ellipticView = 'Mercator';
        projection.ellipticDiscRadius = -1;
        projection.ellipticMap = function(position) {
            Fast.cosSin(position.x, v);
            let r = Fast.exp(-position.y);
            position.x = r * v.x;
            position.y = r * v.y;
            return 1;
        };
        Make.updateNewMap();
    };

    projection.ellipticGonomicCylinder = function() {
        projection.ellipticView = 'gonomic cylinder';
        projection.ellipticDiscRadius = -1;
        projection.ellipticMap = function(position) {
            Fast.cosSin(position.x, v);
            let r = ellipticWorldradius2 / (position.y + Math.hypot(position.y, basicKaleidoscope.worldRadiusElliptic));
            position.x = r * v.x;
            position.y = r * v.y;
            return 1;
        };
        Make.updateNewMap();
    };

    // euclidic
    // the usual straight view
    projection.euclidicView = 'direct';
    projection.euclidicNormal = function() {
        projection.euclidicView = 'direct';
        projection.euclidicMap = projection.identityMap;
        projection.euclidicDiscRadius = -1;
        Make.updateNewMap();
    };
    projection.euclidicInverted = function() {
        projection.euclidicView = 'inverted';
        projection.euclidicMap = function(position) {
            position.scale(ellipticWorldradius2 / position.length2());
            return 1;
        };
        projection.euclidicDiscRadius = -1;
        Make.updateNewMap();
    };

    // spiral view
    let spiralNumber1 = 2;
    let spiralNumber2 = 6;
    let spiralVector1 = new Vector2();
    let spiralVector2 = new Vector2();
    let spiralVector = new Vector2();
    let rt3 = Math.sqrt(3);

    // called at each basicKaleidoscope.setKMN call, every time Make.initializMap is called
    projection.makeSpiralVector = function(k, m, n) {
        // setting up the two spiralvectors, reduced units 
        // length scale = basicKaleidoscope.intersectionMirrorXAxis
        switch (k) {
            case 2:
                switch (m) {
                    case 3:
                        spiralVector1.setComponents(3, rt3);
                        spiralVector2.setComponents(0, 2 * rt3);
                        break;
                    case 4:
                        spiralVector1.setComponents(2, 0);
                        spiralVector2.setComponents(0, 2);
                        break;
                    case 6:
                        spiralVector1.setComponents(1, rt3);
                        spiralVector2.setComponents(2, 0);
                        break;
                }
                break;
            case 3:
                switch (m) {
                    case 2:
                        spiralVector1.setComponents(0, 2 * rt3);
                        spiralVector2.setComponents(3, rt3);
                        break;
                    case 3:
                        spiralVector1.setComponents(1.5, 0.5 * rt3);
                        spiralVector2.setComponents(0, rt3);
                        break;
                    case 6:
                        spiralVector1.setComponents(0, rt3);
                        spiralVector2.setComponents(1.5, 0.5 * rt3);
                        break;
                }
                break;
            case 4:
                switch (m) {
                    case 2:
                        spiralVector1.setComponents(2, 0);
                        spiralVector2.setComponents(0, 2);
                        break;
                    case 4:
                        spiralVector1.setComponents(1, 1);
                        spiralVector2.setComponents(1, -1);
                        break;
                }
                break;
            case 6:
                switch (m) {
                    case 2:
                        spiralVector1.setComponents(2, 0);
                        spiralVector2.setComponents(1, rt3);
                        break;
                    case 3:
                        spiralVector1.setComponents(0, rt3);
                        spiralVector2.setComponents(1.5, rt3 * 0.5);
                        break;
                }
                break;
        }
        spiralVector1.scale(spiralNumber1);
        spiralVector2.scale(spiralNumber2);
        spiralVector.set(spiralVector1).add(spiralVector2);
        // make a "periodic vector" defining a path with period 2 pi
        spiralVector.scale(basicKaleidoscope.intersectionMirrorXAxis * 0.5 / Math.PI);
    };

    // the map 
    function basicEuclidicSpiral(position) {
        // use the complex log to map the plane into a strip
        // y goes from -pi to +pi, 
        let x = 0.5 * Fast.log(position.x * position.x + position.y * position.y);
        let y = Fast.atan2(position.y, position.x);
        // going from (x,y) to (x,y+2*pi) we have to get the same image
        // so y has to go along a periodic vector with period 2*pi
        // scale and rotate 
        position.x = y * spiralVector.x + x * spiralVector.y;
        position.y = y * spiralVector.y - x * spiralVector.x;
        return 1;
    }

    projection.euclidicSpiralTest = function() {
        spiralNumber1 = 0;
        spiralNumber2 = 1;
        projection.euclidicDiscRadius = -1;
        projection.euclidicMap = basicEuclidicSpiral;
        Make.updateNewMap();
    };

    projection.euclidicSingleSpiral = function() {
        projection.euclidicView = 'single spiral';
        spiralNumber1 = 6;
        spiralNumber2 = 1;
        projection.euclidicDiscRadius = -1;
        projection.euclidicMap = basicEuclidicSpiral;
        Make.updateNewMap();
    };

    projection.euclidicDoubleSpiral = function() {
        projection.euclidicView = 'double spiral';
        spiralNumber1 = 6;
        spiralNumber2 = 1;
        projection.euclidicDiscRadius = -1;
        projection.euclidicMap = function(p) {
            p.scale(1.3);
            cayley(p);
            basicEuclidicSpiral(p);
            return 1;
        };
        Make.updateNewMap();
    };

    projection.euclidicDisc = function() {
        projection.euclidicView = 'disc';
        projection.euclidicDiscRadius = basicKaleidoscope.worldRadiusElliptic;
        const ir = 1 / basicKaleidoscope.worldRadiusElliptic;
        const base = 1;
        projection.euclidicMap = function(position) {
            const scale = base / (1 - Math.hypot(position.x, position.y) * ir);
            position.scale(scale);
            return 1;
        };
        Make.updateNewMap();
    };

    //hyperbolic
    projection.hyperbolicView = 'Poincaré disc';
    projection.hyperbolicPoincareDisc = function() {
        projection.hyperbolicView = 'Poincaré disc';
        projection.hyperbolicMap = projection.identityMap;
        projection.hyperbolicDiscRadius = basicKaleidoscope.worldRadiusHyperbolic;
        Make.updateNewMap();
    };

    let hyperbolicWorldradius2 = basicKaleidoscope.worldRadiusHyperbolic * basicKaleidoscope.worldRadiusHyperbolic;
    let iHyperbolicWorldradius2 = 1 / hyperbolicWorldradius2;

    // go from klein disc to poincare disc, return 1
    function kleinPoincare(position) {
        let r2worldRadius2 = (position.x * position.x + position.y * position.y) * iHyperbolicWorldradius2;
        let mapFactor = 1 / (1 + Math.sqrt(1.00001 - r2worldRadius2));
        position.x *= mapFactor;
        position.y *= mapFactor;
        return 1;
    }

    projection.hyperbolicKleinDisc = function() {
        projection.hyperbolicView = 'Beltrami-Klein disc';
        projection.hyperbolicMap = kleinPoincare;
        projection.hyperbolicDiscRadius = basicKaleidoscope.worldRadiusHyperbolic;
        Make.updateNewMap();
    };

    projection.hyperbolicInvertedKleinDisc = function() {
        projection.hyperbolicMap = function(position) {
            const scale = hyperbolicWorldradius2 / position.length2();
            if (scale <= 1) {
                position.scale(scale);
                kleinPoincare(position); // sonst inverted poincare disc
                return 1;
            } else {
                //       kleinPoincare(position);                  // sonst inverted poincare disc

                return 1;
            }
        };
        projection.hyperbolicDiscRadius = -1;
        Make.updateNewMap();
    };

    // cayley transform w=(z-i)/(z+i)
    function cayley(position) {
        let r2 = position.x * position.x + position.y * position.y;
        let base = 1 / (r2 + 2 * position.y + 1.00001);
        position.y = -2 * position.x * base;
        position.x = (r2 - 1) * base;
    }

    // go from halfplane y>hyperbolic world radius to disc with hyperbolic worldRadius 
    // cayley transform
    function halfplaneDisc(position) {
        position.y = basicKaleidoscope.worldRadiusHyperbolic - position.y;
        if (position.y > 0) {
            cayley(position);
            position.x *= basicKaleidoscope.worldRadiusHyperbolic;
            position.y *= basicKaleidoscope.worldRadiusHyperbolic;
            return 1;
        } else {
            return -1;
        }
    }

    projection.hyperbolicPoincarePlane = function() {
        projection.hyperbolicView = 'Poincaré plane';
        projection.hyperbolicDiscRadius = -1;
        projection.hyperbolicMap = halfplaneDisc;
        Make.updateNewMap();
    };

    // go from band model (hyperbolicWorldradius>abs(y) to disc with hyperbolic world radius

    let bandScale = Math.PI * 0.5 / basicKaleidoscope.worldRadiusHyperbolic;

    function bandDisc(position) {
        if (Math.abs(position.y) < basicKaleidoscope.worldRadiusHyperbolic) {
            position.scale(bandScale);
            let exp2u = Fast.exp(position.x);
            let expm2u = 1 / exp2u;
            Fast.cosSin(position.y, v);
            let base = basicKaleidoscope.worldRadiusHyperbolic / (exp2u + expm2u + 2 * v.x);
            position.x = (exp2u - expm2u) * base;
            position.y = 2 * v.y * base;
            return 1;
        } else {
            return -1;
        }
    }

    projection.hyperbolicBulatovBand = function() {
        projection.hyperbolicView = 'Bulatov band';
        projection.hyperbolicDiscRadius = -1;
        projection.hyperbolicMap = bandDisc;
        Make.updateNewMap();
    };

    projection.hyperbolicGans = function() {
        projection.hyperbolicView = 'Gans model';
        projection.hyperbolicDiscRadius = -1;
        projection.hyperbolicMap = function(position) {
            let mapFactor = 1 / (1 + Math.sqrt(1 + (position.x * position.x + position.y * position.y) * iHyperbolicWorldradius2));
            position.x *= mapFactor;
            position.y *= mapFactor;
            return 1;
        };
        Make.updateNewMap();
    };

    projection.hyperbolicMercator = function() {
        projection.hyperbolicView = 'Mercator';
        projection.hyperbolicDiscRadius = -1;
        projection.hyperbolicMap = function(position) {
            position.y = basicKaleidoscope.worldRadiusHyperbolic - position.y;
            if (position.y > 0) {
                Fast.cosSin(position.x, v);
                let r = basicKaleidoscope.worldRadiusHyperbolic * Fast.exp(-position.y);
                position.x = r * v.x;
                position.y = r * v.y;
                return 1;
            } else {
                return -1;
            }
        };
        Make.updateNewMap();
    };

    projection.ellipticQuincuncial = function() {
        projection.ellipticView = 'quincuncial tiled';
        projection.ellipticDiscRadius = -1;
        projection.ellipticMap = quincuncial;
        Make.updateNewMap();
    };

    projection.ellipticQuincuncialSingle = function() {
        projection.ellipticView = 'quincuncinal single';
        projection.ellipticDiscRadius = -1;
        projection.ellipticMap = quincuncialSingle;
        Make.updateNewMap();
    };


    const qEpsilon = 0.0001;

    function quincuncial(position) {
        // periods are 2*worldradius, reduce to ranges -0.5 ... 0.5
        let h = 0.25 / projection.worldradius;
        position.x *= h;
        position.y *= h;
        position.x -= Math.round(position.x);
        position.y -= Math.round(position.y);
        // lower part to up, diagonal shifts
        if (position.y < 0) {
            if (position.x > 0) {
                position.x -= 0.5;
            } else {
                position.x += 0.5;
            }
            position.y += 0.5;
        }
        // left to right, rotate
        if (position.x < 0) {
            position.x = -position.x;
            position.y = 0.5 - position.y;
        }
        // shift to center
        position.x -= 0.25;
        position.y -= 0.25;

        // rotate 45 degrees, corners at (+-2,0) and (0,+-2)
        h = position.x + position.y;
        let invert = false;
        position.y = 4 * (position.x - position.y);
        position.x = 4 * h;

        if (position.x > 1) {
            position.x = 2 - position.x;
        } else if (position.x < -1) {
            position.x = -2 - position.x;
        } else if (position.y > 1) {
            position.y = 2 - position.y;
        } else if (position.y < -1) {
            position.y = -2 - position.y;
        } else {
            invert = true;
        }

        // transform unit square (+-1,0) and (0,+-1) to unit circle
        const x2 = position.x * position.x;
        const y2 = position.y * position.y;
        const r2 = x2 + y2;
        var scale;
        // beware of singularities
        if (r2 < qEpsilon) {
            scale = 1;
        } else if (r2 + qEpsilon > 2) {
            scale = 0.7071;
        } else {
            const x2y2 = x2 * y2;
            scale = Math.sqrt((r2 - 2 * x2y2) / r2 / (1 - x2y2));
        }
        position.scale(scale);
        // invert for lower hemisphere
        if (invert) {
            const scale = 1 / (position.length2() + 0.0001);
            position.scale(scale);
        }
        position.scale(projection.worldradius);
        return 1;
    }


    function quincuncialSingle(position) {
        if ((position.x > projection.worldradius) || (position.x < -projection.worldradius) || (position.y > projection.worldradius) || (position.y < -projection.worldradius)) {
            return -1;
        }
        return quincuncial(position);
    }


    // for switching betwwen geometries (remembering the projection)
    projection.worldradius = basicKaleidoscope.worldRadiusElliptic;
    projection.ellipticMap = projection.ellipticNormalMap;
    projection.euclidicMap = projection.identityMap;
    projection.hyperbolicMap = projection.identityMap;

    // the cutoff radius for map making
    //           Make.map.discRadius = -1; if there is no cutoff    (default)
    //  Make.map.discRadius=value of the projection disc

    projection.ellipticDiscRadius = basicKaleidoscope.ellipticDiscRadius;
    projection.euclidicDiscRadius = -1;
    projection.hyperbolicDiscRadius = basicKaleidoscope.worldRadiusHyperbolic;


}());