/* jshint esversion: 6 */

import {
    output
} from "../libgui/modules.js";

import {
    ui,
    builder,
    examples,
    readJSON
} from './modules.js';

export const main = {};

ui.setup();

output.createCanvas(ui.gui, true);
output.addCoordinateTransform(false);
output.setInitialCoordinates(0, 0, 3);
output.createPixels();
output.backgroundColorController.setValueOnly('#999999');
output.setBackground();
output.saveType.setValueOnly('jpg');


readJSON.makeButton(ui.gui,
    function() {
        console.log(readJSON.result);
        builder.setup(readJSON.result);
        main.create();
        main.draw();
    });

builder.init(ui.gui);

examples.init(ui.gui);

main.create = function() {
builder.setup(examples.current);


};

main.lineWidth = 2;


main.draw = function() {
    output.startDrawing();
    output.fillCanvas('#00000000');
    output.setLineWidth(main.lineWidth);
    output.canvasContext.strokeStyle = '#000000';
    output.canvasContext.lineCap = 'round';

    builder.drawTile(builder.initialTile, 0, 0, 1, 0);

};

output.drawCanvasChanged = main.draw;
output.drawImageChanged = main.draw;

console.log(examples.ammannBeenker);
main.create();
main.draw();