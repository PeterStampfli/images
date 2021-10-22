/* jshint esversion: 6 */

import {
    output,
    ParamGui
} from "../libgui/modules.js";

import {
    builder,
    examples,
    readJSON
} from './modules.js';

export const main = {};

main.drawFill = true;
main.drawStroke = true;
main.drawInitialStroke = true;
main.markerSize = 0.1;
main.drawMarker = true;
main.markerColor = '#444444aa';
main.lineWidth = 2;
main.lineColor = '#000000';
main.inflate = false;
main.outlineWidth = 3;
main.outlineColor = '#444444';

// setting up the canvas and its gui
const gui = new ParamGui({
    name: 'quasiperiodic tilings + fractals',
    closed: false,
    booleanButtonWidth: 40
});
main.gui = gui;
output.createCanvas(gui, true);
output.addCoordinateTransform(false);
output.setInitialCoordinates(0, 0, 3);
output.backgroundColorController.setValueOnly('#999999');
output.setBackground();
output.saveType.setValueOnly('jpg');

builder.init(gui);

gui.add({
    type: 'boolean',
    params: main,
    property: 'inflate',
    onChange: function() {
        main.create();
        main.draw();
    }
});

gui.add({
    type: 'boolean',
    params: main,
    property: 'drawFill',
    labelText: 'draw fill',
    onChange: function() {
        main.draw();
    }
});

// stroke
gui.add({
    type: 'color',
    params: main,
    property: 'lineColor',
    labelText: 'stroke',
    onChange: function() {
        main.draw();
    }
});
gui.add({
    type: 'number',
    params: main,
    property: 'lineWidth',
    min: 0.5,
    step: 0.1,
    labelText: 'width',
    onChange: function() {
        main.draw();
    }
}).add({
    type: 'boolean',
    params: main,
    property: 'drawStroke',
    labelText: '',
    onChange: function() {
        main.draw();
    }
});

// marker
gui.add({
    type: 'color',
    params: main,
    property: 'markerColor',
    labelText: 'marker',
    onChange: function() {
        main.draw();
    }
});

main.markerSizeController = gui.add({
    type: 'number',
    params: main,
    property: 'markerSize',
    min: 0,
    step: 0.1,
    labelText: 'size',
    onChange: function() {
        main.draw();
    }
});

main.markerSizeController.add({
    type: 'boolean',
    params: main,
    property: 'drawMarker',
    labelText: '',
    onChange: function() {
        main.draw();
    }
});

// outline
gui.add({
    type: 'color',
    params: main,
    property: 'outlineColor',
    labelText: 'outline',
    onChange: function() {
        main.draw();
    }
});
gui.add({
    type: 'number',
    params: main,
    property: 'outlineWidth',
    min: 0.5,
    step: 0.1,
    labelText: 'width',
    onChange: function() {
        main.draw();
    }
}).add({
    type: 'boolean',
    params: main,
    property: 'drawInitialStroke',
    labelText: '',
    onChange: function() {
        main.draw();
    }
});

readJSON.makeButton(gui,
    function() {
        examples.add(readJSON.name, readJSON.result);
        main.newStructure();
        main.create();
        main.draw();
    });

examples.init(gui);

main.newStructure = function() {
    builder.setup(examples.current);
};

main.create = function() {
    builder.create();
};

main.draw = function() {
    output.correctYAxis();
    output.startDrawing();
    output.fillCanvas('#00000000');
    output.canvasContext.lineCap = 'round';
    output.canvasContext.lineJoin = 'round';
    if (builder.drawGeneration > builder.maxGeneration) {
        builder.drawGenController.setValueOnly(builder.maxGeneration);
    }
    builder.draw();
};

output.drawCanvasChanged = main.draw;
output.drawImageChanged = main.draw;
main.newStructure();

main.create();
main.draw();