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
main.lineWidth = 2;
main.lineColor = '#000000';
main.inflate = false;

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
}).add({
    type: 'boolean',
    params: main,
    property: 'drawStroke',
    labelText: 'stroke',
    onChange: function() {
        main.draw();
    }
});
gui.add({
    type: 'color',
    params: main,
    property: 'lineColor',
    labelText: 'line',
    onChange: function() {
        main.draw();
    }
}).add({
    type: 'number',
    params: main,
    property: 'lineWidth',
    min: 0.5,
    step: 0.1,
    labelText: 'width',
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
    output.setLineWidth(main.lineWidth);
    output.canvasContext.strokeStyle = main.lineColor;
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