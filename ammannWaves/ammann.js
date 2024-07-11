// doing the ammann beenker tiling using iteration methods ..
//drawing lines

// ammann beenker tiling

import {
    Vector2
}
from "../mappings/vector2.js";

import {
    DrawingLines
}
from "../mappings/drawingLines.js";

export const ammann = {};

const rt2 = Math.sqrt(2);
const angle = Math.PI / 4;
const tanPi8 = Math.tan(Math.PI / 8);
const ratio = 1 / (1 + Math.sqrt(2));
const hypoRatio = 1 / (rt2 + 2);

ammann.maxIterations=4;
ammann.side=1500;

ammann.lines = new DrawingLines();

/*
 * creating the lattice
 */

ammann.start = function() {
    ammann.lines.clear();
    const side=ammann.side;
    const zero = new Vector2(0, 0);
    const rhomb1Right = new Vector2(side * (1 + 1 / rt2), side / rt2);
    const rhomb2Right = new Vector2(side * (1 + rt2), 0);
    const rhomb2Left = new Vector2(rhomb1Right.x, rhomb1Right.x);
    const rhomb1Bottom = new Vector2(side, 0);
    const rhomb1Top = new Vector2(side / rt2, side / rt2);
    for (var i = 0; i < 8; i++) {
        ammann.rhomb(0, zero, rhomb1Right.clone());
        ammann.rhomb(0, rhomb2Right.clone(), rhomb2Left.clone());
        ammann.triangle(0, true, rhomb2Right.clone(), rhomb1Right.clone(), rhomb1Bottom.clone());
        ammann.triangle(0, false, rhomb2Left.clone(), rhomb1Right.clone(), rhomb1Top.clone());
        rhomb1Right.rotate45();
        rhomb2Right.rotate45();
        rhomb2Left.rotate45();
        rhomb1Bottom.rotate45();
        rhomb1Top.rotate45();
    }
};

ammann.rhomb = function(ite, left, right) {
    // create the corner points and add polygon to structure data
    const center = Vector2.center(left, right);
    const halfDiagonal = Vector2.difference(center, left);
    halfDiagonal.scale(tanPi8).rotate90();
    const top = Vector2.sum(center, halfDiagonal);
    const bottom = Vector2.difference(center, halfDiagonal);
    Vector2.toPool(halfDiagonal);
    if (ite < ammann.maxIterations) {
        // continue iteration, create more points
        const bottomLeft = Vector2.lerp(left, ratio, bottom);
        const topLeft = Vector2.lerp(left, ratio, top);
        const bottomRight = Vector2.lerp(right, ratio, bottom);
        const topRight = Vector2.lerp(right, ratio, top);
        const centerRatio = tanPi8 / (2 + tanPi8);
        const centerLeft = Vector2.lerp(center, centerRatio, left);
        const centerRight = Vector2.lerp(center, centerRatio, right);
        // tiles of the new generation
        ammann.rhomb(ite + 1, left, centerLeft);
        ammann.rhomb(ite + 1, bottom, top);
        ammann.rhomb(ite + 1, right, centerRight);
        ammann.triangle(ite + 1, true, bottom, centerLeft, bottomLeft);
        ammann.triangle(ite + 1, false, top, centerLeft, topLeft);
        ammann.triangle(ite + 1, false, bottom, centerRight, bottomRight);
        ammann.triangle(ite + 1, true, top, centerRight, topRight);
    } else {
        // end iteration, make an image tile
        ammann.lines.addParallelogram(angle, left, right);
    }
};

ammann.triangle = function(ite, counterclockwise, a, b, c) {
    if (ite < ammann.maxIterations) {
        //create points for the new generation
        const ab = Vector2.lerp(a, ratio, b);
        const bc = Vector2.lerp(b, ratio, c);
        const ac = Vector2.lerp(a, hypoRatio, c);
        const ca = Vector2.lerp(c, hypoRatio, a);
        const m = Vector2.center(a, c);
        const center = Vector2.lerp(b, 1 / (1 + 1 / rt2), m);
        // tiles of the new generation
        ammann.rhomb(ite + 1, a, center);
        ammann.rhomb(ite + 1, b, ca);
        ammann.triangle(ite + 1, counterclockwise, b, center, ab);
        ammann.triangle(ite + 1, !counterclockwise, ca, center, ac);
        ammann.triangle(ite + 1, counterclockwise, c, ca, bc);
        Vector2.toPool(m);
    } else {
        if (counterclockwise) {
            ammann.lines.addRegularHalfPolygon(4, a, b);
        } else {
            ammann.lines.addRegularHalfPolygon(4, c, b);
        }
    }
};

ammann.setup = function(gui) {
    gui.addParagraph('<strong>Ammann Beenker tiling</strong>'),
    gui.add({
        type: 'number',
        params: ammann,
        property: 'side',
        labelText: 'size',
        onChange: function() {
            ammann.draw();
        }
    }).add({
        type: 'number',
        params: ammann,
        step: 1,
        min: 0,
        property: 'maxIterations',
        labelText: 'ites',
        onChange: function() {
            ammann.draw();
        }
    });
}