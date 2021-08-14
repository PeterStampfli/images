/* jshint esversion: 6 */


import {
    map,
    output,
    ParamGui,
    Pixels
} from "../libgui/modules.js";

import {
    mappingSpheres,
    imageSpheres,
    imagePoints
} from "./touchingSpheres.js";

import {
    tetrahedronSpheres
} from "./tetrahedronSpheres.js";

export const controllers = {};

// setting up the canvas and its gui
const gui = new ParamGui({
    name: 'touching spheres',
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

// limits
mappingSpheres.maxGeneration = 100;
mappingSpheres.minGeneration = 3;
mappingSpheres.minimumRadius = 0.01;

gui.add({
    type: 'number',
    params: mappingSpheres,
    property: 'maxGeneration',
    labelText: 'max gen',
    min: 1,
    step: 1,
    onChange: function() {
        draw();
    }
});
gui.add({
    type: 'number',
    params: mappingSpheres,
    property: 'minGeneration',
    labelText: 'min gen',
    min: 1,
    step: 1,
    onChange: function() {
        draw();
    }
});
gui.add({
    type: 'number',
    params: mappingSpheres,
    property: 'minimumRadius',
    labelText: 'min radius',
    min: 0,
    onChange: function() {
        draw();
    }
});

// display
mappingSpheres.draw = true;
mappingSpheres.color = '#ffffff';
mappingSpheres.lineWidth = 2;

gui.add({
    type: 'boolean',
    params: mappingSpheres,
    property: 'draw',
    labelText: 'mapping',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'color',
    params: mappingSpheres,
    property: 'color',
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: mappingSpheres,
    property: 'lineWidth',
    labelText: 'width',
    onChange: function() {
        draw();
    }
});

imageSpheres.draw = true;
imageSpheres.drawGeneration = 2;
imageSpheres.stroke = '#000000';
imageSpheres.lineWidth = 2;
imageSpheres.fill = '#ff0000';
const imageSpheresOnOffController = gui.add({
    type: 'boolean',
    params: imageSpheres,
    property: 'draw',
    labelText: 'spheres',
    onChange: function() {
        draw();
    }
});
const imageSpheresDrawGenController = imageSpheresOnOffController.add({
    type: 'number',
    params: imageSpheres,
    property: 'drawGeneration',
    min: 0,
    step: 1,
    labelText: 'generation',
    onChange: function() {
        if (imageSpheres.drawGeneration > mappingSpheres.minGeneration) {
            imageSpheresDrawGenController.setValueOnly(mappingSpheres.minGeneration);
        }
        draw();
    }
});

gui.add({
    type: 'color',
    params: imageSpheres,
    property: 'stroke',
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: imageSpheres,
    property: 'lineWidth',
    labelText: 'width',
    onChange: function() {
        draw();
    }
});
gui.add({
    type: 'color',
    params: imageSpheres,
    property: 'fill',
    onChange: function() {
        draw();
    }
});

imagePoints.draw = true;
imagePoints.size = 0.02;
imagePoints.color = '#ffff00';
gui.add({
    type: 'boolean',
    params: imagePoints,
    property: 'draw',
    labelText: 'points',
    onChange: function() {
        draw();
    }
});
gui.add({
    type: 'color',
    params: imagePoints,
    property: 'color',
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: imagePoints,
    property: 'size',
    onChange: function() {
        draw();
    }
});

function draw() {
    output.startDrawing();
    output.fillCanvas('#00000000');
    if (imageSpheres.draw) {
        imageSpheres.draw2dCircles();
    }
    if (mappingSpheres.draw) {
        mappingSpheres.draw2dCircles();
    }
    if (imagePoints.draw) {
        imagePoints.drawDots();
    }
}

output.drawCanvasChanged = draw;


mappingSpheres.idealTriangle();

mappingSpheres.createImages();

draw();

/*
//threeMappingSpheres();
mappingSpheres.idealTriangle();

//setProjection(0.5, 1, 1, 1, 1);

//add4dTo3dMappingSphere(0.5, 1, 1, 1, 1);
//add4dTo3dMappingSphere(0.5, 1, 1, 1, -1);
//add4dTo3dMappingSphere(0.5, 2, 0, 0, 0);

mappingSpheres.log();

mappingSpheres.minimumRadius=0.1
*/


imageSpheres.log();
//imagePoints.log();