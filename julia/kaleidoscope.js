/* jshint esversion:6 */


import {
    julia
} from "./julia.js";

import {
    map
} from "./mapImage.js";

export const kaleidoscope = {};

kaleidoscope.k = 5;
kaleidoscope.m = 4;

kaleidoscope.setup = function(gui) {
    gui.addParagraph('<strong>kaleidoscope</strong>');
    gui.add({
        type: 'number',
        params: kaleidoscope,
        property: 'k',
        min: 1,
        step: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: kaleidoscope,
        property: 'm',
        min: 1,
        step: 1,
        onChange: julia.drawNewStructure
    });
    kaleidoscope.type = kaleidoscope.regular;
    gui.add({
        type: 'selection',
        params: kaleidoscope,
        property: 'type',
        options: {
            nothing: kaleidoscope.nothing,
            regular: kaleidoscope.regular,
            rectified: kaleidoscope.rectified,
            'uniform truncated': kaleidoscope.uniformTruncated
        },
        onChange: julia.drawNewStructure
    });

};

kaleidoscope.nothing = function() {};

// kaleidoscope depends on kaleidoscope.k/m

kaleidoscope.basic = function() {
    const m = kaleidoscope.m;
    const k = Math.min(100, kaleidoscope.k);
    const n = 2;
    const maxIterations = 1000;
    // geometry types
    var geometry;
    const elliptic = 0;
    const euklidic = 1;
    const hyperbolic = 2;

    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;

    /* k<1  identity map, do not change*/
    if (k < 1) {
        return;
    }

    /* the rotations of the dihedral group, order k*/
    const dAngle = 2 * Math.PI / k;
    const k2 = 2 * k;
    const sines = [];
    const cosines = [];
    for (let i = 0; i < k2; i++) {
        sines.push(Math.sin(i * dAngle));
        cosines.push(Math.cos(i * dAngle));
    }
    const gamma = Math.PI / k;
    const iGamma2 = 0.5 / gamma;
    const kPlus05 = k + 0.5;

    /* catch case that there is no triangle*/
    /* m<=1 or n<=1: simple dihedral group of order k*/
    if (m < 2) {
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
                    structure = 1 - structure;
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
            let x = xArray[index];
            let y = yArray[index];
            /* invalid if outside of poincare disc for hyperbolic kaleidoscope*/
            if ((geometry === hyperbolic) && (x * x + y * y >= 1)) {
                structureArray[index] = 128 + structure;
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
                structure = 1 - structure;
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
                rotation = Math.floor(Math.atan2(y, x) * iGamma2 + kPlus05);
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
            /* fail after doing maximum repetitions*/
            if (success) {
                /* be safe: do not get points outside the poincare disc*/
                if ((geometry === hyperbolic) && (x * x + y * y >= 1)) {
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
};


kaleidoscope.regular = function() {
    console.log('regular');
    kaleidoscope.basic();
};

/*==========================================================
 * rectifying the result of the basic kaleidoscope(k,m,n)
 * only for n=2
 * new mirror lines connecting the centers of the basic polygon
 * a regular polynom of m corners appears at the corners of the polygons of the regular tiling 
 * the polygon with k corners at the center of the regular tiling shrinks
 * rectify(k, m);
 *========================================================*/

kaleidoscope.rectified = function() {
    kaleidoscope.basic();
    const m = kaleidoscope.m;
    const k = Math.min(100, kaleidoscope.k);
    const n = 2;
    // geometry types
    var geometry;
    const elliptic = 0;
    const euklidic = 1;
    const hyperbolic = 2;

    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;

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
    var c2x, c2y, c2r2, d;
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
            d = circleCenterX - factor;
            d = 0.5 * (1 + d * d) / d / cosGamma;
            c2x = d * cosGamma;
            c2y = d * sinGamma;
            c2r2 = d * d - 1;
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
            d = circleCenterX - factor;
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
            let x = xArray[index];
            let y = yArray[index];
            var dx, dy, d2;
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
};

/*==========================================================
 * uniform truncating the result of the basic kaleidoscope(k,m,n)
 * only for n=2
 * new mirror lines connecting the centers of the basic polygon
 * a regular polynom of m corners appears at the corners of the polygons of the regular tiling 
 * the regular polynom of k corners has now twice this corners
 * uniformTrucated(k, m);
 *========================================================*/

kaleidoscope.uniformTruncated = function() {
    kaleidoscope.basic();
    const m = kaleidoscope.m;
    const k = Math.min(100, kaleidoscope.k);
    const n = 2;
    // geometry types
    var geometry;
    const elliptic = 0;
    const euklidic = 1;
    const hyperbolic = 2;

    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;

    /* k<1  identity map, do not change*/
    // also if there is no triangle
    if ((k < 1) || (m < 2)) {
        return;
    }

    // for the angle at the center
    const gamma = Math.PI / k;
    const cosGamma = Math.cos(gamma);
    const sinGamma = Math.sin(gamma);
const cosGamma2 = Math.cos(gamma / 2);
 const   sinGamma2 = Math.sin(gamma / 2);
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
    var c3x, c3y, c3r2;
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
        var dx,dy,d2;
        if (structure < 128) {
            let x = xArray[index];
            let y = yArray[index];
            switch (geometry) {
                case hyperbolic:
                    dx = x - c3x;
                    dy = y - c3y;
                    d2 = dx * dx + dy * dy;
                    if (d2 < c3r2) {
                        structure = 1 - structure;
                        factor = c3r2 / d2;
                        x = c3x + factor * dx;
                        y = c3y + factor * dy;
                    }
                    break;
                case elliptic:
                    dx = x - c3x;
                    dy = y - c3y;
                    d2 = dx * dx + dy * dy;
                    if (d2 > c3r2) {
                        structure = 1 - structure;
                        factor = c3r2 / d2;
                        x = c3x + factor * dx;
                        y = c3y + factor * dy;
                    }
                    break;
                case euklidic:
                    d = x * cosGamma + y * sinGamma - 0.5;
                    if (d > 0) {
                        structure = 1 - structure;
                        d = d + d;
                        x = x - d * cosGamma;
                        y = y - d * sinGamma;
                    }
                    break;
            }
            /* mirror at half-diagonal*/
            // for all cases
            let d = y * cosGamma2 - x * sinGamma2;
            if (d > 0) {
                structure = 1 - structure;
                d = d + d;
                x = x + d * cosGamma2;
                y = y - d * sinGamma2;
            }
            structureArray[index] = structure;
            xArray[index] = x;
            yArray[index] = y;
        }
    }
};