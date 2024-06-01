/* jshint esversion:6 */

// quasiperiodic wave packets

import {
    julia,
    map,
    base
} from "./modules.js";

export const brokenEvenWaves = {};
brokenEvenWaves.symmetry = 4;
brokenEvenWaves.scale = 1;
brokenEvenWaves.transX = 0;
brokenEvenWaves.transY = 0;

brokenEvenWaves.setup = function(gui) {
    base.gui.add({
        type: 'number',
        params: brokenEvenWaves,
        property: 'symmetry',
        step: 2,
        min: 2,
        onChange: julia.drawNewStructure
    });
    base.gui.add({
        type: 'number',
        params: brokenEvenWaves,
        property: 'scale',
        onChange: julia.drawNewStructure
    });
    base.gui.add({
        type: 'number',
        params: brokenEvenWaves,
        property: 'transX',
        labelText: 'translation',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: brokenEvenWaves,
        property: 'transY',
        labelText: '',
        onChange: julia.drawNewStructure
    });
};

brokenEvenWaves.map = function() {
    const symmetry = brokenEvenWaves.symmetry;
    const scale = brokenEvenWaves.scale;
    const transX = brokenEvenWaves.transX;
    const transY = brokenEvenWaves.transY;
    const sines = [];
    const cosines = [];
    var dAngle;
    const xArray = map.xArray;
    const nPixels = xArray.length;
    const yArray = map.yArray;
    const structureArray = map.structureArray;

    const m = symmetry / 2;
    sines.length = m;
    cosines.length = m;
    dAngle = Math.PI / m;
    for (let n = 0; n < m; n++) {
        sines[n] = Math.sin(n * dAngle);
        cosines[n] = Math.cos(n * dAngle);
    }
    for (let index = 0; index < nPixels; index++) {
        let x = scale * (xArray[index] + transX);
        let y = scale * (yArray[index] + transY);
        let xNew = Math.cos(x);
        let yNew = 0;
        for (let n = 1; n < m; n += 2) {
            const projection = x * cosines[n] + y * sines[n];
            yNew += Math.cos(projection);
        }
        for (let n = 2; n < m; n += 2) {
            const projection = x * cosines[n] + y * sines[n];
            xNew += Math.cos(projection);
        }

        xArray[index] = xNew;
        yArray[index] = yNew;
        structureArray[index] = (yNew > 0) ? 1 : 0;
    }
};