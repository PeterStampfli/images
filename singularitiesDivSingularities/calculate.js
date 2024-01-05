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
    const zerosConstant = singularities.zerosConstant;
    const singsConstant = singularities.singsConstant;
    const amplitude = singularities.amplitude;
    const zerosReal = singularities.zerosReal;
    const zerosImag = singularities.zerosImag;
    const singsReal = singularities.singsReal;
    const singsImag = singularities.singsImag;
    const zerosLength = zerosReal.length;
    const singsLength = singsReal.length;
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
        // power of z as prefactor
        const phi = Math.atan2(y, x);
        const lnr = 0.5 * Math.log(r2);
        const r = Math.exp(lnr * zPow);
        const angle = zPow * phi;
        const powReal = r * Math.cos(angle);
        const powImag = r * Math.sin(angle);

        // sum of singularities of nominator=>singularities
        let sumSingReal = constant;
        let sumSingImag = 0;
        for (let i = 0; i < singsLength; i++) {
            const rr = singsReal[i];
            const ri = singsImag[i];
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
                sumSingReal = Infinity;
                sumSingImag = Infinity;
                break;
            }
            const factor = 1 / denom2;
            sumSingReal += factor * real;
            sumSingImag -= factor * imag;
        }

        // sum of singularities of denominator=>zeros
        let sumZeroReal = constant;
        let sumZeroImag = 0;
        for (let i = 0; i < zerosLength; i++) {
            const rr = zerosReal[i];
            const ri = zerosImag[i];
            let real = x * rr - y * ri - 1;
            let imag = y * rr + x * ri;

            // division, take care of overflows
            const denom2 = real * real + imag * imag;
            if (!isFinite(denom2)) {
                continue;
            }
            // beware of division by zero
            if (denom2 < eps) {
                sumZeroReal = Infinity;
                sumZeroImag = Infinity;
                break;
            }
            const factor = 1 / denom2;
            sumZeroReal += factor * real;
            sumZeroImag -= factor * imag;
        }
        // division sing/zero
        const denom2 = sumZeroReal * sumZeroReal + sumZeroImag * sumZeroImag;
        if (!isFinite(denom2)) {
            xArray[index] = 0;
            yArray[index] = 0;
            continue;
        }
        // beware of division by zero
        if (denom2 < eps) {
            xArray[index] = Infinity;
            yArray[index] = Infinity;
            continue;
        }
        const factor = 1 / denom2;
        const qReal = factor * (sumSingReal * sumZeroReal + sumSingImag * sumZeroImag);
        const qImag = factor * (sumSingImag * sumZeroReal - sumSingReal * sumZeroImag);
        // multiplication with amplitude and power of z
        xArray[index] = amplitude * (powReal * qReal - powImag * qImag);
        yArray[index] = amplitude * (powReal * qImag + powImag * qReal);
    }
};