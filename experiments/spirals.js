/* jshint esversion:6 */

import {
    julia,map,base,bulatov
} from "./modules.js";

import {
    kaleidoscope
} from "../mappings/kaleidoscope.js";

export const spirals = {};
spirals.xDrift = 0;
spirals.yDrift = 0;
spirals.armDrift=0;

spirals.n = 5;
spirals.m = 1;

spirals.setup = function() {
    const gui=base.gui;
    gui.addParagraph('<strong>spirals</strong>');
    gui.add({
        type: 'number',
        params: spirals,
        property: 'n',
        step:1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: spirals,
        property: 'm',
        step:1,
        onChange: julia.drawNewStructure
    });

    gui.add({
        type: 'number',
        params: spirals,
        property: 'xDrift',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: spirals,
        property: 'yDrift',
        onChange: julia.drawNewStructure
    });

    gui.add({
        type: 'number',
        params: spirals,
        property: 'armDrift',
        onChange: julia.drawNewStructure
    })
};

spirals.map = function() {
     map.makeDriftArrays();
         const period = bulatov.getPeriod(kaleidoscope.k,kaleidoscope.m);
    if (period < 0) {
        return;
    }
    const phiToX = spirals.n * period / 2 / Math.PI;
    const nTimesPeriod=spirals.n*period;
    const phiToY = -spirals.m / Math.PI;
    const m = spirals.m;
    const a = 1;
    const e = Math.exp(1);
    const piA2 = Math.PI * a / 2;
    const iTanPiA4 = 1.0 / Math.tan(Math.PI * a / 4);
    const xDrift = spirals.xDrift;
    const yDrift = spirals.yDrift;
    const armDrift = spirals.armDrift;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const driftXArray = map.driftXArray;
    const driftYArray = map.driftYArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        let x = xArray[index];
        let y = yArray[index];
        // spiralize
        // make the log
        const phi = Math.atan2(y, x);
        let lnr = 0.5 * Math.log(x * x + y * y);
        // scale and rotate
        x = phiToX * phi - phiToY * lnr;
        y = phiToY * phi + phiToX * lnr;
        // bulatovband,periodic, reduce to y=-1...+1
        // index to the repeated bulatov bands
        const bandIndex = Math.floor(0.5 * (y + 1));
        y -= 2 * bandIndex;
        // calculate arm and total length
        const turns = Math.floor(bandIndex / m);
        const arm = bandIndex - m * turns;
        driftXArray[index] = xDrift*(x+turns*nTimesPeriod)+yDrift*y;
        driftYArray[index] = armDrift * arm;
        const nPeriod = Math.floor(x / period);
        x = piA2 * (x - period * nPeriod);
        y = piA2 * y;
        const exp2x = Math.exp(x);
        const base = iTanPiA4 / (exp2x + 1.0 / exp2x + 2 * Math.cos(y));
        xArray[index] = (exp2x - 1.0 / exp2x) * base;
        yArray[index] = 2 * Math.sin(y) * base;
    }
};
