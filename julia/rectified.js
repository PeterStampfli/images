/* jshint esversion:6 */

/*==========================================================
 * rectifying the result of the basic kaleidoscope(k,m,n)
 * only for n=2
 * new mirror lines connecting the centers of the basic polygon
 * a regular polynom of m corners appears at the corners of the polygons of the regular tiling 
 * the polygon with k corners at the center of the regular tiling shrinks
 * rectify(k, m);
 *========================================================*/



function rectified(k, m) {
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
    // also if there is no triangle
    if ((k < 1) || (m < 2)) {
        return;
    }

    // for the angle at the center
    const gamma = Math.PI / k;
    const cosGamma = Math.cos(gamma);
    const sinGamma = Math.sin(gamma);

    /* we have a triangle*/
    const n = 2;
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
    var c2x, c2y, c2r2, c3x, c3y, c3r2;
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
            d = 0.5 * (1 + d * d) / d / cosGamma;
            c2x = d * cosGamma;
            c2y = d * sinGamma;
            c2r2 = d * d - 1;
            c3x = circleCenterX * cosGamma;
            c3y = circleCenterX * sinGamma;
            c3r2 = circleRadius2;
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
            d = 0.5 * (1 - d * d) / d / cosGamma;
            c2x = -d * cosGamma;
            c2y = -d * sinGamma;
            c2r2 = d * d + 1;
            c3x = circleCenterX * cosGamma;
            c3y = circleCenterX * sinGamma;
            c3r2 = circleRadius2;
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
            switch (geometry) {
                case hyperbolic:
                    dx = x - c2x;
                    dy = y - c2y;
                    d2 = dx * dx + dy * dy;
                    if (d2 < c2r2) {
                        structure = 1 - structure;
                        factor = c2r2 / d2;
                        x = c2x + factor * dx;
                        y = c2y + factor * dy;
                    }
                    break;
                case elliptic:
                    dx = x - c2x;
                    dy = y - c2y;
                    d2 = dx * dx + dy * dy;
                    if (d2 > c2r2) {
                        structure = 1 - structure;
                        factor = c2r2 / d2;
                        x = c2x + factor * dx;
                        y = c2y + factor * dy;
                    }
                    break;
                case euklidic:
                    dx = x - 0.5;
                    d = dx * cosGamma + y * sinGamma;
                    if (d > 0) {
                        structure = 1 - structure;
                        d = d + d;
                        x = x - d * cosGamma;
                        y = y - d * sinGamma;
                    }
                    break;
            }
            structureArray[index] = structure;
            xArray[index] = x;
            yArray[index] = y;
        }
    }
}