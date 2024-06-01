/* jshint esversion:6 */

// quasiperiodic wave packets

import {
    julia,
    map,
    base
} from "./modules.js";

export const productWaves = {};
productWaves.symmetry = 4;
productWaves.scale = 1;
productWaves.transX = 0;
productWaves.transY = 0;

productWaves.setup = function(gui) {
    base.gui.add({
        type: 'number',
        params: productWaves,
        property: 'symmetry',
        step: 1,
        min: 1,
        onChange: julia.drawNewStructure
    });
    base.gui.add({
        type: 'number',
        params: productWaves,
        property: 'scale',
        onChange: julia.drawNewStructure
    });
    base.gui.add({
        type: 'number',
        params: productWaves,
        property: 'transX',
        labelText: 'translation',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: productWaves,
        property: 'transY',
        labelText: '',
        onChange: julia.drawNewStructure
    });
};

productWaves.map = function() {
    const symmetry = productWaves.symmetry;
    const scale = productWaves.scale;
    const transX = productWaves.transX;
    const transY = productWaves.transY;
    const sines = [];
    const cosines = [];
    var dAngle;
    const xArray = map.xArray;
    const nPixels = xArray.length;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    if ((symmetry & 1) !== 0) {
        sines.length = symmetry;
        cosines.length = symmetry;
        dAngle = 2 * Math.PI / symmetry;
        for (let n = 0; n < symmetry; n++) {
            sines[n] = Math.sin(n * dAngle);
            cosines[n] = Math.cos(n * dAngle);
        }
        for (let index = 0; index < nPixels; index++) {
            let x = scale * (xArray[index] + transX);
            let y = scale * (yArray[index] + transY);
            let xNew = Math.cos(x);
            let yNew = Math.sin(x);
            for (let n = 1; n < symmetry; n++) {
                const projection = x * cosines[n] + y * sines[n];
                xNew *= Math.cos(projection);
                yNew *= Math.sin(projection);
            }
            xArray[index] = xNew;
            yArray[index] = yNew;
            structureArray[index] = (xNew > 0) ? 1 : 0;
        }
    } else {
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
            let xNew = 1;
            let yNew = 1;
            let projection = x;
            for (let n = 1; n < m; n++) {
                const nextProjection = x * cosines[n] + y * sines[n];
                xNew *= Math.cos(projection);
                yNew *= Math.cos(projection + nextProjection);
                projection = nextProjection;
            }
            xNew *= Math.cos(projection);
            yNew *= Math.cos(projection - x);
            xArray[index] = xNew;
            yArray[index] = yNew;
            structureArray[index] = (xNew > 0) ? 1 : 0;
        }
    }
};