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
output.createPixels();
output.backgroundColorController.setValueOnly('#999999');
output.setBackground();
output.saveType.setValueOnly('jpg');

builder.init(gui);

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

main.lineWidth = 2;

main.draw = function() {
    output.startDrawing();
    output.fillCanvas('#00000000');
    output.setLineWidth(main.lineWidth);
    output.canvasContext.strokeStyle = '#000000';
    output.canvasContext.lineCap = 'round';

    if (builder.showGeneration > builder.maxGeneration) {
        builder.showGenController.setValueOnly(builder.maxGeneration);
    }

    builder.drawTile({
        name: builder.initialTile,
        originX: 0,
        originY: 0,
        size: 1,
        orientation: 0
    });

};

output.drawCanvasChanged = main.draw;
output.drawImageChanged = main.draw;
main.newStructure();

main.create();
main.draw();