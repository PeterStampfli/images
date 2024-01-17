/* jshint esversion: 6 */

import {
    map
} from "../mappings/mapImage.js";

import {
    singularities,
    roots
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
    const order=singularities.order;
    const zerosLength = zerosReal.length;
    const singsLength = singsReal.length;
    const denRootsReal = roots.denReal;
    const denRootsImag = roots.denImag;
    const nomRootsReal = roots.nomReal;
    const nomRootsImag = roots.nomImag;
    const denRootsLength=denRootsReal.length;
    const nomRootsLength=nomRootsReal.length;
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
            r2 = big2;
        }
        // or singularity at z=0
        else if (r2 < eps) {
            x = eps;
            y = 0;
            r2 = eps2;
        }

        // power of z as prefactor
        const phi = Math.atan2(y, x);
        const lnr = 0.5 * Math.log(r2);
        let r = Math.exp(lnr * zPow);
        let angle = zPow * phi;
        const powReal = r * Math.cos(angle);
        const powImag = r * Math.sin(angle);

        // sum of singularities of nominator=>singularities
        let sumSingReal = singsConstant;
        let sumSingImag = 0;
        for (let i = 0; i < singsLength; i++) {
            const rr = singsReal[i];
            const ri = singsImag[i];
            let real = x * rr - y * ri - 1;
            let imag = y * rr + x * ri;
            const denom2 = real * real + imag * imag + eps2;
            const factor = 1 / denom2;
            sumSingReal += factor * real;
            sumSingImag -= factor * imag;
        }

        // sum of singularities of denominator=>zeros
        let sumZeroReal = zerosConstant;
        let sumZeroImag = 0;
        for (let i = 0; i < zerosLength; i++) {
            const rr = zerosReal[i];
            const ri = zerosImag[i];
            let real = x * rr - y * ri - 1;
            let imag = y * rr + x * ri;

            // division, take care of overflows
            const denom2 = real * real + imag * imag + eps2;
            const factor = 1 / denom2;
            sumZeroReal += factor * real;
            sumZeroImag -= factor * imag;
        }

        // doing the polynomials
        // z to power of order
        r = Math.exp(lnr * order);
        angle = order * phi;
        x = r * Math.cos(angle);
        y = r * Math.sin(angle);
        // nominator is product of the nominator polynomial and sumSingularities
        for (let i = 0; i < nomRootsLength; i++) {
            const factorReal = x - nomRootsReal[i];
            const factorImag = y - nomRootsImag[i];
            const h = sumSingReal * factorReal - sumSingImag * factorImag;
            sumSingImag = sumSingReal * factorImag + sumSingImag * factorReal;
            sumSingReal = h;
            if (index===0){
                console.log(x,y);
                console.log(factorReal,factorImag);
                console.log(sumSingReal,sumSingImag);
            }
        }
        // denominator is product of denomin polynomial and sumZeros
        for (let i = 0; i < denRootsLength; i++) {
            const factorReal = x - denRootsReal[i];
            const factorImag = y - denRootsImag[i];
            const h = sumZeroReal * factorReal - sumZeroImag * factorImag;
            sumZeroImag = sumZeroReal * factorImag + sumZeroImag * factorReal;
            sumZeroReal = h;
        }
        // division sing/zero
        const denom2 = sumZeroReal * sumZeroReal + sumZeroImag * sumZeroImag + eps2;
        const factor = 1 / denom2;
        const qReal = factor * (sumSingReal * sumZeroReal + sumSingImag * sumZeroImag);
        const qImag = factor * (sumSingImag * sumZeroReal - sumSingReal * sumZeroImag);
        // multiplication with amplitude and power of z
        xArray[index] = amplitude * (powReal * qReal - powImag * qImag);
        yArray[index] = amplitude * (powReal * qImag + powImag * qReal);
    }
};