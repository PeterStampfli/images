/* jshint esversion: 6 */

import {
    ParamGui,
    output,
    BooleanButton
}
from "../libgui/modules.js";

import {
    Sphere
}
from "./sphere.js";

import {
    Line
}
from "./line.js";

import {
    Circle
}
from "./circle.js";

import {
    extra
}
from "./extra.js";

const gui = new ParamGui({
    closed: false
});

output.createCanvas(gui, {
    name: 'canvas control',
});
const canvas = output.canvas;
const canvasContext = canvas.getContext('2d');

output.addCoordinateTransform();
output.addCursorposition();
output.setInitialCoordinates(0, 0, 10);
output.addGrid();


function draw() {
    output.correctYAxis();
    output.lineRound();
    output.fillCanvasBackgroundColor();
    output.setLineWidth(1);

    const s1 = new Sphere(0, 0, 0, 1);
    const s2 = new Sphere(3, 0, 0, 1);
    const s3 = new Sphere(10, 3, 0, 1);

    s1.drawProjection();
    s2.drawProjection();
    s3.drawProjection();

    const thing = extra.triplett(s1, s2, s3);
    thing.drawProjection();

    output.drawGrid();
}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#eeeeee');