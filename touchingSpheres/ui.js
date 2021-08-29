/* jshint esversion: 6 */

import {
    map,
    output,
    ParamGui,
    Pixels
} from "../libgui/modules.js";

import {
    basics
} from "./basics.js";

import {
    poincare
} from "./poincare.js";

import {
    mapping
} from "./mapping.js";

// setting up the canvas and its gui
const gui = new ParamGui({
    name: 'touching spheres',
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

mapping.config = mapping.tetrahedron;

gui.add({
    type: 'selection',
    params: mapping,
    property: 'config',
    options: {
        tetrahedron: mapping.tetrahedron
    },
    onChange: function() {
        create();
        transformSort();
        draw();
    }
});

gui.add({
    type: 'number',
    params: mapping,
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
    params: mapping,
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
    params: mapping,
    property: 'minRadius',
    labelText: 'point radius',
    min: 0,
    onChange: function() {
        create();
        transformSort();
        draw();
    }
}).add({
    type: 'number',
    params: mapping,
    property: 'additionalPoints',
    labelText: 'morePoints',
    min: 0,
    step: 1,
    onChange: function() {
        create();
        transformSort();
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: mapping,
    property: 'useTouchingPoints',
    labelText: 'touch points',
    onChange: function() {
        create();
        transformSort();
        draw();
    }
});

gui.add({
    type: 'boolean',
    params: mapping.on,
    property: 0,
    labelText: 'mappings',
    onChange: function() {
        create();
        transformSort();
        draw();
    }
}).add({
    type: 'boolean',
    params: mapping.on,
    property: 1,
    labelText: '',
    onChange: function() {
        create();
        transformSort();
        draw();
    }
}).add({
    type: 'boolean',
    params: mapping.on,
    property: 2,
    labelText: '',
    onChange: function() {
        create();
        transformSort();
        draw();
    }
}).add({
    type: 'boolean',
    params: mapping.on,
    property: 3,
    labelText: '',
    onChange: function() {
        create();
        transformSort();
        draw();
    }
}).add({
    type: 'boolean',
    params: mapping.on,
    property: 4,
    labelText: '',
    onChange: function() {
        create();
        transformSort();
        draw();
    }
});


//===========

basics.alpha = 0;
basics.beta = 0;
basics.gamma = 0;

const controllerAlpha = gui.add({
    type: 'number',
    params: basics,
    property: 'alpha',
    labelText: 'Euler: alpha',
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
    params: basics,
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
    params: basics,
    property: 'gamma',
    min: -180,
    max: 180,
    onChange: function() {
        transformSort();
        draw();
    }
});
controllerGamma.cyclic();


gui.add({
    type: 'selection',
    params: basics,
    property: 'view',
    options: ['normal', 'stereographic'],
    onChange: function() {
        switch (basics.view) {
            case 'normal':
                viewInterpolation.hide();
                break;
            case 'stereographic':
                viewInterpolation.show();
                break;
        }
        transformSort();
        draw();
    }
});

const viewInterpolation = gui.add({
    type: 'number',
    params: basics,
    property: 'viewInterpolation',
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

const tiltController = gui.add({
    type: 'number',
    params: basics,
    property: 'tiltAngle',
    labelText: 'tilt',
    min: -180,
    max: 180,
    onChange: function() {
        transformSort();
        draw();
    }
}).cyclic();
tiltController.add({
    type: 'number',
    params: basics,
    property: 'rotationAngle',
    labelText: 'rotation',
    min: -180,
    max: 180,
    onChange: function() {
        transformSort();
        draw();
    }
}).cyclic();

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

//==============

gui.add({
    type: 'color',
    params: poincare,
    property: 'color',
    labelText: 'poinc sphere',
    onChange: function() {
        draw();
    }
});

function create() {
    mapping.spheres.length = 0;
    mapping.config();
    mapping.createImages();
    mapping.createTouchingPoints();
    mapping.logSpheres();
}

function transformSort() {
    mapping.transformImages();

}

function draw() {
    output.startDrawing();
    output.fillCanvas('#00000000');
    output.setLineWidth(display.lineWidth);
    output.canvasContext.strokeStyle = '#000000';

    poincare.drawSphere();
}

output.drawCanvasChanged = draw;
output.drawImageChanged = draw;

create();
transformSort();
draw();