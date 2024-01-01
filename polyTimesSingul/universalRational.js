/* jshint esversion: 6 */

import {
    map
} from "../mappings/mapImage.js";

export const universalRational = {};

// universal rational function defined by a params-array

map.universalRational = function(zPow, order, amplitudeReal, amplitudeImag, nomRootsReal, nomRootsImag, denomRootsReal, denomRootsImag) {
    const eps = 1e-100;
    let totalPower = zPow + order * nomRootsReal.length;
    if (denomRootsReal.length > 0) {
        totalPower -= 1;
    }
    // supposing that roots are not zero: Is z=0 a singularity?
    const zeroSingular = (zPow < -eps);
    //result for infinite z, or very large z
    var xInfty, yInfty;
    if (totalPower > eps) {
        xInfty = Infinity;
        yInfty = Infinity;
    } else
    if (totalPower > -eps) {
        xInfty = amplitudeReal;
        yInfty = amplitudeImag;
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
        // power of z as prefactor, initialize nominator and denominator
        const phi = Math.atan2(y, x);
        const lnr = 0.5 * Math.log(r2);
        let r = Math.exp(lnr * zPow);
        let angle = zPow * phi;
        let nomReal = r * Math.cos(angle);
        let nomImag = r * Math.sin(angle);
        let denReal = 1;
        let denImag = 0;
        // z to power of order
        r = Math.exp(lnr * order);
        angle = order * phi;
        const xp = r * Math.cos(angle);
        const yp = r * Math.sin(angle);
        // calculate nominator and denominator
        let length = nomRootsReal.length;
        for (let i = 0; i < length; i++) {
            const factorReal = xp - nomRootsReal[i];
            const factorImag = yp - nomRootsImag[i];
            const h = nomReal * factorReal - nomImag * factorImag;
            nomImag = nomReal * factorImag + nomImag * factorReal;
            nomReal = h;
        }
        const nom2 = nomReal * nomReal + nomImag * nomImag;

        if (!isFinite(nom2)) {
            xArray[index] = xInfty;
            yArray[index] = yInfty;
            continue;
        }

        length = denomRootsReal.length;
        for (let i = 0; i < length; i++) {
            // singularity at denomroots
            let real = x - denomRootsReal[i];
            let imag = y - denomRootsImag[i];
            // division, take care of overflows
            const denom2 = real * real + imag * imag;
            // denom2 === infinite resembles case that z is infinite
            // that is, z is too large ...
            if (!isFinite(denom2)) {
                xArray[index] = xInfty;
                yArray[index] = yInfty;
                continue;
            }
            // beware of division by zero
            //  assuming that zeros of polynoms and singularities are different
            if (denom2 < eps) {
                xArray[index] = Infinity;
                yArray[index] = Infinity;
                continue;
            }
            const factor = 1 / denom2;
            denReal += factor * real;
            denImag -= factor * imag;
        }

        // multiply polygon with sum of singularities
        const zzReal = nomReal * denReal - nomImag * denImag;
        const zzImag = nomImag * denReal + nomReal * denImag;
        // multiplication with amplitude
        xArray[index] = amplitudeReal * zzReal - amplitudeImag * zzImag;
        yArray[index] = amplitudeReal * zzImag + amplitudeImag * zzReal;
    }
};