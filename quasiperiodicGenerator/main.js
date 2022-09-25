/* jshint esversion: 6 */

import {
    output,
    ParamGui
} from "../libgui/modules.js";

import {
    builder,
    examples
} from './modules.js';

export const main = {};

// data for drawing
main.drawFill = true;
main.drawStroke = true;
main.drawInitialStroke = true;
main.markerSize = 0.1;
main.drawMarker = false;
main.markerColor = '#444444';
main.lineWidth = 2;
main.lineColor = '#000000';
main.inflate = false;
main.outlineWidth = 3;
main.outlineColor = '#444444';

// setting up the gui and the canvas
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
output.transparencyController.setValueOnly('opaque');

gui.add({
    type:"button",
    buttonText:"--- HELP ---",
    onClick: function(){
        window.location="https://geometricolor.wordpress.com/2022/04/16/generating-quasiperiodic-tilings-and-fractals-i-the-browser-app/";
    }
});

// after the canvas gui comes the gui that defines the tiling/fractal
builder.init();

// finally the gui that determines drawing styles
gui.add({
    type: 'boolean',
    params: main,
    property: 'inflate',
    onChange: function() {
        main.create();
        main.draw();
    }
}).addHelp('If off, then the image size does not change, tiles become smaller for higher generations. If on, then the tile size stays constant and the image size increases for higher generations.');

main.drawFillController = gui.add({
    type: 'boolean',
    params: main,
    property: 'drawFill',
    labelText: 'draw fill',
    onChange: function() {
        main.draw();
    }
});
main.drawFillController.addHelp('Switches the area color of tiles on and off. You can choose the "color of tiles" in the submenue at the bottom.');

// stroke
gui.add({
    type: 'color',
    params: main,
    property: 'lineColor',
    labelText: 'stroke',
    onChange: function() {
        main.draw();
    }
}).addHelp('Choose the color of the surrounding lines of tiles.');

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
}).addHelp('You can switch the surrounding line of tiles on and off. You can set its width in pixel.');

// marker
main.markerColorController = gui.add({
    type: 'color',
    params: main,
    property: 'markerColor',
    labelText: 'marker',
    onChange: function() {
        main.draw();
    }
});
main.markerColorController.addHelp('Markers define the orientation of tiles. Particularly for asymmetric inflation rules. Here you can choose the color.');

main.markerSizeController = gui.add({
    type: 'number',
    params: main,
    property: 'markerSize',
    min: 0,
    step: 0.01,
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
main.markerSizeController.addHelp('Switch markers off or on and choose their size.');

// outline
main.outlineColorController = gui.add({
    type: 'color',
    params: main,
    property: 'outlineColor',
    labelText: 'outline',
    onChange: function() {
        main.draw();
    }
});
main.outlineColorController.addHelp('Choose the color for the outline of the initial tile shape.');
main.outlineSizeController = gui.add({
    type: 'number',
    params: main,
    property: 'outlineWidth',
    min: 0.5,
    step: 0.1,
    labelText: 'width',
    onChange: function() {
        main.draw();
    }
});
main.OutlineOnOffController = main.outlineSizeController.add({
    type: 'boolean',
    params: main,
    property: 'drawInitialStroke',
    labelText: '',
    onChange: function() {
        main.draw();
    }
});
main.OutlineOnOffController.addHelp('Switch the outline of initial shape on or off, and choose size, in pixels.');

// the gui for choosing the tiling fractal
examples.init(gui);

//examples.selectionController.setValueOnly("Theo's seven-fold");

// setup of the definition of a new tiling
main.newStructure = function() {
    builder.defineTiling(examples.current);
};

// create the tiling according to the existing definitions
main.create = function() {
    builder.create();
};

main.draw = function() {
    output.correctYAxis();
    output.startDrawing();
    output.fillCanvasBackgroundColor();
    output.canvasContext.lineCap = 'round';
    output.canvasContext.lineJoin = 'round';
    if (builder.drawGeneration > builder.maxGeneration) {
        builder.drawGenController.setValueOnly(builder.maxGeneration);
    }
    builder.draw();
};

output.drawCanvasChanged = main.draw;
output.drawImageChanged = main.draw;
output.drawBackgroundChanged = main.draw;
main.newStructure();

main.create();
main.draw();