/* jshint esversion: 6 */

import {
    output,
    ParamGui
} from "../libgui/modules.js";


import {
    Line
} from "./line.js";

import {
    ParallelLines
} from "./parallelLines.js";

import {
    Intersection
} from "./intersection.js";


export const main = {};

main.setup = function() {
    // gui and output canvas
    const gui = new ParamGui({
        name: 'gridmethod',
        closed: false,
        booleanButtonWidth: 40
    });
    main.gui = gui;
    // no background color, no transparency
    output.createCanvas(gui, true);
    output.addCoordinateTransform(false);
    output.setInitialCoordinates(0, 0, 3);
    output.backgroundColorController.setValueOnly('#999999');
    output.setBackground();
    output.saveType.setValueOnly('jpg');

    output.drawCanvasChanged = draw;
    output.drawImageChanged = draw;

    draw();
};

function draw(){
    output.correctYAxis();
    output.startDrawing();
    output.fillCanvas('#bbbbbb');
    output.canvasContext.lineCap = 'round';
    output.canvasContext.lineJoin = 'round';
    const line=new Line(0,1);
    const otherLine=new Line(Math.PI/2,1);
    console.log(line);
    line.draw();
    otherLine.draw();
    console.log(otherLine);
    const inter=new Intersection(line,otherLine);
    console.log(inter);
    inter.draw();
    const lines=ParallelLines.createSymmetricBundle(Math.PI/4,3);
    lines.draw();
    line.addIntersection(otherLine);
    console.log(line);

}