/* jshint esversion:6 */

/*
iteration of f(z)=(z^symmetry -r^symmetry) z^power
with final limiting to |z|<cutoff
scaling with 1/cutoff
*/

import {
    map,
    julia,
    base
} from "./modules.js";

export const simpleRationalFamily = {};
simpleRationalFamily.symmetry = 5;
simpleRationalFamily.power = -1;
simpleRationalFamily.iters = 4;
simpleRationalFamily.cutoff = 10;
simpleRationalFamily.root = 0.9;
simpleRationalFamily.amplitude = 1;

simpleRationalFamily.setup = function() {
    const gui = base.gui;
    gui.add({
        type: 'number',
        params: simpleRationalFamily,
        property: 'symmetry',
        step: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: simpleRationalFamily,
        property: 'power',
        labelText: 'center power',
        step: 1,
        onChange: julia.drawNewStructure
    });

    gui.add({
        type: 'number',
        params: simpleRationalFamily,
        property: 'root',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: simpleRationalFamily,
        property: 'amplitude',
        onChange: julia.drawNewStructure
    });

    gui.add({
        type: 'number',
        params: simpleRationalFamily,
        property: 'iters',
        step: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: simpleRationalFamily,
        property: 'cutoff',
        onChange: julia.drawNewStructure
    });
};

simpleRationalFamily.map = function() {
    const power = simpleRationalFamily.power;
    const symmetry = simpleRationalFamily.symmetry;
    const cutoff = simpleRationalFamily.cutoff;
    const cutoff2 = cutoff * cutoff;
    const iCutoff = 1 / cutoff;
    const rootPowNm1 = Math.pow(simpleRationalFamily.root, symmetry) - 1;
    const amplitude = simpleRationalFamily.amplitude;
    let resInfty = 0;
    if (power === 0) {
        resInfty = amplitude;
    } else if (power > 0) {
        resInfty = Infinity;
    }
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const iters = simpleRationalFamily.iters;
    const length = xArray.length;
    for (var index = 0; index < length; index++) {
        let x = xArray[index];
        let y = yArray[index];
        // iterating
        for (let i = 0; i < iters; i++) {
            const r2 = x * x + y * y;
            if (isFinite(r2)) {
                const phi = Math.atan2(y, x);
                const lnr = 0.5 * Math.log(r2);
                let r = Math.exp(lnr * symmetry);
                let angle = symmetry * phi;
                // the rational part
                let zReal = r * Math.cos(angle)+1;
                let zImag = r * Math.sin(angle);
                const factor = rootPowNm1 / (zReal * zReal + zImag * zImag);
                const polyReal = 1 - factor * zReal;
                const polyImag = -factor * zImag;
                // multiplication with amplitude and power of z
                r = amplitude * Math.exp(power * lnr);
                angle = power * phi;
                zReal = r * Math.cos(angle);
                zImag = r * Math.sin(angle);
                const h = polyReal * zReal - polyImag * zImag;
                y = polyImag * zReal + polyReal * zImag;
                x = h;
            } else {
                x = resInfty;
                y = 0;
            }
        }
        // check if out of limits or not finite
        const r2 = x * x + y * y;
        if (r2 < cutoff2) {
            xArray[index] = iCutoff * x;
            yArray[index] = iCutoff * y;
        }
        else {
            structureArray[index]=128;
        }
    }
};