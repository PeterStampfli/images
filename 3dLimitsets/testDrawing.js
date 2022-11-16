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

    const s=new Sphere(0,2.1,2.1,3);
    const t=new Sphere(0,0,0,3);
    t.drawProjection(0,0,1);
    s.drawProjection(0,0.7,0.7);
    const l=new Line(0,1,1,0,1,1);
    l.drawProjection(1,0,0);


    output.drawGrid();
}

output.setDrawMethods(draw);
output.backgroundColorController.setValue('#eeeeee');