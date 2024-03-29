/* jshint esversion:6 */

// simple bulatov band
// using periodicity

import {
    julia,
    map,
    base,
    kaleidoscope
} from "./modules.js";

export const bulatov = {};

bulatov.on = true;

bulatov.setup = function() {
    base.gui.addParagraph('<strong>bulatov</strong>');
    base.gui.add({
        type: 'boolean',
        params: bulatov,
        property: 'on',
        onChange: function() {
            julia.drawNewStructure();
        }
    });
};

// calculate width of Bulatov Oval depending on the
// geometry parameter k, m, n
//  k is order of dihedral symmetry at center, pi/k the angle between the
//  straight mirror lines (x-axis and oblique line), k<=100 !
//  m is order of dihedral symmetry arising at the oblique line
//  and the third side of the triangle (circle or straight line), angle pi/n
//  n is order of dihedral symmetry arising at x-axis, the geometry has to be hyperbolic

bulatov.getPeriod = function(k, m) {
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
    // radius and center define the inverting circle
    if ((k % 2) === 0) {
            return 8 / Math.PI * Math.atanh(center - radius);
    } else {
        // intersection of circle with oblique line
        let angle = Math.PI * (0.5 - 1 / k - 1 / m);
        const a = Math.sqrt(center * center + radius * radius - 2 * center * radius * Math.cos(angle));
        // a is the distance from origin to the intersection
        if ((m % 2) === 0) {
            return 8 / Math.PI * (Math.atanh(center - radius) + Math.atanh(a));
        } else {
            if (m>3){
                console.error("getBulatovPeriod: k and m are odd, and m > 3, not implemented");
                return -1;
            }
            // both are odd, map the rotated intersection point
            let px = a * Math.cos(3 * gamma);
            let py = a * Math.sin(3 * gamma);
            // invert at circle
            px = px - center;
            const factor = radius * radius / (px * px + py * py);
            px = center + factor * px;
            py = factor * py;
            // distance to origin gives period limit at left
            const pLeft = Math.hypot(px, py);
            // at the right, invert (a,0) to (pRight,0)
            const pRight = center - radius * radius / (a + center);
            // map and put together
            return 4 / Math.PI * (Math.atanh(pLeft) + Math.atanh(pRight));
        }
    }
};

// the simple band transform using periodicity
bulatov.map = function() {
    if (!bulatov.on) {
        return;
    }
    const period = bulatov.getPeriod(kaleidoscope.k, kaleidoscope.m);
    if (period < 0) {
        return;
    }
    const a = 1;
    const piA2 = Math.PI * a / 2;
    const iTanPiA4 = 1.0 / Math.tan(Math.PI * a / 4);
    const xArray = map.xArray;
    const yArray = map.yArray;
    const structureArray = map.structureArray;
    const nPixels = xArray.length;
    for (var index = 0; index < nPixels; index++) {
        if (structureArray[index] < 128) {
            let y = yArray[index];
            if (Math.abs(y) > 1) {
                structureArray[index] = 128;
            } else {
                let x = xArray[index];
                const nPeriods = Math.floor(x / period);
                x = piA2 * (x - period * nPeriods);
                y *= piA2;
                const exp2x = Math.exp(x);
                const base = iTanPiA4 / (exp2x + 1.0 / exp2x + 2 * Math.cos(y));
                xArray[index] = (exp2x - 1.0 / exp2x) * base;
                yArray[index] = 2 * Math.sin(y) * base;
            }
        }
    }
};