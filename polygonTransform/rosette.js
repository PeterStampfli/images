/* jshint esversion:6 */

import {
    map,
    julia
} from "./mapImage.js";

export const rosette = {};
rosette.order = 5;
rosette.type = rosette.nothing;
rosette.rPower = 2;
rosette.alpha = 1;

rosette.setup = function(gui) {
    gui.addParagraph('<strong>final rosette</strong>');
    gui.add({
        type: 'number',
        params: rosette,
        property: 'order',
        min: 2,
        step: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: rosette,
        property: 'rPower',
        min: 0,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: rosette,
        property: 'alpha',
        min: 0.01,
        onChange: julia.drawNewStructure
    });
    rosette.type = rosette.nothing;
    gui.add({
        type: 'selection',
        params: rosette,
        property: 'type',
        options: {
            nothing: rosette.nothing,
            'mirror symmetric': rosette.mirrorSymmetric,
            cyclic: rosette.cyclic,
        },
        onChange: julia.drawNewStructure
    });
};

rosette.nothing = function() {};

rosette.mirrorSymmetric = function() {
    const order = rosette.order;
    const rPower = rosette.rPower / 2;
    const iAlpha = 1 / rosette.alpha;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    for (let index = 0; index < nPixels; index++) {
        let structure = structureArray[index];
        /* do only transform if pixel is valid*/
        if (structure < 128) {
            let x = xArray[index];
            let y = yArray[index];
            const phi = order * Math.atan2(y, x);
            const r2 = x * x + y * y;
            let r = Math.pow(r2, rPower);
            r = r / (r + iAlpha);
            xArray[index] = r * Math.cos(phi);
            yArray[index] = r * Math.cos(phi + phi);
        }
    }
}; 

rosette.cyclic = function() {
    const order = rosette.order;
    const rPower = rosette.rPower / 2;
    const iAlpha = 1 / rosette.alpha;
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    for (let index = 0; index < nPixels; index++) {
        let structure = structureArray[index];
        /* do only transform if pixel is valid*/
        if (structure < 128) {
            let x = xArray[index];
            let y = yArray[index];
            const phi = order * Math.atan2(y, x);
            const r2 = x * x + y * y;
            let r = Math.pow(r2, rPower);
            r = r / (r + iAlpha);
            xArray[index] = r * Math.cos(phi);
            yArray[index] = r * Math.sin(phi);
        }
    }
};