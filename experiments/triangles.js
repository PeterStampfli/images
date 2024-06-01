/* jshint esversion:6 */

// quasiperiodic wave packets

import {
    julia,
    map,
    base
} from "./modules.js";

function cosTriangle(x) {
    x -= Math.floor(x);
    return (x < 0.5) ? 0.25 - x : -0.75 + x;
}

export const triangles = {};
triangles.symmetry = 4;
triangles.scale = 1;
triangles.transX = 0;
triangles.transY = 0;

triangles.setup = function(gui) {
    base.gui.add({
        type: 'number',
        params: triangles,
        property: 'symmetry',
        step: 1,
        min: 1,
        onChange: julia.drawNewStructure
    });
    base.gui.add({
        type: 'number',
        params: triangles,
        property: 'scale',
        onChange: julia.drawNewStructure
    });
    base.gui.add({
        type: 'number',
        params: triangles,
        property: 'transX',
        labelText: 'translation',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: triangles,
        property: 'transY',
        labelText: '',
        onChange: julia.drawNewStructure
    });
};

triangles.map = function() {
    const symmetry = triangles.symmetry;
    const scale = triangles.scale;
    const transX = triangles.transX;
    const transY = triangles.transY;
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

            let xNew = cosTriangle(x);
            let yNew = cosTriangle(x - 0.25);

            for (let n = 1; n < symmetry; n++) {
                const projection = x * cosines[n] + y * sines[n];

                xNew += cosTriangle(projection);
                yNew += cosTriangle(projection - 0.25);

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
            let xNew = 0;
            let yNew = 0;
            let projection = x;
            for (let n = 1; n < m; n++) {
                const nextProjection = x * cosines[n] + y * sines[n];

                xNew += cosTriangle(projection);
                yNew += cosTriangle(projection + nextProjection);

                projection = nextProjection;
            }

            xNew += cosTriangle(projection);
            yNew += cosTriangle(projection - x);

            xArray[index] = xNew;
            yArray[index] = yNew;
            structureArray[index] = (xNew > 0) ? 1 : 0;
        }
    }
};