/* jshint esversion:6 */

/*==========================================================
 * BasicKaleidoscope: Creates a tiling with a basic triangle and reflections at its sides. 
 * The triangle's corner angles are integer fractions of 180 degrees.
 * This makes dihedral groups. Depending on the corner angles we get elliptic, hyperbolic or euclidic geometry.
 * For hyperbolic geometry we get a Poincare disc representation of the tiling with radius 1.
 * For elliptic geometry we get a stereographic projection of the tiled sphere. The projection of the equator has radius 1. 
 *
 * basicKaleidoscope(k, m , n);
 * basicKaleidoscope(k, m , n, maxRange);
 * basicKaleidoscope( k, m , n, maxRange, minRange);
 *
 *
 * input: 3 integers, k, m, n. 
 *     Determine the symmetries and the basic triangle.
 *     k is order of dihedral symmetry at center, pi/k the angle between the
 *     straight mirror lines (x-axis and oblique line), 
 *     k is limited, k <= 100 (enforced).
 *     m is order of dihedral symmetry arising at the oblique line
 *     and the third side of the triangle (circle or straight line), angle pi/n
 *     n is order of dihedral symmetry arising at x-axis and the third side of
 *     the triangle (circle or straight line), angle pi/n
 *
 *     if one or more of the m or n are 1 or smaller then the basicKaleidoscope
 *     does a a simple dihedral group of order k (because these values do not give a triangle.)
 *
 *     if k is smaller than 1 then the basicKaleidoscope does nothing (identity map)
 *
 *     hyperbolic case: the radius of the Poincare disc is equal to 1
 *     elliptic case: the radius of the equator in stereographic projection is equal to 1
 *
 * optional parameters: 
 *    maxRange (maximum number of iterations, default value is 1000)
 *    minRange (minimum number of iterations, values > 0 make a hole, default is 0)
 *
 * returns nothing and modifies the map argument if used as a procedure:
 *   basicKaleidoscope(map, k, m, n);
 *
 * returns a modified map and does not change the map argument if used as a function:
 *  newMap = basicKaleidoscope(map, k, m, n);
 *
 *========================================================*/



function basicKaleidoscope(k, m, n, maxRange = 1000, minRange = 0) {
    // geometry types
    var geometry;
    const elliptic = 0;
    const euklidic = 1;
    const hyperbolic = 2;

    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;

    /* limit k */
    if (k > 100) {
        k = 100;
    }

    /* k<1  identity map, do not change*/
    if (k < 1) {
        return;
    }

    /* the rotations of the dihedral group, order k*/
    const dAngle = 2 * Math.PI / k;
    const k2 = 2 * k;
    const sines = [];
    const cosines = [];
    for (i = 0; i < k2; i++) {
        sines.push(Math.sin(i * dAngle));
        cosines.push(Math.cos(i * dAngle));
    }
    const gamma = Math.PI / k;
    const iGamma2 = 0.5 / gamma;
    const kPlus05 = k + 0.5;

    /* catch case that there is no triangle*/
    /* m<=1 or n<=1: simple dihedral group of order k*/
    if ((m < 2) || (n < 2)) {
        for (let index = 0; index < nPixels; index++) {
            let structure = structureArray[index];
            /* do only transform if pixel is valid*/
            if (structure < 128) {
                let x = xArray[index];
                let y = yArray[index];
                /* make dihedral map to put point in first sector*/
                const rotation = Math.floor(Math.atan2(y, x) * iGamma2 + kPlus05);
                const cosine = cosines[rotation];
                const sine = sines[rotation];
                const h = cosine * x + sine * y;
                y = -sine * x + cosine * y;
                x = h;
                if (y < 0) {
                    y = -y;
                    structure += 1;
                }
                xArray[index] = x;
                yArray[index] = y;
                structureArray[index] = structure;
            }
        }
        return;
    }

    /* we have a triangle*/
    const alpha = Math.PI / n;
    const beta = Math.PI / m;
    const angleSum = 1 / k + 1 / n + 1 / m;
    if (angleSum > 1.001) {
        geometry = elliptic;
    } else if (angleSum > 0.999) {
        geometry = euklidic;
    } else {
        geometry = hyperbolic;
    }

    var circleCenterX, circleCenterY, circleRadius2;
    var mirrorX, mirrorNormalX, mirrorNormalY;
    var centerX, centerY, factor;
    /* define the inverting circle/mirror line*/
    switch (geometry) {
        case hyperbolic:
            /* hyperbolic geometry with inverting circle*/
            /* calculation of center for circle radius=1*/
            centerY = Math.cos(alpha);
            centerX = centerY / Math.tan(gamma) + Math.cos(beta) / Math.sin(gamma);
            /* hyperbolic geometry: renormalize for poincare radius=1*/
            factor = 1 / Math.sqrt(centerX * centerX + centerY * centerY - 1);
            circleCenterX = factor * centerX;
            circleCenterY = factor * centerY;
            circleRadius2 = factor * factor;
            break;
        case elliptic:
            /* calculation of center for circle radius=1*/
            centerY = -Math.cos(alpha);
            centerX = -(centerY / Math.tan(gamma) + Math.cos(beta) / Math.sin(gamma));
            /* renormalize to get equator radius of 1 in stereographic projection*/
            factor = 1 / Math.sqrt(1 - centerX * centerX - centerY * centerY);
            circleCenterX = factor * centerX;
            circleCenterY = factor * centerY;
            circleRadius2 = factor * factor;
            break;
        case euklidic:
            /* euklidic geometry with mirror line*/
            /* mirror position is arbitrary, mirror line passes through (mirrorX,0)*/
            mirrorX = 0.5;
            /* normal vector to the mirror line, pointing outside*/
            mirrorNormalX = Math.sin(alpha);
            mirrorNormalY = Math.cos(alpha);
            break;
    }

    for (let index = 0; index < nPixels; index++) {
        let structure = structureArray[index];
        /* do only transform if pixel is valid*/
        if (structure < 128) {
            x = inMap[index];
            y = inMap[index + nXnY];
            /* invalid if outside of poincare disc for hyperbolic kaleidoscope*/
            if ((geometry == hyperbolic) && (x * x + y * y >= 1)) {
                outMap[index] = INVALID;
                outMap[index + nXnY] = INVALID;
                outMap[index + nXnY2] = INVALID;
                continue;
            }
            /* make dihedral map to put point in first sector*/
            /* and thus be able to use inversion/mirror as first step in iterated mapping*/
            let rotation = Math.floor(Math.atan2(y, x) * iGamma2 + kPlus05);
            let cosine = cosines[rotation];
            let sine = sines[rotation];
            let h = cosine * x + sine * y;
            y = -sine * x + cosine * y;
            x = h;
            if (y < 0) {
                y = -y;
                structure += 1;
            }
            /* repeat inversion and dihedral group until success*/
            let success = false;
            let iterations = 0;
            while ((!success) && (iterations < maxIterations)) {
                var dx, dy, d2, d;
                switch (geometry) {
                    case hyperbolic:
                        /* inversion inside-out at circle*/
                        /* if no mapping we have finished*/
                        dx = x - circleCenterX;
                        dy = y - circleCenterY;
                        d2 = dx * dx + dy * dy;
                        /* d2 always larger than zero, because only points inside th Poincare disc*/
                        /* are considered, center of inverting sphere lies outside */
                        if (d2 < circleRadius2) {
                            structure = 1 - structure;
                            factor = circleRadius2 / d2;
                            x = circleCenterX + factor * dx;
                            y = circleCenterY + factor * dy;
                        } else {
                            success = true;
                        }
                        break;
                    case elliptic:
                        /* inversion outside-in at circle,*/
                        /* if no mapping we have finished*/
                        dx = x - circleCenterX;
                        dy = y - circleCenterY;
                        d2 = dx * dx + dy * dy;
                        if (d2 > circleRadius2) {
                            structure = 1 - structure;
                            factor = circleRadius2 / d2;
                            x = circleCenterX + factor * dx;
                            y = circleCenterY + factor * dy;
                        } else {
                            success = true;
                        }
                        break;
                    case euklidic:
                        /* reflect point at mirror line if it is at the right hand side*/
                        /* if no mapping we have finished*/
                        d = (x - mirrorX) * mirrorNormalX + y * mirrorNormalY;
                        if (d > 0) {
                            structure = 1 - structure;
                            d = d + d;
                            x = x - d * mirrorNormalX;
                            y = y - d * mirrorNormalY;
                        } else {
                            success = true;
                        }
                        break;
                }
                /* dihedral symmetry, if no mapping we have finished*/
                rotation = Math.floor(Math.atan2f(y, x) * iGamma2 + kPlus05);
                if (rotation != k) {
                    /* we have a rotation and can't return*/
                    cosine = cosines[rotation];
                    sine = sines[rotation];
                    h = cosine * x + sine * y;
                    y = -sine * x + cosine * y;
                    x = h;
                    if (y < 0) {
                        y = -y;
                        structure = 1 - structure;
                    }
                } else {
                    /* no rotation*/
                    if (y < 0) {
                        /* mirror symmetry at the x-axis, not finished*/
                        y = -y;
                        structure = 1 - structure;
                    } else {
                        /* no mapping, it's finished*/
                        success = true;
                    }
                }
                iterations += 1;
            }
            /* fail after doing maximum repetitions or less than minimum iterations*/
            if ((success) && (iterations > minIterations)) {
                /* be safe: do not get points outside the poincare disc*/
                if ((geometry == hyperbolic) && (x * x + y * y >= 1)) {
                    structure += 128;
                }
            } else {
                structure += 128;
            }
            structureArray[index] = structure;
            xArray[index] = x;
            yArray[index] = y;
        }
    }
}