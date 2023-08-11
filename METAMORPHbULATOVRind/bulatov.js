/* jshint esversion:6 */

import {
    map,
    julia
} from "./mapImage.js";

import {
    kaleidoscope
} from "./kaleidoscope.js";

import {
    Pixels,
    output,
    CoordinateTransform,
    MouseEvents,
    keyboard
} from "../libgui/modules.js";

export const bulatov = {};
bulatov.xDrift = 0;
bulatov.yDrift = 0;
bulatov.xDrift2 = 0;
bulatov.yDrift2 = 0;
bulatov.n = 5;


bulatov.setup = function(gui) {
    gui.addParagraph('<strong>bulatov</strong>');
    bulatov.type = bulatov.nothing;
    gui.add({
        type: 'selection',
        params: bulatov,
        property: 'type',
        options: {
            nothing: bulatov.nothing,
            map: bulatov.map
        },
        onChange: function() {
            julia.drawNewStructure();
        }
    });

    gui.add({
        type: 'number',
        params: bulatov,
        property: 'n',
        onChange: julia.drawNewStructure
    });

    gui.add({
        type: 'number',
        params: bulatov,
        property: 'xDrift',
        labelText: 'drift x lin',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: bulatov,
        property: 'xDrift2',
        labelText: 'sq',
        onChange: julia.drawNewStructure
    });
    gui.add({
        type: 'number',
        params: bulatov,
        property: 'yDrift',
        labelText: 'drift y lin',
        onChange: julia.drawNewStructure
    }).add({
        type: 'number',
        params: bulatov,
        property: 'yDrift2',
        labelText: 'sq',
        onChange: julia.drawNewStructure
    });
};

bulatov.nothing = function() {
    getBulatovPeriod();
    console.log(bulatov.period);
};

// calculate width of Bulatov Oval depending on the
// geometry parameter k, m, n
//  k is order of dihedral symmetry at center, pi/k the angle between the
//  straight mirror lines (x-axis and oblique line), k<=100 !
//  m is order of dihedral symmetry arising at the oblique line
//  and the third side of the triangle (circle or straight line), angle pi/n
//  n is order of dihedral symmetry arising at x-axis, the geometry has to be hyperbolic

function getBulatovPeriod() {
    const k = kaleidoscope.k;
    const m = kaleidoscope.m;
    const n = 2;
    const gamma = Math.PI / k;
    const alpha = Math.PI / n;
    const beta = Math.PI / m;
    const angleSum = 1 / k + 1 / n + 1 / m;
    if (angleSum > 0.999) {
        console.error("getBulatovPeriod: Geometry has to be hyperbolic, it isn't.");
        return -1;
    }
    // assuming circle r=1, circle is on x-axis
    let center = Math.cos(beta) / Math.sin(gamma);
    // renormalize to poincare radius 1 (devide by poincare radius)
    const radius = 1 / Math.sqrt(center * center - 1);
    center = radius * center;
    if ((k % 2) === 0) {
        bulatov.period = 8 / Math.PI * Math.atanh(center - radius);
    } else {
        // intersection of circle with oblique line
        const angle = Math.PI * (0.5 - 1 / k - 1 / m);
        const a = Math.sqrt(center * center + radius * radius - 2 * center * radius * Math.cos(angle));
        bulatov.period = 8 / Math.PI * (Math.atanh(center - radius) + Math.atanh(a));
    }
}

// the simple band transform using periodicity
bulatov.map = function() {
    getBulatovPeriod();
    if (bulatov.period < 0) {
        return;
    }
    const period = bulatov.period;
    const a = 1;
    const angFactor = bulatov.n / 2 / Math.PI * period;
    console.log('angFactor', angFactor);
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


bulatov.drift = function() {
    const xDrift = bulatov.xDrift;
    const yDrift = bulatov.yDrift;
    let scale = output.coordinateTransform.totalScale;
    let shiftX = output.coordinateTransform.shiftX;
    let shiftY = output.coordinateTransform.shiftY;
    let index = 0;
    const xArray = map.xArray;
    const yArray = map.yArray;
    let y = shiftY;
    for (var j = 0; j < map.height; j++) {
        let x = shiftX;
        for (var i = 0; i < map.width; i++) {
            const r = Math.hypot(x, y);
            xArray[index] -= xDrift * y;
            yArray[index] += xDrift * x;
            index += 1;
            x += scale;
        }
        y += scale;
    }
};