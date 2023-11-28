/* jshint esversion:6 */

/*
iteration of f(z)=(1-z^symmetry r^-symmetry) z^power
with final limiting to |z|<cutoff
scaling with 1/cutoff
*/

import {
    map,
    julia,
    base
} from "./modules.js";

export const fractalsFamily = {};
fractalsFamily.symmetry = 3;
fractalsFamily.power = 1;
fractalsFamily.iters = 4;
fractalsFamily.cutoff = 10;
fractalsFamily.root = 1;

fractalsFamily.setup = function() {
    const gui = base.gui;
    gui.add({
        type: 'number',
        params: fractalsFamily,
        property: 'symmetry',
        step: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: fractalsFamily,
        property: 'power',
        labelText: 'center power',
        step: 1,
        onChange: julia.drawNewStructure
    });

    gui.add({
        type: 'number',
        params: fractalsFamily,
        property: 'root',
        onChange: julia.drawNewStructure
    });

    gui.add({
        type: 'number',
        params: fractalsFamily,
        property: 'iters',
        step: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: fractalsFamily,
        property: 'cutoff',
        onChange: julia.drawNewStructure
    });
};

fractalsFamily.map = function() {
    const power = fractalsFamily.power;
    const symmetry = fractalsFamily.symmetry;
    const cutoff = fractalsFamily.cutoff;
    const cutoff2 = cutoff * cutoff;
    const iCutoff = 1 / cutoff;
    const iRoot = 1 / Math.pow(fractalsFamily.root, symmetry);
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const iters = fractalsFamily.iters;
    const length = xArray.length;
    for (var index = 0; index < length; index++) {
        let x = xArray[index];
        let y = yArray[index];
        // iterating
        for (let i = 0; i < iters; i++) {
            const r2 = x * x + y * y;
            const phi = Math.atan2(y, x);
            const lnr = 0.5 * Math.log(r2);
            let r = iRoot * Math.exp(lnr * symmetry);
            let angle = symmetry * phi;
            const polyReal = 1 - r * Math.cos(angle);
            const polyImag = -r * Math.sin(angle);
            r = Math.exp(power * lnr);
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