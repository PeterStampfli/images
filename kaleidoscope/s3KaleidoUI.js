/* jshint esversion: 6 */

import {
    map,
    output,
    ParamGui,
    Pixels,
    BooleanButton,
    Logger
} from "../libgui/modules.js";

import {
    geometry
} from "./s3KaleidoGeometry.js";

export const controllers = {};

Logger.spacing = 2;

// setting up the canvas and its gui
const gui = new ParamGui({
    name: 'spheres',
    closed: false
});
// create an output canvas, with coordinates and pixels
output.createCanvas(gui, true);
output.addCoordinateTransform(false);
output.setInitialCoordinates(0, 0, 3);
output.createPixels();
// add options for the output image
output.addImageProcessing();
output.addAntialiasing();
output.grid.interval = 0.1;
output.addGrid();
output.addCursorposition();
// options of what to show
map.makeShowingGui(gui, {
    closed: false
});
map.lightController.destroy();
map.linewidthController.destroy();
map.trajectoryOnOffController.destroy();
map.trajectoryColorController.destroy();
// add drag and drop for the input image
map.imageController.addDragAndDropWindow();
// link the output drawing routines to the map routines
map.setOutputDraw();

// for debugging
map.allImageControllersHide();

gui.add({
    type: 'selection',
    params: geometry,
    property: 'tiling',
    options: ['ikosahedral 533', 'octahedral 433', 'tetrahedral 333', 'special 343', 'irregular 333'],
    onChange: function(choice) {
        console.log((choice));
        switch (choice) {
            case 'ikosahedral 533':
                geometry.d12 = 5;
                geometry.d13 = 2;
                geometry.d23 = 3;
                geometry.d24 = 2;
                geometry.d34 = 3;
                geometry.d14 = 2;
                break;
            case 'octahedral 433':
                geometry.d12 = 4;
                geometry.d13 = 2;
                geometry.d23 = 3;
                geometry.d24 = 2;
                geometry.d34 = 3;
                geometry.d14 = 2;
                break;
            case 'tetrahedral 333':
                geometry.d12 = 3;
                geometry.d13 = 2;
                geometry.d23 = 3;
                geometry.d24 = 2;
                geometry.d34 = 3;
                geometry.d14 = 2;
                break;
            case 'special 343':
                geometry.d12 = 4;
                geometry.d13 = 2;
                geometry.d14 = 3;
                geometry.d23 = 3;
                geometry.d24 = 2;
                geometry.d34 = 2;
                break;
            case 'irregular 333':
                geometry.d12 = 3;
                geometry.d13 = 3;
                geometry.d14 = 3;
                geometry.d23 = 2;
                geometry.d24 = 2;
                geometry.d34 = 2;
        }
        geometry.dihedral=geometry.dihedrals[geometry.d12];
        geometry.check();
    }
});