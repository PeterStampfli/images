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

main.nLines = 1;
main.offset = 0.25;
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
        labelText: 'line width',
        min: 0,
        onChange: draw
    }).add({
        type: 'number',
        params: main,
        property: 'lineBorderWidth',
        labelText: 'border width',
        min: 0,
        onChange: draw
    });

    gui.add({
        type: 'color',
        params: main,
        property: 'lineBorderColor',
        labelText: 'border color',
        onChange: draw
    });

    gui.add({
        type: 'color',
        params: lineColor,
        property: '0',
        labelText: 'color 1',
        onChange: draw
    });

    gui.add({
        type: 'color',
        params: lineColor,
        property: '1',
        labelText: 'color 2',
        onChange: draw
    });

    gui.add({
        type: 'boolean',
        params: main,
        property: 'drawLines',
        labelText: 'draw lines',
        onChange: draw
    });
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
        labelText: 'fill',
        onChange: draw
    });

    gui.add({
        type: 'number',
        params: main,
        property: 'nFold',
        labelText: 'symmetry',
        step: 1,
        min: 3,
        onChange: function() {
            create();
            draw();
        }
    });
    gui.add({
        type: 'number',
        params: main,
        property: 'offset',
        onChange: function() {
            create();
            draw();
        }
    });
    gui.add({
        type: 'number',
        params: main,
        property: 'generations',
        step: 1,
        min: 0,
        onChange: function() {
            create();
            draw();
        }
    }).add({
        type: 'selection',
        params: main,
        property: 'spacing',
        options: {
            'equal spaced': grid.equalSpacedLines,
            trisection: grid.trisection,
            'golden section': grid.goldenSection
        },
        onChange: function() {
            create();
            draw();
        }
    });

    gui.add({
        type: 'boolean',
        params: main,
        property: 'tile',
        labelText: 'make tiling',
        onChange: function() {
            create();
            draw();
        }
    });

    gui.add({
        type: 'number',
        params: main,
        property: 'rhombusLineWidth',
        labelText: 'tiling line',
        min: 0,
        onChange: draw
    }).add({
        type: 'boolean',
        params: main,
        property: 'drawIntersections',
        labelText: '',
        onChange: draw
    });

    gui.add({
        type: 'color',
        params: main,
        property: 'rhombusColor',
        labelText: '',
        onChange: draw
    });

    gui.add({
        type: 'number',
        params: main,
        property: 'rhombusSize',
        labelText: 'tile size',
        onChange: function() {
            create();
            draw();
        }
    });

    gui.add({
        type: 'boolean',
        params: main,
        property: 'fill',
        onChange: draw
    });

    gui.add({
        type: 'color',
        params: color,
        property: 0,
        labelText: 'colors: 0',
        onChange: draw
    });
    for (let i = 1; i < color.length; i++) {
        gui.add({
            type: 'color',
            params: color,
            property: i,
            onChange: draw
        });
    }

    create();
    draw();
};

function create() {
    main.spacing();
    grid.adjust();
    // double grid for even order
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