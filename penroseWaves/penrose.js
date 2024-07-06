// penrose tiling with rhombs p3-tiling

import {
    DrawingLines
}
from "./drawingLines.js";

import {
    Vector2
}
from "./vector2.js";


export const penrose = {};

const largeAngle = Math.PI / 2.5;
const smallAngle = Math.PI / 5;
const ratio = 2 / (1 + Math.sqrt(5));
const centerRatio = ratio / 2 / Math.cos(smallAngle);

penrose.maxIterations=5;
penrose.side=4;

penrose.lines = new DrawingLines();

/*
 * creating the lattice lines
 */

penrose.start = function() {
    penrose.lines.clear();
    const zero = new Vector2(0, 0);
    const b1 = new Vector2(penrose.side, 0);
    const b2 = b1.clone().rotate72();
    const c = Vector2.sum(b1, b2);
    for (var i = 0; i < 5; i++) {
        penrose.fat(0, true, zero, b1.clone(), c);
        penrose.fat(0, false, zero, b2.clone(), c);
        b1.rotate72();
        b2.rotate72();
        c.rotate72();
    }
};

penrose.slim = function(ite, counterclockwise, a, b, c) {
    if (ite < penrose.maxIterations) {
        const ab = Vector2.lerp(b, ratio, a);
        penrose.fat(ite + 1, counterclockwise, c, ab, b);
        penrose.slim(ite + 1, counterclockwise, ab, c, a);
    } else {
        if (counterclockwise) {
            const corner = Vector2.sum(a, c).sub(b);
            penrose.lines.addParallelogram(smallAngle, b, corner);
        }
    }
};

penrose.fat = function(ite, counterclockwise, a, b, c) {
    if (ite < penrose.maxIterations) {
        const ba = Vector2.lerp(a, ratio, b);
        const ca = Vector2.lerp(c, centerRatio, a);
        penrose.fat(ite + 1, !counterclockwise, ca, ba, a);
        penrose.fat(ite + 1, counterclockwise, c, ca, b);
        penrose.slim(ite + 1, !counterclockwise, ba, ca, b);
    } else {
        if (counterclockwise) {
            penrose.lines.addParallelogram(largeAngle, a, c);

        }
    }
};

penrose.setup=function(gui){

gui.add({
    type: 'number',
    params: penrose,
    property: 'side',
    labelText: 'size',
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: penrose,
    step: 1,
    min: 0,
    property: 'maxIterations',
    labelText: 'ites',
    onChange: function() {
        draw();
    }
});}