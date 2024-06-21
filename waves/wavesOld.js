/* jshint esversion:6 */

// quasiperiodic wave packets


import {
    map,
    julia
} from "../mappings/mapImage.js";

export const waves = {};
waves.symmetry = 4;
waves.scale = 1;
waves.transX = 0;
waves.transY = 0;

waves.setup = function(gui) {
    gui.addParagraph('<strong>waves</strong>');
    gui.add({
        type: 'number',
        params: waves,
        property: 'symmetry',
        step: 1,
        min: 1,
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: waves,
        property: 'scale',
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: waves,
        property: 'transX',
        labelText: 'translation',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: waves,
        property: 'transY',
        labelText: '',
        onChange: julia.drawNewStructure
    });

    map.mapping = waves.map;
};

waves.map = function() {
    const symmetry = waves.symmetry;
    const scale = waves.scale;
    const transX = waves.transX;
    const transY = waves.transY;
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
            let x = xArray[index];
            let y = yArray[index];
            let xNew = Math.cos(x) - symmetry;
            let yNew = Math.sin(x);
            for (let n = 1; n < symmetry; n++) {
                const projection = x * cosines[n] + y * sines[n];
                xNew += Math.cos(projection);
                yNew += Math.sin(projection);
            }
            xNew = scale * xNew + transX;
            yNew = scale * yNew + transY;
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
            let xNew = -m;
            let yNew = -m;
            let projection = x;
            for (let n = 1; n < m; n++) {
                const nextProjection = x * cosines[n] + y * sines[n];
                xNew += Math.cos(projection);
                yNew += Math.cos(projection + nextProjection);
                projection = nextProjection;
            }
            xNew += Math.cos(projection);
            yNew += Math.cos(projection - x);
            xNew = scale * xNew + transX;
            yNew = scale * yNew + transY;
            xArray[index] = xNew;
            yArray[index] = yNew;
            structureArray[index] = (xNew > 0) ? 1 : 0;
        }
    }
};