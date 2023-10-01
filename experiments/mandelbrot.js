/* jshint esversion:6 */

import {
    map,
    julia,
    base
} from "./modules.js";

export const mandelbrot = {};
mandelbrot.symmetry = 3;
mandelbrot.iters = 1;
mandelbrot.cutoff=10;

mandelbrot.setup = function() {
    const gui = base.gui;
    gui.add({
        type: 'number',
        params: mandelbrot,
        property: 'symmetry',
        step: 1,
        min: 1,
        onChange: julia.drawNewStructure
    });

    gui.add({
        type: 'number',
        params: mandelbrot,
        property: 'iters',
        step: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: mandelbrot,
        property: 'cutoff',
        step: 1,
        onChange: julia.drawNewStructure
    });
};

mandelbrot.map = function() {
    const power = mandelbrot.power;
    const symmetry = mandelbrot.symmetry;
    const cutoff=mandelbrot.cutoff;
    const cutoff2=cutoff*cutoff;
    const iCutoff=1/cutoff;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const iters = mandelbrot.iters;
    const length = xArray.length;
    for (var index = 0; index < length; index++) {
        let x = xArray[index];
        let y = yArray[index];
        const xNull=x;
        const yNull=y;
        for (let i = 0; i < iters; i++) {
            const r2=x * x + y * y;
            if (r2>cutoff2){
                break;
            }
            const phi = Math.atan2(y, x);
            const lnr = 0.5 * Math.log(r2);
            let r = Math.exp(lnr * symmetry);
            let angle = symmetry * phi;
            x = r * Math.cos(angle) + xNull;
            y = r * Math.sin(angle)+yNull;
        }
        xArray[index] =iCutoff* x;
        yArray[index] =iCutoff* y;
    }
};