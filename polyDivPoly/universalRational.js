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

// universal rational function
// against singularities
const eps = 1e-10;
const eps2 = eps * eps;
// big number, all above is similar to infinite
// maximum number of javascript is 1e300
const big = 1e10;
const big2=big*big;
// big^30 < Infinity , should be safe enough

// parameters
var zPow, order, amplitudeReal, amplitudeImag, nomRootsReal, nomRootsImag, denomRootsReal, denomRootsImag;

// setting the params
map.setParams = function(zPowP, orderP, amplitudeRealP, amplitudeImagP, nomRootsRealP, nomRootsImagP, denomRootsRealP, denomRootsImagP) {
    zPow = zPowP;
    order = orderP;
    amplitudeReal = amplitudeRealP;
    amplitudeImag = amplitudeImagP;
    nomRootsReal = nomRootsRealP;
    nomRootsImag = nomRootsImagP;
    denomRootsReal = denomRootsRealP;
    denomRootsImag = denomRootsImagP;
};

// maps all pixels

map.universalRational = function() {
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
        x = r * Math.cos(angle);
        y = r * Math.sin(angle);
        // calculate nominator and denominator
        let length = nomRootsReal.length;
        for (let i = 0; i < length; i++) {
            const factorReal = x - nomRootsReal[i];
            const factorImag = y - nomRootsImag[i];
            const h = nomReal * factorReal - nomImag * factorImag;
            nomImag = nomReal * factorImag + nomImag * factorReal;
            nomReal = h;
        }
        length = denomRootsReal.length;
        for (let i = 0; i < length; i++) {
            const factorReal = x - denomRootsReal[i];
            const factorImag = y - denomRootsImag[i];
            const h = denReal * factorReal - denImag * factorImag;
            denImag = denReal * factorImag + denImag * factorReal;
            denReal = h;
        }
        // we can safely assume that nominator and denominator are finite
        const factor = 1 / (denReal * denReal + denImag * denImag + eps2);
        const zzReal = factor * (nomReal * denReal + nomImag * denImag);
        const zzImag = factor * (nomImag * denReal - nomReal * denImag);
        // multiplication with amplitude
        xArray[index] = amplitudeReal * zzReal - amplitudeImag * zzImag;
        yArray[index] = amplitudeReal * zzImag + amplitudeImag * zzReal;
    }
};

// map a simple point for trajectory
// an array, pair of coordinates

map.point = function(point) {
    let x = point.x;
    let y = point.y;
    let r2 = x * x + y * y;

    // safety: check if z is finite
    if (!isFinite(r2)) {
        point.x = xInfty;
        point.y = yInfty;
        return;
    }
    // or singularity at z=0
    if ((r2 < eps) && zeroSingular) {
        point.x = Infinity;
        point.y = Infinity;
        return;
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
    x = r * Math.cos(angle);
    y = r * Math.sin(angle);
    // calculate nominator and denominator
    let length = nomRootsReal.length;
    for (let i = 0; i < length; i++) {
        const factorReal = x - nomRootsReal[i];
        const factorImag = y - nomRootsImag[i];
        const h = nomReal * factorReal - nomImag * factorImag;
        nomImag = nomReal * factorImag + nomImag * factorReal;
        nomReal = h;
    }
    length = denomRootsReal.length;
    for (let i = 0; i < length; i++) {
        const factorReal = x - denomRootsReal[i];
        const factorImag = y - denomRootsImag[i];
        const h = denReal * factorReal - denImag * factorImag;
        denImag = denReal * factorImag + denImag * factorReal;
        denReal = h;
    }
    // division, take care of overflows
    const nom2 = nomReal * nomReal + nomImag * nomImag;
    const denom2 = denReal * denReal + denImag * denImag;
    if (!isFinite(nom2)) {
        if (isFinite(denom2)) {
            point.x = Infinity;
            point.y = Infinity;
        } else {
            point.x = xInfty;
            point.y = yInfty;
        }
        return;
    } else if (!isFinite(denom2)) {
        point.x = 0;
        point.y = 0;
        return;
    }
    // nominator and denominator are both finite
    // beware of division by zero
    //  assuming that nominator and denominator have different roots
    if (denom2 < eps) {
        point.x = Infinity;
        point.y = Infinity;
        return;
    }
    const factor = 1 / denom2;
    const zzReal = factor * (nomReal * denReal + nomImag * denImag);
    const zzImag = factor * (nomImag * denReal - nomReal * denImag);
    // multiplication with amplitude
    point.x = amplitudeReal * zzReal - amplitudeImag * zzImag;
    point.y = amplitudeReal * zzImag + amplitudeImag * zzReal;
};