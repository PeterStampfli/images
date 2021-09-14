/* jshint esversion: 6 */

import {
    output
} from "../libgui/modules.js";

import {
	ui,
	draw,
	poincare,
	mapping,
    view
} from './modules.js';

export const main={};

// calling setup of ui
// setting up the canvas and the generating, transforming, drawing routines

ui.setup();

output.createCanvas(ui.gui, true);
output.addCoordinateTransform(false);
output.setInitialCoordinates(0, 0, 5);
output.createPixels();
output.backgroundColorController.setValueOnly('#0000aa');
output.setBackground();
output.saveType.setValueOnly('jpg');


main.create=function() {
mapping.tetrahedron();
//mapping.logSpheres();
}

main.transformSort=function() {
 view.update();
 view.transform(mapping.spheres);
}

main.textOn = true;
main.textColor='#ffffff';

main.writeIterations=function(n){
    if (main.textOn) {
        output.write('Iterations: ' + n, 10, 40, 36, main.textColor);
    }
}

main.lineWidth=2;

main.draw=function() {
    output.startDrawing();
    output.fillCanvas('#00000000');
    output.setLineWidth(main.lineWidth);
    output.canvasContext.strokeStyle = '#000000';
    output.canvasContext.lineCap = 'round';

    main.writeIterations(33);
    mapping.drawSpheres();
}

output.drawCanvasChanged = main.draw;
output.drawImageChanged = main.draw;

main.create();
main.transformSort();
main.draw();