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

const display = {};
display.show = 'image spheres';

gui.add({
    type: 'selection',
    params: display,
    property: 'show',
    options: ['mapping spheres', 'image spheres', 'points'],
    labelText: 'display',
    onChange: function() {
        create();
        draw();
    }
});

gui.addParagraph('mapping spheres');
mappingSpheres.stroke = true;
mappingSpheres.fillColor = '#aaaaaa';
mappingSpheres.strokeColor = '#ffffff';
mappingSpheres.lineWidth = 2;

gui.add({
    type: 'color',
    params: mappingSpheres,
    property: 'fillColor',
    labelText: 'fill',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: mappingSpheres,
    property: 'stroke',
    onChange: function() {
        draw();
    }
}).add({
    type: 'color',
    params: mappingSpheres,
    property: 'strokeColor',
    labelText: '',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: mappingSpheres,
    property: 'lineWidth',
    labelText: 'width',
    onChange: function() {
        draw();
    }
});

gui.addParagraph('image spheres');
imageSpheres.stroke = true;
imageSpheres.drawGeneration = 2;
imageSpheres.strokeColor = '#000000';
imageSpheres.lineWidth = 2;
imageSpheres.fillColor = '#ff0000';

imageSpheres.drawGenController = gui.add({
    type: 'number',
    params: imageSpheres,
    property: 'drawGeneration',
    min: 0,
    step: 1,
    labelText: 'gen',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'color',
    params: imageSpheres,
    property: 'fillColor',
    labelText: 'fill',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: imageSpheres,
    property: 'stroke',
    onChange: function() {
        draw();
    }
}).add({
    type: 'color',
    params: imageSpheres,
    property: 'strokeColor',
    labelText: '',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'number',
    params: imageSpheres,
    property: 'lineWidth',
    labelText: 'width',
    onChange: function() {
        draw();
    }
});

imagePoints.pixelSize = 2;

gui.add({
    type: 'number',
    params: imagePoints,
    property: 'pixelSize',
    min: 1,
    step: 1,
    max: 4,
    labelText: 'point size',
    onChange: function() {
        draw();
    }
});

function create() {
    mappingSpheres.createImageSpheres();
}

function draw() {
    output.startDrawing();
    output.fillCanvas('#00000000');
    switch (display.show) {
        case 'mapping spheres':
            mappingSpheres.draw2dCircles();
            break;
        case 'image spheres':
            mappingSpheres.draw2dCircles();
            imageSpheres.draw2dCircles();
            break;
        case 'points':
            mappingSpheres.draw2dCircles();
            imagePoints.drawPixels();
            break;
    }
}

output.drawCanvasChanged = draw;

create();

draw();