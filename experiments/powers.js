/* jshint esversion:6 */

import {
    map,
    julia,
    base
} from "./modules.js";

export const powers = {};
powers.symmetry = 3;
powers.power = 1;
powers.iters = 1;
powers.cutoff=10;

powers.setup = function() {
    const gui = base.gui;
    gui.add({
        type: 'number',
        params: powers,
        property: 'symmetry',
        step: 1,
        min: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: powers,
        property: 'power',
        labelText: 'center power',
        step: 1,
        onChange: julia.drawNewStructure
    });

    gui.add({
        type: 'number',
        params: powers,
        property: 'iters',
        step: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: powers,
        property: 'cutoff',
        step: 1,
        onChange: julia.drawNewStructure
    });
};

powers.map = function() {
    const power = powers.power;
    const symmetry = powers.symmetry;
    const cutoff=powers.cutoff;
    const cutoff2=cutoff*cutoff;
    let iCutoff=1/cutoff;
    iCutoff=1;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const iters = powers.iters;
    const length = xArray.length;
    for (var index = 0; index < length; index++) {
        let x = xArray[index];
        let y = yArray[index];
        for (let i = 0; i < iters; i++) {
            const r2=x * x + y * y;
            if (r2>cutoff2){
             //   break;
            }
            const phi = Math.atan2(y, x);
            const lnr = 0.5 * Math.log(r2);
            let r = Math.exp(lnr * symmetry);
            let angle = symmetry * phi;
            const polyReal = r * Math.cos(angle) + 1;
            const polyImag = r * Math.sin(angle);
            r = Math.exp(power * lnr);
            angle = power * phi;
            const zReal = r * Math.cos(angle);
            const zImag = r * Math.sin(angle);

            const h = polyReal * zReal - polyImag * zImag;
            y = polyImag * zReal + polyReal * zImag;
            x = h;
        }
        xArray[index] =iCutoff* x;
        yArray[index] =iCutoff* y;
    }
};