/* jshint esversion: 6 */

import {
    SVG,
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

main.scale = 600;
main.overprint = 4;

main.nLines = 15;
main.offset = 0.0;
main.nFold = 5;

main.tile = true;
main.lineColor = '#000000';
main.lineWidth = 8;

main.rhombusSize = 0.3; // side length of rhombus
main.rhombusColor = '#008800';
main.rhombusLineWidth = 8;
main.drawTiles = true;
main.fill = false;
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
    // gui and svg
    const gui = new ParamGui({
        name: 'gridmethod',
        closed: false,
        booleanButtonWidth: 40
    });
    main.gui = gui;

    SVG.makeGui(gui);
    SVG.init();
    BooleanButton.greenRedBackground();
    // no background color, no transparency
    gui.add({
        type: 'number',
        params: main,
        property: 'scale',
        min: 0,
        onChange: function() {
            create();
            draw();
        }
    });

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
        type: 'number',
        params: main,
        property: 'rhombusLineWidth',
        labelText: 'tile line width',
        min: 0,
        onChange: draw
    }).add({
        type: 'boolean',
        params: main,
        property: 'drawTiles',
        labelText: 'tile lines',
        onChange: draw
    });

    gui.add({
        type: 'color',
        params: main,
        property: 'rhombusColor',
        labelText: '',
        onChange: draw
    }).addHelp('Choose the color for the line at the border of tiles');

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
    SVG.draw = draw;
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

/*
    const length = main.colorControllers.length;
    for (let i = 1; i < length; i++) {
        main.colorControllers[i].hide();
    }
    for (let i = 1; i <= grid.nRhombi; i++) {
        main.colorControllers[i].show();
    }
*/

function draw() {
    SVG.begin();
    SVG.groupAttributes = {
        transform: 'scale(1 -1)',
        fill: 'none',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
    };

    SVG.groupAttributes.fill = 'none';
    SVG.groupAttributes.stroke = 'none';
    if (main.drawTiles) {
        SVG.groupAttributes.stroke = main.rhombusColor;
        SVG.groupAttributes['stroke-width'] = main.rhombusLineWidth;
        SVG.createGroup(SVG.groupAttributes);
        grid.drawTiles();
    }



    SVG.terminate();
}