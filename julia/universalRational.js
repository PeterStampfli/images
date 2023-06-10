/* jshint esversion: 6 */


import {
    map
} from "./mapImage.js";


export const universalRational = {};

universalRational.setup = function() {
    map.mapping = map.universalRational;
};


// universal rational function defined by a params-array
// first element: power for z, integer
// second element: prefactor,real part
// third element: prefactor, imaginary part
// then followed by tripletts, each defining a factor:
// first: order, integer, if positive it is for the nominator, if negative for the denominator
//        the calculation then uses the absolute value for the  power of z
// second: real part of constant term
// third: imaginary part of constant term

map.universalRational = function(params) {
    let paramsLength = params.length;
    if (paramsLength % 3 !== 0) {
        console.error('map.universalRational: params length is not multiple of 3. params:');
        console.log(params);
    }
    if (paramsLength < 3) {
        console.error('map.universalRational: params length is smaller than 3. params:');
        console.log(params);
    }
    const zPow = params[0];
    const zPow2 = params[0] / 2;
    const amplitudeReal = params[1];
    const amplitudeImag = params[2];
    const order = [];
    const order2 = [];
    const constantReal = [];
    const constantImag = [];
    const isNominator = [];
    for (let i = 3; i < paramsLength; i += 3) {
        isNominator.push((params[i] > 0));
        order.push(params[i]);
        order2.push(params[i] / 2);
        constantReal.push(params[i + 1]);
        constantImag.push(params[i + 2]);
    }
    paramsLength = isNominator.length;
    const eps = 0.00001;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = map.xArray.length;
    for (var index = 0; index < nPixels; index++) {
        const structure = structureArray[index];
        if (structure >= 128) {
            continue;
        }
        let x = xArray[index];
        let y = yArray[index];
        // safety: check if z is finite
        const r2 = x * x + y * y;
        if (isFinite(r2)) {
            const phi = Math.atan2(y, x);
            let r = Math.pow(r2, zPow2);
            let angle = zPow * phi;
            let nomReal = r * Math.cos(angle);
            let nomImag = r * Math.sin(angle);
            let denomReal = 1;
            let denomImag = 0;
            for (let i = 0; i < paramsLength; i++) {
                r = Math.pow(r2, order2[i]);
                angle = order[i] * phi;
                const zOrderRealPlus = r * Math.sin(angle) + constantReal[i];
                const zOrderImagPlus = r * Math.cos(angle) + constantImag[i];
                if (isNominator[i]) {
                    const h = nomReal * zOrderRealPlus - nomImag * zOrderImagPlus;
                    nomImag = nomReal * zOrderImagPlus + nomImag * zOrderRealPlus;
                    nomReal = h;
                } else {
                    const h = denomReal * zOrderRealPlus - denomImag * zOrderImagPlus;
                    denomImag = denomReal * zOrderImagPlus + denomImag * zOrderRealPlus;
                    denomReal = h;
                }
            }
            const factor = 1 / (denomReal * denomReal + denomImag * denomImag);
            const zzReal = factor * (nomReal * denomReal + nomImag * denomImag);
            const zzImag = factor * (nomImag * denomReal - nomReal * denomImag);
            xArray[index] = amplitudeReal * zzReal - amplitudeImag * zzImag;
            yArray[index] = amplitudeReal * zzImag + amplitudeImag * zzReal;
        } else {
            xArray[index] = Infinity;
            yArray[index] = Infinity;
        }
    }
};