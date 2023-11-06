/* jshint esversion: 6 */

/*
rational functions of the form:

      p                 n_1             n_?
f(z)=z  * prefactor *[(z    -c_1)...]/[z     -c_?]

*/

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
    xInfty = Infinity;
    yInfty = Infinity;

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
            const rr = denomRootsReal[i];
            const ri = denomRootsImag[i];
                     let real = x*rr-y*ri-1;
            let imag = y*rr+x*ri;
            const expo = Math.exp(real);
            if (!isFinite(expo)) {
                xArray[index] = xInfty;
                yArray[index] = yInfty;
                continue;
            }


            denReal += expo * Math.cos(imag);
            denImag += expo * Math.sin(imag);
        }



        // multiply polygon with sum of singularities
        const zzReal = nomReal * denReal - nomImag * denImag;
        const zzImag = nomImag * denReal + nomReal * denImag;
        // multiplication with amplitude
        xArray[index] = amplitudeReal * zzReal - amplitudeImag * zzImag;
        yArray[index] = amplitudeReal * zzImag + amplitudeImag * zzReal;
    }
};