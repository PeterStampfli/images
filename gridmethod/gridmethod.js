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
    Grid
} from "./grid.js";

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
    const grid=Grid.createBasic(5,1);
    grid.makeIntersections();
const line=grid.getFirstLine();
    grid.sortIntersections();
line.intersections[0].set(0,0);
    line.adjust();

  //  grid.parallelLines[1].adjust();

    grid.drawLines();
     grid.drawIntersections();



}