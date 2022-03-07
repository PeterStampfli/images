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
    const grid=Grid.createBasic(5);
    grid.makeIntersections();
    grid.drawLines();
    grid.shiftIntersections(1,1);
    grid.drawIntersections();
    grid.sortIntersections();
console.log(grid.sumIntersectionsX());
console.log(grid.numberOfIntersections());
const line=grid.getFirstLine();
line.intersections[10].set(2,3);
console.log(line.intersections[10])
console.log(line.indexAdjustedIntersection())
}