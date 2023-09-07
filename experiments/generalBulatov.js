/* jshint esversion:6 */

// generalized bulatov band

import {
    julia,
    map,
    base,
    kaleidoscope
} from "./modules.js";

export const generalBulatov = {};

generalBulatov.on = true;
generalBulatov.a = 1;
generalBulatov.outside = true;
generalBulatov.step = 0.1;
generalBulatov.drift = 0.1;
generalBulatov.ring = true;
generalBulatov.m=3;
generalBulatov.n = 6;

generalBulatov.setup = function() {
    base.gui.addParagraph('<strong>generalBulatov</strong>');
    base.gui.add({
        type: 'boolean',
        params: generalBulatov,
        property: 'on',
        onChange: function() {
            julia.drawNewStructure();
        }
    }).add({
        type: 'number',
        params: generalBulatov,
        property: 'a',
        onChange: julia.drawNewStructure
    });
    base.gui.add({
        type: 'boolean',
        params: generalBulatov,
        property: 'outside',
        onChange: function() {
            julia.drawNewStructure();
        }
    }).add({
        type: 'number',
        params: generalBulatov,
        property: 'step',
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: generalBulatov,
        property: 'drift',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: generalBulatov,
        property: 'm',
        step:1,
        onChange: julia.drawNewStructure
    });
    base.gui.add({
        type: 'boolean',
        params: generalBulatov,
        property: 'ring',
        onChange: function() {
            julia.drawNewStructure();
        }
    }).add({
        type: 'number',
        params: generalBulatov,
        property: 'n',
        onChange: julia.drawNewStructure
    });
};

generalBulatov.map = function() {
    if (!generalBulatov.on) {
        return;
    }
    const outside = generalBulatov.outside;
    if (outside) {
        map.makeDriftArrays();
    }
    const drift = generalBulatov.drift;
    const step = generalBulatov.step;
    const a = generalBulatov.a;
    const piA2 = Math.PI * a / 2;
    const iTanPiA4 = 1.0 / Math.tan(Math.PI * a / 4);
    // period in y-direction is 4/a
    const iPeriod = a / 4;
    const ring = generalBulatov.ring;
    const n = generalBulatov.n;
    const m=generalBulatov.m;
    const ringFactor = n * 2 / a / Math.PI;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const driftYArray = map.driftYArray;
    const driftXArray = map.driftXArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        if (structureArray[index] < 128) {
            let x = xArray[index];
            let y = yArray[index];
            if (ring) {
                // ring transform, periodic in y-direction
                const h = ringFactor * Math.atan2(y, x);
                x = ringFactor * 0.5 * Math.log(x * x + y * y);
                y = h;
            }
            // bulatov transform
            let yInitial = y;
            x *= piA2;
            y *= piA2;
            const exp2x = Math.exp(x);
            const base = iTanPiA4 / (exp2x + 1.0 / exp2x + 2 * Math.cos(y));
            x = (exp2x - 1.0 / exp2x) * base;
            y = 2 * Math.sin(y) * base;
            if (outside) {
                const r2 = x * x + y * y;
                if (r2 > 1) {
                    driftYArray[index] = step;
                    let nCopy = Math.floor(iPeriod * yInitial);
                    nCopy = nCopy - m * Math.floor(nCopy / m);
                    driftXArray[index] = drift * nCopy;
                    const factor = 1 / r2;
                    x *= factor;
                    y *= factor;
                }
            }
            xArray[index] = x;
            yArray[index] = y;
        }
    }
};