/* jshint esversion: 6 */

import {
    map,
    output,
    ParamGui,
    Pixels
} from "../libgui/modules.js";

import {
    poincareSphere,
    mappingSpheres,
    imageSpheres,
    imagePoints,
    eulerAngles,
    view
} from "./touchingSpheresSphere.js";

// setting up the canvas and its gui
const gui = new ParamGui({
    name: 'touching spheres on a 3d spherical surface',
    closed: false
});

// create an output canvas, with coordinates and pixels
output.createCanvas(gui, true);
output.addCoordinateTransform(false);
output.setInitialCoordinates(0, 0, 2);
output.createPixels();

// structure parameters
mappingSpheres.config = mappingSpheres.tetrahedron;
mappingSpheres.maxGeneration = 100;
mappingSpheres.minGeneration = 6;
mappingSpheres.minimumRadius = 0.001;

gui.add({
    type: 'selection',
    params: mappingSpheres,
    property: 'config',
    options: {
        tetrahedron: mappingSpheres.tetrahedron
    },
    onChange: function() {
        create();
        transformSort();
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
        transformSort();
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
        transformSort();
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
        transformSort();
        draw();
    }
});

gui.addParagraph("<strong>View</strong> - Euler angles");

eulerAngles.alpha = 0;
eulerAngles.beta = 0;
eulerAngles.gamma = 0;

const controllerAlpha = gui.add({
    type: 'number',
    params: eulerAngles,
    property: 'alpha',
    min: -180,
    max: 180,
    onChange: function() {
        transformSort();
        draw();
    }
});
controllerAlpha.cyclic();

const controllerBeta = controllerAlpha.add({
    type: 'number',
    params: eulerAngles,
    property: 'beta',
    min: -180,
    max: 180,
    onChange: function() {
        transformSort();
        draw();
    }
});
controllerBeta.cyclic();

const controllerGamma = controllerBeta.add({
    type: 'number',
    params: eulerAngles,
    property: 'gamma',
    min: -180,
    max: 180,
    onChange: function() {
        transformSort();
        draw();
    }
});
controllerGamma.cyclic();

view.pointsTransform = view.normal;
view.spheresTransform = view.normal;
view.name = 'normal';
view.interpolation = 1;

gui.add({
    type: 'selection',
    params: view,
    property: 'name',
    labelText: 'view',
    options: ['normal', 'stereographic'],
    onChange: function() {
        switch (view.name) {
            case 'normal':
                viewInterpolation.hide();
                view.pointsTransform = view.normal;
                view.spheresTransform = view.normal;
                break;
            case 'stereographic':
                viewInterpolation.show();
                view.pointsTransform = view.stereographicPoints;
                view.spheresTransform = view.stereographicSpheres;
                break;
        }
        transformSort();
        draw();
    }
});

const viewInterpolation = gui.add({
    type: 'number',
    params: view,
    property: 'interpolation',
    min: 0.001,
    max: 1,
    step: 0.001,
    labelText: 'x',
    onChange: function() {
        transformSort();
        draw();
    }
});
viewInterpolation.hide();

gui.addParagraph("<strong>Display</strong>");

poincareSphere.color = '#888888';
poincareSphere.lineWidth = 2;

gui.add({
    type: 'color',
    params: poincareSphere,
    property: 'color',
    labelText: 'poinc sphere',
    onChange: function() {
        draw();
    }
}).add({
    type: 'number',
    params: poincareSphere,
    property: 'lineWidth',
    labelText: 'width',
    onChange: function() {
        draw();
    }
});

mappingSpheres.color = '#aaaaaa';
gui.add({
    type: 'color',
    params: mappingSpheres,
    property: 'color',
    labelText: 'mapp spheres',
    onChange: function() {
        draw();
    }
});

gui.addParagraph('image spheres');

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
        transformSort();
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

imagePoints.drawFront = true;
imagePoints.drawBack = true;
imagePoints.colorFront = '#ffff00';
imagePoints.colorBack = '#00ffff';
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

gui.add({
    type: 'boolean',
    params: imagePoints,
    property: 'drawFront',
    labelText: 'front',
    onChange: function() {
        draw();
    }
}).add({
    type: 'color',
    params: imagePoints,
    property: 'colorFront',
    labelText: '',
    onChange: function() {
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: imagePoints,
    property: 'drawBack',
    labelText: 'back',
    onChange: function() {
        draw();
    }
}).add({
    type: 'color',
    params: imagePoints,
    property: 'colorBack',
    labelText: '',
    onChange: function() {
        draw();
    }
});

function create() {
    mappingSpheres.createImageSpheres();
}

function transformSort(){
    eulerAngles.updateCoefficients();
    view.setup();
    imageSpheres.copy();
    imageSpheres.rotate();
    imageSpheres.transform();
    imageSpheres.zSort();
    mappingSpheres.copy();
    mappingSpheres.rotate();
    mappingSpheres.transform();
    mappingSpheres.zSort();
    imagePoints.copy();
    imagePoints.rotate();
    imagePoints.transform();
}

function draw() {
    output.startDrawing();
    output.fillCanvas('#00000000');
    poincareSphere.drawLowerBubble();
    //poincareSphere.drawSphere();

    //  imageSpheres.draw2dCircles();

    mappingSpheres.drawSpheres();

    //  imagePoints.drawPixels();
}

output.drawCanvasChanged = draw;



create();

transformSort();

draw();