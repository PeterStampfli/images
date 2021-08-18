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
} from "./touchingSpheresPlane.js";

// setting up the canvas and its gui
const gui = new ParamGui({
    name: 'touching spheres in two dimensions',
    closed: false
});

// create an output canvas, with coordinates and pixels
output.createCanvas(gui, true);
output.addCoordinateTransform(false);
output.setInitialCoordinates(0, 0, 3);
output.createPixels();

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
        one: mappingSpheres.one,
        two: mappingSpheres.two,
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
imagePoints.color = '#ffff00';
imagePoints.pixelSize = 2;
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
    property: 'pixelSize',
    min: 1,
    step: 1,
    max: 4,
    labelText: 'size',
    onChange: function() {
        draw();
    }
});

var timeStart;

function create() {
    mappingSpheres.createImageSpheres();
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
        imagePoints.drawPixels();
    }
}

output.drawCanvasChanged = draw;



create();

draw();