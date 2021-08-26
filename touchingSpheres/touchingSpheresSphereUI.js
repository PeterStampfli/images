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
    view,
    switches
} from "./touchingSpheresSphere.js";

// setting up the canvas and its gui
const gui = new ParamGui({
    name: 'touching spheres on a 3d spherical surface',
    closed: false,
    booleanButtonWidth: 40
});

// create an output canvas, with coordinates and pixels
output.createCanvas(gui, true);
output.addCoordinateTransform(false);
output.setInitialCoordinates(0, 0, 2);
output.createPixels();
output.backgroundColorController.setValueOnly('#0000aa');
output.setBackground();

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

gui.addParagraph("Euler angles");

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

const display = {};
display.show = 'points on solid sphere';
display.lineWidth = 2;

gui.add({
    type: 'selection',
    params: display,
    property: 'show',
    options: ['mapping spheres', 'points on solid sphere', 'points on bubble', 'points with circle', 'nix'],
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
});

mappingSpheres.color = '#aaaaaa';
gui.add({
    type: 'color',
    params: mappingSpheres,
    property: 'color',
    labelText: 'map spheres',
    onChange: function() {
        draw();
    }
});

switches[0] = true;
switches[1] = true;
switches[2] = true;
switches[3] = true;
switches[4] = true;

gui.add({
    type: 'boolean',
    params: switches,
    property: 0,
    labelText: 'switches',
    onChange: function() {
        create();
        transformSort();
        draw();
    }
}).add({
    type: 'boolean',
    params: switches,
    property: 1,
    labelText: '',
    onChange: function() {
        create();
        transformSort();
        draw();
    }
}).add({
    type: 'boolean',
    params: switches,
    property: 2,
    labelText: '',
    onChange: function() {
        create();
        transformSort();
        draw();
    }
}).add({
    type: 'boolean',
    params: switches,
    property: 3,
    labelText: '',
    onChange: function() {
        create();
        transformSort();
        draw();
    }
}).add({
    type: 'boolean',
    params: switches,
    property: 4,
    labelText: '',
    onChange: function() {
        create();
        transformSort();
        draw();
    }
});

imageSpheres.drawGeneration = 2;
imageSpheres.color = '#ff0000';
imageSpheres.useSpecialColors = true;

imageSpheres.drawGenController = gui.add({
    type: 'number',
    params: imageSpheres,
    property: 'drawGeneration',
    min: 1,
    step: 1,
    labelText: 'iterations',
    onChange: function() {
        transformSort();
        draw();
    }
});

gui.add({
    type: 'color',
    params: imageSpheres,
    property: 'color',
    labelText: 'img sphere',
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

function transformSort() {
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
    output.setLineWidth(display.lineWidth);
    output.canvasContext.strokeStyle = '#000000';
    switch (display.show) {
        case 'mapping spheres':
            mappingSpheres.drawSpheres();
            break;
        case 'points on solid sphere':
            poincareSphere.drawSphere();
            imagePoints.drawUpper();
            break;
        case 'points on bubble':
            imagePoints.drawLower();
            poincareSphere.drawLowerBubble();
            poincareSphere.drawUpperBubble();
            imagePoints.drawUpper();
            break;
        case 'points with circle':
            poincareSphere.drawCircle();
            imagePoints.drawLower();
            imagePoints.drawUpper();
            break;
    }
    //poincareSphere.drawSphere();

    imageSpheres.draw2dCircles();

    output.write('Iterations: ' + imageSpheres.drawGeneration, 10, 40, 36, '#ffffff');

    //  imagePoints.drawPixels();
}

output.drawCanvasChanged = draw;
output.drawImageChanged = draw;

create();

transformSort();

draw();