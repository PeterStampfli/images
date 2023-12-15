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

export const simplePolyFamily = {};
simplePolyFamily.symmetry = 3;
simplePolyFamily.power = 1;
simplePolyFamily.iters = 4;
simplePolyFamily.cutoff = 10;
simplePolyFamily.root = 1;
simplePolyFamily.amplitude=1;

simplePolyFamily.setup = function() {
    const gui = base.gui;
    gui.add({
        type: 'number',
        params: simplePolyFamily,
        property: 'symmetry',
        step: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: simplePolyFamily,
        property: 'power',
        labelText: 'center power',
        step: 1,
        onChange: julia.drawNewStructure
    });

    gui.add({
        type: 'number',
        params: simplePolyFamily,
        property: 'root',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: simplePolyFamily,
        property: 'amplitude',
        onChange: julia.drawNewStructure
    });

    gui.add({
        type: 'number',
        params: simplePolyFamily,
        property: 'iters',
        step: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: simplePolyFamily,
        property: 'cutoff',
        onChange: julia.drawNewStructure
    });
};

simplePolyFamily.map = function() {
    const power = simplePolyFamily.power;
    const symmetry = simplePolyFamily.symmetry;
    const cutoff = simplePolyFamily.cutoff;
    const cutoff2 = cutoff * cutoff;
    const iCutoff = 1 / cutoff;
    const rootPowN = Math.pow(simplePolyFamily.root, symmetry);
    const amplitude=simplePolyFamily.amplitude;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const iters = simplePolyFamily.iters;
    const length = xArray.length;
    for (var index = 0; index < length; index++) {
        let x = xArray[index];
        let y = yArray[index];
        // iterating
        for (let i = 0; i < iters; i++) {
            const r2 = x * x + y * y;
            const phi = Math.atan2(y, x);
            const lnr = 0.5 * Math.log(r2);
            let r = Math.exp(lnr * symmetry);
            let angle = symmetry * phi;
            const polyReal = r * Math.cos(angle)-rootPowN;
            const polyImag = r * Math.sin(angle);
            r = amplitude*Math.exp(power * lnr);
            angle = power * phi;
            const zReal = r * Math.cos(angle);
            const zImag = r * Math.sin(angle);
            const h = polyReal * zReal - polyImag * zImag;
            y = polyImag * zReal + polyReal * zImag;
            x = h;
        }
        // check if out of limits
        const r2 = x * x + y * y;
        if (r2 < cutoff2) {
            xArray[index] = iCutoff * x;
            yArray[index] = iCutoff * y;
        } else {
            structureArray[index] = 200;
        }
    }
};