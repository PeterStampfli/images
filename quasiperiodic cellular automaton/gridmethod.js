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

main.scale = 200;
main.overprint = 4;

main.nLines = 15;
main.offset = 0.0;
main.nFold = 5;
main.nStates = 1;

main.tileLineColor = '#008800';
main.tileLineWidth = 8;
main.drawTiles = true;
main.cellLineColor = '#0000bb';
main.cellLineWidth = 8;
main.drawCellLines = true;

color.push('#000000');
color.push('#00aaaa');
color.push('#4444ff');
color.push('#ff00ff');
color.push('#ff4444');
color.push('#ff8800');
color.push('#ffff00');
color.push('#88ff88');
main.colorControllers = [];

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
        property: 'tileLineWidth',
        labelText: 'tile line width',
        min: 0,
        onChange: draw
    }).add({
        type: 'boolean',
        params: main,
        property: 'drawTiles',
        labelText: '',
        onChange: draw
    });

    gui.add({
        type: 'color',
        params: main,
        property: 'tileLineColor',
        labelText: '',
        onChange: draw
    }).addHelp('Choose the color for the line at the border of tiles');

    gui.add({
        type: 'number',
        params: main,
        property: 'cellLineWidth',
        labelText: 'cell line width',
        min: 0,
        onChange: draw
    }).add({
        type: 'boolean',
        params: main,
        property: 'drawCellLines',
        labelText: '',
        onChange: draw
    });

    gui.add({
        type: 'color',
        params: main,
        property: 'cellLineColor',
        labelText: '',
        onChange: draw
    }).addHelp('Choose the color for the line at the border of tiles');

    gui.add({
        type: 'number',
        params: main,
        property: 'nStates',
        labelText: 'states',
        step: 1,
        min: 1,
        max: color.length - 1,
        onChange: function() {
            create();
            draw();
        }
    });

    gui.addParagraph("colors for states");

    for (let i = 0; i < color.length; i++) {
        main.colorControllers.push(gui.add({
            type: 'color',
            params: color,
            property: i,
            onChange: draw
        }));
    }

    create();
    SVG.draw = draw;
    draw();
};

function create() {
    const length = main.colorControllers.length;
    for (let i = 1; i < length; i++) {
        main.colorControllers[i].hide();
    }
    for (let i = 1; i < main.nStates; i++) {
        main.colorControllers[i].show();
    }
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
        SVG.groupAttributes.stroke = main.tileLineColor;
        SVG.groupAttributes['stroke-width'] = main.tileLineWidth;
        SVG.createGroup(SVG.groupAttributes);
        grid.drawTiles();
    }



    SVG.terminate();
}