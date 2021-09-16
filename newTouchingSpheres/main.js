/* jshint esversion: 6 */

import {
    output
} from "../libgui/modules.js";

import {
    ui,
    draw,
    poincare,
    mapping,
    view,
    color
} from './modules.js';

export const main = {};
main.textOn = true;
main.textColor = '#ffffff';

// calling setup of ui
// setting up the canvas and the generating, transforming, drawing routines

ui.setup();

output.createCanvas(ui.gui, true);
output.addCoordinateTransform(false);
output.setInitialCoordinates(0, 0, 3);
output.createPixels();
output.backgroundColorController.setValueOnly('#0000aa');
output.setBackground();
output.saveType.setValueOnly('jpg');

main.create = function() {
    mapping.config();
    //mapping.logSpheres();
    mapping.generate();
};

main.transformSort = function() {
    view.update();
    mapping.viewTransform();
};

main.writeIterations = function(n) {
    if (main.textOn) {
        output.write('Iterations: ' + n, 10, 40, 36, main.textColor);
    }
};

main.lineWidth = 2;

main.draw = function() {
    output.startDrawing();
    output.fillCanvas('#00000000');
    output.setLineWidth(main.lineWidth);
    output.canvasContext.strokeStyle = '#000000';
    output.canvasContext.lineCap = 'round';
    mapping.checkDrawGeneration();
    color.setupInterpolation();
    main.writeIterations(mapping.drawGeneration);
    mapping.drawImageSpheres();
    mapping.drawLines();
};

output.drawCanvasChanged = main.draw;
output.drawImageChanged = main.draw;

main.create();
main.transformSort();
main.draw();