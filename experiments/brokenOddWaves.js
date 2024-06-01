/* jshint esversion:6 */

// quasiperiodic wave packets

import {
    julia,
    map,
    base
} from "./modules.js";

export const brokenOddWaves = {};
brokenOddWaves.symmetry = 16;
brokenOddWaves.scale = 1;
brokenOddWaves.transX = 0;
brokenOddWaves.transY = 0;
brokenOddWaves.oddX = true;
brokenOddWaves.oddY = true;

brokenOddWaves.setup = function(gui) {
    base.gui.add({
        type: 'number',
        params: brokenOddWaves,
        property: 'symmetry',
        step: 2,
        min: 2,
        onChange: julia.drawNewStructure
    });
    base.gui.add({
        type: 'number',
        params: brokenOddWaves,
        property: 'scale',
        onChange: julia.drawNewStructure
    });
    base.gui.add({
        type: 'number',
        params: brokenOddWaves,
        property: 'transX',
        labelText: 'translation',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: brokenOddWaves,
        property: 'transY',
        labelText: '',
        onChange: julia.drawNewStructure
    });
    base.gui.add({
        type: 'boolean',
        params: brokenOddWaves,
        property: 'oddX',
        labelText: 'odd X',
        onChange: julia.drawNewStructure
    }).add({
        type: 'boolean',
        params: brokenOddWaves,
        property: 'oddY',
        labelText: 'Y',
        onChange: julia.drawNewStructure
    })
};

brokenOddWaves.map = function() {
    const symmetry = brokenOddWaves.symmetry;
    const scale = brokenOddWaves.scale;
    const transX = brokenOddWaves.transX;
    const transY = brokenOddWaves.transY;
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
        let xNew = 0;
        let yNew = 0;
        let sign = 1;
        if (brokenOddWaves.oddY) {
            for (let n = 1; n < m; n += 2) {
                sign = -sign;
                const projection = x * cosines[n] + y * sines[n];
                yNew += sign * Math.sin(projection);
            }
        } else {
            for (let n = 1; n < m; n += 2) {
                const projection = x * cosines[n] + y * sines[n];
                yNew += Math.cos(projection);
            }
        }
        if (brokenOddWaves.oddX) {
            xNew = Math.sin(x);
            sign = 1;
            for (let n = 2; n < m; n += 2) {
                sign = -sign;
                const projection = x * cosines[n] + y * sines[n];
                xNew += sign * Math.sin(projection);
            }
        } else {
            xNew = Math.cos(x);
            for (let n = 2; n < m; n += 2) {
                const projection = x * cosines[n] + y * sines[n];
                xNew += Math.cos(projection);
            }
        }

        xArray[index] = xNew;
        yArray[index] = yNew;
        structureArray[index] = (yNew > 0) ? 1 : 0;
    }
};