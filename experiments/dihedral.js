/* jshint esversion:6 */

import {
    map,
    julia,
    base
} from "./modules.js";

export const dihedral = {};

dihedral.k = 5;
dihedral.on = true;

dihedral.setup = function() {
    const gui = base.gui;
    gui.add({
        type: 'number',
        params: dihedral,
        property: 'dihedral k',
        max: 100,
        min: 1,
        step: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'boolean',
        params: dihedral,
        property: 'on',
        onChange: julia.drawNewStructure
    });
};

dihedral.map = function() {
    if (dihedral.on) {
        const k = dihedral.k;
        const xArray = map.xArray;
        const yArray = map.yArray;
        const structureArray = map.structureArray;
        const nPixels = xArray.length;
        /* the rotations of the dihedral group, order k*/
        const dAngle = 2 * Math.PI / k;
        const k2 = 2 * k;
        const sines = [];
        const cosines = [];
        for (let i = 0; i < k2; i++) {
            sines.push(Math.sin(i * dAngle));
            cosines.push(Math.cos(i * dAngle));
        }
        const gamma = Math.PI / k;
        const iGamma2 = 0.5 / gamma;
        const kPlus05 = k + 0.5;
        for (let index = 0; index < nPixels; index++) {
            let structure = structureArray[index];
            /* do only transform if pixel is valid*/
            if (structure < 128) {
                let x = xArray[index];
                let y = yArray[index];
                /* make dihedral map to put point in first sector*/
                const rotation = Math.floor(Math.atan2(y, x) * iGamma2 + kPlus05);
                const cosine = cosines[rotation];
                const sine = sines[rotation];
                const h = cosine * x + sine * y;
                y = -sine * x + cosine * y;
                x = h;
                if (y < 0) {
                    y = -y;
                    structure = 1 - structure;
                }
                xArray[index] = x;
                yArray[index] = y;
                structureArray[index] = structure;
            }
        }
    }
};