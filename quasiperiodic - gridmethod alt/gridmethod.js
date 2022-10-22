/* jshint esversion: 6 */

import {
    output,
    ParamGui,
    BooleanButton
} from "../libgui/modules.js";

import {
    Line
} from "./line.js";

import {
    ParallelLines
} from "./parallelLines.js";

import {
    grid
} from "./grid.js";

import {
    Intersection
} from "./intersection.js";

export const main = {};
export const color = [];
export const lineColor = [];

main.drawLines = false;
main.drawBentLines = false;
main.drawArcs = false;
main.arcsFill = false;
main.overprint = 4;

main.nLines = 15;
main.offset = 0.0;
main.nFold = 7;

main.tile = true;
main.lineBorderColor = '#000000';
main.lineWidth = 8;
main.lineBorderWidth = 2;

main.rhombusSize = 0.3; // side length of rhombus
main.rhombusColor = '#008800';
main.rhombusLineWidth = 1;
main.drawIntersections = true;
main.fill = true;
main.generations = 1;
main.spacing = grid.equalSpacedLines;
main.double = true;

color.push('#000000');
color.push('#ff0000');
color.push('#00bb00');
color.push('#cccc00');
color.push('#4444ff');
color.push('#ff00ff');
color.push('#ffffff');
main.colorControllers = [];

lineColor.push('#0000dd');
lineColor.push('#880000');

main.setup = function() {
    // gui and output canvas
    const gui = new ParamGui({
        name: 'gridmethod',
        closed: false,
        booleanButtonWidth: 40
    });
    main.gui = gui;
    BooleanButton.greenRedBackground();
    // no background color, no transparency
    output.createCanvas(gui, true);
    output.addCoordinateTransform(false);
    output.setInitialCoordinates(0, 0, 3);
    output.backgroundColorController.setValueOnly('#999999');
    output.setBackground();
    output.saveType.setValueOnly('jpg');
    output.drawCanvasChanged = draw;
    output.drawImageChanged = draw;

    gui.add({
        type: 'number',
        params: main,
        property: 'lineWidth',
        labelText: 'grid line width',
        min: 0,
        onChange: draw
    }).add({
        type: 'number',
        params: main,
        property: 'lineBorderWidth',
        labelText: 'border width',
        min: 0,
        onChange: draw
    }).addHelp("Width for grid lines and Truchet lines. Border width is the width of borders for grid lines only.");

    gui.add({
        type: 'color',
        params: main,
        property: 'lineBorderColor',
        labelText: 'border color',
        onChange: draw
    }).addHelp("Color for the border of grid lines and for Truchet lines.");

    gui.add({
        type: 'color',
        params: lineColor,
        property: '0',
        labelText: 'color 1',
        onChange: draw
    }).addHelp('One of two colors for grid lines and for the fill of Truchet tilings.');

    gui.add({
        type: 'color',
        params: lineColor,
        property: '1',
        labelText: 'color 2',
        onChange: draw
    }).addHelp('The other of two colors for grid lines and for the fill of Truchet tilings.');

    gui.add({
        type: 'boolean',
        params: main,
        property: 'drawLines',
        labelText: 'grid lines',
        onChange: draw
    }).addHelp('Switch on/off drawing the lines of the grid.');

    gui.add({
        type: 'boolean',
        params: main,
        property: 'drawArcs',
        labelText: 'truchet lines',
        onChange: draw
    }).add({
        type: 'boolean',
        params: main,
        property: 'arcsFill',
        labelText: 'truchet fill',
        onChange: draw
    }).addHelp("Truchet tiling based on the quasiperiodic tiling. Draw the lines of this tiling. Draw the regions between the lines in the two colors choosen above.");

    gui.add({
        type: 'number',
        params: main,
        property: 'nFold',
        labelText: 'symmetry',
        step: 1,
        min: 3,
        max: 14,
        onChange: function() {
            create();
            draw();
        }
    }).addHelp('Determine the order of the rotational symmetry of the quasiperiodic tiling.');

    gui.add({
        type: 'number',
        params: main,
        property: 'offset',
        labelText: 'grid offset',
        onChange: function() {
            create();
            draw();
        }
    }).add({
        type: 'number',
        params: main,
        property: 'nLines',
        step: 2,
        min: 1,
        labelText: "lines",
        onChange: function() {
            create();
            draw();
        }
    }).addHelp('Choose the number of parallel grid lines. Use an offset for these lines with respect to the origin to modify the tiling. For the Penrose and Ammann-Beenker tilings use zero as offset.');

    gui.add({
        type: 'boolean',
        params: main,
        property: 'tile',
        labelText: 'make tiling',
        onChange: function() {
            create();
            draw();
        }
    }).addHelp('Switch on/off adjusting the position of the rhombi at grid line intersections to make a quasiperiodic rhombus tiling. Bends the grid lines.');

    gui.add({
        type: 'number',
        params: main,
        property: 'rhombusLineWidth',
        labelText: 'tile line width',
        min: 0,
        onChange: draw
    }).addHelp('Choose the width of lines at the border of rhombus tiles.');

    gui.add({
        type: 'color',
        params: main,
        property: 'rhombusColor',
        labelText: '',
        onChange: draw
    }).addHelp('Choose the color for the line at the border of tiles');

    gui.add({
        type: 'number',
        params: main,
        property: 'rhombusSize',
        labelText: 'tile size',
        onChange: function() {
            create();
            draw();
        }
    }).addHelp('Choose the size of the rhombus tiles relative to the spacing of grid lines.');

    gui.add({
        type: 'boolean',
        params: main,
        property: 'drawIntersections',
        labelText: 'tile lines',
        onChange: draw
    }).add({
        type: 'boolean',
        params: main,
        property: 'fill',
        labelText: 'tile fill',
        onChange: draw
    }).addHelp('Switch on/off the drawing of lines at the border of rhombus tiles and their fill color.');

    gui.addParagraph("colors for rhombus tiles");
    main.colorControllers.push(0);

    for (let i = 1; i < color.length; i++) {
        main.colorControllers.push(gui.add({
            type: 'color',
            params: color,
            property: i,
            labelText: '',
            onChange: draw
        }));
    }

    create();
    draw();
};

function create() {
    grid.spacing();
    // double grid for even order
    // for correct alternating colors of lines
    if ((main.nFold & 1) === 0) {
        const length = grid.linepositions.length;
        for (let i = 0; i < length; i++) {
            grid.linepositions.push(-grid.linepositions[i]);
        }
        grid.linepositions.sort();
    }
    grid.create();
    grid.makeTiling();
}

function draw() {
    output.correctYAxis();
    output.startDrawing();
    output.fillCanvas('#bbbbbb');
    output.canvasContext.lineCap = 'round';
    output.canvasContext.lineJoin = 'round';
    if (!main.arcsFill) {
        grid.drawIntersections();
    }
    if (main.drawLines && !main.arcsFill) {
        if (main.tile) {
            grid.drawBentLines();
        } else {
            grid.drawLines();
        }
    }
    if (main.arcsFill) {
        grid.fillBackgroundTruchet();
        grid.fillForegroundTruchet();
    }
    if (main.drawArcs || main.arcsFill) {
        grid.drawLinesTruchet();
    }
}