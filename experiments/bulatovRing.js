/* jshint esversion:6 */


import {
    julia,map,base,kaleidoscope,bulatov
} from "./modules.js";

export const bulatovRing = {};

bulatovRing.on=true;
bulatovRing.nRepeats = 5;

bulatovRing.setup = function() {
    base.maps.push(bulatovRing);
    base.gui.add({
        type: 'boolean',
        params: bulatovRing,
        property: 'on',
        labelText:'ring on',
        onChange: function() {
            julia.drawNewStructure();
        }
    }).add({
        type: 'number',
        params: bulatovRing,
        property: 'nRepeats',
        labelText:'n',
        onChange: julia.drawNewStructure
    });
};

// the simple band transform using periodicity
bulatovRing.map = function() {
    if (!bulatovRing.on){
        return;
    }
    const period = bulatov.getPeriod();
    if (period < 0) {
        return;
    }
    const a = 1;
    const angFactor = bulatovRing.nRepeats / 2 / Math.PI * period;
    const e = Math.exp(1);
    const piA2 = Math.PI * a / 2;
    const iTanPiA4 = 1.0 / Math.tan(Math.PI * a / 4);
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        const structure = structureArray[index];
        let x = xArray[index];
        let y = yArray[index];
        //ring to band
        const h = angFactor * Math.atan2(y, x);
        y = angFactor * Math.log(Math.hypot(x, y)) + 1;
        x = h;
        // bulatovband
        if ((y > -1) && (y < 1)) {
            const nPeriods = Math.floor(x / period);
            x = piA2 * (x - period * nPeriods);
            y = piA2 * y;
            const exp2x = Math.exp(x);
            const base = iTanPiA4 / (exp2x + 1.0 / exp2x + 2 * Math.cos(y));
            xArray[index] = (exp2x - 1.0 / exp2x) * base;
            yArray[index] = 2 * Math.sin(y) * base;
        } else {
            structureArray[index] = 200;
        }
    }
};
