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
generalBulatov.a=1;

generalBulatov.setup = function() {
    base.maps.push(generalBulatov);
    base.gui.addParagraph('<strong>generalBulatov</strong>');
    base.gui.add({
        type: 'boolean',
        params: generalBulatov,
        property: 'on',
        onChange: function() {
            julia.drawNewStructure();
        }
    }).add({
        type:'number',
        params:generalBulatov,
        property:'a',
        onChange:julia.drawNewStructure
    });
};

generalBulatov.map = function() {
    if (!generalBulatov.on) {
        return;
    }
    const a = generalBulatov.a;
    const piA2 = Math.PI * a / 2;
    const iTanPiA4 = 1.0 / Math.tan(Math.PI * a / 4);
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        if (structureArray[index] < 128) {
            let y = yArray[index];
                let x = piA2 *xArray[index];
                y *= piA2;
                const exp2x = Math.exp(x);
                const base = iTanPiA4 / (exp2x + 1.0 / exp2x + 2 * Math.cos(y));
                xArray[index] = (exp2x - 1.0 / exp2x) * base;
                yArray[index] = 2 * Math.sin(y) * base;
        }
    }
};