// doing the stampfli tiling with 12 fold rotational symmetry using iteration methods ..

import {
    DrawingLines
}
from "../mappings/drawingLines.js";

import {
    Vector2
}
from "../mappings/vector2.js";

export const stampfli = {};

const rt3 = Math.sqrt(3);
const rt32 = rt3 / 2;
const angle = Math.PI / 6;
const ratio = 1 / (2 + rt3);
const tanPI12 = Math.tan(Math.PI / 12);


stampfli.maxIterations = 2;
stampfli.side = 702;

stampfli.lines = new DrawingLines();

/*
 * creating the lattice
 */

// starting the iteration with a dodecagon
stampfli.start = function() {
    stampfli.lines.clear();
    const side=stampfli.side;
    const zero = new Vector2(0, 0);
    const bottom = new Vector2(side, 0);
    const top = bottom.clone().rotate30();
    const right = new Vector2(side * (1 + rt32), side * 0.5);
    const rightMirrored = new Vector2(side * (1 + rt32), -side * 0.5);
    const extra = new Vector2(side * (1 + 2 * rt32), 0);
    const extraRotated = extra.clone().rotate30();
    for (var i = 0; i < 12; i++) {
        stampfli.rhomb(0, zero, right);
        stampfli.triangle(0, bottom, rightMirrored, right);
        stampfli.triangle(0, rightMirrored, extra, right);
        stampfli.square(0, extra, extraRotated);
        bottom.rotate30();
        top.rotate30();
        right.rotate30();
        rightMirrored.rotate30();
        extra.rotate30();
        extraRotated.rotate30();
    }
};

stampfli.rhomb = function(ite, left, right) {
    // create the corner points
    const center = Vector2.center(left, right);
    const halfDiagonal = Vector2.difference(center, left);
    halfDiagonal.scale(tanPI12).rotate90();
    const top = Vector2.sum(center, halfDiagonal);
    const bottom = Vector2.difference(center, halfDiagonal);
    Vector2.toPool(halfDiagonal);
    if (ite < stampfli.maxIterations) {
        // continue iteration, create more points
        const er = Vector2.difference(bottom, left).scale(ratio);
        const er2 = er.clone().rotateM30();
        const el = Vector2.difference(top, left).scale(ratio);
        const el2 = el.clone().rotate30();
        const leftBottom = Vector2.sum(left, er);
        const leftCenter = Vector2.sum(leftBottom, el);
        stampfli.rhomb(ite + 1, left, leftCenter);
        stampfli.triangle(ite + 1, leftBottom, Vector2.sum(leftBottom, er2), leftCenter);
        const topLeft = Vector2.difference(top, el);
        stampfli.triangle(ite + 1, leftCenter, topLeft, Vector2.difference(topLeft, er));
        const bottomLeft = Vector2.sum(leftCenter, er2);
        const centerLeft = Vector2.sum(bottomLeft, el2);
        stampfli.square(ite + 1, leftCenter, centerLeft);
        stampfli.triangle(ite + 1, bottomLeft, bottom, centerLeft);
        stampfli.triangle(ite + 1, topLeft, centerLeft, top);
        stampfli.rhomb(ite + 1, top, bottom);
        const topRight = Vector2.sum(top, er);
        const centerRight = Vector2.difference(topRight, el2);
        stampfli.triangle(ite + 1, top, centerRight, topRight);
        const bottomRight = Vector2.sum(bottom, el);
        stampfli.triangle(ite + 1, bottom, bottomRight, centerRight);
        const rightCenter = Vector2.sum(topRight, er2);
        stampfli.square(ite + 1, centerRight, rightCenter);
        stampfli.triangle(ite + 1, bottomRight, Vector2.sum(bottomRight, er), rightCenter);
        stampfli.rhomb(ite + 1, right, rightCenter);
        stampfli.triangle(ite + 1, rightCenter, Vector2.difference(right, er), Vector2.sum(topRight, el));
    } else {
        // end iteration, make an image tile
        stampfli.lines.addParallelogram(angle, left, right);
    }
};

stampfli.triangle = function(ite, a, b, c) {
    if (ite < stampfli.maxIterations) {
        // continue iteration, create more points
        const ab = Vector2.lerp(a, ratio, b);
        const er = Vector2.difference(ab, a);
        const er2 = er.clone().rotateM30();
        const e = er.clone().rotate30();
        const el = e.clone().rotate30();
        const el2 = el.clone().rotate30();
        const ac = Vector2.sum(el, a);
        const am = Vector2.sum(e, a);
        const mc = Vector2.sum(er, am);
        const mb = Vector2.sum(el, am);
        stampfli.rhomb(ite + 1, a, mc);
        stampfli.rhomb(ite + 1, a, mb);
        stampfli.triangle(ite + 1, am, mc, mb);
        const caOut = Vector2.difference(mb, er2);
        const ca = Vector2.sum(caOut, e);
        stampfli.triangle(ite + 1, mb, ca, caOut);
        stampfli.rhomb(ite + 1, c, mb);
        const cm = Vector2.sum(el, mb);
        const ma = Vector2.sum(mb, er);
        stampfli.rhomb(ite + 1, c, ma);
        stampfli.triangle(ite + 1, cm, mb, ma);
        stampfli.triangle(ite + 1, ma, mb, mc);
        stampfli.triangle(ite + 1, ma, Vector2.sum(ma, er2), Vector2.sum(ma, e));
        stampfli.rhomb(ite + 1, b, ma);
        stampfli.rhomb(ite + 1, b, mc);
        stampfli.triangle(ite + 1, ma, mc, Vector2.sum(mc, er));
        stampfli.triangle(ite + 1, mc, ab, Vector2.sum(ab, er2));
    } else {
        // end iteration, make an image tile
        stampfli.lines.addRegularPolygon(3, a, b);
    }
};

stampfli.square = function(ite, left, right) {
    // create the corner points
    const center = Vector2.center(left, right);
    const halfDiagonal = Vector2.difference(center, left);
    halfDiagonal.rotate90();
    const top = Vector2.sum(center, halfDiagonal);
    const bottom = Vector2.difference(center, halfDiagonal);
    Vector2.toPool(halfDiagonal);
    if (ite < stampfli.maxIterations) {
        // continue iteration, create more points
        const leftBottom = Vector2.lerp(left, ratio, bottom);
        const er2 = Vector2.difference(leftBottom, left);
        const er = er2.clone().rotate30();
        const el = er.clone().rotate30();
        const el2 = el.clone().rotate30();
        const leftTop = Vector2.sum(left, el2);
        const bottomLeft = Vector2.difference(bottom, er2);
        const topLeft = Vector2.difference(top, el2);
        const topRight = Vector2.sum(top, er2);
        const rightTop = Vector2.difference(right, er2);
        const bottomRight = Vector2.sum(bottom, el2);
        const rightBottom = Vector2.difference(right, el2);
        const leftBottomCenter = Vector2.sum(leftBottom, er);
        const centerBottom = Vector2.sum(leftBottomCenter, el);
        const rightBottomCenter = Vector2.sum(centerBottom, er);
        const centerRight = Vector2.sum(centerBottom, el2);
        const centerLeft = Vector2.difference(centerBottom, er2);
        const centerTop = Vector2.sum(centerLeft, el2);
        const rightTopCenter = Vector2.sum(centerTop, el);
        const leftTopCenter = Vector2.sum(leftTop, el);
        stampfli.rhomb(ite + 1, left, leftBottomCenter);
        stampfli.rhomb(ite + 1, left, centerLeft);
        stampfli.rhomb(ite + 1, left, leftTopCenter);
        stampfli.triangle(ite + 1, leftBottom, Vector2.difference(leftBottomCenter, el2), leftBottomCenter);
        stampfli.triangle(ite + 1, centerLeft, leftTopCenter, Vector2.difference(leftTopCenter, el2));
        stampfli.triangle(ite + 1, centerLeft, Vector2.difference(leftBottomCenter, er2), leftBottomCenter);
        stampfli.rhomb(ite + 1, centerBottom, bottom);
        stampfli.rhomb(ite + 1, leftBottomCenter, bottom);
        stampfli.rhomb(ite + 1, rightBottomCenter, bottom);
        stampfli.triangle(ite + 1, bottomRight, Vector2.sum(rightBottomCenter, er2), rightBottomCenter);
        stampfli.triangle(ite + 1, centerBottom, leftBottomCenter, Vector2.sum(leftBottomCenter, er2));
        stampfli.triangle(ite + 1, centerBottom, Vector2.difference(rightBottomCenter, el2), rightBottomCenter);
        stampfli.rhomb(ite + 1, right, rightBottomCenter);
        stampfli.rhomb(ite + 1, right, centerRight);
        stampfli.rhomb(ite + 1, right, rightTopCenter);
        stampfli.triangle(ite + 1, rightTopCenter, rightTop, Vector2.sum(rightTopCenter, el2));
        stampfli.triangle(ite + 1, centerRight, rightBottomCenter, Vector2.sum(rightBottomCenter, el2));
        stampfli.triangle(ite + 1, centerRight, Vector2.sum(centerRight, el), rightTopCenter);
        stampfli.rhomb(ite + 1, top, rightTopCenter);
        stampfli.rhomb(ite + 1, top, centerTop);
        stampfli.rhomb(ite + 1, top, leftTopCenter);
        stampfli.triangle(ite + 1, topLeft, Vector2.difference(topLeft, el), leftTopCenter);
        stampfli.triangle(ite + 1, centerTop, Vector2.sum(leftTopCenter, el2), leftTopCenter);
        stampfli.triangle(ite + 1, centerTop, rightTopCenter, Vector2.difference(rightTopCenter, er2));
        stampfli.square(ite + 1, centerLeft, centerRight);
        stampfli.triangle(ite + 1, centerBottom, centerLeft, leftBottomCenter);
        stampfli.triangle(ite + 1, centerRight, centerBottom, rightBottomCenter);
        stampfli.triangle(ite + 1, centerRight, rightTopCenter, centerTop);
        stampfli.triangle(ite + 1, centerTop, leftTopCenter, centerLeft);
        Vector2.toPool(top, bottom);
        Vector2.toPool(leftBottom, er2, er, el, el2, leftTop, bottomLeft);
        Vector2.toPool(topLeft, topRight, rightTop, bottomRight, rightBottom);
        Vector2.toPool(leftBottomCenter, centerBottom, rightBottomCenter, centerRight, centerLeft, centerTop, rightTopCenter, leftTopCenter);
    } else {
        // end iteration, make an image tile
        stampfli.lines.addRegularPolygon(4, left, bottom);
    }
};

stampfli.setup = function(gui) {
    gui.addParagraph('<strong>stampfli tiling</strong>'),
    gui.add({
        type: 'number',
        params: stampfli,
        property: 'side',
        labelText: 'size',
        onChange: function() {
            stampfli.draw();
        }
    }).add({
        type: 'number',
        params: stampfli,
        step: 1,
        min: 0,
        property: 'maxIterations',
        labelText: 'ites',
        onChange: function() {
            stampfli.draw();
        }
    });
}