/* jshint esversion: 6 */

import {
    map
} from "../mappings/mapImage.js";

import {
    singularities
} from "./singularities.js";

export const calculate = {};

map.calculate = function() {
    const zPow = singularities.zPower;
    const constant = singularities.constant;
    const amplitude = singularities.amplitude;
    const realCoeffs = singularities.realCoeffs;
    const imagCoeffs = singularities.imagCoeffs;
    const coeffsLength = realCoeffs.length;
    const eps = 1e-10;
    const eps2 = eps * eps;
    // big number, all above is similar to infinite
    // maximum number of javascript is 1e300
    const big = 1e10;
    const big2 = big * big;
    // big^30 < Infinity , should be safe enough

    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = map.xArray.length;

    for (let index = 0; index < nPixels; index++) {
        const structure = structureArray[index];
        if (structure >= 128) {
            continue;
        }
        let x = xArray[index];
        let y = yArray[index];
        let r2 = x * x + y * y;

        // safety: check if z is not too large
        if (r2 > big2) {
            x = big;
            y = 0;
            r2=big2;
        }
        // or singularity at z=0
        else if (r2 < eps) {
            x = eps;
            y = 0;
            r2=eps2;
        }

        // sum of singularities
        let sumReal = constant;
        let sumImag = 0;
        for (let i = 0; i < coeffsLength; i++) {
            const rr = realCoeffs[i];
            const ri = imagCoeffs[i];
            let real = x * rr - y * ri - 1;
            let imag = y * rr + x * ri;

            // division, take care of overflows
            const denom2 = real * real + imag * imag + eps2;
            // denom2 is approx same as r2, because r2<eps2 also denom2<eps2
            // real division by zero is avoided
            const factor = 1 / denom2;
            sumReal += factor * real;
            sumImag -= factor * imag;
        }
        // power of z as prefactor
        const phi = Math.atan2(y, x);
        const lnr = 0.5 * Math.log(r2);
        const r = Math.exp(lnr * zPow);
        const angle = zPow * phi;
        const powReal = r * Math.cos(angle);
        const powImag = r * Math.sin(angle);
        // multiplication with amplitude
        xArray[index] = amplitude * (powReal * sumReal - powImag * sumImag);
        yArray[index] = amplitude * (powReal * sumImag + powImag * sumReal);
    }
};