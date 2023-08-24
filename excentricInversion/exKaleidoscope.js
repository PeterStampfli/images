/* jshint esversion:6 */

import {
    map,
    julia
} from "./mapImage.js";

export const kaleidoscope = {};

kaleidoscope.k = 5;
kaleidoscope.m = 4;
kaleidoscope.offset = 0.1;

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
    gui.add({
        type: 'number',
        params: kaleidoscope,
        property: 'offset',
        onChange: julia.drawNewStructure
    })
};

kaleidoscope.basic = function() {
    const m = kaleidoscope.m;
    const k = Math.min(100, kaleidoscope.k);
    const maxIterations = 1000;

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
    const beta = Math.PI / m;
    const angleSum = 1 / k + 0.5 + 1 / m;
    if (angleSum > 0.999) {
        return;
    }


    /* define the inverting center*/
    /* calculation of center with distance 1 between inversion center and third corner*/
    const inversionCenter = Math.cos(beta) / Math.sin(gamma);

    let inversionRadius2 = 1;

    // third corner of the hyperbolic triangle
    const thirdCornerDistance = Math.cos(gamma) * inversionCenter - Math.sqrt(1 - Math.sin(gamma) * Math.sin(gamma) * inversionCenter * inversionCenter);
    const thirdCornerDistance2 = thirdCornerDistance * thirdCornerDistance;
    // circle of inversion offset from inversion center
    const circleCenter = inversionCenter + kaleidoscope.offset;
    // radius given by third corner of hyperbolic triangle
    const thirdCornerX = thirdCornerDistance * Math.cos(gamma);
    const thirdCornerY = thirdCornerDistance * Math.sin(gamma);
    const circleRadius2 = (thirdCornerX - circleCenter) * (thirdCornerX - circleCenter) + thirdCornerY * thirdCornerY;


    for (let index = 0; index < nPixels; index++) {
        let structure = structureArray[index];
        /* do only transform if pixel is valid*/
        if (structure < 128) {
            let x = xArray[index];
            let y = yArray[index];
            /* invalid if outside of poincare disc for hyperbolic kaleidoscope*/
            if ((x * x + y * y >= 1)) {
                structureArray[index] = 128 + structure;
                continue;
            } else if (!isFinite(x * x + y * y)) {
                structureArray[index] = 128;
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

                /* inversion inside-out at circle*/
                /* if no mapping we have finished*/
                let dx = x - inversionCenter;
                let d2 = dx * dx + y * y;
                /* d2 always larger than zero, because only points inside th Poincare disc*/
                /* are considered, center of inverting sphere lies outside */
                if (d2 < inversionRadius2) {
                    structure = 1 - structure;
                    const factor = inversionRadius2 / d2;
                    x = inversionCenter + factor * dx;
                    y = factor * y;
                } else {
                    success = true;
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
                /* be safe: do not get points outside the hyperbolic triangle*/
                if ((x * x + y * y >= thirdCornerDistance2)) {
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