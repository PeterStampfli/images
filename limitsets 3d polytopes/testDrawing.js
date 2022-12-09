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

    const s1 = new Sphere(0, 0, 0, 1.5);
    const s2 = new Sphere(3, 0, 1, 1);
    const s3 = new Sphere(1, 0, 0, 1);
    const thing = extra.triplett(s1, s2, s3);
    s1.drawProjection(thing.normalX,thing.normalY,thing.normalZ);
    s2.drawProjection(thing.normalX,thing.normalY,thing.normalZ);
    s3.drawProjection(thing.normalX,thing.normalY,thing.normalZ);
/*
const line=new Line(1,3,1,1,1,0);

const thing=s1.invertLine(line);

    s1.drawProjection(thing.normalX,thing.normalY,thing.normalZ);
    line.drawProjection(thing.normalX,thing.normalY,thing.normalZ);
*/
    thing.drawProjection(thing.normalX,thing.normalY,thing.normalZ);

    output.drawGrid();
}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#eeeeee');