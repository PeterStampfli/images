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
    imagePoints,
    switches
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
output.backgroundColorController.setValueOnly('#0000aa');
output.setBackground();

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
display.lineWidth=2;

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

gui.add({
    type: 'number',
    params: display,
    property: 'lineWidth',
    labelText: 'line width',
    onChange: function() {
        draw();
    }
});

mappingSpheres.fillColor = '#aaaaaa';

gui.add({
    type: 'color',
    params: mappingSpheres,
    property: 'fillColor',
    labelText: 'map spheres',
    onChange: function() {
        draw();
    }
});

switches[0]=true;
switches[1]=true;
switches[2]=true;
switches[3]=true;

gui.add({
    type:'boolean',
    params:switches,
    property:0,
    labelText:'switches',
    onChange: function() {
        create();
        draw();
    }
}).add({
    type:'boolean',
    params:switches,
    property:1,
    labelText:'',
    onChange: function() {
        create();
        draw();
    }
}).add({
    type:'boolean',
    params:switches,
    property:2,
    labelText:'',
    onChange: function() {
        create();
        draw();
    }
}).add({
    type:'boolean',
    params:switches,
    property:3,
    labelText:'',
    onChange: function() {
        create();
        draw();
    }
});

imageSpheres.drawGeneration = 2;
imageSpheres.fillColor = '#ff0000';
imageSpheres.useSpecialColors=true;

imageSpheres.drawGenController = gui.add({
    type: 'number',
    params: imageSpheres,
    property: 'drawGeneration',
    min: 1,
    step: 1,
    labelText: 'iterations',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'color',
    params: imageSpheres,
    property: 'fillColor',
    labelText: 'img spheres',
    onChange: function() {
        draw();
    }
}).add({
    type: 'boolean',
    params: imageSpheres,
    property: 'useSpecialColors',
    labelText: 'multi',
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
    output.setLineWidth(display.lineWidth);
    output.canvasContext.strokeStyle='#000000';
    switch (display.show) {
        case 'mapping spheres':
            mappingSpheres.draw2dCircles();
            break;
        case 'image spheres':
            mappingSpheres.draw2dCircles();
            imageSpheres.draw2dCircles();
            output.write('Iterations: ' + imageSpheres.drawGeneration, 10, 40, 36, '#ffffff');
            break;
        case 'points':
            mappingSpheres.draw2dCircles();
            imagePoints.drawPixels();
            break;
    }
}

output.drawCanvasChanged = draw;
output.drawImageChanged = draw;

create();

draw();
