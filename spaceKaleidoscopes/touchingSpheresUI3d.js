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
} from "./touchingSpheres3d.js";

export const controllers = {};

// setting up the canvas and its gui
const gui = new ParamGui({
    name: 'touching spheres in three dimensions',
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

// structure parameters
mappingSpheres.config = mappingSpheres.triangle;
mappingSpheres.maxGeneration = 100;
mappingSpheres.minGeneration = 6;
mappingSpheres.minimumRadius = 0.001;

gui.add({
    type: 'selection',
    params: mappingSpheres,
    property: 'config',
    options: {
        twoSpheres: mappingSpheres.two,
        triangle: mappingSpheres.triangle,
        tetrahedron: mappingSpheres.tetrahedron2d,
    },
    onChange: function() {
        create();
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
        create();
        draw();
    }
}).add({
    type: 'number',
    params: mappingSpheres,
    property: 'maxGeneration',
    labelText: 'max gen',
    min: 1,
    step: 1,
    onChange: function() {
        create();
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
        create();
        draw();
    }
});

imagePoints.generate = false;
imagePoints.gens = 4;
gui.add({
    type: 'boolean',
    params: imagePoints,
    property: 'generate',
    labelText: 'points gen',
    onChange: function() {
        create();
        draw();
    }
}).add({
    type: 'number',
    params: imagePoints,
    property: 'gens',
    min: 1,
    step: 1,
    onChange: function() {
        create();
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
imageSpheres.onOffController = gui.add({
    type: 'boolean',
    params: imageSpheres,
    property: 'draw',
    labelText: 'spheres',
    onChange: function() {
        draw();
    }
});
imageSpheres.drawGenController = imageSpheres.onOffController.add({
    type: 'number',
    params: imageSpheres,
    property: 'drawGeneration',
    min: 0,
    step: 1,
    labelText: 'generation',
    onChange: function() {
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

function create() {
    mappingSpheres.createImageSpheres();
    if (imagePoints.generate) {
        mappingSpheres.createImagePoints();
    }
}

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



create();

draw();