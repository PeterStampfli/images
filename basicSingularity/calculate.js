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
    const eps = 1e-100;

    // supposing that roots are not zero: Is z=0 a singularity?
    const zeroSingular = (zPow < -eps);
    //result for infinite z, or very large z
    var xInfty, yInfty;
    if (zPow > eps) {
        xInfty = Infinity;
        yInfty = Infinity;
    } else
    if (zPow > -eps) {
        xInfty = amplitude * constant;
        yInfty = 0;
    } else {
        xInfty = 0;
        yInfty = 0;
    }

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

        // safety: check if z is finite
        if (!isFinite(r2)) {
            xArray[index] = xInfty;
            yArray[index] = yInfty;
            continue;
        }
        // or singularity at z=0
        if ((r2 < eps) && zeroSingular) {
            xArray[index] = Infinity;
            yArray[index] = Infinity;
            continue;
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
            const denom2 = real * real + imag * imag;
            // denom2 === infinite resembles case that z is infinite
            // that is, z is too large ...
            if (!isFinite(denom2)) {
                continue;
            }
            // beware of division by zero
            if (denom2 < eps) {
                sumReal = Infinity;
                sumImag = Infinity;
                break;
            }
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