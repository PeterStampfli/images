/* jshint esversion:6 */

// quasiperiodic wave packets

import {
    julia,
    map
} from "./modules.js";

export const waves = {};
waves.symmetry = 5;
waves.offset = 0;
waves.scale = 1;
waves.transX = 0;
waves.transY = 0;
waves.structureOfX = true;
waves.brokenX = false;
waves.brokenY = false;

// the different wave packages

waves.nothing = function() {};

waves.regular = function() {
    const symmetry = waves.symmetry;
    const offset = waves.offset;
    const scale = waves.scale;
    const transX = waves.transX;
    const transY = waves.transY;
    const structureOfX = waves.structureOfX;
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
            let projection = x + offset;
            let xNew = Math.cos(projection);
            let yNew = Math.sin(projection);
            for (let n = 1; n < symmetry; n++) {
                const projection = x * cosines[n] + y * sines[n] + offset;
                xNew += Math.cos(projection);
                yNew += Math.sin(projection);
            }
            xNew = scale * xNew + transX;
            yNew = scale * yNew + transY;
            xArray[index] = xNew;
            yArray[index] = yNew;
            if (structureOfX) {
                structureArray[index] = (xNew > 0) ? 1 : 0;
            } else {
                structureArray[index] = (yNew > 0) ? 1 : 0;
            }
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
        if (waves.brokenX) {
            if (waves.brokenY) {
                for (let index = 0; index < nPixels; index++) {
                    let x = xArray[index];
                    let y = yArray[index];
                    let xNew = 0;
                    let yNew = 0;
                    let sign = 1;
                    let projection = x + offset;
                    for (let n = 1; n < m; n++) {
                        const nextProjection = x * cosines[n] + y * sines[n] + offset;
                        xNew += sign * Math.cos(projection);
                        yNew += sign * Math.cos(projection + nextProjection);
                        projection = nextProjection;
                        sign = -sign;
                    }
                    xNew += sign * Math.cos(projection);
                    yNew += sign * Math.cos(projection - x);
                    xNew = scale * xNew + transX;
                    yNew = scale * yNew + transY;
                    xArray[index] = xNew;
                    yArray[index] = yNew;
                    if (structureOfX) {
                        structureArray[index] = (xNew > 0) ? 1 : 0;
                    } else {
                        structureArray[index] = (yNew > 0) ? 1 : 0;
                    }
                }
            } else {
                for (let index = 0; index < nPixels; index++) {
                    let x = xArray[index];
                    let y = yArray[index];
                    let xNew = 0;
                    let yNew = 0;
                    let sign = 1;
                    let projection = x + offset;
                    for (let n = 1; n < m; n++) {
                        const nextProjection = x * cosines[n] + y * sines[n] + offset;
                        xNew += sign * Math.cos(projection);
                        yNew += Math.cos(projection + nextProjection);
                        projection = nextProjection;
                        sign = -sign;
                    }
                    xNew += sign * Math.cos(projection);
                    yNew += Math.cos(projection - x);
                    xNew = scale * xNew + transX;
                    yNew = scale * yNew + transY;
                    xArray[index] = xNew;
                    yArray[index] = yNew;
                    if (structureOfX) {
                        structureArray[index] = (xNew > 0) ? 1 : 0;
                    } else {
                        structureArray[index] = (yNew > 0) ? 1 : 0;
                    }
                }
            }
        } else {
            if (waves.brokenY) {
                for (let index = 0; index < nPixels; index++) {
                    let x = xArray[index];
                    let y = yArray[index];
                    let xNew = 0;
                    let yNew = 0;
                    let sign = 1;
                    let projection = x + offset;
                    for (let n = 1; n < m; n++) {
                        const nextProjection = x * cosines[n] + y * sines[n] + offset;
                        xNew += Math.cos(projection);
                        yNew += sign * Math.cos(projection + nextProjection);
                        projection = nextProjection;
                        sign = -sign;
                    }
                    xNew += Math.cos(projection);
                    yNew += sign * Math.cos(projection - x);
                    xNew = scale * xNew + transX;
                    yNew = scale * yNew + transY;
                    xArray[index] = xNew;
                    yArray[index] = yNew;
                    if (structureOfX) {
                        structureArray[index] = (xNew > 0) ? 1 : 0;
                    } else {
                        structureArray[index] = (yNew > 0) ? 1 : 0;
                    }
                }
            } else {
   for (let index = 0; index < nPixels; index++) {
                    let x = xArray[index];
                    let y = yArray[index];
                    let xNew = 0;
                    let yNew = 0;
                    let projection = x + offset;
                    for (let n = 1; n < m; n++) {
                        const nextProjection = x * cosines[n] + y * sines[n] + offset;
                        xNew +=  Math.cos(projection);
                        yNew +=  Math.cos(projection + nextProjection);
                        projection = nextProjection;
                    }
                    xNew +=  Math.cos(projection);
                    yNew +=  Math.cos(projection - x);
                    xNew = scale * xNew + transX;
                    yNew = scale * yNew + transY;
                    xArray[index] = xNew;
                    yArray[index] = yNew;
                    if (structureOfX) {
                        structureArray[index] = (xNew > 0) ? 1 : 0;
                    } else {
                        structureArray[index] = (yNew > 0) ? 1 : 0;
                    }
                }
            }
        }
    }
};

waves.product = function() {
    const symmetry = waves.symmetry;
    const offset = waves.offset;
    const scale = waves.scale;
    const transX = waves.transX;
    const transY = waves.transY;
    const structureOfX = waves.structureOfX;
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
            let projection = x + offset;
            let xNew = Math.cos(projection);
            let yNew = Math.sin(projection);
            for (let n = 1; n < symmetry; n++) {
                const projection = x * cosines[n] + y * sines[n] + offset;
                xNew *= Math.cos(projection);
                yNew *= Math.sin(projection);
            }
            xNew = scale * xNew + transX;
            yNew = scale * yNew + transY;
            xArray[index] = xNew;
            yArray[index] = yNew;
            if (structureOfX) {
                structureArray[index] = (xNew > 0) ? 1 : 0;
            } else {
                structureArray[index] = (yNew > 0) ? 1 : 0;
            }
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
            let x = xArray[index];
            let y = yArray[index];
            let xNew = 1;
            let yNew = 1;
            let projection = x + offset;
            for (let n = 1; n < m; n++) {
                const nextProjection = x * cosines[n] + y * sines[n] + offset;
                xNew *= Math.cos(projection);
                yNew *= Math.cos(projection + nextProjection);
                projection = nextProjection;
            }
            xNew *= Math.cos(projection);
            yNew *= Math.cos(projection - x);
            xNew = scale * xNew + transX;
            yNew = scale * yNew + transY;
            xArray[index] = xNew;
            yArray[index] = yNew;
            if (structureOfX) {
                structureArray[index] = (xNew > 0) ? 1 : 0;
            } else {
                structureArray[index] = (yNew > 0) ? 1 : 0;
            }
        }
    }
};

waves.sumOfSines = function() {
    const symmetry = waves.symmetry;
    const offset = waves.offset;
    const scale = waves.scale;
    const transX = waves.transX;
    const transY = waves.transY;
    const structureOfX = waves.structureOfX;
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
            let xNew = 0;
            let yNew = 0;
            let projection = x + offset;
            for (let n = 1; n < symmetry; n++) {
                const nextProjection = x * cosines[n] + y * sines[n] + offset;
                xNew += Math.sin(projection);
                yNew += Math.sin(projection + nextProjection);
                projection = nextProjection;
            }
            xNew += Math.sin(projection);
            yNew += Math.sin(projection + x);
            xNew = scale * xNew + transX;
            yNew = scale * yNew + transY;
            xArray[index] = xNew;
            yArray[index] = yNew;
            if (structureOfX) {
                structureArray[index] = (xNew > 0) ? 1 : 0;
            } else {
                structureArray[index] = (yNew > 0) ? 1 : 0;
            }
        }
    }
};


waves.productOfSines = function() {
    const symmetry = waves.symmetry;
    const offset = waves.offset;
    const scale = waves.scale;
    const transX = waves.transX;
    const transY = waves.transY;
    const structureOfX = waves.structureOfX;
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
            let xNew = 1;
            let yNew = 1;
            let projection = x + offset;
            for (let n = 1; n < symmetry; n++) {
                const nextProjection = x * cosines[n] + y * sines[n] + offset;
                xNew *= Math.sin(projection);
                yNew *= Math.sin(projection + nextProjection);
                projection = nextProjection;
            }
            xNew *= Math.sin(projection);
            yNew *= Math.sin(projection + x);
            xNew = scale * xNew + transX;
            yNew = scale * yNew + transY;
            xArray[index] = xNew;
            yArray[index] = yNew;
            if (structureOfX) {
                structureArray[index] = (xNew > 0) ? 1 : 0;
            } else {
                structureArray[index] = (yNew > 0) ? 1 : 0;
            }
        }
    }
};

waves.sumSimpleCos = function() {
    const symmetry = waves.symmetry;
    const offset = waves.offset;
    const scale = waves.scale;
    const transX = waves.transX;
    const transY = waves.transY;
    const structureOfX = waves.structureOfX;
    const sines = [];
    const cosines = [];
    var dAngle;
    const xArray = map.xArray;
    const nPixels = xArray.length;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    sines.length = symmetry;
    cosines.length = symmetry;
    dAngle = 0.5 * Math.PI / symmetry;
    let s2 = 2 * symmetry;
    for (let n = 0; n < s2; n++) {
        sines[n] = Math.sin(n * dAngle);
        cosines[n] = Math.cos(n * dAngle);
    }
    for (let index = 0; index < nPixels; index++) {
        let x = xArray[index];
        let y = yArray[index];
        let xNew = 0;
        let yNew = 0;
        for (let n = 0; n < s2; n += 2) {
            xNew += Math.cos(x * cosines[n] + y * sines[n] + offset);
            yNew += Math.cos(x * cosines[n + 1] + y * sines[n + 1] + offset);
        }
        xNew = scale * xNew + transX;
        yNew = scale * yNew + transY;
        xArray[index] = xNew;
        yArray[index] = yNew;
        if (structureOfX) {
            structureArray[index] = (xNew > 0) ? 1 : 0;
        } else {
            structureArray[index] = (yNew > 0) ? 1 : 0;
        }
    }
};

waves.prodSimpleCos = function() {
    const symmetry = waves.symmetry;
    const offset = waves.offset;
    const scale = waves.scale;
    const transX = waves.transX;
    const transY = waves.transY;
    const structureOfX = waves.structureOfX;
    const sines = [];
    const cosines = [];
    var dAngle;
    const xArray = map.xArray;
    const nPixels = xArray.length;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    sines.length = symmetry;
    cosines.length = symmetry;
    dAngle = 0.5 * Math.PI / symmetry;
    let s2 = 2 * symmetry;
    for (let n = 0; n < s2; n++) {
        sines[n] = Math.sin(n * dAngle);
        cosines[n] = Math.cos(n * dAngle);
    }
    for (let index = 0; index < nPixels; index++) {
        let x = xArray[index];
        let y = yArray[index];
        let xNew = 1;
        let yNew = 1;
        for (let n = 0; n < s2; n += 2) {
            xNew *= Math.cos(x * cosines[n] + y * sines[n] + offset);
            yNew *= Math.cos(x * cosines[n + 1] + y * sines[n + 1] + offset);
        }
        xNew = scale * xNew + transX;
        yNew = scale * yNew + transY;
        xArray[index] = xNew;
        yArray[index] = yNew;
        if (structureOfX) {
            structureArray[index] = (xNew > 0) ? 1 : 0;
        } else {
            structureArray[index] = (yNew > 0) ? 1 : 0;
        }
    }
};

waves.type = waves.regular;

waves.setup = function(gui) {
    gui.add({
        type: 'number',
        params: waves,
        property: 'symmetry',
        step: 1,
        min: 1,
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: waves,
        property: 'offset',
        onChange: julia.drawNewStructure
    }).add({
        type: 'selection',
        params: waves,
        property: 'type',
        options: {
            'regular sum': waves.regular,
            'regular prod': waves.product,
            'sum of sines': waves.sumOfSines,
            'prod of sines': waves.productOfSines,
            'sum simple cos': waves.sumSimpleCos,
            'prod simple cos': waves.prodSimpleCos,
            'nothing': waves.nothing
        },
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: waves,
        property: 'scale',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: waves,
        property: 'transX',
        labelText: 'trans x',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: waves,
        property: 'transY',
        labelText: 'y',
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'boolean',
        params: waves,
        property: 'structureOfX',
        labelText: 'structure of x',
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'boolean',
        params: waves,
        property: 'brokenX',
        labelText: 'break x',
        onChange: julia.drawNewStructure
    }).add({
        type: 'boolean',
        params: waves,
        property: 'brokenY',
        labelText: 'y',
        onChange: julia.drawNewStructure
    });
};

waves.map = function() {
    waves.type();
};