/* jshint esversion:6 */

import {
    map,
    julia
} from "./mapImage.js";


export const excentricTest = {};

excentricTest.eps = 0.2;
excentricTest.radius = 1;
excentricTest.circleCenter = 0.5;
excentricTest.inversionCenter = 0.3;

excentricTest.setup = function(gui) {
    gui.add({
        type: 'number',
        params: excentricTest,
        property: 'eps',
        min: 0,
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: excentricTest,
        property: 'radius',
        min: 0,
        onChange: julia.drawNewStructure
    });

    gui.add({
        type: 'number',
        params: excentricTest,
        property: 'circleCenter',
        min: 0,
        onChange: julia.drawNewStructure
    });

    gui.add({
        type: 'number',
        params: excentricTest,
        property: 'inversionCenter',
        min: 0,
        onChange: julia.drawNewStructure
    });

};


/**
 * solve quadratic equation ax**2+bx+c=0
 * only for real solutions
 * solutions are in Fast.xLow and Fast.xHigh
 * @method Fast.quadraticEquation
 * @param {float} a - has to be diffferent from zero, check before !!!
 * @param {float} b
 * @param {float} c
 * solutions in lowerSolution<higherSolution
 * @return {boolean} true if there are real solutions
 */
var lowerSolution, higherSolution;

function quadratic(a, b, c) {
    const rootArg = b * b - 4 * a * c;
    if (rootArg < 0) {
        lowerSolution = 0;
        higherSolution = 0;
        return false;
    }
    if (b > 0) {
        lowerSolution = 0.5 * (-b - Math.sqrt(rootArg)) / a;
        higherSolution = c / a / lowerSolution;
    } else {
        higherSolution = 0.5 * (-b + Math.sqrt(rootArg)) / a;
        lowerSolution = c / a / higherSolution;
    }
    return true;
}

// inversion inside out, for hyperbolic geometry
function check(x, y) {
    const circleRadius = excentricTest.radius;
    const circleRadius2 = radius * radius;
    // centers at real axis, y=0
    const circleCenter = excentricTest.circleCenter;
    const inversionCenter = excentricTest.inversionCenter;
    const inversionCenter2 = inversionCenter * inversionCenter;
    const circleCenter2mr2 = circleCenter * circleCenter - circleRadius2;

    const xArray = map.xArray;
    const yArray = map.yArray;
    const nPixels = xArray.length;
    console.log('check', x, y);


    // is inside? then map inside out
    let dx = x - circleCenter;
    if (dx * dx + y * y < circleRadius2) {
        console.log('inside');
        dx = x - inversionCenter;
        // determine distance from inversion center to intersection between circle and
        // line from inversion center to point
        // get u is projection of intersection to the real axis
        const m = y / dx;
        const m2 = m * m;
        const a = m2 + 1;
        const b = -2 * (m2 * inversionCenter + circleCenter);
        const c = m2 * inversionCenter2 + circleCenter2mr2;
        quadratic(a, b, c);
        var solution;
        if (Math.abs(lowerSolution - inversionCenter) < Math.abs(higherSolution - inversionCenter)) {
            solution = lowerSolution;
        } else {
            solution = higherSolution;
        }
        const d = (1 + m2) * solution;
        // the imaging factor
        const factor = d * d / (y * y + dx * dx);

    }
}

// inversion inside out, for hyperbolic geometry
excentricTest.map = function() {
    check(0.5, 0.5);
    const eps = excentricTest.eps;
    const circleRadius = excentricTest.radius;
    const circleRadius2 = circleRadius * circleRadius;
    console.log(circleRadius2);
    // centers at real axis, y=0
    let circleCenter = excentricTest.circleCenter;
    console.log(circleCenter);
    let inversionCenter = excentricTest.inversionCenter;
    const inversionCenter2 = inversionCenter * inversionCenter;
    const circleCenter2mr2 = circleCenter * circleCenter - circleRadius2;
    // distance between inversion center and circle for points directly above or below inversion center
    const d2Vertical = circleRadius2 - (circleCenter - inversionCenter) * (circleCenter - inversionCenter);

    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;

    for (let index = 0; index < nPixels; index++) {
        let x = xArray[index];
        let y = yArray[index];
        // mapping inside out needs cutoff/ something for singularity
        let dx = x - circleCenter;
        if ((dx * dx + y * y) < circleRadius2) {
            dx = x - inversionCenter;
            // determine distance from inversion center to intersection between circle and
            // line from inversion center to point
            // get projection of intersection to the real axis
            const m = y / dx;
            const m2 = m * m;
            var d2;
            if (isFinite(m2)) {
                const a = m2 + 1;
                const b = -2 * (m2 * inversionCenter + circleCenter);
                const c = m2 * inversionCenter2 + circleCenter2mr2;
                quadratic(a, b, c);
                // solution will be distance between inversion center to projection of the
                // intersection point to the x-axis
                // get value at the same side of inversion center as given point

                solution = (dx > 0) ? higherSolution : lowerSolution;
                solution -= inversionCenter;
                d2 = (1 + m2) * solution * solution;
            } else {
                d2 = d2Vertical;
            }

            if (d2 > y * y + dx * dx) {
                structureArray[index] = 1;
            }
            // the imaging factor
            let factor = (d2 + eps) / (y * y + dx * dx + eps);

            xArray[index] = inversionCenter + factor * dx;
            xArray[index] = factor * x;
            yArray[index] = factor * y;
        } else {
            xArray[index] = x;
            yArray[index] = y;
            structureArray[index] = 128;
        }
    }
};